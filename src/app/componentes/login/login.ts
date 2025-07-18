import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Supabase } from '../../servicios/supabase';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  loginForm = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]],  // Validación de email
    password: ['', Validators.required]  // Validación de contraseña
  });
  errorMessage: string | null = null;
  private supabaseService = inject(Supabase);  // Servicio de Supabase
  private router = inject(Router);  // Inyectamos el router para navegar

  // Datos de acceso rápido (usuarios predefinidos)
  quickAccessUsers = [
    { email: 'liydejodre@gufum.com', password: 'hola123', rol: 'admin', fotoPerfil: 'https://ltlzjkqhulpaydaoldma.supabase.co/storage/v1/object/public/imagenes/Nicolas-Perez-1750048048493' },
    { email: 'dj4e38ap5n@wyoxafp.com', password: 'hola123', rol: 'paciente', fotoPerfil: 'https://ltlzjkqhulpaydaoldma.supabase.co/storage/v1/object/public/imagenes/Paciente-Claudia-Miguez-1-1750051345274' },
    { email: 'divikef945@2mik.com', password: 'hola123', rol: 'paciente', fotoPerfil: 'https://ltlzjkqhulpaydaoldma.supabase.co/storage/v1/object/public/imagenes/Paciente-aron-piper-1-1749777268058' },
    { email: 't00muyuj3f@illubd.com', password: 'hola123', rol: 'paciente', fotoPerfil: 'https://ltlzjkqhulpaydaoldma.supabase.co/storage/v1/object/public/imagenes/Paciente-kiara-kiki-1-1749777424728' },
    { email: 'uezwl7cy2k@zvvzuv.com', password: 'hola123', rol: 'especialista', fotoPerfil: 'https://ltlzjkqhulpaydaoldma.supabase.co/storage/v1/object/public/imagenes/Especialista-Laura-Martinez-1-1750051069362' },
    { email: 'coragruquepu-9440@yopmail.com', password: 'hola123', rol: 'especialista', fotoPerfil: 'https://ltlzjkqhulpaydaoldma.supabase.co/storage/v1/object/public/imagenes/Especialista-Maria-Angeles-1-1750048835466' },
  ];

  // Método para manejar el inicio de sesión rápido
  onQuickAccessLogin(email: string, password: string) {
    this.loginForm.setValue({ email, password });  // Seteamos los valores de email y contraseña en el formulario
    this.onSubmit();  // Llamamos al método onSubmit para manejar el login
  }

async onSubmit() {
  if (this.loginForm.valid) {
    let { email, password } = this.loginForm.value;

    if (!email || !password) {
      this.errorMessage = 'Correo y contraseña son obligatorios.';
      return;
    }

    try {
      // Intentar login
      const { data: signInResult, error: loginError } = await this.supabaseService.supabase.auth.signInWithPassword({
        email,
        password
      });

      // Si hay error de login
      if (loginError) {
        if (loginError.message.toLowerCase().includes('email not confirmed')) {
          Swal.fire({
            icon: 'error',
            title: 'Correo no verificado',
            text: 'Por favor, revisá tu correo y verificá tu cuenta antes de iniciar sesión.',
            confirmButtonText: 'Aceptar'
          });
        } else {
          this.errorMessage = 'Credenciales incorrectas. Por favor, intenta de nuevo.';
        }
        return;
      }

      // Obtener datos del usuario autenticado
      const { data: userData } = await this.supabaseService.supabase.auth.getUser();

      try {
      if (userData?.user?.id && userData?.user?.email) {
        await this.supabaseService.supabase
          .from('logs_ingreso')
          .insert([
            {
              usuario_id: userData.user.id,
              email: userData.user.email,
              fecha: new Date().toISOString()
            }
          ]);
      }
    } catch (logError) {
      console.warn('No se pudo registrar el log de ingreso:', logError);
    }


      // Verificar si el correo está confirmado
      if (!userData?.user?.confirmed_at) {
        await this.supabaseService.supabase.auth.signOut();
        Swal.fire({
          icon: 'warning',
          title: 'Verificá tu correo',
          text: 'Tu cuenta aún no fue verificada. Revisá tu correo y hacé clic en el enlace de activación.',
          confirmButtonText: 'Aceptar'
        });
        return;
      }

      // Buscar usuario en la tabla personalizada
      const { data, error: userError } = await this.supabaseService.supabase
        .from('usuarios')
        .select('rol, estado')
        .eq('mail', email)
        .single();

      if (userError || !data) {
        this.errorMessage = 'No se pudo obtener el estado del usuario.';
        await this.supabaseService.supabase.auth.signOut();
        return;
      }

      const rol = data.rol?.toLowerCase();
      const estado = data.estado?.toLowerCase();

      // Si es especialista y no está activo
      if (rol === 'especialista' && estado !== 'activo') {
        await this.supabaseService.supabase.auth.signOut();
        Swal.fire({
          icon: 'error',
          title: 'Cuenta inhabilitada',
          text: 'Tu cuenta de especialista fue inhabilitada. Contactá al administrador.',
          confirmButtonText: 'Aceptar'
        });
        return;
      }

      localStorage.setItem('rol', rol);

      // Redirigir según el rol
      if (rol === 'admin') {
        this.router.navigate(['/admin']);
      } else if (rol === 'especialista') {
        this.router.navigate(['/mis-turnos-especialista']);
      } else if (rol === 'paciente') {
        this.router.navigate(['/mis-turnos-paciente']);
      } else {
        this.router.navigate(['/bienvenida']);
      }

    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
    }
  }
}

    goTo(path: string) {
    this.router.navigate([`/registro`]); 
  }

}

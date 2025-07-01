
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Supabase } from '../../servicios/supabase';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { FormatoDniPipe } from '../../pipes/formatodni-pipe';
import { ToLowerCasePipe } from '../../pipes/tolowercase-pipe';
import { EstadoColorPipe } from '../../pipes/estado-color-pipe';
import { HoverZoom } from '../../directivas/hover-zoom';
import { AutoFocus } from '../../directivas/auto-focus';
import { MostrarPassword } from '../../directivas/mostrar-password';



@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormatoDniPipe,ToLowerCasePipe,EstadoColorPipe,HoverZoom,AutoFocus,MostrarPassword],
  templateUrl: './administrador.html',
  styleUrls: ['./administrador.scss']
})
export class Administrador implements OnInit {
  users: any[] = [];
  errorMessage: string | null = null;
  newUser: any = {};
  modo: 'tabla' | 'crear-admin' = 'tabla';
 

  currentUser: any = {};  // Almacenamos la información del usuario logueado
  formAdmin!: FormGroup; // Formulario para crear administrador

  mostrarModalHistoria: boolean = false;
historialSeleccionado: any[] = [];
pacienteSeleccionado: any = null;
mapaTurnos: Record<string, any> = {};

pacientes: any[] = [];

mostrarPacientes: boolean = false;



  constructor(private fb: FormBuilder, private supabaseService: Supabase, private router: Router) {}

    ngOnInit(): void{
    this.getUsers(); 
    this.getCurrentUser();  // Obtener la información del usuario logueado
    this.createAdminForm(); // Crear el formulario para admin
  }

  // Crear el formulario para el administrador
  createAdminForm() {
    this.formAdmin = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]], // Solo letras
      apellido: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]], // Solo letras
      edad: ['', [Validators.required, Validators.min(18), Validators.max(120), Validators.pattern(/^[0-9]+$/)]], // Solo números, hasta 120 años
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]], // Solo 8 números
      mail: ['', [Validators.required, Validators.email]], // Validación de mail
      password: ['', [Validators.required, Validators.minLength(6)]], // Contraseña mínima de 6 caracteres
      fotoPerfil: ['', Validators.required] // Foto de perfil es obligatoria
    });
  }
  isArray(value: any): boolean {
  return Array.isArray(value);
}

  // Obtener los datos del usuario logueado
  async getCurrentUser() {
  try {
    const { data: session, error: sessionError } = await this.supabaseService.supabase.auth.getUser();
    if (sessionError || !session.user) {
      this.errorMessage = 'No se pudo obtener la sesión';
      this.router.navigate(['/bienvenida']);
      return;
    }

    const email = session.user.email;

    const { data: usuario, error } = await this.supabaseService.supabase
      .from('usuarios')
      .select('rol')
      .eq('mail', email)
      .single();

    if (error || !usuario) {
      this.errorMessage = 'No se pudo obtener la información del usuario';
      this.router.navigate(['/bienvenida']);
      return;
    }

    const rol = usuario.rol?.toLowerCase();
    if (rol !== 'admin') {
      this.router.navigate(['/bienvenida']);
      return;
    }

    // Si llegó acá es admin
    this.currentUser = usuario;
    
  } catch (error) {
    this.errorMessage = 'Hubo un problema al obtener la información del usuario';
    this.router.navigate(['/bienvenida']);
  }
}


// Obtener usuarios desde Supabase
// async getUsers() {
//   try {
//     const { data, error } = await this.supabaseService.supabase
//       .from('usuarios')
//       .select('*');

//     if (error) {
//       this.errorMessage = 'Error al obtener los usuarios';
//     } else {
//       // Normalizar especialidades si vienen como string tipo JSON
//       this.users = data.map(user => {
//         try {
//           if (
//             typeof user.especialidades === 'string' &&
//             user.especialidades.trim().startsWith('[')
//           ) {
//             user.especialidades = JSON.parse(user.especialidades);
//           }
//         } catch (e) {
//           console.warn('No se pudo parsear especialidades:', user.especialidades);
//         }

//         return user;
//       });
//     }
//   } catch (error) {
//     this.errorMessage = 'Hubo un problema al cargar los usuarios';
//   }
// }

async getUsers() {
  try {
    const { data, error } = await this.supabaseService.supabase
      .from('usuarios')
      .select('*');

    if (error) {
      this.errorMessage = 'Error al obtener los usuarios';
    } else {
      // Normalizar especialidades si vienen como string tipo JSON
      this.users = data.map(user => {
        try {
          if (
            typeof user.especialidades === 'string' &&
            user.especialidades.trim().startsWith('[')
          ) {
            user.especialidades = JSON.parse(user.especialidades);
          }
        } catch (e) {
          console.warn('No se pudo parsear especialidades:', user.especialidades);
        }

        return user;
      });
        this.pacientes = this.users.filter(u => u.rol?.toLowerCase() === 'paciente');
    }
  } catch (error) {
    this.errorMessage = 'Hubo un problema al cargar los usuarios';
  }
}



  // Función para habilitar o inhabilitar un usuario Especialista
async toggleUserStatus(userId: string, status: boolean) {
  const accion = status ? 'habilitar' : 'inhabilitar';
  const confirm = await Swal.fire({
    title: `¿Estás seguro?`,
    text: `Vas a ${accion} el acceso de este especialista.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Sí, ${accion}`,
    cancelButtonText: 'Cancelar'
  });

  if (!confirm.isConfirmed) return;

  try {
    const { data, error } = await this.supabaseService.supabase
      .from('usuarios')
      .update({ estado: status ? 'activo' : 'inhabilitado' })
      .eq('id', userId);

    if (error) {
      this.errorMessage = 'Error al actualizar el estado del usuario';
    } else {
      this.getUsers();
    }
  } catch (error) {
    this.errorMessage = 'Hubo un problema al actualizar el estado';
  }
}
cerrarModal() {
  this.mostrarModalHistoria = false;
}


  // Cerrar sesión
  logout() {
    this.supabaseService.supabase.auth.signOut();
    this.router.navigate(['/bienvenida']);
  }

  // Mostrar el formulario para crear un nuevo administrador
  toggleCreateAdminForm() {
     this.modo = 'crear-admin';
  }

  // Crear un nuevo usuario Administrador
  async createUser(newUser: any) {
    const formValue = this.formAdmin.getRawValue();
    try {
      // Verificar si el formulario no es válido
      if (!this.formAdmin.valid) {
        Swal.fire('Error', 'Por favor complete todos los campos correctamente.', 'error');
        return;
      }

      // Subir la foto de perfil si existe
      let fotoUrl = null;
      if (newUser.fotoPerfil) {
        const filePath = `${newUser.nombre}-${newUser.apellido}-${new Date().getTime()}-1`;
        fotoUrl = await this.supabaseService.uploadImage(newUser.fotoPerfil, filePath);
        if (!fotoUrl) {
          Swal.fire('Error', 'Hubo un problema al subir la foto de perfil', 'error');
          return;
        }
      }

      // Crear el usuario en el sistema de autenticación de Supabase (sin la contraseña en la tabla usuarios)
      const user = await this.supabaseService.signUp(newUser.mail, newUser.password);
      if (!user) {
        Swal.fire('Error', 'No se pudo registrar al usuario en el sistema de autenticación', 'error');
        return;
      }

      // Insertar los datos en la tabla usuarios (sin la contraseña)
      const { data, error } = await this.supabaseService.supabase
        .from('usuarios')
        .insert([{
          mail: formValue.mail,
          rol: 'admin',
          estado: 'activo',
          nombre: formValue.nombre,
          apellido: formValue.apellido,
          edad: formValue.edad,
          dni: formValue.dni,
          fotoPerfil: formValue.fotoPerfil  
        }]);

      if (error) {
        this.errorMessage = `Error al crear el usuario: ${error.message}`;
        return;
      }

      // Mostrar mensaje de éxito
      Swal.fire('¡Éxito!', 'Administrador creado correctamente.', 'success');

      // Limpiar los campos después de crear el usuario
      this.formAdmin.reset();

      // Recargar la lista de usuarios
      this.getUsers();
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al crear el administrador. Inténtalo nuevamente.', 'error');
    }
  }

  // Manejar el cambio de archivo (foto de perfil)
    async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const nombre = this.formAdmin.get('nombre')?.value || 'sin-nombre';
    const apellido = this.formAdmin.get('apellido')?.value || 'sin-apellido';
    const filePath = `${nombre}-${apellido}-${Date.now()}`;

    const url = await this.supabaseService.uploadImage(file, filePath);

    if (url) {
    this.formAdmin.patchValue({ fotoPerfil: url }); // Guarda solo la URL en el form
    } else {
    Swal.fire('Error', 'No se pudo subir la imagen', 'error');
    }
    }


  volverATabla() {
  this.modo = 'tabla';
}

  // Redirigir a la ruta proporcionada
  goTo(path: string) {
    this.router.navigate([path]); 
  }

   exportarUsuariosAExcel() {
  if (!this.users.length) {
    Swal.fire('Atención', 'No hay usuarios para exportar.', 'info');
    return;
  }

  const usuariosParaExportar = this.users.map(user => ({
    Nombre: user.nombre,
    Apellido: user.apellido,
    Edad: user.edad,
    DNI: user.dni,
    Email: user.mail,
    Rol: user.rol,
    Estado: user.estado,
    Especialidades: Array.isArray(user.especialidades)
      ? user.especialidades.join(', ')
      : user.especialidades || 'N/A' ,
    ObraSocial: user.obraSocial || 'N/A' 

  }));

  const worksheet = XLSX.utils.json_to_sheet(usuariosParaExportar);
  const workbook = { Sheets: { 'Usuarios': worksheet }, SheetNames: ['Usuarios'] };
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  const fecha = new Date().toISOString().slice(0, 10);
  saveAs(blob, `usuarios_clinica_${fecha}.xlsx`);
}

  getClaves(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
async verHistoriaClinica(pacienteId: string) {
  // Traer datos del paciente
  const { data: paciente } = await this.supabaseService.supabase
    .from('usuarios')
    .select('*')
    .eq('id', pacienteId)
    .single();
  this.pacienteSeleccionado = paciente;

  // Traer historias clínicas
  const { data: historias } = await this.supabaseService.supabase
    .from('historia_clinica')
    .select('*')
    .eq('paciente_id', pacienteId);
  this.historialSeleccionado = historias || [];

  // Traer turnos asociados
  const turnoIds = this.historialSeleccionado.map(h => h.turno_id);
  if (turnoIds.length) {
    const { data: turnosHistoria } = await this.supabaseService.supabase
      .from('turnos')
      .select('id, especialidad, fecha, hora')
      .in('id', turnoIds);

    turnosHistoria?.forEach(t => {
      this.mapaTurnos[t.id] = t;
    });
  }

  this.mostrarModalHistoria = true;
}
datosTurno(id: string): any {
  return this.mapaTurnos[id] || {};
}

async descargarHistoriaClinica() {
  const doc = new jsPDF();
  const logoUrl = 'assets/images/logo.png';
  doc.addImage(logoUrl, 'PNG', 15, 10, 15, 15);

  doc.setFontSize(16);
  doc.text(`Historia Clínica de ${this.pacienteSeleccionado?.nombre} ${this.pacienteSeleccionado?.apellido}`, 35, 18);
  doc.setFontSize(10);
  doc.text('Emitido: ' + new Date().toLocaleString(), 35, 25);

  let y = 40;

  this.historialSeleccionado.forEach(h => {
    const datos = [
      `Fecha: ${new Date(h.fecha).toLocaleString()}`,
      `Especialidad: ${this.datosTurno(h.turno_id)?.especialidad || '-'}`,
      `Altura: ${h.altura || 'N/A'} cm`,
      `Peso: ${h.peso || 'N/A'} kg`,
      `Presión: ${h.presion || 'N/A'}`,
      `Temperatura: ${h.temperatura || 'N/A'} °C`,
    ];
    datos.forEach(dato => {
      doc.text(dato, 15, y);
      y += 8;
    });
    if (h.datos_extra) {
      doc.text('Otros Datos:', 15, y);
      y += 8;
      Object.keys(h.datos_extra).forEach(clave => {
        doc.text(`${clave}: ${h.datos_extra[clave]}`, 20, y);
        y += 8;
      });
    }
    y += 10;
  });

  doc.save(`historia_clinica_${this.pacienteSeleccionado?.apellido}.pdf`);
}


}

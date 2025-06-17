
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Supabase } from '../../servicios/supabase';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';


// @Component({
//   selector: 'app-solicitar-turno',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './solicitar-turno.html',
//   styleUrls: ['./solicitar-turno.scss']
// })
// export class SolicitarTurno implements OnInit {
//   especialistas: any[] = [];
//   especialidades: string[] = [];
//   especialistaSeleccionado: any = null;
//   horariosDelDia: string[] = [];
//   formTurno!: FormGroup;
//   userId: string | null = null;

//   constructor(private fb: FormBuilder, private supabase: Supabase) {}

//   async ngOnInit() {
//     const session = await this.supabase.supabase.auth.getUser();
//     this.userId = session.data.user?.id || null;

//     this.formTurno = this.fb.group({
//       especialistaId: ['', Validators.required],
//       especialidad: ['', Validators.required],
//       fecha: ['', Validators.required],
//       hora: ['', Validators.required]
//     });

//     const { data } = await this.supabase.supabase
//       .from('usuarios')
//       .select('id, nombre, apellido, mail, especialidades, fotoPerfil, horarios')
//       .eq('rol', 'Especialista');

//     if (data) this.especialistas = data;
//   }

//   onEspecialistaChange() {
//     const idSeleccionado = this.formTurno.value.especialistaId;
//     this.especialistaSeleccionado = this.especialistas.find(e => e.id === idSeleccionado);

//     const espRaw = this.especialistaSeleccionado?.especialidades;

//     try {
//       if (Array.isArray(espRaw)) {
//         this.especialidades = espRaw;
//       } else if (typeof espRaw === 'string' && espRaw.trim().startsWith('[')) {
//         this.especialidades = JSON.parse(espRaw);
//       } else if (typeof espRaw === 'string') {
//         this.especialidades = espRaw.split(',').map(e => e.trim());
//       } else {
//         this.especialidades = [];
//       }
//     } catch {
//       this.especialidades = [];
//     }

//     this.formTurno.patchValue({ especialidad: '', fecha: '', hora: '' });
//     this.horariosDelDia = [];
//   }

//   async onFechaChange() {
//     const fecha = this.formTurno.value.fecha;
//     const especialidad = this.formTurno.value.especialidad;
//     const horarios = this.especialistaSeleccionado?.horarios || [];
//     const disponibles: string[] = [];

//     for (const h of horarios) {
//       let esp = h.especialidad;
//       if (typeof esp === 'string' && esp.startsWith('[')) {
//         try {
//           esp = JSON.parse(esp)[0];
//         } catch {}
//       }
//       if (h.fecha === fecha && esp === especialidad) {
//         disponibles.push(...this.generarBloques(h));
//       }
//     }

//     const { data: ocupados } = await this.supabase.supabase
//       .from('turnos')
//       .select('hora')
//       .eq('especialista', this.formTurno.value.especialistaId)
//       .eq('fecha', fecha);

//     const horasOcupadas = ocupados?.map(t => t.hora) || [];
//     this.horariosDelDia = disponibles.filter(h => !horasOcupadas.includes(h));
//   }

//   generarBloques(horario: any): string[] {
//     const bloques: string[] = [];
//     const duracion = horario.duracion || 30;
//     let [h, m] = horario.horaInicio.split(':').map(Number);
//     const [hf, mf] = horario.horaFin.split(':').map(Number);

//     while (h < hf || (h === hf && m < mf)) {
//       bloques.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
//       m += duracion;
//       if (m >= 60) {
//         h++;
//         m -= 60;
//       }
//     }

//     return bloques;
//   }

// async solicitarTurno() {
//   if (this.formTurno.invalid || !this.userId || !this.especialistaSeleccionado) return;

//   const { especialistaId, especialidad, fecha, hora } = this.formTurno.value;

//   const { error } = await this.supabase.supabase.from('turnos').insert({
//     paciente: this.userId,
//     especialista: this.especialistaSeleccionado.mail,
//     especialidad,
//     fecha,
//     hora,
//     estado: 'pendiente'
//   });

//   if (error) {
//     Swal.fire({
//       icon: 'error',
//       title: 'Error',
//       text: 'No se pudo solicitar el turno. Intente nuevamente.',
//     });
//   } else {
//     Swal.fire({
//       icon: 'success',
//       title: 'Turno solicitado',
//       text: 'Tu turno fue solicitado correctamente.',
//     });
//   }

//   this.formTurno.reset();
//   this.especialidades = [];
//   this.horariosDelDia = [];
//   this.especialistaSeleccionado = null;
// }

//   logout() {
//     this.supabase.supabase.auth.signOut();
//     location.href = '/bienvenida';
//   }
// }



import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Supabase } from '../../servicios/supabase';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './solicitar-turno.html',
  styleUrls: ['./solicitar-turno.scss']
})
export class SolicitarTurno implements OnInit {
  especialistas: any[] = [];
  especialidades: string[] = [];
  especialistaSeleccionado: any = null;
  horariosDelDia: string[] = [];
  formTurno!: FormGroup;
  userId: string | null = null;
  

  constructor(private fb: FormBuilder, private supabase: Supabase, private router: Router) {}

  async ngOnInit() {
    const session = await this.supabase.supabase.auth.getUser();
    this.userId = session.data.user?.id || null;

    this.formTurno = this.fb.group({
      especialistaId: ['', Validators.required],
      especialidad: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });

    const { data } = await this.supabase.supabase
      .from('usuarios')
      .select('id, nombre, apellido, mail, especialidades, fotoPerfil, horarios')
      .eq('rol', 'Especialista');

    if (data) this.especialistas = data;
  }

  onEspecialistaChange() {
    const idSeleccionado = this.formTurno.value.especialistaId;
    this.especialistaSeleccionado = this.especialistas.find(e => e.id === idSeleccionado);

    const espRaw = this.especialistaSeleccionado?.especialidades;

    try {
      if (Array.isArray(espRaw)) {
        this.especialidades = espRaw;
      } else if (typeof espRaw === 'string' && espRaw.trim().startsWith('[')) {
        this.especialidades = JSON.parse(espRaw);
      } else if (typeof espRaw === 'string') {
        this.especialidades = espRaw.split(',').map(e => e.trim());
      } else {
        this.especialidades = [];
      }
    } catch {
      this.especialidades = [];
    }

    this.formTurno.patchValue({ especialidad: '', fecha: '', hora: '' });
    this.horariosDelDia = [];
  }

async onFechaChange() {
  const fecha = this.formTurno.value.fecha;
  const especialidadSeleccionada = this.formTurno.value.especialidad;
  const horarios = this.especialistaSeleccionado?.horarios || [];
  const disponibles: string[] = [];

  for (const h of horarios) {
    let esp = h.especialidad;

    try {
  if (Array.isArray(esp)) {
    esp = esp[0];
  } else if (typeof esp === 'string') {
    // Si parece un array pero con comillas dobles sin escapar, intenta repararlo
    if (esp.trim().startsWith('[')) {
      esp = JSON.parse(esp.replace(/'/g, '"').replace(/\\"/g, '"'));
    }
  }
  if (Array.isArray(esp)) {
    esp = esp[0];
  }
} catch (e) {
  console.warn('❌ Error al parsear especialidad:', esp, e);
  esp = '';
}

    // Coincide especialidad y fecha, y está disponible
    if (h.fecha === fecha && esp === especialidadSeleccionada && h.estado === 'disponible') {
      disponibles.push(...this.generarBloques(h));
    }
  }

  // Buscar turnos ya tomados para ese especialista y fecha
  const { data: ocupados } = await this.supabase.supabase
    .from('turnos')
    .select('hora')
    .eq('especialista', this.especialistaSeleccionado.mail)
    .eq('fecha', fecha);

  const horasOcupadas = ocupados?.map(t => t.hora) || [];

  // Excluir horas ya tomadas
  this.horariosDelDia = disponibles.filter(h => !horasOcupadas.includes(h));
}


  generarBloques(horario: any): string[] {
    const bloques: string[] = [];
    const duracion = horario.duracion || 30;
    let [h, m] = horario.horaInicio.split(':').map(Number);
    const [hf, mf] = horario.horaFin.split(':').map(Number);

    while (h < hf || (h === hf && m < mf)) {
      bloques.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      m += duracion;
      if (m >= 60) {
        h++;
        m -= 60;
      }
    }

    return bloques;
  }

async solicitarTurno() {
  if (this.formTurno.invalid || !this.userId || !this.especialistaSeleccionado) return;

  const { especialidad, fecha, hora } = this.formTurno.value;
  const mailEspecialista = this.especialistaSeleccionado.mail;

  // 1. Insertar en tabla "turnos"
  const { error: insertError } = await this.supabase.supabase.from('turnos').insert({
    paciente: this.userId,
    especialista: mailEspecialista,
    especialidad,
    fecha,
    hora,
    estado: 'pendiente'
  });

  if (insertError) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo solicitar el turno.' });
    return;
  }

  // 2. Actualizar horarios en tabla usuarios
  const horariosActualizados = this.especialistaSeleccionado.horarios.map((h: any) => {
    let esp = h.especialidad;
    if (typeof esp === 'string' && esp.startsWith('[')) {
      try { esp = JSON.parse(esp)[0]; } catch {}
    }

    if (
      h.fecha === fecha &&
      h.horaInicio === hora &&
      esp === especialidad &&
      h.estado === 'disponible'
    ) {
      return { ...h, estado: 'ocupado' };  // o 'pendiente'
    }

    return h;
  });

  const { error: updateError } = await this.supabase.supabase
    .from('usuarios')
    .update({ horarios: horariosActualizados })
    .eq('mail', mailEspecialista);

  if (updateError) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Turno tomado, pero no se actualizó el estado del horario.' });
  } else {
    Swal.fire({ icon: 'success', title: 'Turno solicitado', text: 'Tu turno fue reservado exitosamente.' });
    this.formTurno.reset();
    this.especialidades = [];
    this.horariosDelDia = [];
    this.especialistaSeleccionado = null;
  }
}
 goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
  logout() {
    this.supabase.supabase.auth.signOut();
    location.href = '/bienvenida';
  }
}

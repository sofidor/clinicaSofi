// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Supabase } from '../../servicios/supabase';

// @Component({
//   selector: 'app-mis-turnos-especialista',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './mis-turnos-especialista.html',
//   styleUrls: ['./mis-turnos-especialista.scss']
// })
// export class MisTurnosEspecialista implements OnInit {
//   userData: any = null;
//   rol: string = '';

//   horarios: {
//     especialidad: string;
//     duracion: number;
//     fecha: string;
//     horaInicio: string;
//     horaFin: string;
//     estado: string;
//   }[] = [];

//   especialidades: string[] = [];
//   horas: string[] = [];
//   turnos: any[] = [];
//   horariosOcupados: any[] = [];

//   constructor(private supabase: Supabase, private router: Router) {}

//   async ngOnInit() {
//     this.generarHoras();

//     const { data: session } = await this.supabase.supabase.auth.getUser();
//     const email = session.user?.email;

//     const { data: usuario, error } = await this.supabase.supabase
//       .from('usuarios')
//       .select('*')
//       .eq('mail', email)
//       .single();

//     if (error || !usuario) {
//       console.error('Error al obtener usuario:', error);
//       return;
//     }

//     this.userData = usuario;
//     this.rol = usuario.rol;
//     this.horarios = usuario.horarios || [];

//     if (typeof usuario.especialidades === 'string') {
//       this.especialidades = usuario.especialidades.split(',').map((e: string) => e.trim());
//     } else {
//       this.especialidades = usuario.especialidades || [];
//     }

//     if (this.rol === 'Especialista') {
//       const { data: turnosData } = await this.supabase.supabase
//         .from('turnos')
//         .select('*')
//         .eq('especialista', usuario.mail)
//         .eq('estado', 'disponible');

//       this.turnos = turnosData || [];
//       this.horariosOcupados = this.turnos.map(t => ({
//         especialidad: t.especialidad,
//         fecha: t.fecha,
//         horaInicio: t.hora
//       }));
//     }

//     if (this.horarios.length === 0) {
//       this.agregarHorario();
//     }
//   }

//   generarHoras() {
//     const intervalo = 30;
//     for (let h = 0; h < 24; h++) {
//       for (let m = 0; m < 60; m += intervalo) {
//         const hora = h.toString().padStart(2, '0');
//         const minuto = m.toString().padStart(2, '0');
//         this.horas.push(`${hora}:${minuto}`);
//       }
//     }
//   }

//   agregarHorario() {
//     this.horarios.push({
//       especialidad: this.especialidades.length === 1 ? this.especialidades[0] : '',
//       duracion: 30,
//       fecha: '',
//       horaInicio: '',
//       horaFin: '',
//       estado: 'disponible'
//     });
//   }

//   normalizarEspecialidad(raw: any): string {
//     try {
//       if (Array.isArray(raw)) return raw[0];
//       if (typeof raw === 'string') {
//         const limpiado = raw.trim();
//         if (limpiado.startsWith('[')) {
//           const json = JSON.parse(limpiado.replace(/'/g, '"'));
//           return Array.isArray(json) ? json[0] : json;
//         }
//       }
//     } catch (e) {
//       console.warn('Error al normalizar especialidad:', raw);
//     }
//     return typeof raw === 'string' ? raw.replace(/[\[\]"]/g, '') : '';
//   }

//   async eliminarHorario(index: number) {
//     const horarioEliminado = this.horarios[index];
//     this.horarios.splice(index, 1);

//     const especialidadNormalizada = this.normalizarEspecialidad(horarioEliminado.especialidad);

//     const { error: errorUsuario } = await this.supabase.supabase
//       .from('usuarios')
//       .update({ horarios: this.horarios })
//       .eq('mail', this.userData.mail);

//     if (errorUsuario) {
//       alert('Error al actualizar horarios del usuario');
//       return;
//     }

//     const bloques = this.generarBloques(horarioEliminado);
//     for (const hora of bloques) {
//       await this.supabase.supabase
//         .from('turnos')
//         .delete()
//         .match({
//           especialista: this.userData.mail,
//           fecha: horarioEliminado.fecha,
//           hora,
//           especialidad: especialidadNormalizada,
//           estado: 'disponible'
//         });
//     }

//     alert('Horario y turnos eliminados correctamente');
//   }

//   especialidadesNoUsadas(indexActual: number): string[] {
//     const usadas = this.horarios.filter((_, i) => i !== indexActual).map(h => h.especialidad);
//     return this.especialidades.filter(e => !usadas.includes(e));
//   }

//   async guardarHorarios() {
//     this.horarios = this.horarios.map(h => ({
//       ...h,
//       estado: h.estado || 'disponible',
//       especialidad: this.normalizarEspecialidad(h.especialidad)
//     }));

//     const { error } = await this.supabase.supabase
//       .from('usuarios')
//       .update({ horarios: this.horarios })
//       .eq('mail', this.userData.mail);

//     if (!error) {
//       const bloques: any[] = [];
//       for (const h of this.horarios) {
//         const especialidad = this.normalizarEspecialidad(h.especialidad);
//         const bloquesHorario = this.generarBloques(h);
//         for (const hora of bloquesHorario) {
//           bloques.push({
//             especialista: this.userData.mail,
//             especialidad,
//             fecha: h.fecha,
//             hora,
//             estado: 'disponible'
//           });
//         }
//       }
//       if (bloques.length) {
//         await this.supabase.supabase.from('turnos').insert(bloques);
//       }
//       alert('Horarios guardados y turnos generados.');
//     } else {
//       alert('Ocurrió un error al guardar los horarios.');
//     }
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

//   logout() {
//     this.supabase.supabase.auth.signOut();
//     this.router.navigate(['/bienvenida']);
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Supabase } from '../../servicios/supabase';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-mis-turnos-especialista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos-especialista.html',
  styleUrls: ['./mis-turnos-especialista.scss']
})
export class MisTurnosEspecialista implements OnInit {
  userData: any = null;
  rol: string = '';
  mostrarPerfil: boolean = true;
  filtroEspecialidad: string | null = null;
  filtroPaciente: string | null = null;
  turnosFiltrados: any[] = [];
  especialidadesUnicas: string[] = [];
  pacientesUnicos: string[] = [];

  horarios: {
    especialidad: string;
    duracion: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    estado: string;
  }[] = [];

  especialidades: string[] = [];
  horas: string[] = [];
  turnos: any[] = [];
  horariosOcupados: any[] = [];

  constructor(private supabase: Supabase, private router: Router) {}

  async ngOnInit() {
    this.generarHoras();

    const { data: session } = await this.supabase.supabase.auth.getUser();
    const email = session.user?.email;

    const { data: usuario, error } = await this.supabase.supabase
      .from('usuarios')
      .select('*')
      .eq('mail', email)
      .single();

    if (error || !usuario) {
      console.error('Error al obtener usuario:', error);
      return;
    }

    this.userData = usuario;
    this.rol = usuario.rol;
    this.horarios = usuario.horarios || [];

    if (typeof usuario.especialidades === 'string') {
      this.especialidades = usuario.especialidades.split(',').map((e: string) => e.trim());
    } else {
      this.especialidades = usuario.especialidades || [];
    }

if (this.rol === 'Especialista') {
  const { data: turnosData } = await this.supabase.supabase
    .from('turnos')
    .select('*')
    .eq('especialista', usuario.mail);

  this.turnos = turnosData || [];

  // 🔍 Extraer los IDs únicos de pacientes
  const pacientesIds = [...new Set(this.turnos.map(t => t.paciente))];

  // 📦 Buscar datos de los pacientes
  const { data: pacientesData } = await this.supabase.supabase
    .from('usuarios')
    .select('id, nombre, apellido')
    .in('id', pacientesIds);

  // 🧠 Crear un mapa rápido de búsqueda
  const mapaPacientes: Record<string, string> = {};
  pacientesData?.forEach(p => {
    mapaPacientes[p.id] = `${p.nombre} ${p.apellido}`;
  });

  // 🧩 Combinar datos en los turnos
  this.turnos = this.turnos.map(t => ({
    ...t,
    nombrePaciente: mapaPacientes[t.paciente] || 'Paciente desconocido'
  }));

  this.actualizarFiltros();
  this.aplicarFiltros();
}

}


  generarHoras() {
    const intervalo = 30;
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervalo) {
        const hora = h.toString().padStart(2, '0');
        const minuto = m.toString().padStart(2, '0');
        this.horas.push(`${hora}:${minuto}`);
      }
    }
  }

  agregarHorario() {
    this.horarios.push({
      especialidad: this.especialidades.length === 1 ? this.especialidades[0] : '',
      duracion: 30,
      fecha: '',
      horaInicio: '',
      horaFin: '',
      estado: 'disponible'
    });
  }

  normalizarEspecialidad(raw: any): string {
    try {
      if (Array.isArray(raw)) return raw[0];
      if (typeof raw === 'string') {
        const limpiado = raw.trim();
        if (limpiado.startsWith('[')) {
          const json = JSON.parse(limpiado.replace(/'/g, '"'));
          return Array.isArray(json) ? json[0] : json;
        }
      }
    } catch (e) {
      console.warn('Error al normalizar especialidad:', raw);
    }
    return typeof raw === 'string' ? raw.replace(/[\[\]"]/g, '') : '';
  }

  async eliminarHorario(index: number) {
    const horarioEliminado = this.horarios[index];
    this.horarios.splice(index, 1);

    const especialidadNormalizada = this.normalizarEspecialidad(horarioEliminado.especialidad);

    const { error: errorUsuario } = await this.supabase.supabase
      .from('usuarios')
      .update({ horarios: this.horarios })
      .eq('mail', this.userData.mail);

    if (errorUsuario) {
      alert('Error al actualizar horarios del usuario');
      return;
    }

    const bloques = this.generarBloques(horarioEliminado);
    for (const hora of bloques) {
      await this.supabase.supabase
        .from('turnos')
        .delete()
        .match({
          especialista: this.userData.mail,
          fecha: horarioEliminado.fecha,
          hora,
          especialidad: especialidadNormalizada,
          estado: 'disponible'
        });
    }

    alert('Horario y turnos eliminados correctamente');
  }

  especialidadesNoUsadas(indexActual: number): string[] {
    const usadas = this.horarios.filter((_, i) => i !== indexActual).map(h => h.especialidad);
    return this.especialidades.filter(e => !usadas.includes(e));
  }

  async guardarHorarios() {
    this.horarios = this.horarios.map(h => ({
      ...h,
      estado: h.estado || 'disponible',
      especialidad: this.normalizarEspecialidad(h.especialidad)
    }));

    const { error } = await this.supabase.supabase
      .from('usuarios')
      .update({ horarios: this.horarios })
      .eq('mail', this.userData.mail);

    if (!error) {
      const bloques: any[] = [];
      for (const h of this.horarios) {
        const especialidad = this.normalizarEspecialidad(h.especialidad);
        const bloquesHorario = this.generarBloques(h);
        for (const hora of bloquesHorario) {
          bloques.push({
            especialista: this.userData.mail,
            especialidad,
            fecha: h.fecha,
            hora,
            estado: 'disponible'
          });
        }
      }
      if (bloques.length) {
        await this.supabase.supabase.from('turnos').insert(bloques);
      }
      alert('Horarios guardados y turnos generados.');
    } else {
      alert('Ocurrió un error al guardar los horarios.');
    }
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

aplicarFiltros() {
  this.turnosFiltrados = this.turnos.filter(t =>
    (!this.filtroEspecialidad || t.especialidad === this.filtroEspecialidad) &&
    (!this.filtroPaciente || t.paciente === this.filtroPaciente)
  );
}


actualizarFiltros() {
  this.especialidadesUnicas = [...new Set(this.turnos.map(t => t.especialidad))];
  this.pacientesUnicos = [...new Set(this.turnos.map(t => t.paciente))];
  this.aplicarFiltros();
}

puedeAceptar(estado: string): boolean {
  return !['realizado', 'cancelado', 'rechazado'].includes(estado);
}

puedeRechazar(estado: string): boolean {
  return !['aceptado', 'realizado', 'cancelado'].includes(estado);
}

puedeCancelar(estado: string): boolean {
  return !['aceptado', 'realizado', 'rechazado'].includes(estado);
}

async aceptarTurno(turno: any) {
  const confirm = await Swal.fire({
    title: '¿Aceptar turno?',
    text: 'Estás por aceptar este turno.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Aceptar'
  });

  if (confirm.isConfirmed) {
    await this.supabase.supabase.from('turnos').update({ estado: 'aceptado' }).eq('id', turno.id);
    this.recargarTurnos();
  }
}

async rechazarTurno(turno: any) {
  const { value: motivo } = await Swal.fire({
    title: 'Motivo del rechazo',
    input: 'text',
    inputLabel: 'Ingrese el motivo',
    inputValidator: (value) => !value && 'El motivo es obligatorio',
    showCancelButton: true
  });

  if (motivo) {
    await this.supabase.supabase.from('turnos')
      .update({ estado: 'rechazado', motivo_rechazo: motivo })
      .eq('id', turno.id);
    this.recargarTurnos();
  }
}

async cancelarTurno(turno: any) {
  const { value: motivo } = await Swal.fire({
    title: 'Motivo de la cancelación',
    input: 'text',
    inputLabel: 'Ingrese el motivo',
    inputValidator: (value) => !value && 'El motivo es obligatorio',
    showCancelButton: true
  });

  if (motivo) {
    await this.supabase.supabase.from('turnos')
      .update({ estado: 'cancelado', motivo_cancelacion: motivo })
      .eq('id', turno.id);
    this.recargarTurnos();
  }
}

async finalizarTurno(turno: any) {
  const { value: comentario } = await Swal.fire({
    title: 'Finalizar turno',
    input: 'textarea',
    inputLabel: 'Comentario de diagnóstico',
    inputValidator: (value) => !value && 'El comentario es obligatorio',
    showCancelButton: true
  });

  if (comentario) {
    await this.supabase.supabase.from('turnos')
      .update({ estado: 'realizado', comentarioEspecialista: comentario })
      .eq('id', turno.id);
    this.recargarTurnos();
  }
}

verResena(turno: any) {
  Swal.fire({
    title: 'Reseña del paciente',
    text: turno.encuestaPaciente || 'Sin comentarios.',
    icon: 'info'
  });
}

async recargarTurnos() {
  const { data } = await this.supabase.supabase
    .from('turnos')
    .select('*')
    .eq('especialista', this.userData.mail);
  this.turnos = data || [];
  this.actualizarFiltros();
}

toggleVista(mostrar: boolean) {
  this.mostrarPerfil = mostrar;
}

  logout() {
    this.supabase.supabase.auth.signOut();
    this.router.navigate(['/bienvenida']);
  }
}


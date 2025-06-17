// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Supabase } from '../../servicios/supabase';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-mis-turnos-paciente',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './mis-turnos-paciente.html',
//   styleUrls: ['./mis-turnos-paciente.scss']
// })
// export class MisTurnosPaciente implements OnInit {
//   turnos: any[] = [];
//   filtroEspecialidad: string | null = null;
//   filtroEspecialista: string | null = null;
//   especialidades: string[] = [];
//   especialistas: string[] = [];
//   comentarioCancelacion: { [key: string]: string } = {};
//   comentarioAtencion: { [key: string]: string } = {};
//   userId: string | null = null;
//   userData: any = null;
//   mostrarPerfil: boolean = true;

//   constructor(private supabase: Supabase, private router: Router) {}

//   async ngOnInit() {
//     const session = await this.supabase.supabase.auth.getUser();
//     const email = session.data.user?.email;
//     this.userId = session.data.user?.id || null;

//     const { data: usuario, error: userError } = await this.supabase.supabase
//       .from('usuarios')
//       .select('*')
//       .eq('mail', email)
//       .single();

//     if (!userError && usuario) {
//       this.userData = usuario;
//     }

//     const { data: turnos, error: turnosError } = await this.supabase.supabase
//       .from('turnos')
//       .select('*')
//       .eq('paciente', this.userId);

//     if (!turnosError && turnos) {
//       this.turnos = turnos;
//       this.especialidades = [...new Set(turnos.map(t => t.especialidad))];
//       this.especialistas = [...new Set(turnos.map(t => t.especialista))];
//       console.log('🧠 userId actual:', this.userId);
//       console.log('✅ Turnos cargados:', this.turnos);
//     } else {
//       console.warn('⚠️ No se encontraron turnos o hubo un error:', turnosError);
//     }
//   }

//   turnosFiltrados() {
//     return this.turnos.filter(t => {
//       const filtraEsp = this.filtroEspecialidad ? t.especialidad === this.filtroEspecialidad : true;
//       const filtraDoc = this.filtroEspecialista ? t.especialista === this.filtroEspecialista : true;
//       return filtraEsp && filtraDoc;
//     });
//   }

//   puedeCancelar(turno: any) {
//     return turno.estado !== 'realizado' && turno.estado !== 'cancelado';
//   }

//   puedeVerResena(turno: any) {
//     return !!turno.comentarioEspecialista;
//   }

//   puedeCompletarEncuesta(turno: any) {
//     return turno.estado === 'realizado' && !!turno.comentarioEspecialista && !turno.encuestaPaciente;
//   }

//   puedeCalificar(turno: any) {
//     return turno.estado === 'realizado' && !turno.calificacionPaciente;
//   }

//   mostrarCancelar(turnoId: string) {
//     this.comentarioCancelacion[turnoId] = '';
//   }

//   async cancelarTurno(turnoId: string) {
//     const comentario = this.comentarioCancelacion[turnoId];
//     if (!comentario) return;
//     await this.supabase.supabase
//       .from('turnos')
//       .update({ estado: 'cancelado', motivo_cancelacion: comentario })
//       .eq('id', turnoId);
//     this.ngOnInit();
//   }

//   verResena(turno: any) {
//     alert(`Reseña del especialista: ${turno.comentarioEspecialista}`);
//   }

//   completarEncuesta(turnoId: string) {
//     alert('Completar encuesta para el turno ' + turnoId);
//   }

//   mostrarComentario(turnoId: string) {
//     this.comentarioAtencion[turnoId] = '';
//   }

//   async calificarAtencion(turnoId: string) {
//     const comentario = this.comentarioAtencion[turnoId];
//     if (!comentario) return;
//     await this.supabase.supabase
//       .from('turnos')
//       .update({ calificacionPaciente: comentario })
//       .eq('id', turnoId);
//     this.ngOnInit();
//   }

//   toggleVista(mostrar: boolean) {
//     this.mostrarPerfil = mostrar;
//   }

//   goTo(path: string) {
//     this.router.navigate([`/${path}`]);
//   }

//   logout() {
//     this.supabase.supabase.auth.signOut();
//     location.href = '/bienvenida';
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../../servicios/supabase';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-turnos-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos-paciente.html',
  styleUrls: ['./mis-turnos-paciente.scss']
})
export class MisTurnosPaciente implements OnInit {
  turnos: any[] = [];
  filtroEspecialidad: string | null = null;
  filtroEspecialista: string | null = null;
  especialidades: string[] = [];
  especialistas: string[] = [];
  comentarioCancelacion: { [key: string]: string } = {};
  comentarioAtencion: { [key: string]: string } = {};
  userId: string | null = null;
  userData: any = null;
  mostrarPerfil: boolean = true;

  constructor(private supabase: Supabase, private router: Router) {}

  async ngOnInit() {
    const session = await this.supabase.supabase.auth.getUser();
    const email = session.data.user?.email;
    this.userId = session.data.user?.id || null;

    const { data: usuario, error: userError } = await this.supabase.supabase
      .from('usuarios')
      .select('*')
      .eq('mail', email)
      .single();

    if (!userError && usuario) {
      this.userData = usuario;
    }

    const { data: turnos, error: turnosError } = await this.supabase.supabase
      .from('turnos')
      .select('*')
      .eq('paciente', this.userId);

    if (!turnosError && turnos) {
      this.turnos = turnos;
      this.especialidades = [...new Set(turnos.map(t => t.especialidad))];
      this.especialistas = [...new Set(turnos.map(t => t.especialista))];
    } else {
      Swal.fire({ icon: 'warning', title: 'Sin turnos', text: 'No se encontraron turnos.' });
    }
  }

  turnosFiltrados() {
    return this.turnos.filter(t => {
      const filtraEsp = this.filtroEspecialidad ? t.especialidad === this.filtroEspecialidad : true;
      const filtraDoc = this.filtroEspecialista ? t.especialista === this.filtroEspecialista : true;
      return filtraEsp && filtraDoc;
    });
  }

  puedeCancelar(turno: any) {
    return turno.estado !== 'realizado' && turno.estado !== 'cancelado';
  }

  puedeVerResena(turno: any) {
    return !!turno.comentarioEspecialista;
  }

  puedeCalificar(turno: any) {
    return turno.estado === 'realizado' && !turno.calificacionPaciente;
  }

  mostrarCancelar(turnoId: string) {
    this.comentarioCancelacion[turnoId] = '';
  }

  async cancelarTurno(turnoId: string) {
    const comentario = this.comentarioCancelacion[turnoId];
    if (!comentario) return;
    const { error } = await this.supabase.supabase
      .from('turnos')
      .update({ estado: 'cancelado', motivo_cancelacion: comentario })
      .eq('id', turnoId);

    if (!error) {
      Swal.fire({ icon: 'success', title: 'Turno cancelado', text: 'Tu turno fue cancelado correctamente.' });
      this.ngOnInit();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar el turno.' });
    }
  }

  verResena(turno: any) {
    Swal.fire({
      title: 'Reseña del especialista',
      text: turno.comentarioEspecialista,
      icon: 'info'
    });
  }

  mostrarComentario(turnoId: string) {
    this.comentarioAtencion[turnoId] = '';
  }

  async calificarAtencion(turnoId: string) {
    const comentario = this.comentarioAtencion[turnoId];
    if (!comentario) return;
    const { error } = await this.supabase.supabase
      .from('turnos')
      .update({ calificacionPaciente: comentario })
      .eq('id', turnoId);

    if (!error) {
      Swal.fire({ icon: 'success', title: 'Gracias por tu opinión', text: 'Tu calificación fue registrada.' });
      this.ngOnInit();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la calificación.' });
    }
  }

  toggleVista(mostrar: boolean) {
    this.mostrarPerfil = mostrar;
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  logout() {
    this.supabase.supabase.auth.signOut();
    location.href = '/bienvenida';
  }
}

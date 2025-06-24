
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Supabase } from '../../servicios/supabase';
// import Swal from 'sweetalert2';


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
//   mostrarPerfil: boolean = true;
//   filtroEspecialidad: string | null = null;
//   filtroPaciente: string | null = null;
//   turnosFiltrados: any[] = [];
//   especialidadesUnicas: string[] = [];
//   pacientesUnicos: string[] = [];

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
//     this.horarios = this.horarios.map(h => ({
//   ...h,
//   especialidad: this.normalizarEspecialidad(h.especialidad)
// }));

//     if (typeof usuario.especialidades === 'string') {
//       this.especialidades = usuario.especialidades.split(',').map((e: string) => e.trim());
//     } else {
//       this.especialidades = usuario.especialidades || [];
//     }

// if (this.rol === 'Especialista') {
//   const { data: turnosData } = await this.supabase.supabase
//     .from('turnos')
//     .select('*')
//     .eq('especialista', usuario.mail);

//   this.turnos = turnosData || [];

//   // 🔍 Extraer los IDs únicos de pacientes
//   const pacientesIds = [...new Set(this.turnos.map(t => t.paciente))];

//   // 📦 Buscar datos de los pacientes
//   const { data: pacientesData } = await this.supabase.supabase
//     .from('usuarios')
//     .select('id, nombre, apellido')
//     .in('id', pacientesIds);

//   // 🧠 Crear un mapa rápido de búsqueda
//   const mapaPacientes: Record<string, string> = {};
//   pacientesData?.forEach(p => {
//     mapaPacientes[p.id] = `${p.nombre} ${p.apellido}`;
//   });

//   // 🧩 Combinar datos en los turnos
//   this.turnos = this.turnos.map(t => ({
//     ...t,
//     nombrePaciente: mapaPacientes[t.paciente] || 'Paciente desconocido'
//   }));

//   this.actualizarFiltros();
//   this.aplicarFiltros();
// }

// }


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

// normalizarEspecialidad(raw: any): string {
//   try {
//     // Si es array, devolvemos el primer valor como string
//     if (Array.isArray(raw)) {
//       return (raw[0] || '').toString().trim();
//     }

//     // Si es un string tipo JSON: '["Cardiología"]' o incluso con comillas simples
//     if (typeof raw === 'string') {
//       const limpio = raw.trim();
//       if (limpio.startsWith('[')) {
//         const json = JSON.parse(limpio.replace(/'/g, '"'));
//         if (Array.isArray(json)) return (json[0] || '').toString().trim();
//         return json.toString().trim();
//       }

//       // Si es string común (ej: 'Cardiología')
//       return limpio.replace(/[\[\]"]/g, '').trim();
//     }

//     // Cualquier otro tipo
//     return raw?.toString().trim() || '';
//   } catch (e) {
//     console.warn('Error al normalizar especialidad:', raw, e);
//     return '';
//   }
// }


//   async eliminarHorario(index: number) {
//   const confirm = await Swal.fire({
//     title: '¿Eliminar horario?',
//     text: 'Esta acción eliminará también los turnos generados para este bloque.',
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonText: 'Sí, eliminar',
//     cancelButtonText: 'Cancelar'
//   });

//   if (!confirm.isConfirmed) return;

//   const horarioEliminado = this.horarios[index];
//   this.horarios.splice(index, 1);

//   const especialidadNormalizada = this.normalizarEspecialidad(horarioEliminado.especialidad);

//   const { error: errorUsuario } = await this.supabase.supabase
//     .from('usuarios')
//     .update({ horarios: this.horarios })
//     .eq('mail', this.userData.mail);

//   if (errorUsuario) {
//     Swal.fire('Error', 'No se pudo actualizar la información del usuario.', 'error');
//     return;
//   }

//   // Borrar turnos 'disponibles' asociados al horario
//   const bloques = this.generarBloques(horarioEliminado);

//   for (const hora of bloques) {
//     await this.supabase.supabase
//       .from('turnos')
//       .delete()
//       .match({
//         especialista: this.userData.mail,
//         fecha: horarioEliminado.fecha,
//         hora,
//         especialidad: especialidadNormalizada,
//         estado: 'disponible'
//       });
//   }

//   Swal.fire('Eliminado', 'Horario y turnos eliminados correctamente.', 'success');
// }


//   especialidadesNoUsadas(indexActual: number): string[] {
//     const usadas = this.horarios.filter((_, i) => i !== indexActual).map(h => h.especialidad);
//     return this.especialidades.filter(e => !usadas.includes(e));
//   }

//   async guardarHorarios() {
//   // Normalizamos datos antes de guardar
//   this.horarios = this.horarios.map(h => ({
//     ...h,
//     estado: h.estado || 'disponible',
//     especialidad: this.normalizarEspecialidad(h.especialidad)
//   }));

//   const { error } = await this.supabase.supabase
//     .from('usuarios')
//     .update({ horarios: this.horarios })
//     .eq('mail', this.userData.mail);

//   if (error) {
//     Swal.fire('Error', 'Ocurrió un error al guardar los horarios.', 'error');
//     return;
//   }

//   const bloques: any[] = [];

//   for (const h of this.horarios) {
//     const especialidad = this.normalizarEspecialidad(h.especialidad);
//     const bloquesHorario = this.generarBloques(h);
//     for (const hora of bloquesHorario) {
//       bloques.push({
//         especialista: this.userData.mail,
//         especialidad,
//         fecha: h.fecha,
//         hora,
//         estado: 'disponible'
//       });
//     }
//   }

//   if (bloques.length) {
//     await this.supabase.supabase.from('turnos').insert(bloques);
//   }

//   Swal.fire('Éxito', 'Horarios guardados correctamente.', 'success');
// }


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

// aplicarFiltros() {
//   this.turnosFiltrados = this.turnos.filter(t =>
//     (!this.filtroEspecialidad || t.especialidad === this.filtroEspecialidad) &&
//     (!this.filtroPaciente || t.paciente === this.filtroPaciente)
//   );
// }


// actualizarFiltros() {
//   this.especialidadesUnicas = [...new Set(this.turnos.map(t => t.especialidad))];
//   this.pacientesUnicos = [...new Set(this.turnos.map(t => t.paciente))];
//   this.aplicarFiltros();
// }

// puedeAceptar(estado: string): boolean {
//   return !['realizado', 'cancelado', 'rechazado'].includes(estado);
// }

// puedeRechazar(estado: string): boolean {
//   return !['aceptado', 'realizado', 'cancelado'].includes(estado);
// }

// puedeCancelar(estado: string): boolean {
//   return !['aceptado', 'realizado', 'rechazado'].includes(estado);
// }

// async aceptarTurno(turno: any) {
//   const confirm = await Swal.fire({
//     title: '¿Aceptar turno?',
//     text: 'Estás por aceptar este turno.',
//     icon: 'question',
//     showCancelButton: true,
//     confirmButtonText: 'Aceptar'
//   });

//   if (confirm.isConfirmed) {
//     await this.supabase.supabase.from('turnos').update({ estado: 'aceptado' }).eq('id', turno.id);
//     this.recargarTurnos();
//   }
// }

// async rechazarTurno(turno: any) {
//   const { value: motivo } = await Swal.fire({
//     title: 'Motivo del rechazo',
//     input: 'text',
//     inputLabel: 'Ingrese el motivo',
//     inputValidator: (value) => !value && 'El motivo es obligatorio',
//     showCancelButton: true
//   });

//   if (motivo) {
//     await this.supabase.supabase.from('turnos')
//       .update({ estado: 'rechazado', motivo_rechazo: motivo })
//       .eq('id', turno.id);
//     this.recargarTurnos();
//   }
// }

// async cancelarTurno(turno: any) {
//   const { value: motivo } = await Swal.fire({
//     title: 'Motivo de la cancelación',
//     input: 'text',
//     inputLabel: 'Ingrese el motivo',
//     inputValidator: (value) => !value && 'El motivo es obligatorio',
//     showCancelButton: true
//   });

//   if (motivo) {
//     await this.supabase.supabase.from('turnos')
//       .update({ estado: 'cancelado', motivo_cancelacion: motivo })
//       .eq('id', turno.id);
//     this.recargarTurnos();
//   }
// }

// async finalizarTurno(turno: any) {
//   const { value: comentario } = await Swal.fire({
//     title: 'Finalizar turno',
//     input: 'textarea',
//     inputLabel: 'Comentario de diagnóstico',
//     inputValidator: (value) => !value && 'El comentario es obligatorio',
//     showCancelButton: true
//   });

//   if (comentario) {
//     await this.supabase.supabase.from('turnos')
//       .update({ estado: 'realizado', comentarioEspecialista: comentario })
//       .eq('id', turno.id);
//     this.recargarTurnos();
//   }
// }

// verResena(turno: any) {
//   Swal.fire({
//     title: 'Reseña del paciente',
//     text: turno.encuestaPaciente || 'Sin comentarios.',
//     icon: 'info'
//   });
// }

// async recargarTurnos() {
//   const { data } = await this.supabase.supabase
//     .from('turnos')
//     .select('*')
//     .eq('especialista', this.userData.mail);
//   this.turnos = data || [];
//   this.actualizarFiltros();
// }

// toggleVista(mostrar: boolean) {
//   this.mostrarPerfil = mostrar;
// }

//   logout() {
//     this.supabase.supabase.auth.signOut();
//     this.router.navigate(['/bienvenida']);
//   }
// }

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Supabase } from '../../servicios/supabase';
// import Swal from 'sweetalert2';

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
//   mostrarPerfil: boolean = true;
//   filtroEspecialidad: string | null = null;
//   filtroPaciente: string | null = null;
//   turnosFiltrados: any[] = [];
//   especialidadesUnicas: string[] = [];
//   pacientesUnicos: string[] = [];

//   diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
//   horas: string[] = [];
//   especialidades: string[] = [];

//   horarios: {
//     dia: string;
//     horaInicio: string;
//     horaFin: string;
//     especialidad: string;
//     duracion: number;
//     estado: string;
//   }[] = [];

//   turnos: any[] = [];

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
//         .eq('especialista', usuario.mail);

//       this.turnos = turnosData || [];

//       const pacientesIds = [...new Set(this.turnos.map(t => t.paciente))];
//       const { data: pacientesData } = await this.supabase.supabase
//         .from('usuarios')
//         .select('id, nombre, apellido')
//         .in('id', pacientesIds);

//       const mapaPacientes: Record<string, string> = {};
//       pacientesData?.forEach(p => {
//         mapaPacientes[p.id] = `${p.nombre} ${p.apellido}`;
//       });

//       this.turnos = this.turnos.map(t => ({
//         ...t,
//         nombrePaciente: mapaPacientes[t.paciente] || 'Paciente desconocido'
//       }));

//       this.actualizarFiltros();
//       this.aplicarFiltros();
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
//       dia: '',
//       horaInicio: '',
//       horaFin: '',
//       especialidad: this.especialidades.length === 1 ? this.especialidades[0] : '',
//       duracion: 30,
//       estado: 'disponible'
//     });
//   }

//   obtenerFechasProximas(diaNombre: string): string[] {
//     const dias: Record<string, number> = {
//       'Domingo': 0,
//       'Lunes': 1,
//       'Martes': 2,
//       'Miércoles': 3,
//       'Jueves': 4,
//       'Viernes': 5,
//       'Sábado': 6
//     };

//     const hoy = new Date();
//     const resultados: string[] = [];
//     const target = dias[diaNombre];

//     for (let i = 0; i < 15; i++) {
//       const d = new Date();
//       d.setDate(hoy.getDate() + i);
//       if (d.getDay() === target) {
//         resultados.push(d.toISOString().split('T')[0]);
//       }
//     }

//     return resultados;
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

//   async guardarHorarios() {
    
//     await this.supabase.supabase
//       .from('usuarios')
//       .update({ horarios: this.horarios })
//       .eq('mail', this.userData.mail);

//     const bloques: any[] = [];

//     for (const h of this.horarios) {
//       const fechas = this.obtenerFechasProximas(h.dia);
//       for (const fecha of fechas) {
//         const bloquesHorario = this.generarBloques(h);
//         for (const hora of bloquesHorario) {
//           bloques.push({
//             especialista: this.userData.mail,
//             especialidad: h.especialidad,
//             fecha,
//             hora,
//             estado: 'disponible'
//           });
//         }
//       }
//     }

//     if (bloques.length) {
//       await this.supabase.supabase.from('turnos').insert(bloques);
//     }

//     Swal.fire('Horarios guardados', 'Los turnos se generaron correctamente.', 'success');
//   }

//   async eliminarHorario(index: number) {
//     const confirm = await Swal.fire({
//       title: '¿Eliminar horario?',
//       text: 'Esto eliminará también los turnos disponibles generados.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Eliminar'
//     });

//     if (!confirm.isConfirmed) return;

//     const horarioEliminado = this.horarios[index];
//     this.horarios.splice(index, 1);

//     await this.supabase.supabase
//       .from('usuarios')
//       .update({ horarios: this.horarios })
//       .eq('mail', this.userData.mail);

//     const fechas = this.obtenerFechasProximas(horarioEliminado.dia);
//     for (const fecha of fechas) {
//       const bloques = this.generarBloques(horarioEliminado);
//       for (const hora of bloques) {
//         await this.supabase.supabase
//           .from('turnos')
//           .delete()
//           .match({
//             especialista: this.userData.mail,
//             fecha,
//             hora,
//             especialidad: horarioEliminado.especialidad,
//             estado: 'disponible'
//           });
//       }
//     }

//     Swal.fire('Eliminado', 'Horario y turnos eliminados.', 'success');
//   }

//   aplicarFiltros() {
//     this.turnosFiltrados = this.turnos.filter(t =>
//       (!this.filtroEspecialidad || t.especialidad === this.filtroEspecialidad) &&
//       (!this.filtroPaciente || t.paciente === this.filtroPaciente)
//     );
//   }

//   actualizarFiltros() {
//     this.especialidadesUnicas = [...new Set(this.turnos.map(t => t.especialidad))];
//     this.pacientesUnicos = [...new Set(this.turnos.map(t => t.paciente))];
//     this.aplicarFiltros();
//   }

//   puedeAceptar(estado: string): boolean {
//     return !['realizado', 'cancelado', 'rechazado'].includes(estado);
//   }

//   puedeRechazar(estado: string): boolean {
//     return !['aceptado', 'realizado', 'cancelado'].includes(estado);
//   }

//   puedeCancelar(estado: string): boolean {
//     return !['aceptado', 'realizado', 'rechazado'].includes(estado);
//   }

//   async aceptarTurno(turno: any) {
//     const confirm = await Swal.fire({
//       title: '¿Aceptar turno?',
//       icon: 'question',
//       showCancelButton: true
//     });

//     if (confirm.isConfirmed) {
//       await this.supabase.supabase.from('turnos').update({ estado: 'aceptado' }).eq('id', turno.id);
//       this.recargarTurnos();
//     }
//   }

//   async rechazarTurno(turno: any) {
//     const { value: motivo } = await Swal.fire({
//       title: 'Motivo del rechazo',
//       input: 'text',
//       inputValidator: (v) => !v && 'El motivo es obligatorio',
//       showCancelButton: true
//     });

//     if (motivo) {
//       await this.supabase.supabase.from('turnos')
//         .update({ estado: 'rechazado', motivo_rechazo: motivo })
//         .eq('id', turno.id);
//       this.recargarTurnos();
//     }
//   }

//   async cancelarTurno(turno: any) {
//     const { value: motivo } = await Swal.fire({
//       title: 'Motivo de cancelación',
//       input: 'text',
//       inputValidator: (v) => !v && 'El motivo es obligatorio',
//       showCancelButton: true
//     });

//     if (motivo) {
//       await this.supabase.supabase.from('turnos')
//         .update({ estado: 'cancelado', motivo_cancelacion: motivo })
//         .eq('id', turno.id);
//       this.recargarTurnos();
//     }
//   }

//   async finalizarTurno(turno: any) {
//     const { value: comentario } = await Swal.fire({
//       title: 'Finalizar turno',
//       input: 'textarea',
//       inputValidator: (v) => !v && 'Comentario obligatorio',
//       showCancelButton: true
//     });

//     if (comentario) {
//       await this.supabase.supabase.from('turnos')
//         .update({ estado: 'realizado', comentarioEspecialista: comentario })
//         .eq('id', turno.id);
//       this.recargarTurnos();
//     }
//   }

//   verResena(turno: any) {
//     Swal.fire({
//       title: 'Reseña del paciente',
//       text: turno.encuestaPaciente || 'Sin comentarios.',
//       icon: 'info'
//     });
//   }

//   async recargarTurnos() {
//     const { data } = await this.supabase.supabase
//       .from('turnos')
//       .select('*')
//       .eq('especialista', this.userData.mail);
//     this.turnos = data || [];
//     this.actualizarFiltros();
//   }

//   toggleVista(mostrar: boolean) {
//     this.mostrarPerfil = mostrar;
//   }

//   logout() {
//     this.supabase.supabase.auth.signOut();
//     this.router.navigate(['/bienvenida']);
//   }
// }
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Supabase } from '../../servicios/supabase';
// import Swal from 'sweetalert2';

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
//   mostrarPerfil: boolean = true;
//   filtroEspecialidad: string | null = null;
//   filtroPaciente: string | null = null;
//   turnosFiltrados: any[] = [];
//   especialidadesUnicas: string[] = [];
//   pacientesUnicos: string[] = [];

//   diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
//   horas: string[] = [];
//   especialidades: string[] = [];

//   horarios: {
//     dia: string;
//     horaInicio: string;
//     horaFin: string;
//     especialidad: string;
//     duracion: number;
//     estado: string;
//   }[] = [];

//   turnos: any[] = [];

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
//         .eq('especialista', usuario.mail);

//       this.turnos = turnosData || [];

//       const pacientesIds = [...new Set(this.turnos.map(t => t.paciente))];
//       const { data: pacientesData } = await this.supabase.supabase
//         .from('usuarios')
//         .select('id, nombre, apellido')
//         .in('id', pacientesIds);

//       const mapaPacientes: Record<string, string> = {};
//       pacientesData?.forEach(p => {
//         mapaPacientes[p.id] = `${p.nombre} ${p.apellido}`;
//       });

//       this.turnos = this.turnos.map(t => ({
//         ...t,
//         nombrePaciente: mapaPacientes[t.paciente] || 'Paciente desconocido'
//       }));

//       this.actualizarFiltros();
//       this.aplicarFiltros();
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
//       dia: '',
//       horaInicio: '',
//       horaFin: '',
//       especialidad: this.especialidades.length === 1 ? this.especialidades[0] : '',
//       duracion: 30,
//       estado: 'disponible'
//     });
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

//   async guardarHorarios() {
//   await this.supabase.supabase
//     .from('usuarios')
//     .update({ horarios: this.horarios })
//     .eq('mail', this.userData.mail);

//   await this.supabase.supabase
//     .from('disponibilidad')
//     .delete()
//     .eq('especialista_id', this.userData.id);

//   const bloques: any[] = [];
//   const hoy = new Date();

//   for (let i = 0; i < 15; i++) {
//     const fecha = new Date(hoy);
//     fecha.setDate(hoy.getDate() + i);
//     const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' });

//     for (const h of this.horarios) {
//       if (h.dia.toLowerCase() === diaSemana.toLowerCase()) {
//         const bloquesHorario = this.generarBloques(h);
//         for (const horaInicio of bloquesHorario) {
//           const [hStart, mStart] = horaInicio.split(':').map(Number);
//           const inicio = `${String(hStart).padStart(2, '0')}:${String(mStart).padStart(2, '0')}`;
//           const finDate = new Date(fecha);
//           finDate.setHours(hStart);
//           finDate.setMinutes(mStart + h.duracion);
//           const fin = `${String(finDate.getHours()).padStart(2, '0')}:${String(finDate.getMinutes()).padStart(2, '0')}`;

//           bloques.push({
//             especialista_id: this.userData.id,
//             especialidad: h.especialidad,
//             dia: diaSemana,
//             inicio,
//             fin,
//             duracion: h.duracion,
//             estado: 'disponible'
//           });
//         }
//       }
//     }
//   }

//   if (bloques.length) {
//     const { error } = await this.supabase.supabase.from('disponibilidad').insert(bloques);
//     if (error) {
//       console.error('Error al insertar disponibilidad:', error.message, error.details);
//       Swal.fire('Error', 'No se pudo guardar la disponibilidad.', 'error');
//       return;
//     }
//   }

//   Swal.fire('Horarios guardados', 'La disponibilidad fue actualizada correctamente.', 'success');
// }



//   async eliminarHorario(index: number) {
//     const confirm = await Swal.fire({
//       title: '¿Eliminar horario?',
//       text: 'Esto eliminará también la disponibilidad generada.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Eliminar'
//     });

//     if (!confirm.isConfirmed) return;

//     const horarioEliminado = this.horarios[index];
//     this.horarios.splice(index, 1);

//     await this.supabase.supabase
//       .from('usuarios')
//       .update({ horarios: this.horarios })
//       .eq('mail', this.userData.mail);

//     await this.supabase.supabase
//       .from('disponibilidad')
//       .delete()
//       .match({
//         especialista_id: this.userData.id,
//         dia_semana: horarioEliminado.dia,
//         especialidad: horarioEliminado.especialidad,
//         estado: 'disponible'
//       });

//     Swal.fire('Eliminado', 'Disponibilidad eliminada correctamente.', 'success');
//   }

//   aplicarFiltros() {
//     this.turnosFiltrados = this.turnos.filter(t =>
//       (!this.filtroEspecialidad || t.especialidad === this.filtroEspecialidad) &&
//       (!this.filtroPaciente || t.paciente === this.filtroPaciente)
//     );
//   }

//   actualizarFiltros() {
//     this.especialidadesUnicas = [...new Set(this.turnos.map(t => t.especialidad))];
//     this.pacientesUnicos = [...new Set(this.turnos.map(t => t.paciente))];
//     this.aplicarFiltros();
//   }

//     puedeAceptar(estado: string): boolean {
//     return !['realizado', 'cancelado', 'rechazado'].includes(estado);
//   }

//   puedeRechazar(estado: string): boolean {
//     return !['aceptado', 'realizado', 'cancelado'].includes(estado);
//   }

//   puedeCancelar(estado: string): boolean {
//     return !['aceptado', 'realizado', 'rechazado'].includes(estado);
//   }

//   async aceptarTurno(turno: any) {
//   const confirm = await Swal.fire({
//     title: '¿Aceptar turno?',
//     text: 'Estás por aceptar este turno.',
//     icon: 'question',
//     showCancelButton: true,
//     confirmButtonText: 'Aceptar'
//   });

//   if (confirm.isConfirmed) {
//     await this.supabase.supabase.from('turnos').update({ estado: 'aceptado' }).eq('id', turno.id);
//     this.recargarTurnos();
//   }
// }

// async rechazarTurno(turno: any) {
//   const { value: motivo } = await Swal.fire({
//     title: 'Motivo del rechazo',
//     input: 'text',
//     inputLabel: 'Ingrese el motivo',
//     inputValidator: (value) => !value && 'El motivo es obligatorio',
//     showCancelButton: true
//   });

//   if (motivo) {
//     await this.supabase.supabase.from('turnos')
//       .update({ estado: 'rechazado', motivo_rechazo: motivo })
//       .eq('id', turno.id);
//     this.recargarTurnos();
//   }
// }

// async cancelarTurno(turno: any) {
//   const { value: motivo } = await Swal.fire({
//     title: 'Motivo de la cancelación',
//     input: 'text',
//     inputLabel: 'Ingrese el motivo',
//     inputValidator: (value) => !value && 'El motivo es obligatorio',
//     showCancelButton: true
//   });

//   if (motivo) {
//     await this.supabase.supabase.from('turnos')
//       .update({ estado: 'cancelado', motivo_cancelacion: motivo })
//       .eq('id', turno.id);
//     this.recargarTurnos();
//   }
// }

// async finalizarTurno(turno: any) {
//   const { value: comentario } = await Swal.fire({
//     title: 'Finalizar turno',
//     input: 'textarea',
//     inputLabel: 'Comentario de diagnóstico',
//     inputValidator: (value) => !value && 'El comentario es obligatorio',
//     showCancelButton: true
//   });

//   if (comentario) {
//     await this.supabase.supabase.from('turnos')
//       .update({ estado: 'realizado', comentarioEspecialista: comentario })
//       .eq('id', turno.id);
//     this.recargarTurnos();
//   }
// }

//   async recargarTurnos() {
//     const { data } = await this.supabase.supabase
//       .from('turnos')
//       .select('*')
//       .eq('especialista', this.userData.mail);
//     this.turnos = data || [];
//     this.actualizarFiltros();
//   }


// verResena(turno: any) {
//   Swal.fire({
//     title: 'Reseña del paciente',
//     text: turno.encuestaPaciente || 'Sin comentarios.',
//     icon: 'info'
//   });
// }

//   toggleVista(mostrar: boolean) {
//     this.mostrarPerfil = mostrar;
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
filtroPacienteId: string | null = null;
pacientesUnicos: { id: string, nombre: string }[] = [];
  diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  horas: string[] = [];
  especialidades: string[] = [];
  horarios: {
    dia: string;
    horaInicio: string;
    horaFin: string;
    especialidad: string;
    duracion: number;
    estado: string;
  }[] = [];
  turnos: any[] = [];

  constructor(private supabase: Supabase, private router: Router) {}

async ngOnInit() {
  this.generarHoras();

  // Obtener sesión y correo del usuario autenticado
  const { data: session } = await this.supabase.supabase.auth.getUser();
  const email = session.user?.email;

  // Traer datos del usuario desde la tabla 'usuarios'
  const { data: usuario, error } = await this.supabase.supabase
    .from('usuarios')
    .select('*')
    .eq('mail', email)
    .single();

  if (error || !usuario) {
    console.error('❌ Error al obtener usuario:', error);
    return;
  }

  this.userData = usuario;
  this.rol = usuario.rol;
  this.horarios = usuario.horarios || [];

  // Cargar especialidades del especialista
  this.especialidades = typeof usuario.especialidades === 'string'
    ? usuario.especialidades.split(',').map((e: string) => e.trim())
    : usuario.especialidades || [];

  // Si el usuario es especialista, cargar sus turnos
  if (this.rol === 'Especialista') {
    const { data: turnosData } = await this.supabase.supabase
      .from('turnos')
      .select('*')
      .eq('especialista', usuario.mail);

    this.turnos = turnosData || [];
    console.log('📋 Turnos encontrados:', this.turnos);

    // Obtener lista única de IDs de pacientes
    const pacientesIds = [...new Set(this.turnos.map(t => t.paciente))];

    // Traer datos de los pacientes (nombre + apellido)
    const { data: pacientesData } = await this.supabase.supabase
      .from('usuarios')
      .select('id, nombre, apellido')
      .in('id', pacientesIds);

    // Mapa para mostrar nombre del paciente en la tabla
    const mapaPacientes: Record<string, string> = {};
    this.pacientesUnicos = pacientesData?.map(p => ({
      id: p.id,
      nombre: `${p.nombre} ${p.apellido}`
    })) || [];

    pacientesData?.forEach(p => {
      mapaPacientes[p.id] = `${p.nombre} ${p.apellido}`;
    });

    // Añadir nombrePaciente a cada turno
    this.turnos = this.turnos.map(t => ({
      ...t,
      nombrePaciente: mapaPacientes[t.paciente] || 'Paciente desconocido'
    }));

    // Filtrar y mostrar
    this.actualizarFiltros();
    this.aplicarFiltros();
  }
}


  generarHoras() {
    const intervalo = 30;
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervalo) {
        this.horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
  }

  agregarHorario() {
    this.horarios.push({ dia: '', horaInicio: '', horaFin: '', especialidad: this.especialidades.length === 1 ? this.especialidades[0] : '', duracion: 30, estado: 'disponible' });
  }

  generarBloques(horario: any): string[] {
    const bloques: string[] = [];
    const duracion = horario.duracion || 30;
    let [h, m] = horario.horaInicio.split(':').map(Number);
    const [hf, mf] = horario.horaFin.split(':').map(Number);
    while (h < hf || (h === hf && m < mf)) {
      bloques.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      m += duracion;
      if (m >= 60) { h++; m -= 60; }
    }
    return bloques;
  }

  async guardarHorarios() {
  await this.supabase.supabase.from('usuarios').update({ horarios: this.horarios }).eq('mail', this.userData.mail);
  await this.supabase.supabase.from('disponibilidad').delete().eq('especialista_id', this.userData.id);

  const bloques: any[] = [];
  const hoy = new Date();

  for (let i = 0; i < 15; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    const diaSemana = this.obtenerNombreDia(fecha);

    for (const h of this.horarios) {
      if (this.normalizarDia(h.dia) === this.normalizarDia(diaSemana)) {
        const semana = this.obtenerSemana(fecha);
        const bloquesHorario = this.generarBloques(h);

        console.log(`🗓️ Día encontrado: ${diaSemana} - Fecha: ${fecha.toISOString().split('T')[0]} - Especialidad: ${h.especialidad}`);

        for (const horaInicio of bloquesHorario) {
          const [hStart, mStart] = horaInicio.split(':').map(Number);
          const inicio = `${String(hStart).padStart(2, '0')}:${String(mStart).padStart(2, '0')}`;
          const finDate = new Date(fecha);
          finDate.setHours(hStart);
          finDate.setMinutes(mStart + h.duracion);
          const fin = `${String(finDate.getHours()).padStart(2, '0')}:${String(finDate.getMinutes()).padStart(2, '0')}`;

          console.log(`⏰ Bloque generado: ${inicio} - ${fin} (Duración: ${h.duracion} min)`);

          bloques.push({
            especialista_id: this.userData.id,
            especialidad: h.especialidad,
            dia: diaSemana,
            fecha: fecha.toISOString().split('T')[0],
            semana,
            inicio,
            fin,
            duracion: h.duracion,
            estado: 'disponible'
          });
        }
      }
    }
  }

  if (bloques.length) {
    const { error } = await this.supabase.supabase.from('disponibilidad').insert(bloques);
    if (error) {
      console.error('❌ Error al insertar disponibilidad:', error.message, error.details);
      Swal.fire('Error', 'No se pudo guardar la disponibilidad.', 'error');
      return;
    }
  }

  console.log('✅ Total de bloques generados:', bloques.length);
  Swal.fire('Horarios guardados', 'La disponibilidad fue actualizada correctamente.', 'success');
}


  async eliminarHorario(index: number) {
    const confirm = await Swal.fire({ title: '¿Eliminar horario?', text: 'Esto eliminará también la disponibilidad generada.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar' });
    if (!confirm.isConfirmed) return;
    const horarioEliminado = this.horarios[index];
    this.horarios.splice(index, 1);
    await this.supabase.supabase.from('usuarios').update({ horarios: this.horarios }).eq('mail', this.userData.mail);
    await this.supabase.supabase.from('disponibilidad').delete().match({ especialista_id: this.userData.id, dia_semana: horarioEliminado.dia, especialidad: horarioEliminado.especialidad, estado: 'disponible' });
    Swal.fire('Eliminado', 'Disponibilidad eliminada correctamente.', 'success');
  }


aplicarFiltros() {
  this.turnosFiltrados = this.turnos.filter(t =>
    (!this.filtroEspecialidad || t.especialidad === this.filtroEspecialidad) &&
    (!this.filtroPacienteId || t.paciente === this.filtroPacienteId)
  );
}


  actualizarFiltros() {
    this.especialidadesUnicas = [...new Set(this.turnos.map(t => t.especialidad))];
    this.pacientesUnicos = this.turnos
  .map(t => ({ id: t.paciente, nombre: t.nombrePaciente }))
  .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i); // elimina duplicados

    this.aplicarFiltros();
  }

  puedeAceptar(estado: string): boolean {
    return !['realizado', 'cancelado', 'rechazado','aceptado'].includes(estado);
  }

  puedeRechazar(estado: string): boolean {
    return !['aceptado', 'realizado', 'cancelado' , 'rechazado'].includes(estado);
  }

  puedeCancelar(estado: string): boolean {
    return !['aceptado', 'realizado', 'rechazado','cancelado'].includes(estado);
  }

  async aceptarTurno(turno: any) {
    const confirm = await Swal.fire({ title: '¿Aceptar turno?', text: 'Estás por aceptar este turno.', icon: 'question', showCancelButton: true, confirmButtonText: 'Aceptar' });
    if (confirm.isConfirmed) {
      await this.supabase.supabase.from('turnos').update({ estado: 'aceptado' }).eq('id', turno.id);
      this.recargarTurnos();
    }
  }

  async rechazarTurno(turno: any) {
    const { value: motivo } = await Swal.fire({ title: 'Motivo del rechazo', input: 'text', inputLabel: 'Ingrese el motivo', inputValidator: (value) => !value && 'El motivo es obligatorio', showCancelButton: true });
    if (motivo) {
      await this.supabase.supabase.from('turnos').update({ estado: 'rechazado', motivo_rechazo: motivo }).eq('id', turno.id);
      this.recargarTurnos();
    }
  }

  async cancelarTurno(turno: any) {
    const { value: motivo } = await Swal.fire({ title: 'Motivo de la cancelación', input: 'text', inputLabel: 'Ingrese el motivo', inputValidator: (value) => !value && 'El motivo es obligatorio', showCancelButton: true });
    if (motivo) {
      await this.supabase.supabase.from('turnos').update({ estado: 'cancelado', motivo_cancelacion: motivo }).eq('id', turno.id);
      this.recargarTurnos();
    }
  }

  async finalizarTurno(turno: any) {
    const { value: comentario } = await Swal.fire({ title: 'Finalizar turno', input: 'textarea', inputLabel: 'Comentario de diagnóstico', inputValidator: (value) => !value && 'El comentario es obligatorio', showCancelButton: true });
    if (comentario) {
      await this.supabase.supabase.from('turnos').update({ estado: 'realizado', comentarioEspecialista: comentario }).eq('id', turno.id);
      this.recargarTurnos();
    }
  }

  async recargarTurnos() {
    const { data } = await this.supabase.supabase.from('turnos').select('*').eq('especialista', this.userData.mail);
    this.turnos = data || [];
    this.actualizarFiltros();
  }

  obtenerSemana(fecha: Date): string {
    const primerDia = new Date(fecha.getFullYear(), 0, 1);
    const diferencia = (+fecha - +primerDia + ((primerDia.getDay() + 6) % 7) * 86400000) / 86400000;
    const semana = Math.ceil(diferencia / 7);
    return `Semana ${semana} - ${fecha.getFullYear()}`;
  }

  obtenerNombreDia(fecha: Date): string {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return dias[fecha.getDay()];
  }

  verResena(turno: any) {
    Swal.fire({ title: 'Reseña del paciente', text: turno.encuestaPaciente || 'Sin comentarios.', icon: 'info' });
  }

  toggleVista(mostrar: boolean) {
    this.mostrarPerfil = mostrar;
  }

  logout() {
    this.supabase.supabase.auth.signOut();
    this.router.navigate(['/bienvenida']);
  }

  normalizarDia(dia: string): string {
  return dia.trim().toLowerCase();
}

cargarHistoriaClinica(turnoId: string) {
  this.router.navigate(['/historia-clinica', turnoId]);
}


}

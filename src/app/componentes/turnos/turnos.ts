import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supabase } from '../../servicios/supabase';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss'
})
export class Turnos implements OnInit{
turnos: any[] = [];
  filtroEspecialidad: string | null = null;
  filtroEspecialista: string | null = null;
  especialidades: string[] = [];
  especialistas: string[] = [];
  comentarioCancelacion: { [key: string]: string } = {};
  userId: string | null = null;
  esAdmin: boolean = false;

  busquedaNombre: string = '';


  constructor(private supabase: Supabase, private router: Router) {}
  async ngOnInit() {
  const session = await this.supabase.supabase.auth.getUser();
  const email = session.data.user?.email;

  const { data: usuario } = await this.supabase.supabase
    .from('usuarios')
    .select('rol')
    .eq('mail', email)
    .single();

  if (!usuario || usuario.rol !== 'admin') {
    Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'Solo el Administrador puede acceder.' });
    this.router.navigate(['/login']);
    return;
  }

  this.esAdmin = true;

  // Traer turnos
  const { data: turnos, error } = await this.supabase.supabase
    .from('turnos')
    .select('*');

  if (error || !turnos) return;

  this.turnos = turnos;
  this.especialidades = [...new Set(turnos.map(t => t.especialidad))];

  // Traer pacientes por UUID
  const pacienteIds = [...new Set(turnos.map(t => t.paciente))].filter(Boolean);
  const { data: pacientes } = await this.supabase.supabase
    .from('usuarios')
    .select('id, nombre, apellido')
    .in('id', pacienteIds);

  // Traer especialistas por mail
  const especialistaMails = [...new Set(turnos.map(t => t.especialista))].filter(Boolean);
  const { data: especialistas } = await this.supabase.supabase
    .from('usuarios')
    .select('mail, nombre, apellido')
    .in('mail', especialistaMails);

  // Armar mapas
  const mapaPacientes = new Map(pacientes?.map(p => [p.id, p]) || []);
  const mapaEspecialistas = new Map(especialistas?.map(e => [e.mail, e]) || []);

  // Enriquecer turnos con nombre y apellido
  this.turnos = this.turnos.map(t => ({
    ...t,
    pacienteNombre: `${mapaPacientes.get(t.paciente)?.nombre || ''} ${mapaPacientes.get(t.paciente)?.apellido || ''}`,
    especialistaNombre: `${mapaEspecialistas.get(t.especialista)?.nombre || ''} ${mapaEspecialistas.get(t.especialista)?.apellido || ''}`
  }));
}


turnosFiltrados() {
  return this.turnos.filter(t => {
    const matchEsp = this.filtroEspecialidad ? t.especialidad === this.filtroEspecialidad : true;
    const matchDoc = this.filtroEspecialista ? t.especialista === this.filtroEspecialista : true;
    const nombreFiltro = this.busquedaNombre.toLowerCase();
    const coincideNombre = !nombreFiltro || t.pacienteNombre.toLowerCase().includes(nombreFiltro) || t.especialistaNombre.toLowerCase().includes(nombreFiltro);
    return matchEsp && matchDoc && coincideNombre;
  });
}

  puedeCancelar(turno: any): boolean {
    return !['aceptado', 'realizado', 'rechazado'].includes(turno.estado);
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
      Swal.fire({ icon: 'success', title: 'Turno cancelado' });
      this.ngOnInit();
    } else {
      Swal.fire({ icon: 'error', title: 'Error al cancelar' });
    }
  }

    goTo(path: string) {
    this.router.navigate([path]);  // Redirigir a la ruta proporcionada
  }

  
  // Cerrar sesión
  logout() {
    this.supabase.supabase.auth.signOut();
    this.router.navigate(['/bienvenida']);
  }

  limpiarFiltros() {
    this.filtroEspecialidad = null;
    this.filtroEspecialista = null;
  }
}

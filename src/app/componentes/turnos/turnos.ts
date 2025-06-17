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

    const { data: turnos, error } = await this.supabase.supabase
      .from('turnos')
      .select('*');

    if (!error && turnos) {
      this.turnos = turnos;
      this.especialidades = [...new Set(turnos.map(t => t.especialidad))];
      this.especialistas = [...new Set(turnos.map(t => t.especialista))];
    }
  }

  turnosFiltrados() {
    return this.turnos.filter(t => {
      const matchEsp = this.filtroEspecialidad ? t.especialidad === this.filtroEspecialidad : true;
      const matchDoc = this.filtroEspecialista ? t.especialista === this.filtroEspecialista : true;
      return matchEsp && matchDoc;
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

import { Routes , RouterModule } from '@angular/router';
import { Bienvenida } from './componentes/bienvenida/bienvenida'; 
import { Login } from './componentes/login/login';
import { Registro } from './componentes/registro/registro';
import { Administrador } from './componentes/administrador/administrador'; 
import { MisTurnosEspecialista } from './componentes/mis-turnos-especialista/mis-turnos-especialista';
import { MisTurnosPaciente } from './componentes/mis-turnos-paciente/mis-turnos-paciente';
import { SolicitarTurno } from './componentes/solicitar-turno/solicitar-turno';
import { Turnos } from './componentes/turnos/turnos';


export const routes: Routes = [
  { path: '', component: Bienvenida },
  { path: 'bienvenida', component: Bienvenida },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro},  
  { path: 'admin', component: Administrador},  
  { path: 'mis-turnos-especialista', component: MisTurnosEspecialista},  
  { path: 'mis-turnos-paciente', component: MisTurnosPaciente},  
  { path: 'solicitar-turno', component: SolicitarTurno},  
  { path: 'turnos', component: Turnos}  
  
];

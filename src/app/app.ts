// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.html',
//   styleUrl: './app.scss'
// })
// export class App {
//   protected title = 'clinicaSofi';
// }
// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { trigger, transition, style, animate, query, group } from '@angular/animations';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterOutlet],
//   templateUrl: './app.html',
//   styleUrls: ['./app.scss'],
//   animations: [
//     trigger('routeAnimations', [
//       transition('* <=> *', [
//         query(':enter, :leave', style({ position: 'absolute', width: '100%' }), {
//           optional: true
//         }),
//         group([
//           query(':leave', [
//             style({ opacity: 1, transform: 'translateX(0)' }),
//             animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-100px)' }))
//           ], { optional: true }),
//           query(':enter', [
//             style({ opacity: 0, transform: 'translateX(100px)' }),
//             animate('300ms ease-in', style({ opacity: 1, transform: 'translateX(0)' }))
//           ], { optional: true })
//         ])
//       ])
//     ])
//   ]
// })
// export class App {
//   prepareRoute(outlet: RouterOutlet) {
//     return outlet?.activatedRouteData?.['animation'];
//   }
// }
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate, query, group } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  animations: [
    trigger('routeAnimations', [
      // Transición general (horizontal) para todas las rutas
      transition('* <=> *', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' }), {
          optional: true
        }),
        group([
          query(':leave', [
            style({ opacity: 1, transform: 'translateX(0)' }), // Sale de izquierda a derecha
            animate('500ms ease-out', style({ opacity: 0, transform: 'translateX(-100px)' })) // Sale hacia la izquierda (más lento)
          ], { optional: true }),
          query(':enter', [
            style({ opacity: 0, transform: 'translateX(100px)' }), // Entra desde la derecha
            animate('500ms ease-in', style({ opacity: 1, transform: 'translateX(0)' })) // Entra desde la derecha (más lento)
          ], { optional: true })
        ])
      ]),

      // Transición específica de Bienvenida a Login (vertical, desde arriba hacia abajo)
      transition('LoginPage <=> RegistroPage', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' }), {
          optional: true
        }),
        group([
          // Componente anterior (Login) sale hacia abajo
          query(':leave', [
            style({ opacity: 1, transform: 'translateY(0)' }), // Sale desde su posición original
            animate('1000ms ease-out', style({ opacity: 0, transform: 'translateY(100px)' })) // Sale hacia abajo
          ], { optional: true }),

          // Componente nuevo (Registro) entra desde arriba
          query(':enter', [
            style({ opacity: 0, transform: 'translateY(-100px)' }), // Empieza desde arriba
            animate('1000ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })) // Entra hacia su posición original
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class App {
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}

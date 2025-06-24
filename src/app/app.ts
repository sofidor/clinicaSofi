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
      transition('* <=> *', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' }), {
          optional: true
        }),
        group([
          query(':leave', [
            style({ opacity: 1, transform: 'translateX(0)' }),
            animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-100px)' }))
          ], { optional: true }),
          query(':enter', [
            style({ opacity: 0, transform: 'translateX(100px)' }),
            animate('300ms ease-in', style({ opacity: 1, transform: 'translateX(0)' }))
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

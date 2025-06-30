import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appBackdropClick]',
  standalone: true
})
export class AppBackdropClick {
@Input('appBackdropClick') onClose!: () => void;

  constructor(private el: ElementRef) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    // Evita cerrar si el clic fue dentro del contenido
    const clickedInside = (event.target as HTMLElement).closest('.modal-content');
    if (!clickedInside && this.onClose) {
      this.onClose();
    }
  }
}
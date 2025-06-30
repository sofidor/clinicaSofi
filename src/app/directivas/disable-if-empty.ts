import { Directive, Input, ElementRef, Renderer2, OnInit, DoCheck } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Directive({
  selector: '[appDisableIfInvalid]',
  standalone: true
})
export class DisableIfInvalidDirective implements OnInit, DoCheck {
  @Input('appDisableIfInvalid') formGroup!: FormGroup;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.toggleDisabled();
  }

  ngDoCheck() {
    this.toggleDisabled();
  }

  private toggleDisabled() {
    const isInvalid = !this.formGroup || this.formGroup.invalid;
    this.renderer.setProperty(this.el.nativeElement, 'disabled', isInvalid);
  }
}


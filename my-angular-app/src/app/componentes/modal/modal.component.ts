import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalService, ModalState } from './modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  readonly modalState$: Observable<ModalState | null> = this.modalService.state$;

  private readonly iconMap: Record<ModalState['type'], string> = {
    info: 'fa-circle-info',
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    danger: 'fa-circle-xmark',
  };

  constructor(private readonly modalService: ModalService) {}

  iconFor(type: ModalState['type']): string {
    return this.iconMap[type];
  }

  confirm(): void {
    this.modalService.confirm();
  }

  cancel(): void {
    this.modalService.cancel();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      const modal = this.modalService.current();
      if (!modal) {
        return;
      }
      if (modal.cancelText) {
        return;
      }
      this.cancel();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent): void {
    if (!this.modalService.isOpen()) {
      return;
    }
    event.preventDefault();
    const modal = this.modalService.current();
    if (modal?.cancelText) {
      return;
    }
    this.cancel();
  }
}

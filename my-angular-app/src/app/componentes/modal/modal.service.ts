import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ModalType = 'info' | 'success' | 'warning' | 'danger';

export interface ModalOptions {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface ModalState {
  message: string;
  title?: string;
  confirmText: string;
  type: ModalType;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly modalSubject = new BehaviorSubject<ModalState | null>(null);
  readonly state$: Observable<ModalState | null> = this.modalSubject.asObservable();

  open(message: string, options: Partial<Omit<ModalOptions, 'message'>> = {}): void {
    const state: ModalState = {
      message,
      title: options.title,
      confirmText: options.confirmText ?? 'Entendi',
      type: options.type ?? 'info',
      cancelText: options.cancelText,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    };
    this.modalSubject.next(state);
  }

  openWith(options: ModalOptions): void {
    this.open(options.message, options);
  }

  confirm(): void {
    const current = this.modalSubject.getValue();
    if (!current) {
      return;
    }
    this.modalSubject.next(null);
    current.onConfirm?.();
  }

  cancel(): void {
    const current = this.modalSubject.getValue();
    if (!current) {
      return;
    }
    this.modalSubject.next(null);
    current.onCancel?.();
  }

  isOpen(): boolean {
    return this.modalSubject.getValue() !== null;
  }

  current(): ModalState | null {
    return this.modalSubject.getValue();
  }
}

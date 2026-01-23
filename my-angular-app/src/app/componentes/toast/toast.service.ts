import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'info' | 'success' | 'warning' | 'danger';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public readonly toasts$ = this.toastsSubject.asObservable();

  private idSeq = 0;

  show(message: string, options?: { type?: ToastType; duration?: number }): string {
    const id = `${Date.now()}-${this.idSeq++}`;
    const toast: Toast = {
      id,
      message,
      type: options?.type ?? 'info',
      duration: options?.duration ?? 3600,
    };
    this.toasts = [...this.toasts, toast];
    this.toastsSubject.next(this.toasts);

    window.setTimeout(() => this.dismiss(id), toast.duration);
    return id;
  }

  info(message: string, duration?: number): string {
    return this.show(message, { type: 'info', duration });
  }
  success(message: string, duration?: number): string {
    return this.show(message, { type: 'success', duration });
  }
  warning(message: string, duration?: number): string {
    return this.show(message, { type: 'warning', duration });
  }
  danger(message: string, duration?: number): string {
    return this.show(message, { type: 'danger', duration });
  }

  dismiss(id: string): void {
    const before = this.toasts.length;
    this.toasts = this.toasts.filter(t => t.id !== id);
    if (this.toasts.length !== before) {
      this.toastsSubject.next(this.toasts);
    }
  }

  clear(): void {
    this.toasts = [];
    this.toastsSubject.next(this.toasts);
  }
}


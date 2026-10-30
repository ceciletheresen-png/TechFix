import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DiagnosticFlow, LoadStatus } from '../models';
import { DiagnosticSession } from './diagnostic-session';

@Injectable({ providedIn: 'root' })
export class DiagnosticService {
  private readonly http = inject(HttpClient);
  readonly status = signal<LoadStatus>('loading');
  readonly flows = signal<DiagnosticFlow[]>([]);

  async load(): Promise<void> {
    this.status.set('loading');
    try {
      this.setFlows(
        await firstValueFrom(this.http.get<DiagnosticFlow[]>('assets/data/diagnostic-flows.json')),
      );
    } catch {
      this.status.set('error');
    }
  }

  setFlows(flows: DiagnosticFlow[]): void {
    this.flows.set(flows);
    this.status.set('ready');
  }

  flow(id: string): DiagnosticFlow | undefined {
    return this.flows().find((f) => f.id === id);
  }

  createSession(flow: DiagnosticFlow): DiagnosticSession {
    return new DiagnosticSession(flow);
  }
}

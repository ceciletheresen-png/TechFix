import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DiagnosticService } from '../../core/services/diagnostic.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { IconComponent } from '../../shared/components/icon.component';
import { StatusMessageComponent } from '../../shared/components/status-message.component';

@Component({
  selector: 'app-diagnose-list',
  imports: [RouterLink, BreadcrumbsComponent, IconComponent, StatusMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <app-breadcrumbs [items]="[{ label: 'Home', link: '/' }, { label: 'Guided diagnosis' }]" />
      <h1 class="text-3xl font-bold">Guided diagnosis</h1>
      <p class="mt-2 text-slate-600">
        Answer simple questions and we will narrow down the problem.
      </p>
      @if (diagnostics.status() !== 'ready') {
        <div class="mt-6">
          <app-status-message [status]="diagnostics.status()" (retry)="diagnostics.load()" />
        </div>
      } @else {
        <ul class="mt-6 grid gap-4 sm:grid-cols-2">
          @for (f of diagnostics.flows(); track f.id) {
            <li>
              <a [routerLink]="['/diagnose', f.id]" class="card-link h-full"
                ><span class="text-brand-700"><app-icon name="diagnose" [size]="24" /></span>
                <h2 class="mt-2 font-semibold">{{ f.title }}</h2>
                <p class="mt-1 text-sm text-slate-600">{{ f.description }}</p></a
              >
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class DiagnoseListComponent {
  protected readonly diagnostics = inject(DiagnosticService);
}

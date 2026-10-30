import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { CalloutComponent } from '../../shared/components/callout.component';

@Component({
  selector: 'app-about',
  imports: [RouterLink, BreadcrumbsComponent, CalloutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <app-breadcrumbs [items]="[{ label: 'Home', link: '/' }, { label: 'About' }]" />
      <h1 class="text-3xl font-bold">About TechFix</h1>
      <p class="mt-3 text-lg text-slate-700">
        TechFix is a free, static troubleshooting guide for everyday computer, phone and internet
        problems. It is built for people who want to try safe fixes before visiting a repair shop.
      </p>

      <h2 class="mt-8 text-xl font-bold">How it works</h2>
      <p class="mt-2">
        All guides are stored inside the app. Once the page has loaded, search and guides work
        without any server or account. Start from
        <a routerLink="/guides" class="font-semibold text-brand-700 underline">Browse problems</a>
        or a
        <a routerLink="/diagnose" class="font-semibold text-brand-700 underline">guided diagnosis</a
        >.
      </p>

      <h2 id="privacy" class="mt-8 text-xl font-bold">Privacy notice</h2>
      <ul class="mt-2 list-disc space-y-1 pl-5">
        <li>
          TechFix has no accounts, no analytics and no tracking, and it does not ask for passwords
          or personal details.
        </li>
        <li>
          Bookmarks, recently viewed guides and "Did this help?" answers are saved in your browser's
          local storage on this device only.
        </li>
        <li>
          Nothing is sent to any server. Clearing your browser data removes it, and you can clear
          your history on the
          <a routerLink="/bookmarks" class="font-semibold text-brand-700 underline"
            >Bookmarks page</a
          >.
        </li>
      </ul>

      <div class="mt-8">
        <app-callout kind="warning" heading="Safety and disclaimer">
          Guides are general information, not professional repair advice, and results can differ by
          device, manufacturer and software version. Back up important files before changing
          settings or resetting a device. Never open batteries or power supplies. Contact a
          qualified technician for hardware repairs and advanced system changes. TechFix never asks
          you to give anyone remote access to your computer.
        </app-callout>
      </div>

      <h2 class="mt-8 text-xl font-bold">Accessibility</h2>
      <p class="mt-2">
        TechFix aims to follow WCAG 2.2 AA: it works with a keyboard, uses visible focus, respects
        reduced-motion settings and does not rely on colour alone.
      </p>
    </div>
  `,
})
export class AboutComponent {}

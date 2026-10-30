import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import categoriesJson from '../../public/assets/data/categories.json';
import guidesJson from '../../public/assets/data/guides.json';
import flowsJson from '../../public/assets/data/diagnostic-flows.json';
import { routes } from '../app/app.routes';
import { Category, DiagnosticFlow, TroubleshootingGuide } from '../app/core/models';
import { DiagnosticService } from '../app/core/services/diagnostic.service';
import { GuideService } from '../app/core/services/guide.service';

/** The real shipped content, so tests exercise the same data users get. */
export const categories = categoriesJson as unknown as Category[];
export const guides = guidesJson as unknown as TroubleshootingGuide[];
export const flows = flowsJson as unknown as DiagnosticFlow[];

export function configureTestBed(): void {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter(routes, withComponentInputBinding()),
    ],
  });
}

export function loadContent(): void {
  TestBed.inject(GuideService).setData(categories, guides);
  TestBed.inject(DiagnosticService).setFlows(flows);
}

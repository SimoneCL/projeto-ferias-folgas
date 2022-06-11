import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeriasFolgaRoutingModule } from './ferias-folga-routing.module';
import { FeriasFolgaComponent } from './ferias-folga.component';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { PoI18nPipe, PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    FeriasFolgaComponent
  ],
  imports: [
    CommonModule,
    LoadingInterceptorModule,
    PoModule,
    PoTemplatesModule,
    FormsModule,
    FeriasFolgaRoutingModule
  ],
  providers: [
    PoI18nPipe
  ]
})
export class FeriasFolgaModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { PoI18nPipe, PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { EventoService } from '../shared/services/evento.service';
import { EventoListService } from '../shared/services/eventolist.service';
import { FeriasFolgaRoutingModule } from './ferias-folga-routing.module';
import { FeriasFolgaComponent } from './ferias-folga.component';


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
    PoI18nPipe,
    EventoService,
    EventoListService
  ]
})
export class FeriasFolgaModule { }

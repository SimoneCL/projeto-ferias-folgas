import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TipoEventoRoutingModule } from './tipo-evento-routing.module';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { FormsModule } from '@angular/forms';
import { TipoEventoComponent } from './list/tipo-evento.component';
import { TipoEventoService } from '../shared/services/tipo-evento.service';


@NgModule({
  declarations: [
    TipoEventoComponent
  ],
  imports: [
    CommonModule,
    LoadingInterceptorModule,
    PoModule,
    PoTemplatesModule,
    FormsModule,
    TipoEventoRoutingModule
  ],
  providers: [
    TipoEventoService
  ]
})
export class TipoEventoModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { FeriadosRoutingModule } from './feriados-routing.module';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { PoI18nPipe, PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { FeriadosComponent } from './feriados.component';
import { FeriadosService } from '../shared/services/feriados.service';
import { EventoService } from '../shared/services/evento.service';
import { UsuarioService } from '../shared/services/usuario.service';


@NgModule({
  declarations: [
    FeriadosComponent
  ],
  imports: [
    CommonModule,
    FeriadosRoutingModule,
    LoadingInterceptorModule,
    PoModule,
    PoTemplatesModule,
    FormsModule,
  ],
  providers: [
    PoI18nPipe,
    FeriadosService,
    EventoService,
    UsuarioService
  ]
})
export class FeriadosModule { }

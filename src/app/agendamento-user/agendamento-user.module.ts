import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { EventoService } from '../shared/services/evento.service';
import { TipoEventoService } from '../shared/services/tipo-evento.service';
import { AgendamentoUserRoutingModule } from './agendamento-user-routing.module';
import { AgendamentoUserEditComponent } from './edit/agendamento-user-edit.component';
import { AgendamentoUserListComponent } from './list/agendamento-user-list.component';


@NgModule({
  declarations: [
    AgendamentoUserListComponent,
    AgendamentoUserEditComponent
  ],
  imports: [
    CommonModule,
    LoadingInterceptorModule,
    PoModule,
    PoTemplatesModule,
    FormsModule,
    AgendamentoUserRoutingModule,
    ReactiveFormsModule
  ],
  providers:[
    EventoService,
    TipoEventoService
  ]
})
export class AgendamentoUserModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { EventoService } from '../shared/services/evento.service';
import { CadastroUserRoutingModule } from './cadastro-user-routing.module';
import { CadastroUserEditComponent } from './edit/cadastro-user-edit.component';
import { CadastroUserListComponent } from './list/cadastro-user-list.component';


@NgModule({
  declarations: [
    CadastroUserListComponent,
    CadastroUserEditComponent
  ],
  imports: [
    CommonModule,
    LoadingInterceptorModule,
    PoModule,
    PoTemplatesModule,
    FormsModule,
    CadastroUserRoutingModule,
    ReactiveFormsModule
  ],
  providers:[
    EventoService
  ]
})
export class CadastroUserModule { }

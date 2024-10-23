import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PoI18nPipe, PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { TipoPerfilUsuarioService } from '../shared/services/tipo-perfil-usuario.service';
import { UsuarioService } from '../shared/services/usuario.service';
import { CadastroUserRoutingModule } from './cadastro-user-routing.module';
import { CadastroUserEditComponent } from './edit/cadastro-user-edit.component';
import { CadastroUserListComponent } from './list/cadastro-user-list.component';
import { UsuarioSubstitutoService } from '../shared/services/usuario-substituto.service';


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
    UsuarioService,
    PoI18nPipe,
    TipoPerfilUsuarioService,
    UsuarioSubstitutoService
  ]
})
export class CadastroUserModule { }

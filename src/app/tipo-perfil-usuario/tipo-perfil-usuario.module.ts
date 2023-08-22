import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TipoPerfilUsuarioRoutingModule } from './tipo-perfil-usuario-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { PoI18nPipe, PoModule } from '@po-ui/ng-components';
import { TipoPerfilUsuarioListComponent } from './list/tipo-perfil-usuario-list.component';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { TipoPerfilUsuarioService } from '../shared/services/tipo-perfil-usuario.service';

@NgModule({
  declarations: [
    TipoPerfilUsuarioListComponent
  ],
  imports: [
    CommonModule,
    TipoPerfilUsuarioRoutingModule,
    LoadingInterceptorModule,
    PoModule,
    PoTemplatesModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    PoI18nPipe,
    TipoPerfilUsuarioService
  ]
})
export class TipoPerfilUsuarioModule { }
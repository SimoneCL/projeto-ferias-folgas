import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { PoI18nPipe, PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { EquipesService } from '../shared/services/equipes.service';
import { TipoPerfilUsuarioService } from '../shared/services/tipo-perfil-usuario.service';
import { UsuarioService } from '../shared/services/usuario.service';
import { EquipesRoutingModule } from './equipes-routing.module';
import { EquipesComponent } from './equipes.component';
import { RelacEquipeEditComponent } from './relacUsuario/relac-equipe-edit.component';
import { EquipeUsuarioService } from '../shared/services/equipe-usuario.service';


@NgModule({
  declarations: [
    EquipesComponent,
    RelacEquipeEditComponent
  ],
  imports: [
    CommonModule,
    EquipesRoutingModule,
    LoadingInterceptorModule,
    PoModule,
    PoTemplatesModule,
    FormsModule,
  ],
  providers: [
    PoI18nPipe,
    EquipesService,
    EquipeUsuarioService,
    UsuarioService,
    TipoPerfilUsuarioService
  ]
})
export class EquipesModule { }

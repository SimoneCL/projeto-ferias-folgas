import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { PoI18nPipe, PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { EquipeUsuarioService } from '../shared/services/equipe-usuario.service';
import { EquipesService } from '../shared/services/equipes.service';
import { EventoService } from '../shared/services/evento.service';
import { TipoEventoService } from '../shared/services/tipo-evento.service';
import { UsuarioService } from '../shared/services/usuario.service';
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
    UsuarioService,
    EventoService,
    TipoEventoService,
    EquipesService,
    EquipeUsuarioService
  ]
})
export class FeriasFolgaModule { }

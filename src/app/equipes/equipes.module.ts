import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { EquipesRoutingModule } from './equipes-routing.module';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { PoI18nPipe, PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { EquipesComponent } from './equipes.component';
import { EquipesService } from '../shared/services/equipes.service';


@NgModule({
  declarations: [
    EquipesComponent
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
    EquipesService
  ]
})
export class EquipesModule { }

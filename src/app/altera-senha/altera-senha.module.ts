import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlteraSenhaRoutingModule } from './altera-senha-routing.module';
import { FormsModule } from '@angular/forms';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { PoI18nPipe, PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { AlteraSenhaComponent } from './altera-senha.component';
import { LoginService } from '../shared/services/login.service';
import { UsuarioService } from '../shared/services/usuario.service';


@NgModule({
  declarations: [
    AlteraSenhaComponent
  ],
  imports: [
    CommonModule,
    AlteraSenhaRoutingModule,
    LoadingInterceptorModule,
    PoModule,
    PoTemplatesModule,
    FormsModule,
  ],
  providers: [
    PoI18nPipe,
    LoginService,
    UsuarioService
  ]
})
export class AlteraSenhaModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { LoginRoutingModule } from './login-routing.module';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { PoI18nPipe, PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { LoginComponent } from './login.component';
import { LoginService } from '../shared/services/login.service';


@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    LoadingInterceptorModule,
    PoModule,
    PoTemplatesModule,
    FormsModule,
  ],
  providers: [
    PoI18nPipe,
    LoginService
  ]
})
export class LoginModule { }

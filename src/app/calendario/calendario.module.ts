import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import { PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { BreadcrumbControlService } from 'dts-backoffice-util';
import { LoadingInterceptorModule } from '../loading-interceptor.module';
import { EventoService } from '../shared/services/evento.service';
import { CalendarioRoutingModule } from './calendario-routing.module';
import { CalendarioComponent } from './calendario.component';


FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin
])

@NgModule({
  declarations: [
    CalendarioComponent
  ],
  imports: [
    CommonModule,
    LoadingInterceptorModule,
    PoModule,
    PoTemplatesModule,
    FormsModule,
    FullCalendarModule,  // register FullCalendar with you app
    CalendarioRoutingModule
  ],
  providers:  [
    BreadcrumbControlService,
    EventoService
  ]
})
export class CalendarioModule { }

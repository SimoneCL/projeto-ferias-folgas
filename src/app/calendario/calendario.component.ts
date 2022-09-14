import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, EventInput } from '@fullcalendar/angular';
import { PoDialogService, PoDisclaimer, PoI18nPipe, PoI18nService, PoModalAction, PoModalComponent, PoNotificationService, PoRadioGroupOption } from '@po-ui/ng-components';
import { BreadcrumbControlService, TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { EventoUser, IEventoUser } from '../shared/model/evento-user.model';
import { EventoService } from '../shared/services/evento.service';
import { createEventId, INITIAL_EVENTS } from '../shared/utils/event-utils';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})


export class CalendarioComponent implements OnInit {
  @ViewChild(PoModalComponent, { static: true }) poModal: PoModalComponent;

  literals: any = {};
  titleEvent: string;
  calendarOptions: CalendarOptions;
  confirmModal: PoModalAction;
  cancelModal: PoModalAction;
  dateSelect: Array<string> = [];
  
  currentEvents: EventApi[] = [];
  selectDate: DateSelectArg;
  public eventosCalendar: any[];

  // INITIAL_EVENTS: EventInput[] = [];
  //calendarApi: CalendarApi;
  eventsTeste: EventInput[] = [];

  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];


  servEventSubscription$: Subscription;

  evento: IEventoUser = new EventoUser();
  items: Array<IEventoUser> = new Array<IEventoUser>();
  eventos: Array<any> = [];
  Events: any[] = [];

  eventType: number;
  readonly eventsOptions: Array<PoRadioGroupOption> = [
    { label: 'Férias', value: 1 },
    { label: 'Ponte', value: 2 },
    { label: 'Reset day/Day off', value: 3 },

  ];


  constructor(
    private poI18nPipe: PoI18nPipe,
    private poI18nService: PoI18nService,
    private poNotification: PoNotificationService,
    private poDialogService: PoDialogService,
    private breadcrumbControlService: BreadcrumbControlService,
    private servEvent: EventoService,
    private router: Router
  ) { }

  ngOnInit(): void {

    forkJoin(
      [
        this.poI18nService.getLiterals(),
        this.poI18nService.getLiterals({ context: 'general' })
      ]
    ).subscribe(literals => {
      literals.map(item => Object.assign(this.literals, item));
      this.setupComponents();

      this.search();
    });

  }


  handleDateClick(arg) {
    //alert('date click! ' + arg.dateStr)
    console.log('handleDateClick', arg.dateStr, ' this.eventType',  this.eventType)
    this.dateSelect = arg.dateSelect;
    this.poModal.open();
  }

  private setupComponents(): void {
    this.eventType = 1;
    this.createCalendar();

    this.confirmModal = {
      action: () => this.confirmEvent(),
      label: this.literals.confirm
    };

    this.cancelModal = {
      action: () => this.closeModal(),
      label: this.literals.cancel

    };
  }
  createCalendar() {
    this.calendarOptions = {
      headerToolbar: {
        left: '',
        center: 'title',
        right: 'prevYear,prev,today,next,nextYear'
        //right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      initialView: 'dayGridMonth',
      initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this)
      /* you can update a remote database when these fire:
      eventAdd:
      eventChange:
      eventRemove:
      */
    };
  }
  handleDateSelect(selectInfo: DateSelectArg) { //AO selecionar a data
    this.titleEvent = '';
    this.selectDate = selectInfo;
    console.log('handleDateSlelect', this.selectDate)
    this.poModal.open();
    
  }
 
  
  handleEventClick(clickInfo: EventClickArg) { //Ao clicar em um evento existente
    if (confirm(`Deseja eliminar o evento '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    console.log('this.currentEvents ', this.currentEvents)
  }

  initialEvents(evento: Array<IEventoUser>) {
    evento.forEach(eventos => {
      console.log(eventos)
      /*switch (eventos.type) {
        case 1:
          this.titleEvent = 'Férias';
          break;
        case 2:
          this.titleEvent = 'Ponte';
          break;
        case 3:
          this.titleEvent = 'Reset day/Day Off';
          break;
      }*/

      // this.INITIAL_EVENTS = [
      //   {
      //     id: createEventId(),
      //     title: this.titleEvent,
      //     start: eventos.eventIniDate,
      //     end: eventos.eventEndDate
      //   }];

      console.log('this.INITIAL_EVENTS', INITIAL_EVENTS)
    });
  }

  closeModal() {
    this.poModal.close();
  }
  private confirmEvent(): void {
    switch (this.eventType) {
      case 1:
        this.titleEvent = 'Férias';
        break;
      case 2:
        this.titleEvent = 'Ponte';
        break;
      case 3:
        this.titleEvent = 'Reset day/Day Off';
        break;
    }

    const calendarApi = this.selectDate.view.calendar;

    if (this.titleEvent) {

      calendarApi.addEvent({
        id: createEventId(),
        title: this.titleEvent,
        start: this.selectDate.startStr,
        end: this.selectDate.endStr,
        allDay: this.selectDate.allDay
      });
      this.evento.events[0].type = this.eventType;
      this.evento.user = 'simone';
      this.evento.events[0].eventIniDate = this.selectDate.startStr;
      this.evento.events[0].eventEndDate = this.selectDate.endStr;


      const start = new Date(this.evento.events[0].eventIniDate);
      const end = new Date(this.evento.events[0].eventEndDate);
      const primeiroDia = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)
      const ultimoDia = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
      this.evento.id = start.getTime();
    }
    this.save();
    this.closeModal();
  }

  save(): void {

    console.log('save', this.evento)
    this.servEventSubscription$ = this.servEvent
      .create(this.evento)
      .subscribe(() => {

        this.poNotification.success(this.literals['createMessage']);
        // this.router.navigate([this.breadcrumbControlService.getPrevRouter()]);

      }, (err: any) => {

      });
  }
  delete(item: IEventoUser): void {
   
    this.poDialogService.confirm({
      title: this.literals['remove'],
      message: this.poI18nPipe.transform(this.literals['modalDeleteMessage'], [item]),
      confirm: () => {
        this.servEventSubscription$ = this.servEvent
          .delete(item)
          .subscribe(() => {
            this.poNotification.success(this.literals['deleteMessage']);
            this.search();
          }, (err: any) => {
          });
      }
    });
  }
  onDateClick(res: any) {
    this.dateSelect = res.dateSelect;
    this.poModal.open();
    //alert('Clicked on date : ' + res.dateStr);
  }
  search(loadMore = false): void {
    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.currentPage = 1;
      this.items = [];
    }

    this.hasNext = false;
    this.servEventSubscription$ = this.servEvent
      .query(this.disclaimers || [], this.expandables, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<IEventoUser>) => {

        if (response && response.items) {
          this.items = [...this.items, ...response.items];
          console.log(' this.items', this.items)
          this.items.forEach(eventos => {

          });
          console.log('this.eventos', this.eventos);


          this.hasNext = response.hasNext;
        }

        if (this.items.length === 0) { this.currentPage = 1; }

      });
    setTimeout(() => {
      this.calendarOptions = {
        initialView: 'dayGridMonth',
        dateClick: this.onDateClick.bind(this),
        events: this.eventos,
      };
      this.Events.push(this.eventos);
      console.log('this.Events a  uiii',this.Events);

    }, 2200);
    
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PoBreadcrumb, PoDialogService, PoDisclaimer, PoDisclaimerGroup, PoI18nPipe, PoI18nService, PoNotificationService, PoPageAction, PoPageFilter, PoTableColumn } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { Evento, IEvento } from '../../shared/model/evento.model';
import { EventoService } from '../../shared/services/evento.service';

@Component({
  selector: 'app-agendamento-user-list',
  templateUrl: './agendamento-user-list.component.html',
  styleUrls: ['./agendamento-user-list.component.css']
})
export class AgendamentoUserListComponent implements OnInit {

  private eventoUserSubscription$: Subscription;
  private disclaimers: Array<PoDisclaimer> = [];

  pageActions: Array<PoPageAction>;
  tableActions: Array<PoPageAction>;

  breadcrumb: PoBreadcrumb;

  items: Array<IEvento> = new Array<IEvento>();
  dayOffType: Array<any>;
  columns: Array<PoTableColumn>;

  hasNext = false;
  pageSize = 20;
  currentPage = 0;
  isLoading = true;

  literals: any = {};

  constructor(
    private serviceEvento: EventoService,
    private poI18nPipe: PoI18nPipe,
    private poI18nService: PoI18nService,
    private poDialogService: PoDialogService,
    private poNotification: PoNotificationService,
    private router: Router,
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

  private setupComponents(): void {

    this.tableActions = [
      { action: this.edit.bind(this), label: this.literals.edit },
      { action: this.delete.bind(this), label: this.literals.delete, type: 'danger' }
    ];

    this.pageActions = [
      {
        label: this.literals.add,
        action: () => this.router.navigate(['agendaUser/new'])
      }
    ];
    this.dayOffType = Evento.dayOffType(this.literals);

    
    this.columns = [
      { property: 'type', label: this.literals.type, type: 'label', labels: this.dayOffType},
      { property: 'eventIniDate', label: this.literals.dateIni, type: 'date' },
      { property: 'eventEndDate', label: this.literals.dateEnd, type: 'date' },
    ];
   

    /*this.disclaimerGroup = {
      title: this.literals.filters,
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this)
    };*/

    // this.filterSettings = {
    //   action: this.searchById.bind(this),
    //   placeholder: this.literals.search
    // };
  }

  searchById(quickSearchValue: string) {
    this.disclaimers = [...[{ property: 'user', value: 'simone' }]];
   // this.disclaimerGroup.disclaimers = [...this.disclaimers];
  }

  search(loadMore = false): void {

    const disclaimer = this.disclaimers || [];

    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.items = [];
      this.currentPage = 1;
    }

    this.isLoading = true;
    this.eventoUserSubscription$ = this.serviceEvento
      .query(disclaimer, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<IEvento>) => {
        this.items = [...this.items, ...response.items];
        this.hasNext = response.hasNext;
        this.isLoading = false;
      }, (err: any) => {
        /*Se retornar erro desabilitar o botão adicionar*/
        this.pageActions = undefined;
      });
  }

  delete(item: IEvento): void {
    const id = Evento.getInternalId(item);
    this.poDialogService.confirm({
      title: this.literals.remove,
      message: this.poI18nPipe.transform(this.literals.modalDeleteMessage, [item.id]),
      confirm: () => {
        this.eventoUserSubscription$ = this.serviceEvento
        .delete(id)
          .subscribe(response => {
            this.router.navigate(['/agendaUser']);
            this.poNotification.success(this.literals.excludedMessage);
            this.search();
          }, (err: any) => {
            this.search();
          });
      }
    });
  }

  getIcons(strTooltip: string): any[] {
    return [
      { value: true, icon: 'po-icon-ok', color: 'color-11', tooltip: strTooltip },
      { value: false, icon: 'po-icon-minus', color: 'color-07', tooltip: `${this.literals.no} ${strTooltip}` }
    ];
  }

  private actionTable(item: IEvento): void {
    this.edit(item);
  }

  private detail(item: IEvento): void {
    this.router.navigate(['/agendaUser', 'detail', Evento.getInternalId(item)]);
  }

  private edit(item: IEvento): void {
    this.router.navigate(['/agendaUser', 'edit', Evento.getInternalId(item)]);
  }

  public onChangeDisclaimer(disclaimers): void {
    this.disclaimers = disclaimers;
    this.search();
  }

  ngOnDestroy(): void {
    this.eventoUserSubscription$.unsubscribe();
  }

  // literals: any = {};
  // items: Array<any> = new Array<any>();
  // columns = [];


  // hasNext = false;
  // currentPage = 1;
  // pageSize = 20;
  // expandables = [''];
  // disclaimers: Array<PoDisclaimer> = [];

  // servEventSubscription$: Subscription;
  // constructor(
  //   private poI18nService: PoI18nService,
  //   private servEvent: EventoService
  // ) { }

  // ngOnInit(): void {
  //   forkJoin(
  //     [
  //       this.poI18nService.getLiterals(),
  //       this.poI18nService.getLiterals({ context: 'general' })
  //     ]
  //   ).subscribe(literals => {
  //     literals.map(item => Object.assign(this.literals, item));
  //     this.setupComponents();
  //     this.search();

  //   });
  // }

  // setupComponents() {
  //   this.disclaimers = [{property: 'user',value:'simone'}] //aqui deveremos pegar o usupario logado
  //   this.columns = [
  //     { property: 'type', label: this.literals.type, type: 'string' },
  //     { property: 'eventIniDate', label: this.literals.dateIni, type: 'date' },
  //     { property: 'eventEndDate', label: this.literals.dateEnd, type: 'date' },
  //   ];
  // }

  // search(loadMore = false): void {

  //   if (loadMore === true) {
  //     this.currentPage = this.currentPage + 1;
  //   } else {
  //     this.currentPage = 1;

  //   }

  //   this.hasNext = false;
  //   this.servEventSubscription$ = this.servEvent
  //     .query(this.disclaimers || [], this.expandables, this.currentPage, this.pageSize)
  //     .subscribe((response: TotvsResponse<IEvento>) => {
  //       if (response && response.items) {
  //         this.items = [...response.items];
  //         console.log('this.items',this.items)
  //         this.hasNext = response.hasNext;
  //       }
  //       if (this.items.length === 0) { this.currentPage = 1; }
  //     });
  // }
}

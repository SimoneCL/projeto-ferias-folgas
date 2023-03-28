import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoBreadcrumb, PoDialogService, PoDisclaimer, PoDisclaimerGroup, PoI18nPipe, PoI18nService, PoNotificationService, PoPageAction, PoPageFilter, PoTableAction, PoTableColumn } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { Evento, IEvento } from '../../shared/model/evento.model';
import { ITipoEvento } from '../../shared/model/tipo-evento.model';
import { EventoService } from '../../shared/services/evento.service';
import { TipoEventoService } from '../../shared/services/tipo-evento.service';

@Component({
  selector: 'app-agendamento-user-list',
  templateUrl: './agendamento-user-list.component.html',
  styleUrls: ['./agendamento-user-list.component.css']
})
export class AgendamentoUserListComponent implements OnInit {

  private eventoUserSubscription$: Subscription;
  private tipoEventoSubscription$: Subscription;
  private disclaimers: Array<PoDisclaimer> = [];
  title: string;

  pageActions: Array<PoPageAction>;
  tableActions: Array<PoTableAction>;

  breadcrumb: PoBreadcrumb;

  items: Array<IEvento> = new Array<IEvento>();
  tipoEventos: Array<ITipoEvento> = new Array<ITipoEvento>();
  dayOffType: Array<any> = [];
  columns: Array<PoTableColumn>;
  filterSettings: PoPageFilter;
  userLogado: string;

  hasNext = false;
  pageSize = 20;
  currentPage = 0;
  isLoading = true;

  literals: any = {};

  constructor(
    private serviceEvento: EventoService,
    private serviceTipoEvento: TipoEventoService,
    private poI18nPipe: PoI18nPipe,
    private poI18nService: PoI18nService,
    private poDialogService: PoDialogService,
    private poNotification: PoNotificationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    
    this.userLogado = localStorage.getItem('userLogado');
    console.log('this.userLogado ', this.userLogado )

    forkJoin(
      [
        this.poI18nService.getLiterals(),
        this.poI18nService.getLiterals({ context: 'general' })
      ]
    ).subscribe(literals => {
      literals.map(item => Object.assign(this.literals, item));
      this.searchTipoEvento();
      this.setupComponents();
      this.search();
    });
  }

  private setupComponents(): void {

    const id  = this.activatedRoute.snapshot.paramMap.get('id');
    console.log('id', id)
    if(id !== null){
      this.title = this.literals.scheduleEventUser + ': ' + id[0].toUpperCase() + id.substring(1);
    } else {
      this.title = this.literals.scheduleEventUser;
    }
    

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
    
    this.columns = [
      { property: 'type', label: this.literals.type, type: 'label', labels: this.dayOffType },
      { property: 'dataEventoIni', label: this.literals.dateIni, type: 'date' },
      { property: 'dataEventoFim', label: this.literals.dateEnd, type: 'date' },
    ];


    /*this.disclaimerGroup = {
      title: this.literals.filters,
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this)
    };*/

    this.filterSettings = {
      action: this.searchById.bind(this),
      placeholder: this.literals.search
    };
  }

  searchById(quickSearchValue: string) {
   
    // this.disclaimerGroup.disclaimers = [...this.disclaimers];
  }

  search(loadMore = false): void {

    this.disclaimers = [...[{ property: 'idUsuario', value: '43115' }]];
    //const disclaimer = this.disclaimers || [];

    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.items = [];
      this.currentPage = 1;
    }
console.log('this.disclaimers', this.disclaimers)
    this.isLoading = true;
    this.eventoUserSubscription$ = this.serviceEvento
      .query(this.disclaimers, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<IEvento>) => {
        this.items = [...this.items, ...response.items];
        console.log('items', this.items)
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

  private edit(item: IEvento): void {
    this.router.navigate(['/agendaUser', 'edit', Evento.getInternalId(item)]);
  }

  public onChangeDisclaimer(disclaimers): void {
    this.disclaimers = disclaimers;
    this.search();
  }

  searchTipoEvento(): void {
    this.dayOffType = [];
    this.tipoEventoSubscription$ = this.serviceTipoEvento
      .query([], 1, 999)
      .subscribe((response: TotvsResponse<ITipoEvento>) => {
        this.tipoEventos = [...this.tipoEventos, ...response.items];

        for (let i in this.tipoEventos) {
          this.dayOffType.push({ label: this.tipoEventos[i].descTipoEvento, value: this.tipoEventos[i].codTipo });
        }
      });
  
      console.log('searchTipoEvento', this.dayOffType)
  }

  ngOnDestroy(): void {
    if (this.eventoUserSubscription$) {
      this.eventoUserSubscription$.unsubscribe();
    }
    if (this.tipoEventoSubscription$){
      this.tipoEventoSubscription$.unsubscribe();
    }
  }
}

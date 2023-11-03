import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoBreadcrumb, PoDatepickerRange, PoDialogService, PoDisclaimer, PoDisclaimerGroup, PoI18nPipe, PoI18nService, PoModalAction, PoModalComponent, PoMultiselectOption, PoNotificationService, PoPageAction, PoPageFilter, PoTableAction, PoTableColumn } from '@po-ui/ng-components';
import { DisclaimerUtil, FieldValidationUtil, TotvsResponse } from 'dts-backoffice-util';
import { Subscription, forkJoin } from 'rxjs';
import { Evento, IEvento } from '../../shared/model/evento.model';
import { ITipoEvento } from '../../shared/model/tipo-evento.model';
import { EventoService } from '../../shared/services/evento.service';
import { TipoEventoService } from '../../shared/services/tipo-evento.service';
import { UsuarioLogadoService } from '../../usuario-logado.service';

@Component({
  selector: 'app-agendamento-user-list',
  templateUrl: './agendamento-user-list.component.html'
})
export class AgendamentoUserListComponent implements OnInit {
  @ViewChild('modalAdvanceSearch', { static: true }) modalAdvanceSearch: PoModalComponent;

  private eventoUserSubscription$: Subscription;
  private tipoEventoSubscription$: Subscription;

  title: string;

  pageActions: Array<PoPageAction>;
  tableActions: Array<PoTableAction>;

  breadcrumb: PoBreadcrumb;

  items: Array<IEvento> = new Array<IEvento>();
  tipoEventos: Array<ITipoEvento> = new Array<ITipoEvento>();
  dayOffType: Array<any> = [];
  columns: Array<PoTableColumn>;


  disclaimers: Array<PoDisclaimer> = [];
  disclaimerGroup: PoDisclaimerGroup;

  disclaimerUtil: DisclaimerUtil;
  fieldValidUtil: FieldValidationUtil;

  filterSettings: PoPageFilter;


  datePickerRangeFilter: PoDatepickerRange;
  descriptionFilter: string;
  eventFilterOptions: Array<PoMultiselectOption>;
  eventTypeFilter = [];

  confirmAdvSearchAction: PoModalAction;
  cancelAdvSearchAction: PoModalAction;
  userLogado: number;

  hasNext = false;
  pageSize = 20;
  currentPage = 0;
  isLoading = true;

  literals: any = {};

  public usuarioLogado = new UsuarioLogadoService();

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

    this.userLogado = this.usuarioLogado.getUsuarioLogado();


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
    this.disclaimers = [];

    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== null) {
      this.title = this.literals.scheduleEventUser + ': ' + id[0].toUpperCase() + id.substring(1);
    } else {
      this.title = this.literals.scheduleEventUser;
    }
    this.eventFilterOptions = this.dayOffType;

    this.confirmAdvSearchAction = {
      action: () => this.onConfirmAdvAction(), label: this.literals['search']
    };

    this.cancelAdvSearchAction = {
      action: () => this.modalAdvanceSearch.close(), label: this.literals['cancel']
    };

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
      { property: 'codTipo', label: this.literals.type, type: 'label', labels: this.dayOffType },
      { property: 'descricao', label: this.literals.description, type: 'string' },
      { property: 'dataEventoIni', label: this.literals.dateIni, type: 'date' },
      { property: 'dataEventoFim', label: this.literals.dateEnd, type: 'date' },


    ];


    const dataAtual = new Date();
    const dataInicial = this.formatoProperty(`${dataAtual.getFullYear()}-01-01`, 'yyyymmdd');
    const dataFinal = this.formatoProperty(`${dataAtual.getFullYear()}-12-31`, 'yyyymmdd');
    this.datePickerRangeFilter = {
      start: dataInicial,
      end: dataFinal
    }
    this.disclaimerGroup = {
      title: this.literals.filters,
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this)
    };


    this.disclaimers = [
      { property: 'dataInicial', value: this.datePickerRangeFilter.start, label: this.formatoProperty(this.datePickerRangeFilter.start.toString(), 'ddmmyyyy') },
      { property: 'dataFinal', value: this.datePickerRangeFilter.end, label: this.formatoProperty(this.datePickerRangeFilter.end.toString(), 'ddmmyyyy') }];

    this.disclaimerGroup.disclaimers = [...this.disclaimers];



    this.filterSettings = {
      action: this.searchById.bind(this),
      advancedAction: this.advancedSearch.bind(this),
      placeholder: this.literals.search
    };
  }

  advancedSearch(): void {
    this.modalAdvanceSearch.open();
  }

  onConfirmAdvAction(): void {

    this.disclaimers = [
      { property: 'dataInicial', value: this.datePickerRangeFilter.start, label: this.formatoProperty(this.datePickerRangeFilter.start.toString(), 'ddmmyyyy') },
      { property: 'dataFinal', value: this.datePickerRangeFilter.end, label: this.formatoProperty(this.datePickerRangeFilter.end.toString(), 'ddmmyyyy') }
    ];
    if (this.eventTypeFilter) {
      this.eventTypeFilter.filter(event => {
        this.dayOffType.forEach((item, indice, array) => {
          if (event === item.value) {
            this.disclaimers = [...this.disclaimers, ...[{ property: 'codTipo', value: item.value, label: item.label }]];
          }
        })
      })
    }

    if (this.descriptionFilter) {
      this.disclaimers = [...this.disclaimers, ...[{ property: 'descricao', value: this.descriptionFilter }]];
    }

    this.disclaimerGroup.disclaimers = [...this.disclaimers];
    this.modalAdvanceSearch.close();
  }

  searchById(quickSearchValue: string) {
    this.disclaimerGroup.disclaimers = [];
    this.descriptionFilter = quickSearchValue;
    this.disclaimers = [{ property: 'descricao', value: quickSearchValue }];
    this.disclaimerGroup.disclaimers = [...this.disclaimerGroup.disclaimers, ...this.disclaimers];
  }
  private formatoProperty(data: string, formato: string) {

    let day = '' + data.toString().substring(8, 10).trim();
    let month = '' + data.toString().substring(5, 7).trim();
    const year = data.toString().substring(0, 4).trim();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    if (formato === 'yyyymmdd') {
      return [year, month, day].join('-');
    } else {
      return [day, month, year].join('/');
    }

  }


  search(loadMore = false): void {
    const newDisclaimer = { property: 'idUsuario', value: localStorage.getItem('usuarioLogado')};
    const isDuplicate = this.disclaimers.some(disclaimer => (
      disclaimer.property === newDisclaimer.property && disclaimer.value === newDisclaimer.value
    ));
    
    if (!isDuplicate) {
      this.disclaimers = [...this.disclaimers, newDisclaimer];
    }
 

    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.items = [];
      this.currentPage = 1;
    }
    this.isLoading = true;
    this.eventoUserSubscription$ = this.serviceEvento
      .query(this.disclaimers, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<IEvento>) => {
        this.items = [...response.items];
        this.hasNext = response.hasNext;
        this.isLoading = false;
      }, (err: any) => {
        /*Se retornar erro desabilitar o botão adicionar*/
        this.pageActions = undefined;
      });
  }

  delete(item: IEvento): void {
    const id = Evento.getInternalId(item) + ';' + this.userLogado ;
    this.poDialogService.confirm({
      title: this.literals.remove,
      message: this.poI18nPipe.transform(this.literals.modalDeleteMessage, [item.idEvento]),
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
  }

  ngOnDestroy(): void {
    if (this.eventoUserSubscription$) {
      this.eventoUserSubscription$.unsubscribe();
    }
    if (this.tipoEventoSubscription$) {
      this.tipoEventoSubscription$.unsubscribe();
    }

  }
}

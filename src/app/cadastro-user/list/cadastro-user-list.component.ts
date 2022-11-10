import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PoBreadcrumb, PoDialogService, PoDisclaimer, PoDisclaimerGroup, PoI18nPipe, PoI18nService, PoNotificationService, PoPageAction, PoPageFilter, PoTableColumn } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { Evento, IEvento } from '../../shared/model/evento.model';
import { EventoService } from '../../shared/services/evento.service';

@Component({
  selector: 'app-cadastro-user-list',
  templateUrl: './cadastro-user-list.component.html',
  styleUrls: ['./cadastro-user-list.component.css']
})
export class CadastroUserListComponent implements OnInit {

  private eventoUserSubscription$: Subscription;
  private disclaimers: Array<PoDisclaimer> = [];

  pageActions: Array<PoPageAction>;
  tableActions: Array<PoPageAction>;

  breadcrumb: PoBreadcrumb;

  items: Array<IEvento> = new Array<IEvento>();
  dayOffType: Array<any>;
  columns: Array<PoTableColumn>;
  filterSettings: PoPageFilter;

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
        action: () => this.router.navigate(['cadastroUser/new'])
      }
    ];
    this.dayOffType = Evento.dayOffType(this.literals);


    this.columns = [
      { property: 'type', label: this.literals.type, type: 'label', labels: this.dayOffType },
      { property: 'eventIniDate', label: this.literals.dateIni, type: 'date' },
      { property: 'eventEndDate', label: this.literals.dateEnd, type: 'date' },
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

    this.disclaimers = [...[{ property: 'user', value: 'simone' }]];
    //const disclaimer = this.disclaimers || [];

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
            this.router.navigate(['/cadastroUser']);
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
    this.router.navigate(['/cadastroUser', 'edit', Evento.getInternalId(item)]);
  }

  public onChangeDisclaimer(disclaimers): void {
    this.disclaimers = disclaimers;
    this.search();
  }

  ngOnDestroy(): void {
    if (this.eventoUserSubscription$) {
      this.eventoUserSubscription$.unsubscribe();
    }
  }
}

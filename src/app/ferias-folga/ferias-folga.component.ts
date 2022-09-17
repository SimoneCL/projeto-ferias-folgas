import { Component, OnDestroy, OnInit } from '@angular/core';
import { PoDatepickerRange, PoDisclaimer, PoI18nService } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { ConfiguracaoFeriasFolga } from '../shared/model/config-ferias-folga.model';
import { IEventoList } from '../shared/model/eventolist.model';
import { EventoListService } from '../shared/services/eventolist.service';

@Component({
  selector: 'app-ferias-folga',
  templateUrl: './ferias-folga.component.html'
})
export class FeriasFolgaComponent implements OnInit, OnDestroy {

  datepickerRange: PoDatepickerRange;
  quantityOfDays: number = undefined;
  columns = [];
  primeiroDia = new Date();
  ultimoDia = new Date();

  literals: any = {};
  dataCalc: Date;
  targetProperty = '';

  items: Array<any> = new Array<any>();
  
  private itemsEventos: Array<IEventoList>;
  public eventos: Array<any> = new Array<any>();
  itemsAux: Array<any>;
  newEvent = {};

  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];
  map1 = new Map();

  servEventSubscription$: Subscription;


  public config: ConfiguracaoFeriasFolga = new ConfiguracaoFeriasFolga();
  constructor(
    private poI18nService: PoI18nService,
    private servEvent: EventoListService
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

    });
  }

  setupComponents() {
    this.primeiroDia = new Date();
    this.ultimoDia = new Date(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), this.primeiroDia.getDate() + 19, 0);

    this.sugerePeriodoDefault();
    if (this.columns[1].property.length > 0) {

      this.search();
    }
  }

  private sugerePeriodoDefault() {

    this.config.datePickerRange = { start: ConfiguracaoFeriasFolga.convertDateToISODate(this.primeiroDia), end: ConfiguracaoFeriasFolga.convertDateToISODate(this.ultimoDia) };

    this.setColumnsList();
  }

  setColumnsList() {
    this.quantityOfDays = Math.floor(
      (Date.UTC(this.ultimoDia.getFullYear(), this.ultimoDia.getMonth(), this.ultimoDia.getDate()) -
        Date.UTC(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), this.primeiroDia.getDate())) /
      (1000 * 60 * 60 * 24)
    );

    this.dataCalc = new Date();


    this.columns = [{ property: 'user', label: 'Nome', type: 'string' }];
    for (let y = 0; y <= this.quantityOfDays; y++) {
      this.dataCalc = new Date(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), this.primeiroDia.getDate() + y);
      this.targetProperty = this.formatoProperty(this.dataCalc);
      this.columns = [...this.columns,
      {
        property: this.targetProperty, label: this.FormataStringData(`${this.dataCalc.toLocaleDateString("pt-BR")}`), type: 'label', labels: [
          { value: 'Férias', color: 'color-03', label: 'Férias' },
          { value: 'Ponte', color: 'color-09', label: 'Ponte' },
          { value: 'Reset day/Day Off', color: 'color-01', label: 'Reset day/Day Off' }
        ]
      },
      ];
    }
  }
  calculateQuantityOfVacationDays() {
    if (ConfiguracaoFeriasFolga.rangeDataValido(this.config)) {
      const start = new Date(this.config.datePickerRange.start);
      const end = new Date(this.config.datePickerRange.end);
      this.primeiroDia = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)
      this.ultimoDia = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
      this.setColumnsList();
    }
  }

  search(loadMore = false): void {

    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.currentPage = 1;

    }

    this.hasNext = false;
    this.servEventSubscription$ = this.servEvent
      .query(this.disclaimers || [], this.expandables, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<IEventoList>) => {
        if (response && response.items) {
          this.itemsEventos = [...response.items];
          this.hasNext = response.hasNext;
        }
        if (this.itemsEventos.length === 0) { this.currentPage = 1; }

        if (this.itemsEventos.length > 0) {
          this.changeObjectProperty(this.itemsEventos);
        }

      });

  }
  private changeObjectProperty(eventsUsers: Array<IEventoList>): void {

    if (eventsUsers.length > 0) {

      for (var i = 0; i < eventsUsers.length; i++) {
        this.map1 = new Map();

        this.map1.set('user', eventsUsers[i].user);
        let labelType = '';
        switch (eventsUsers[i].type) { //deixei fixo, mas depois será téra uma tabela para retornar esta informação
          case 1:
            labelType = 'Férias';
            break;
          case 2:
            labelType = 'Ponte';
            break;
          case 3:
            labelType = 'Reset day/Day Off';
            break;
        }
        this.map1.set(eventsUsers[i].eventDate, labelType);

        this.itemsAux = [...this.map1];

        if (this.newEvent[this.itemsAux[0][0]] !== this.itemsAux[0][1]) {
          this.newEvent = {};
        }
        this.newEvent[this.itemsAux[0][0]] = this.itemsAux[0][1];
        this.newEvent[this.itemsAux[1][0]] = this.itemsAux[1][1];

        this.eventos.push(this.newEvent);
      }
      this.removeDuplicates();
    }
  }


  private removeDuplicates(): void {

    let objTitle = '';
    // Declare an empty object
    let uniqueObject = {};
    // Loop for the array elements
    for (let i in this.eventos) {
      // Extract the title
      objTitle = this.eventos[i]['user'];
      // Use the title as the index
      uniqueObject[objTitle] = this.eventos[i];
    }

    // Loop to push unique object into array
    for (let i in uniqueObject) {
      this.items.push(uniqueObject[i]);
    }
  }


  private formatoProperty(data: Date) {
    var d = new Date(data),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  private FormataStringData(data) {
    var dia = data.split("/")[0];
    var mes = data.split("/")[1];
    var ano = data.split("/")[2];

    return ("0" + dia).slice(-2) + '/' + ("0" + mes).slice(-2);
    // Utilizo o .slice(-2) para garantir o formato com 2 digitos.
  }
  ngOnDestroy(): void {
    if (this.servEventSubscription$) {
      this.servEventSubscription$.unsubscribe();
    }
  }
}

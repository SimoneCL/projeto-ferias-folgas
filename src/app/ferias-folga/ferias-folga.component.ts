import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PoDatepickerRange, PoI18nService, PoPageAction, PoTableAction } from '@po-ui/ng-components';
import { forkJoin } from 'rxjs';
import { ConfiguracaoFeriasFolga } from '../shared/model/config-ferias-folga.model';

@Component({
  selector: 'app-ferias-folga',
  templateUrl: './ferias-folga.component.html'
})
export class FeriasFolgaComponent implements OnInit {

  datepickerRange: PoDatepickerRange;
  quantityOfDays: number = undefined;
  //start = new Date();
  columns = [];
  primeiroDia = new Date();
  ultimoDia = new Date();

  tableActions: Array<PoPageAction>;
  literals: any = {};

  targetProperty = 'status';

  items = [{
    name: 'Simone',
  }, {
    name: 'Cleiton'
  }];


  public config: ConfiguracaoFeriasFolga = new ConfiguracaoFeriasFolga();
  constructor(
    private poI18nService: PoI18nService,
    private router: Router) { }

  ngOnInit(): void {
    forkJoin(
      [
        this.poI18nService.getLiterals(),
        this.poI18nService.getLiterals({ context: 'general' })
      ]
    ).subscribe(literals => {
      literals.map(item => Object.assign(this.literals, item));
      this.setupComponents();
      // this.search();
    });


  }
  setupComponents() {

    this.primeiroDia = new Date();
    this.ultimoDia = new Date(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), this.primeiroDia.getDate() + 7, 0);

    this.sugerePeriodoDefault();
    this.tableActions = [

      { action: this.edit.bind(this), label: this.literals.edit }
    ];
  }



  private edit(item: ConfiguracaoFeriasFolga): void {
    // this.router.navigate(['/manifestationParameters', 'edit', item.siteId]);
  }
  private sugerePeriodoDefault() {

    this.config.datePickerRange = { start: ConfiguracaoFeriasFolga.convertDateToISODate(this.primeiroDia), end: ConfiguracaoFeriasFolga.convertDateToISODate(this.ultimoDia) };

    this.setColumnsList();
  }

  getDiaDaSemana(data) {
    let dw = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return dw[data.getDay()];
  }

  setColumnsList() {
    this.quantityOfDays = Math.floor(
      (Date.UTC(this.ultimoDia.getFullYear(), this.ultimoDia.getMonth(), this.ultimoDia.getDate()) -
        Date.UTC(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), this.primeiroDia.getDate())) /
      (1000 * 60 * 60 * 24)
    );

    let dataCalc = new Date();
    this.columns = [{ property: 'name', label: 'Nome' }];
    for (let y = 0; y <= this.quantityOfDays; y++) {
      dataCalc = new Date(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), this.primeiroDia.getDate() + y);
      this.columns = [...this.columns,
      { property: this.targetProperty, label: `${this.getDiaDaSemana(dataCalc)} ${dataCalc.toLocaleDateString("pt-BR")}`, type: 'columnTemplate' },
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
}

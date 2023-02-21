import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PoDatepickerRange, PoDisclaimer, PoI18nService, PoMultiselectFilter, PoMultiselectOption, PoRadioGroupOption, PoTableColumnLabel } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { ConfiguracaoFeriasFolga } from '../shared/model/config-ferias-folga.model';
import { EquipeUsuario, IEquipeUsuario } from '../shared/model/equipe-usuario.model';
import { IEquipes } from '../shared/model/equipes.model';
import { Evento, IEvento } from '../shared/model/evento.model';
import { ITipoEvento } from '../shared/model/tipo-evento.model';
import { IUsuario, Usuario } from '../shared/model/usuario.model';
import { EquipeUsuarioService } from '../shared/services/equipe-usuario.service';
import { EquipesService } from '../shared/services/equipes.service';
import { EventoService } from '../shared/services/evento.service';
import { TipoEventoService } from '../shared/services/tipo-evento.service';
import { UsuarioService } from '../shared/services/usuario.service';

@Component({
  selector: 'app-ferias-folga',
  templateUrl: './ferias-folga.component.html'
})
export class FeriasFolgaComponent implements OnInit, OnDestroy {

  datepickerRange: PoDatepickerRange;
  quantityOfDays: number = undefined;
  quantityOfDaysSchedule: number = undefined;
  columns = [];
  primeiroDia = new Date();
  ultimoDia = new Date();

  literals: any = {};
  dataCalc: Date;
  targetProperty = '';

  items: Array<any> = new Array<any>();

  private itemsEventosAux: Array<IEvento>;
  tipoEventos: Array<ITipoEvento> = new Array<ITipoEvento>();
  dayOffType: Array<PoTableColumnLabel> = [];

  public eventos: Array<any> = new Array<any>();
  itemsAux: Array<any>;
  itemsUsers: Array<IUsuario> = new Array<IUsuario>();
  newEvent = {};

  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];
  disclaimersEquipeUser: Array<PoDisclaimer> = [];
  map1 = new Map();

  public eventOptions: Array<PoRadioGroupOption> = [];

  servEventSubscription$: Subscription;
  tipoEventoSubscription$: Subscription;
  servEquipeSubscription$: Subscription;
  servEquipeUsuarioSubscription$: Subscription;

  debounce = 500;
  filterService: PoMultiselectFilter;
  public itemsEquipe: Array<IEquipes>;
  EquipesItems: Array<IEquipes> = new Array<IEquipes>();
  optionsMultiSeletc: Array<PoMultiselectOption> = [];

  private usuarioSubscription$: Subscription;
  public usuario: IUsuario = new Usuario();
  multiSelectEquipe: Array<string> = [];

  public equipeUsuario: Array<IEquipeUsuario> = new Array<IEquipeUsuario>();


  public config: ConfiguracaoFeriasFolga = new ConfiguracaoFeriasFolga();
  constructor(
    private poI18nService: PoI18nService,
    private serviceUsuario: UsuarioService,
    private serviceEvento: EventoService,
    private serviceTipoEvento: TipoEventoService,
    private serviceEquipe: EquipesService,
    private serviceEquipeUsuario: EquipeUsuarioService,
    private router: Router
  ) {
    this.filterService = serviceEquipe;
  }

  ngOnInit(): void {
    forkJoin(
      [
        this.poI18nService.getLiterals(),
        this.poI18nService.getLiterals({ context: 'general' })
      ]
    ).subscribe(literals => {
      literals.map(item => Object.assign(this.literals, item));
      this.getUsuar('simone');

      this.searchTipoEvento();

      this.setupComponents();



    });
  }

  getUsuar(id: string): void { //equipes do usuário logado
    this.hasNext = false;
    this.servEquipeUsuarioSubscription$ = this.serviceEquipeUsuario
      .query([{ property: 'usuario', value: id }])
      .subscribe((response: TotvsResponse<IEquipeUsuario>) => {
        if (response && response.items) {
          this.equipeUsuario = [...this.equipeUsuario, ...response.items];
          this.hasNext = response.hasNext;
        }
        this.searchEquipe(this.equipeUsuario);
      })
  }

  searchUsuarByEquipe(): void {

    this.equipeUsuario = [];
    this.hasNext = false;
    this.servEquipeUsuarioSubscription$ = this.serviceEquipeUsuario
      .query(this.disclaimersEquipeUser)
      .subscribe((response: TotvsResponse<IEquipeUsuario>) => {
        if (response && response.items) {
          this.equipeUsuario = [...this.equipeUsuario, ...response.items];
          this.hasNext = response.hasNext;
        }
        this.searchEventos();
      })
  }

  searchEquipe(equipe: Array<IEquipeUsuario>): void {
    this.onDisclaimersEquipeUser(equipe);
    this.hasNext = false;
    this.servEquipeSubscription$ = this.serviceEquipe
      .query(this.disclaimersEquipeUser || [], this.expandables, 1, 9999)
      .subscribe((response: TotvsResponse<IEquipes>) => {
        if (response && response.items) {
          this.EquipesItems = [...this.EquipesItems, ...response.items];
          for (let i in this.EquipesItems) {
            this.optionsMultiSeletc.push(
              { value: this.EquipesItems[i].codEquipe, label: this.EquipesItems[i].descEquipe },
            );
            this.multiSelectEquipe = [...this.multiSelectEquipe, ...this.EquipesItems[i].codEquipe.toString()];
          }
        }
        this.searchUsuarByEquipe();
      });
  }

  onDisclaimersEquipeUser(equipeUser) {

    this.disclaimersEquipeUser = [];
    for (let i in equipeUser) {
      this.disclaimersEquipeUser.push({ property: 'codEquipe', value: equipeUser[i].codEquipe });
    }

    return this.disclaimersEquipeUser;
  }
  changeOptions(event): void { //selecionando equipes
    this.disclaimersEquipeUser = [];

    for (let i in event) {
      this.disclaimersEquipeUser.push({ property: 'codEquipe', value: event[i].value });
    }
    if (this.disclaimersEquipeUser.length > 0) {
      this.searchUsuarByEquipe();
    } else {
      this.items = [];
    }
  }

  setupComponents() {

    this.primeiroDia = new Date();
    this.ultimoDia = new Date(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), this.primeiroDia.getDate() + 19, 0);

    this.sugerePeriodoDefault();
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

    this.columns = [{
      property: 'user', label: 'Nome', type: 'link', action: (value, row) => {
        this.redirect(value, row);
      }
    }];
    for (let y = 0; y <= this.quantityOfDays; y++) {
      this.dataCalc = new Date(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), this.primeiroDia.getDate() + y);
      this.targetProperty = this.formatoProperty(this.dataCalc);
      this.columns = [...this.columns,
      {
        property: this.targetProperty, label: `${this.getDiaDaSemana(this.dataCalc)} ` + Evento.FormataStringData(`${this.dataCalc.toLocaleDateString("pt-BR")}`), type: 'label', labels: this.dayOffType

      },
      ];
    }
  }

  searchTipoEvento(): void {
    this.tipoEventoSubscription$ = this.serviceTipoEvento
      .query([], 1, 999)
      .subscribe((response: TotvsResponse<ITipoEvento>) => {
        this.tipoEventos = response.items;

        for (let i in this.tipoEventos) {
          this.dayOffType.push({ value: this.tipoEventos[i].descTipoEvento, color: `color-0${this.tipoEventos[i].code}`, label: this.tipoEventos[i].descTipoEvento.substring(0, 1), tooltip: this.tipoEventos[i].descTipoEvento });
        }
      });
  }


  redirect(value, row) {
    this.router.navigate(['/agendaUser', 'list', value]);
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

  searchEventos(loadMore = false): void {
    this.itemsEventosAux = [];
    this.items = [];

    this.disclaimers = [];
    this.equipeUsuario.forEach((equipe, index) => {
      this.disclaimers.push({ property: 'user', value: equipe.usuario });

    });

    const disclaimer = this.disclaimers || [];

    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {

      this.currentPage = 1;
    }
    this.servEventSubscription$ = this.serviceEvento
      .query(disclaimer, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<IEvento>) => {

        this.itemsEventosAux = [...response.items];
        this.hasNext = response.hasNext;
        if (this.itemsEventosAux.length === 0) { this.currentPage = 1; }
        if (this.itemsEventosAux.length > 0) {
          this.changeObjectProperty(this.itemsEventosAux);
        }
      });
  }
  private changeObjectProperty(eventsUsers: Array<IEvento>): void {
    this.eventos = [];
    this.itemsAux = [];
    if (eventsUsers.length > 0) {
      for (var i = 0; i < eventsUsers.length; i++) {
        let labelType = this.tipoEventos.find(element => element.code === eventsUsers[i].type).descTipoEvento;

        this.map1 = new Map();
        this.map1.set('user', eventsUsers[i].user);

        if (eventsUsers[i].type === 1) { //férias
          this.primeiroDia = new Date(eventsUsers[i].eventIniDate);
          const end = new Date(eventsUsers[i].eventEndDate);
          this.ultimoDia = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
          this.quantityOfDaysSchedule = Math.floor(
            (Date.UTC(this.ultimoDia.getFullYear(), this.ultimoDia.getMonth(), this.ultimoDia.getDate()) -
              Date.UTC(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), this.primeiroDia.getDate())) /
            (1000 * 60 * 60 * 24)
          );
          this.dataCalc = new Date();
          for (let y = 1; y <= this.quantityOfDaysSchedule; y++) {
            this.dataCalc = new Date(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), this.primeiroDia.getDate() + y);
            this.map1.set(this.formatoProperty(this.dataCalc), labelType);
            this.itemsAux = [...this.map1];

            if (this.newEvent[this.itemsAux[0][0]] !== this.itemsAux[0][1]) {
              this.newEvent = {};
            }
            this.newEvent[this.itemsAux[0][0]] = this.itemsAux[0][1];
            this.newEvent[this.itemsAux[y][0]] = this.itemsAux[y][1];
          }
        } else {
          this.map1.set(eventsUsers[i].eventIniDate, labelType);
          this.itemsAux = [...this.map1];
          if (this.newEvent[this.itemsAux[0][0]] !== this.itemsAux[0][1]) {
            this.newEvent = {};
          }
          this.newEvent[this.itemsAux[0][0]] = this.itemsAux[0][1];
          this.newEvent[this.itemsAux[1][0]] = this.itemsAux[1][1];
        }
        console.log('this.newEvent',this.newEvent)
        this.eventos.push(this.newEvent);
      }
      this.agrupByUser();
    }
  }


  private agrupByUser(): void {

    let objTitle = '';
    // Declare an empty object
    let uniqueObject = {};
    // Loop for the array elements
    for (let i in this.eventos) {
      // Extract the title
      objTitle = this.eventos[i]['user'];
      // Use the title as the index
      if (objTitle === this.eventos[i].user) {
        uniqueObject[objTitle] = { ...uniqueObject[objTitle], ...this.eventos[i] };
      } else {
        uniqueObject[objTitle] = [this.eventos[i]];
      }
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

  getDiaDaSemana(data) {
    let dw = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return dw[data.getDay()];
  }



  ngOnDestroy(): void {
    if (this.usuarioSubscription$) {
      this.usuarioSubscription$.unsubscribe();
    }
    if (this.servEventSubscription$) {
      this.servEventSubscription$.unsubscribe();
    }
    if (this.tipoEventoSubscription$) {
      this.tipoEventoSubscription$.unsubscribe();
    }
    if (this.servEquipeSubscription$) {
      this.servEquipeSubscription$.unsubscribe();
    }
    if (this.servEquipeUsuarioSubscription$) {
      this.servEquipeUsuarioSubscription$.unsubscribe();
    }
  }
}

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PoDatepickerRange, PoDisclaimer, PoI18nService, PoMultiselectFilter, PoMultiselectOption, PoNotificationService, PoRadioGroupOption, PoTableColumn, PoTableColumnLabel, PoTableComponent } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { ConfiguracaoFeriasFolga } from '../shared/model/config-ferias-folga.model';
import { IEquipeUsuario } from '../shared/model/equipe-usuario.model';
import { IEquipes } from '../shared/model/equipes.model';
import { Evento, IEvento } from '../shared/model/evento.model';
import { ITipoEvento } from '../shared/model/tipo-evento.model';
import { IUsuario, Usuario } from '../shared/model/usuario.model';
import { EquipeUsuarioService } from '../shared/services/equipe-usuario.service';
import { EquipesService } from '../shared/services/equipes.service';
import { EventoService } from '../shared/services/evento.service';
import { TipoEventoService } from '../shared/services/tipo-evento.service';
import { UsuarioService } from '../shared/services/usuario.service';
import { UsuarioLogadoService } from '../usuario-logado.service';

@Component({
  selector: 'app-ferias-folga',
  templateUrl: './ferias-folga.component.html'
})
export class FeriasFolgaComponent implements OnInit, OnDestroy {
  @ViewChild('tableEvent', { static: true }) tableEvent: PoTableComponent;

  datepickerRange: PoDatepickerRange;
  quantityOfDays: number = undefined;
  quantityOfDaysSchedule: number = undefined;
  columns  : Array<PoTableColumn>; //[];
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
  userLogado: number;
  idUsuario: number;


  servEventSubscription$: Subscription;
  tipoEventoSubscription$: Subscription;
  servEquipeSubscription$: Subscription;
  servEquipeUsuarioSubscription$: Subscription;

  equipesItems: Array<IEquipes> = new Array<IEquipes>();
  optionsMultiSeletc: Array<PoMultiselectOption> = [];

  private usuarioSubscription$: Subscription;
  public usuario: IUsuario = new Usuario();
  multiSelectEquipe: Array<string> = [];

  public equipeUsuario: Array<IEquipeUsuario> = new Array<IEquipeUsuario>();

  public usuarioLogado = new UsuarioLogadoService();

  public config: ConfiguracaoFeriasFolga = new ConfiguracaoFeriasFolga();
  constructor(
    private poI18nService: PoI18nService,
    private serviceUsuario: UsuarioService,
    private serviceEvento: EventoService,
    private serviceTipoEvento: TipoEventoService,
    private serviceEquipe: EquipesService,
    private serviceEquipeUsuario: EquipeUsuarioService,
    private router: Router,
    private poNotification: PoNotificationService
  ) {
  }
  ngOnInit(): void {

    this.idUsuario = this.usuarioLogado.getUsuarioLogado();
    
    forkJoin(
      [
        this.poI18nService.getLiterals(),
        this.poI18nService.getLiterals({ context: 'general' })
      ]
    ).subscribe(literals => {
      literals.map(item => Object.assign(this.literals, item));
      
      this.searchEquipesUsuario();
      this.searchTipoEvento();

      if (this.equipesItems) {
        this.setupComponents();

      }
    });
  }

  searchEquipesUsuario(): void { //equipes do usuário logado
    this.hasNext = false;

    this.servEquipeUsuarioSubscription$ = this.serviceEquipeUsuario
      .query([{ property: 'idUsuario', value: this.idUsuario }])
      .subscribe((response: TotvsResponse<IEquipeUsuario>) => {
        if (response && response.items) {
          this.equipeUsuario = [...this.equipeUsuario, ...response.items];
          this.hasNext = response.hasNext;
        }
        for (let i in this.equipeUsuario) {
          this.disclaimersEquipeUser.push({ property: 'codEquipe', value: this.equipeUsuario[i].codEquipe });
        }
        if(this.equipeUsuario.length > 0) {
          this.searchEquipe(); //alimenta o multiselect de equipe do usuário
        }
        
      })
  }

  searchEquipe(): void {
    this.hasNext = false;
    this.servEquipeSubscription$ = this.serviceEquipe
      .query(this.disclaimersEquipeUser || [], this.expandables, 1, 9999)
      .subscribe((response: TotvsResponse<IEquipes>) => {
        if (response && response.items) {
          this.equipesItems = [...this.equipesItems, ...response.items];
          this.atualizaMultiSelect(this.equipesItems);

        }
      });
  }

  atualizaMultiSelect(equipesItems: Array<IEquipes>) {
    for (let i in equipesItems) {
      this.optionsMultiSeletc.push(
        { value: equipesItems[i].codEquipe.toString(), label: equipesItems[i].descEquipe },
      );
       this.multiSelectEquipe = [...this.multiSelectEquipe, equipesItems[i].codEquipe.toString()];
    }
   
    if (this.disclaimersEquipeUser) {
      this.searchEventosEquipes();
    }
  }

  changeOptions(event): void { //selecionando equipes
    this.disclaimersEquipeUser = []
    for (let i in event) {
      this.disclaimersEquipeUser.push({ property: 'codEquipe', value: event[i].value });
    }
    if (this.disclaimersEquipeUser.length > 0) {
      this.searchEventosEquipes();
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

    this.columns = [

      { property: 'idUsuario', label: 'idUsuario', type: 'number', visible: false },
      {
        property: 'nomeUsuario', label: 'Nome', width: '200px',type: 'link' , action: (value, row) => {
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
        let indexcolor = 0;
        let colorEvento = '';
        for (let i in this.tipoEventos) {
          indexcolor += 1;

          if (indexcolor == 13){ 
            indexcolor = 1;
          }
          if (indexcolor <=9 ){ 
            colorEvento = `color-0${indexcolor}`;
          } else {
            colorEvento = `color-${indexcolor}`;
          }
          if ( this.tipoEventos[i].descTipoEvento.toLocaleLowerCase() === 'férias'){
            colorEvento = 'color-08';
          }
          this.dayOffType.push({ value: this.tipoEventos[i].descTipoEvento, color: colorEvento, label: this.tipoEventos[i].descTipoEvento.substring(0, 1), tooltip: this.tipoEventos[i].descTipoEvento });
        }
      });
  }


  redirect(value, row) {
    if (this.usuarioLogado.getTipoPerfilUsuario() === 0) { 
      if (row.idUsuario === this.idUsuario ) {
        this.router.navigate(['/agendaUser', 'newOtherUser', row.idUsuario]);
      } else {
        this.poNotification.error(this.literals.erroNewEventOtherUser);
      }
    } else {
      this.router.navigate(['/agendaUser', 'newOtherUser', row.idUsuario]);
    }
    
  }
  calculateQuantityOfVacationDays() {
    if (ConfiguracaoFeriasFolga.rangeDataValido(this.config)) {
      const start = new Date(this.config.datePickerRange.start);
      const end = new Date(this.config.datePickerRange.end);
      this.primeiroDia = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)
      this.ultimoDia = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
      this.setColumnsList();
      if (this.disclaimersEquipeUser) {
        this.searchEventosEquipes();

      }

    }
  }


  getUsuario(id: number): void {
    this.usuarioSubscription$ = this.serviceUsuario
      .getById(id, [''])
      .subscribe((response: IUsuario) => {

        this.itemsUsers = [...this.itemsUsers, response];
      });
  }

  searchEventosEquipes(loadMore = false): void { //coloquei novo
    this.itemsEventosAux = [];
    this.items = [];

    this.disclaimers = [];
    let codEquipe = [];
    for (let i in this.disclaimersEquipeUser) {
      codEquipe.push(this.disclaimersEquipeUser[i].value);
    }
    if (this.config.datePickerRange !== undefined) {
      this.disclaimers.push({ property: 'dataEventoIni', value: this.config.datePickerRange.start },
        { property: 'dataEventoFim', value: this.config.datePickerRange.end },
        { property: 'codEquipe', value: codEquipe });
    }

    const disclaimer = this.disclaimers || [];

    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {

      this.currentPage = 1;
    }
    this.servEventSubscription$ = this.serviceEvento
      .queryEvento(disclaimer, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<any>) => {

        this.itemsEventosAux = [...response.items];
        //this.items = response.items;
        this.hasNext = response.hasNext;

        if (this.itemsEventosAux.length === 0) { this.currentPage = 1; }
        if (this.itemsEventosAux.length > 0) {
          this.changeObjectProperty(this.itemsEventosAux);
        }
      });

  }

  private changeObjectProperty(eventsUsers: Array<any>): void {
    this.eventos = [];
    this.itemsAux = [];
    if (eventsUsers.length > 0) {
      for (var i = 0; i < eventsUsers.length; i++) {

        this.map1 = new Map();
        this.map1.set('idUsuario', eventsUsers[i].idUsuario);
        this.primeiroDia = new Date(eventsUsers[i].dataEventoIni);
        const end = new Date(eventsUsers[i].dataEventoFim);
        this.ultimoDia = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
        this.quantityOfDaysSchedule = Math.floor(
          (Date.UTC(this.ultimoDia.getFullYear(), this.ultimoDia.getMonth(), this.ultimoDia.getDate()) -
            Date.UTC(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), this.primeiroDia.getDate())) /
          (1000 * 60 * 60 * 24)
        );
        this.dataCalc = new Date();
        for (let y = 0; y <= this.quantityOfDaysSchedule; y++) {
          this.dataCalc = new Date(this.primeiroDia.getFullYear(), this.primeiroDia.getMonth(), (this.primeiroDia.getDate()) + y);

          this.map1.set(this.formatoProperty(this.dataCalc), eventsUsers[i].descTipoEvento);
          this.itemsAux = [...this.map1];
          if (this.newEvent[this.itemsAux[0][0]] !== this.itemsAux[0][1]) {
            this.newEvent = {};
          }
          this.newEvent[this.itemsAux[0][0]] = this.itemsAux[0][1];
          this.newEvent[this.itemsAux[y][0]] = this.itemsAux[y][1];
          this.newEvent['nomeUsuario'] = eventsUsers[i].nomeUsuario;
        }

        this.eventos.push(this.newEvent);


      }

      this.agrupByUser();
    }
  }


  private agrupByUser(): void {


    this.items = []

    let resultado = [];
    for (const objeto of this.eventos) {
      const chaveDuplicada = resultado.find(
        (item) =>
          item.idUsuario === objeto.idUsuario &&
          item.nomeUsuario === objeto.nomeUsuario
      );

      if (chaveDuplicada) {
        // Se já existe um objeto com a mesma chave, mesclar as propriedades
        Object.assign(chaveDuplicada, objeto);
      } else {
        // Caso contrário, adicionar o objeto ao resultado
        resultado.push(objeto);
      }
    }
    this.items = resultado;

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

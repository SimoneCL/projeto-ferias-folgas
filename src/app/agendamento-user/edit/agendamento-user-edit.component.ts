import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PoBreadcrumb, PoDatepickerComponent, PoDatepickerRange, PoI18nService, PoNotificationService, PoNumberComponent, PoPageAction, PoSelectOption } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { Subscription, forkJoin } from 'rxjs';
import { Evento, IEvento } from 'src/app/shared/model/evento.model';
import { EventoService } from 'src/app/shared/services/evento.service';
import { ITipoEvento } from '../../shared/model/tipo-evento.model';
import { TipoEventoService } from '../../shared/services/tipo-evento.service';
import { UsuarioLogadoService } from '../../usuario-logado.service';

@Component({
  selector: 'app-agendamento-user-edit',
  templateUrl: './agendamento-user-edit.component.html',
  styleUrls: ['./agendamento-user-edit.component.css']
})
export class AgendamentoUserEditComponent implements OnInit {

  private eventoUserSubscription$: Subscription;
  private tipoEventoSubscription$: Subscription;
  public eventUser: IEvento = new Evento();

  breadcrumb: PoBreadcrumb;
  literals: any = {};

  datepickerRange: PoDatepickerRange;
  datepicker: Date;
  quantityOfDays: number;
  eventType: number;
  eventPage: string;
  userLogado: number;
  id: string = '';
  isEdit: boolean = false;

  items: Array<ITipoEvento> = new Array<ITipoEvento>();

  public eventOptions: Array<PoSelectOption> = [];
  public isHidden: boolean;

  public usuarioLogado = new UsuarioLogadoService();


  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private poI18nService: PoI18nService,
    private poNotification: PoNotificationService,
    private serviceEvento: EventoService,
    private serviceTipoEvento: TipoEventoService
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


      this.eventPage = this.activatedRoute.snapshot.url[0].path;
      this.isEdit = this.eventPage === 'edit';

      this.isHidden = this.eventPage === 'new';

      const id = this.activatedRoute.snapshot.paramMap.get('id');
      this.search();


      if (id) {
        this.get(id);
      }
      this.setupComponents();


    });
  }

  setupComponents() {

    this.breadcrumb = this.getBreadcrumb();
  }
  private beforeRedirect(itemBreadcrumbLabel) {
    this.return();
  }
  changeEvent(event) {


    this.isHiddenField(event)
    this.quantityOfDays = 0;
    this.datepickerRange = undefined;
    this.datepicker = undefined;

  }
  isHiddenField(codTipo) {
    if (codTipo == 2 || codTipo == 3 || codTipo == 4) { //férias, licenca maternidade, licenca paternidade
      this.isHidden = false;
    } else {
      this.isHidden = true;
    }

  }

  return() {
    this.route.navigate(['/agendaUser']);;
  }
  save() {
    this.eventUser.idUsuario = this.userLogado;
    this.calculateQuantityOfVacationDays();
    if ( this.quantityOfDays !== 0 && this.eventUser.codTipo) {
      if (this.datepickerRange) {
        this.eventUser.dataEventoIni = this.datepickerRange.start.toString();
        this.eventUser.dataEventoFim = this.datepickerRange.end.toString();
      } else {
        this.eventUser.dataEventoIni = this.datepicker.toString();
        this.eventUser.dataEventoFim = this.datepicker.toString();
      }
    } else {
      this.poNotification.error(this.literals.erroEditAgendaEvent);
    
    }

  }
  create() {
   this.save();
    if (this.quantityOfDays !== 0 && this.eventUser.codTipo) {
      this.eventoUserSubscription$ = this.serviceEvento.create(this.eventUser).subscribe(() => {
        this.return();
        this.poNotification.success(this.literals.createdMessage);
      });
    }
  }
  update() {
    this.save();
    if ( this.quantityOfDays !== 0 && this.eventUser.codTipo) {
      this.eventoUserSubscription$ = this.serviceEvento.update(this.eventUser).subscribe(() => {
        this.return();
        this.poNotification.success(this.literals.createdMessage);
      });
    }
  }
  getTitle(): string {
    if (this.eventPage === 'edit') {
      return this.literals.editEventUser;
    } else {
      return this.literals.newEventUser;
    }
  }
  getBreadcrumb() {
    if (this.eventPage === 'edit') {
      return {
        items: [
          { label: this.literals.scheduleEventUser, action: this.beforeRedirect.bind(this), link: '/agendaUser' },
          { label: this.literals.editEventUser }
        ]
      };
    } else {
      return {
        items: [
          { label: this.literals.scheduleEventUser, action: this.beforeRedirect.bind(this), link: '/agendaUser' },
          { label: this.literals.newEventUser }
        ]
      };
    }
  }

  getActions(): Array<PoPageAction> {
    switch (this.eventPage) {
      case 'edit': {
        return this.editActions();
      }
      case 'detail': {
        return this.detailActions();
      }
    }
    return this.newActions();
  }

  editActions(): Array<PoPageAction> {

    return [
      {
        label: this.literals.save,
        action: this.update.bind(this, this.eventUser),
      },
      {
        label: this.literals.return,
        action: this.return.bind(this)
      }
    ];

  }

  detailActions(): Array<PoPageAction> {
    return [
      {
        label: this.literals.return,
        action: this.return.bind(this)
      }
    ];
  }

  newActions(): Array<PoPageAction> {
    return [
      {
        label: this.literals.save,
        action: this.create.bind(this),
        icon: 'po-icon-plus'
      }, {
        label: this.literals.return,
        action: this.return.bind(this)
      }
    ];
  }

  get(id: string): void {
    let data = []
    this.eventoUserSubscription$ = this.serviceEvento
      .getById(id, [''])
      .subscribe((response: IEvento) => {
        this.eventUser = response;
        this.isHiddenField(this.eventUser.codTipo)
        if (this.eventUser.codTipo === 2 || this.eventUser.codTipo === 3 || this.eventUser.codTipo === 4) {
          this.datepickerRange = {
            start: new Date(this.eventUser.dataEventoIni),
            end: new Date(this.eventUser.dataEventoFim)
          }
        } else {
          this.datepicker = new Date(this.eventUser.dataEventoIni);

        }
        this.calculateQuantityOfVacationDays();

      });
  }

  search(): void {
    this.eventOptions = [];
    this.tipoEventoSubscription$ = this.serviceTipoEvento
      .query([], 1, 9999)
      .subscribe((response: TotvsResponse<ITipoEvento>) => {
        this.items = [...this.items, ...response.items];
        for (let i in this.items) {
          this.eventOptions = [...this.eventOptions, { label: this.items[i].descTipoEvento.toLocaleUpperCase(), value: this.items[i].codTipo.toString() }];
        }

      });
  }

  calculateQuantityOfVacationDays() {

    if (this.datepickerRange) {
      this.eventUser.dataEventoIni = this.datepickerRange.start.toString();
      this.eventUser.dataEventoFim = this.datepickerRange.end.toString();
    } else {
      this.eventUser.dataEventoIni = this.datepicker.toString();
      this.eventUser.dataEventoFim = this.datepicker.toString();
    }
    let start = new Date(this.eventUser.dataEventoIni);
    let end = new Date(this.eventUser.dataEventoFim);

    if (Number.isNaN(start.getDay()) === false && Number.isNaN(end.getDay()) === false) {
      this.quantityOfDays
        = Math.floor(
          (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
            Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
          (1000 * 60 * 60 * 24)
        ) + 1;
    } else {

      this.quantityOfDays = 0;

    }
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

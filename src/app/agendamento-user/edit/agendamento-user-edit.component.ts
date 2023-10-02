import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PoBreadcrumb, PoDatepickerRange, PoI18nService, PoNotificationService, PoPageAction, PoSelectOption } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { Subscription, forkJoin } from 'rxjs';
import { Evento, IEvento } from 'src/app/shared/model/evento.model';
import { EventoService } from 'src/app/shared/services/evento.service';
import { ITipoEvento } from '../../shared/model/tipo-evento.model';
import { TipoEventoService } from '../../shared/services/tipo-evento.service';

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
  datepickerRangeAux: PoDatepickerRange;
  formVacationSuggestion: UntypedFormGroup;
  quantityOfDays: number;
  eventType: number;
  eventPage: string;
  userLogado: string;
  id: string = '';
  isEdit: boolean = false;

  items: Array<ITipoEvento> = new Array<ITipoEvento>();

  public eventOptions: Array<PoSelectOption> = []; //Array<PoRadioGroupOption> = [];
  public isHidden: boolean;

  get validateForm() {
    return !(
      this.formVacationSuggestion.valid &&
      this.formVacationSuggestion.get('datepickerRange').value.start &&
      this.formVacationSuggestion.get('datepickerRange').value.end
    );
  }
  constructor(
    private route: Router,
    private formBuilder: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private poI18nService: PoI18nService,
    private poNotification: PoNotificationService,
    private serviceEvento: EventoService,
    private serviceTipoEvento: TipoEventoService
  ) { }

  ngOnInit(): void {

    this.userLogado = localStorage.getItem('userLogado');

    forkJoin(
      [
        this.poI18nService.getLiterals(),
        this.poI18nService.getLiterals({ context: 'general' })
      ]
    ).subscribe(literals => {
      literals.map(item => Object.assign(this.literals, item));
      this.formVacationSuggestion = this.formBuilder.group({
        datepickerRange: [undefined, Validators.required],
        quantityOfDays: [undefined],
        eventType: [undefined]
      });

      this.eventPage = this.activatedRoute.snapshot.url[0].path;
      this.isEdit = this.eventPage === 'edit';
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      this.search();


      if (id) {
        this.get(id);
      }
      this.setupComponents();


    });
  }

  setupComponents() {
    this.isHidden = this.eventPage === 'new';
    this.breadcrumb = this.getBreadcrumb();
  }
  private beforeRedirect(itemBreadcrumbLabel) {
    if (this.formVacationSuggestion.valid) {
      this.return();
    }
  }
  changeEvent(event) {
    this.hiddenQtdDay();
  }
  hiddenQtdDay() {
    this.isHidden = this.formVacationSuggestion.get('eventType').value === 1;
  }
  return() {
    this.route.navigate(['/agendaUser']);;
  }
  save() {
    this.eventUser.idUsuario = 63380;
    this.eventUser.codTipo = this.formVacationSuggestion.get('eventType').value;
    if (this.eventUser.codTipo === 1) {
      this.eventUser.dataEventoIni = this.formVacationSuggestion.get('datepickerRange').value.start;
      this.eventUser.dataEventoFim = this.formVacationSuggestion.get('datepickerRange').value.end;

    } else {
      this.eventUser.dataEventoIni = this.formVacationSuggestion.get('datepickerRange').value.start;
      this.eventUser.dataEventoFim = this.eventUser.dataEventoIni;
    }

  }
  create() {
    this.save();
    this.eventoUserSubscription$ = this.serviceEvento.create(this.eventUser).subscribe(() => {
      this.return();
      this.poNotification.success(this.literals.createdMessage);
    });
  }
  update() {
    this.save();
    this.eventoUserSubscription$ = this.serviceEvento.update(this.eventUser).subscribe(() => {
      this.return();
      this.poNotification.success(this.literals.createdMessage);
    });
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
        this.datepickerRangeAux = {
          start: new Date(this.eventUser.dataEventoIni),
          end: new Date(this.eventUser.dataEventoFim)
        }

        this.formVacationSuggestion.get("eventType").patchValue(this.eventUser.codTipo);
        this.hiddenQtdDay();
        this.formVacationSuggestion.get("datepickerRange").patchValue(this.datepickerRangeAux);
      });
  }

  search(): void {
    this.eventOptions = [];
    this.tipoEventoSubscription$ = this.serviceTipoEvento
      .query([], 1, 999)
      .subscribe((response: TotvsResponse<ITipoEvento>) => {
        this.items = [...this.items, ...response.items];
        for (let i in this.items) {
          this.eventOptions = [...this.eventOptions, { label: this.items[i].descTipoEvento, value: this.items[i].codTipo.toString() }];
        }
      });
  }

  calculateQuantityOfVacationDays() {
    const start = new Date(this.formVacationSuggestion.get('datepickerRange').value.start);
    const end = new Date(this.formVacationSuggestion.get('datepickerRange').value.end);

    if (this.eventUser.codTipo === 1) {
      this.eventUser.dataEventoIni = start.getFullYear() + "-" + ((start.getMonth() + 1)) + "-" + ((start.getDate() + 1));
      this.eventUser.dataEventoFim = end.getFullYear() + "-" + ((end.getMonth() + 1)) + "-" + ((end.getDate() + 1));
    } else {
      this.eventUser.dataEventoIni = start.getFullYear() + "-" + ((start.getMonth() + 1)) + "-" + ((start.getDate() + 1));
      this.eventUser.dataEventoFim = this.eventUser.dataEventoIni;
    }


    this.quantityOfDays
      = Math.floor(
        (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
          Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
        (1000 * 60 * 60 * 24)
      );
    this.formVacationSuggestion.get('quantityOfDays').setValue(this.quantityOfDays);
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

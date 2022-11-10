import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PoBreadcrumb, PoDatepickerRange, PoDialogService, PoI18nService, PoNotificationService, PoPageAction, PoRadioGroupOption } from '@po-ui/ng-components';
import { forkJoin, Subscription } from 'rxjs';
import { Evento, IEvento } from 'src/app/shared/model/evento.model';
import { EventoService } from 'src/app/shared/services/evento.service';

@Component({
  selector: 'app-cadastro-user-edit',
  templateUrl: './cadastro-user-edit.component.html',
  styleUrls: ['./cadastro-user-edit.component.css']
})
export class CadastroUserEditComponent implements OnInit {

  private eventoUserSubscription$: Subscription;
  public eventUser: IEvento = new Evento();

  breadcrumb: PoBreadcrumb;
  literals: any = {};

  datepickerRange: PoDatepickerRange;
  datepickerRangeAux: PoDatepickerRange;
  formVacationSuggestion: UntypedFormGroup;
  quantityOfDays: number;
  eventType: number;
  eventPage: string;

  public eventOptions: Array<PoRadioGroupOption>;
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
    private serviceEvento: EventoService
  ) { }

  ngOnInit(): void {
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
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      if (id) {
        this.get(id);
      }
      this.setupComponents();
    });
  }

  setupComponents() {
    this.isHidden = this.eventPage === 'new';
    this.formVacationSuggestion.get("eventType").patchValue(1);
        this.breadcrumb = this.getBreadcrumb();
    this.eventOptions = [
      { label: 'Férias', value: 1 },
      { label: 'Ponte', value: 2 },
      { label: 'Reset day/Day Off', value: 3 }
    ];
  }
  private beforeRedirect(itemBreadcrumbLabel) {
    if (this.formVacationSuggestion.valid) {
      this.return();
    }
  }
  changeEvent(event) {
    this.isHidden = this.formVacationSuggestion.get('eventType').value === 1;
  }
  return() {
    this.route.navigate(['/agendaUser']);;
  }
  save() {
    this.eventUser.user = 'simone';
    this.eventUser.type = this.formVacationSuggestion.get('eventType').value;
    if (this.eventUser.type === 1) {
      this.eventUser.eventIniDate = this.formVacationSuggestion.get('datepickerRange').value.start;
      this.eventUser.eventEndDate = this.formVacationSuggestion.get('datepickerRange').value.end;

    } else {
      this.eventUser.eventIniDate = this.formVacationSuggestion.get('datepickerRange').value.start;
      this.eventUser.eventEndDate = this.eventUser.eventIniDate;
    }

    if (this.eventPage !== 'edit') {
      this.eventUser.id = Math.floor(Math.random() * 65536);
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
      return this.literals.editUser;
    } else {
      return this.literals.newUser;
    }
  }
  getBreadcrumb(){
    if (this.eventPage === 'edit') {
      return {
        items: [
          { label: this.literals.listUser, action: this.beforeRedirect.bind(this), link: '/cadastroUser' },
          { label: this.literals.editUser }
        ]
      };
    } else {
      return {
        items: [
          { label: this.literals.listUser, action: this.beforeRedirect.bind(this), link: '/cadastroUser' },
          { label: this.literals.newUser }
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
          start: this.eventUser.eventIniDate,
          end: this.eventUser.eventEndDate
        }
        this.formVacationSuggestion.get("eventType").patchValue(this.eventUser.type);
        this.formVacationSuggestion.get("datepickerRange").patchValue(this.datepickerRangeAux);
      });
  }


  calculateQuantityOfVacationDays() {
    const start = new Date(this.formVacationSuggestion.get('datepickerRange').value.start);
    const end = new Date(this.formVacationSuggestion.get('datepickerRange').value.end);

    if (this.eventUser.type === 1) {
      this.eventUser.eventIniDate = start.getFullYear() + "-" + ((start.getMonth() + 1)) + "-" + ((start.getDate() + 1));
      this.eventUser.eventEndDate = end.getFullYear() + "-" + ((end.getMonth() + 1)) + "-" + ((end.getDate() + 1));
    } else {
      this.eventUser.eventIniDate = start.getFullYear() + "-" + ((start.getMonth() + 1)) + "-" + ((start.getDate() + 1));
      this.eventUser.eventEndDate = this.eventUser.eventIniDate;
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
  }
}
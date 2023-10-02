import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PoDialogService, PoDisclaimer, PoI18nService, PoModalComponent, PoModalAction } from '@po-ui/ng-components';
import { PoPageLoginLiterals } from '@po-ui/ng-templates';
import { TotvsResponse } from 'dts-backoffice-util';
import { Subscription } from 'rxjs';
import { ILogin, Login } from '../shared/model/login.model';
import { IUsuario } from '../shared/model/usuario.model';
import { LoginService } from '../shared/services/login.service';
import { PoModalPasswordRecoveryComponent, PoModalPasswordRecoveryType } from '@po-ui/ng-templates';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @ViewChild('formLogin', { static: true }) formLogin: NgForm;
  @ViewChild('modalRecSenha', { static: false }) modalRecSenha: PoModalComponent;

  literals: any = {};
  confirm: PoModalAction;
  close: PoModalAction;
  eventPage: string;

  items: Array<any> = new Array<any>();
  private itemsLogin: Array<ILogin>;
  //public login: Array<any> = new Array<any>();
  public login: ILogin = Login.empty();
  literalsI18n: PoPageLoginLiterals;
  loading: boolean = false;
  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];

  servLoginSubscription$: Subscription;
  private i18nSubscription: Subscription;
  userLogin: ILogin;

  user: string = '';
  password: string = '';

  constructor(
    private poI18nService: PoI18nService,
    private poDialog: PoDialogService,
    private servLogin: LoginService,
    private router: Router
  ) { }

  

  ngOnDestroy() {
    this.i18nSubscription.unsubscribe();
  }

  ngOnInit() {
    this.i18nSubscription = this.poI18nService.getLiterals().subscribe(literals => {
      this.literalsI18n = literals;

      this.setupComponents();

      //this.search();
    })
  }

  setupComponents() {
    this.confirm = {
      action: () => {
       /* this.relacEquipe();*/
      },
      label: this.literalsI18n?.enviar
    };

    this.close = {
      action: () => this.closeModal(),
      label: this.literalsI18n?.cancel
    };
  }

  search(loadMore = false): void {
    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.currentPage = 1;
      this.items = [];
    }

    this.hasNext = false;
    this.servLoginSubscription$ = this.servLogin
      .query(this.disclaimers, [], this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<ILogin>) => {

        if (response && response.items) {
          this.itemsLogin = [...this.items, ...response.items];
          this.hasNext = response.hasNext;
        }

        if (this.itemsLogin.length === 0) {
          this.currentPage = 1;
        }

      });
  }

  onClick() {
    
    if (this.login.usuario != "") {    
      
      this.servLoginSubscription$ = this.servLogin
        .getByUser(this.login.usuario).subscribe((response: ILogin) => {
          
          if (response.email != undefined) {            
            this.userLogin = response;

            if ( this.login.senha != undefined && this.login.senha === this.userLogin.senha ) {  
            
              localStorage.setItem('usuarioLogado', this.userLogin.idUsuario.toString());

              setTimeout(() => {
                this.router.navigate(['/feriasFolga']);
              }, 500);
            } else {
              this.poDialog.alert({
                ok: () => (this.loading = false),
                title: 'Login Invalido',
                message: 'usuario ou senha incorretos.'
              });
            }
          } else {
            this.poDialog.alert({
              ok: () => (this.loading = false),
              title: 'Login Invalido',
              message: 'usuario ou senha incorretos.'
            });
          }
        });
    }
  }

  abrirRecSenha() {
    this.modalRecSenha.open();
  }

  public closeModal() {
    /*this.equipeSelected = [];*/
    this.modalRecSenha.close();
  }



}

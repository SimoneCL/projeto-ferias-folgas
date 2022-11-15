import { Component, OnInit } from '@angular/core';
import { PoDialogService, PoDisclaimer, PoI18nService } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { PoModalPasswordRecoveryType, PoPageBlockedUserReasonParams, PoPageLoginCustomField, PoPageLoginLiterals, PoPageLoginRecovery } from '@po-ui/ng-templates';
import { forkJoin, Subscription } from 'rxjs';
import { ILogin } from '../shared/model/login.model';
import { LoginService } from '../shared/services/login.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  titleApp:String;
  attempts = 3;
  exceededAttempts: number;
  literalsI18n: PoPageLoginLiterals;
  loading: boolean = false;
  loginErrors = [];
  passwordErrors = [];
  params: PoPageBlockedUserReasonParams = { attempts: 3, hours: 24 };
  passwordRecovery: PoPageLoginRecovery = {
    url: 'https://po-sample-api.herokuapp.com/v1/users',
    type: PoModalPasswordRecoveryType.All,
    contactMail: 'support@mail.com'
  };
  showPageBlocked: boolean = false;

  items: Array<any> = new Array<any>();

  private itemsLogin: Array<ILogin>;
  public login: Array<any> = new Array<any>();
  ItemsAux: Array<any>;
  newLogin = {};
  eventos: Array<any> = [];

  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];
  map1 = new Map();

  servLoginSubscription$: Subscription;
  
  private i18nSubscription: Subscription;
  userLogin: ILogin;
  
  constructor(
    private poI18nService: PoI18nService, 
    private poDialog: PoDialogService,
    private servLogin: LoginService,
    private router: Router
  ) {}

  ngOnDestroy() {
    this.i18nSubscription.unsubscribe();
  }

  ngOnInit() {
    this.i18nSubscription = this.poI18nService.getLiterals().subscribe(literals => {
      this.literalsI18n = literals;
      this.exceededAttempts = 0;
      this.setupComponent();
      this.search();      
    });
  }

  search (loadMore = false): void {
    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;      
    } else {
      this.currentPage = 1;
      this.items = [];
    }
    
    this.hasNext = false;
    this.servLoginSubscription$ = this.servLogin
      .query(this.disclaimers || [], this.expandables, this.currentPage, this.pageSize)
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

  setupComponent() {
    this.titleApp = "Login";
  }
  checkLogin(formData) {

    if (this.itemsLogin) {
      this.servLoginSubscription$ = this.servLogin
        .getById(formData.login).subscribe((item: ILogin) => {
          this.userLogin = item;          
          
          if (this.userLogin.email.substring(this.userLogin.email.indexOf("@")) != "@totvs.com.br") {
            this.poDialog.alert({
              ok: () => (this.loading = false),
              title: 'Email Invalido',
              message: 'usuario ou senha incorretos.'
            }); 
          }

          if (formData.login === this.userLogin.email && formData.password === this.userLogin.password) {
            this.passwordErrors = [];
            this.exceededAttempts = 0;
            this.loginErrors = [];

            localStorage.setItem('user',this.userLogin.user);
            console.log("login",localStorage.getItem('user'));

            setTimeout(() => {
              this.router.navigate(['/feriasFolga']);
              //this.router.navigate(['/']);
            }, 500);
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

  passwordChange() {
    if (this.passwordErrors.length) {
      this.passwordErrors = [];
    }
  }

  loginChange() {
    if (this.loginErrors.length) {
      this.loginErrors = [];
    }
  }

  private generateAttempts() {
    if (this.attempts >= 1) {
      this.attempts--;
      this.exceededAttempts = this.attempts;
    }
    if (this.attempts === 0) {
      this.showPageBlocked = true;
    }
  }  
}


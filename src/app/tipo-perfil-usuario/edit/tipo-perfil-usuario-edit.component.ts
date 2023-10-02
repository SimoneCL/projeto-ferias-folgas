//Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
//PO-UI
import { PoDialogService, PoDisclaimer, PoI18nService, PoBreadcrumb, PoNotificationService, PoPageAction, PoTableAction, PoTableColumn, PoPageFilter, PoI18nPipe } from '@po-ui/ng-components';
import { PoPageLoginLiterals } from '@po-ui/ng-templates';
import { TotvsResponse } from 'dts-backoffice-util';
//Services
import { forkJoin, Subscription } from 'rxjs';
import { ITipoPerfilUsuario, TipoPerfilUsuario } from '../../shared/model/tipo-perfil-usuario.model';
import { TipoPerfilUsuarioService } from '../../shared/services/tipo-perfil-usuario.service';


@Component({
  selector: 'app-tipo-perfil-usuario-edit',
  templateUrl: './tipo-perfil-usuario-edit.component.html',
  styleUrls: ['./tipo-perfil-usuario-edit.component.css']
})
export class TipoPerfilUsuarioEditComponent implements OnInit {

  userLogado: string;

  literalsI18n: PoPageLoginLiterals;
  literals: any = {};
  breadcrumb: PoBreadcrumb;
  eventPage: string;  
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];

  hasNext = false;
  pageSize = 20;
  currentPage = 0;
  isLoading = true;
  isEdit: boolean;

  public itemsTipoPerfil: ITipoPerfilUsuario = TipoPerfilUsuario.empty();
  servTipoPerfilUsuarioSubscription$: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private poI18nService: PoI18nService,
    private servTipoPerfilUsuario: TipoPerfilUsuarioService,
    private poDialog: PoDialogService,
    private poNotification: PoNotificationService,
    private router: Router
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
      
      const code = this.activatedRoute.snapshot.paramMap.get('id');
      
      this.isEdit = (code) ? true : false;
      if(this.isEdit) {
        this.search(code);
      } 
      
      this.setupComponents();
      
    });
  }

  setupComponents() {
    if(!this.isEdit) {
      this.itemsTipoPerfil.idTipoPerfil = 0;
      this.itemsTipoPerfil.descricaoPerfil = '';
    }    
  }

  search(idTipoPerfil: string): void {
    this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
      .getById(idTipoPerfil)
      .subscribe((response: ITipoPerfilUsuario) => {
        this.itemsTipoPerfil = response;        
      })
  }

  save() {
    if(this.isEdit) {
      this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
        .update(this.itemsTipoPerfil)
        .subscribe((response: ITipoPerfilUsuario) => {
          if(response) {
            this.router.navigate(['/perfilUsuario']);
            this.poNotification.success(this.literals.updatedMessage);
          }          
        })
    } else {
      this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
        .create(this.itemsTipoPerfil)
        .subscribe((response: ITipoPerfilUsuario) => {
          if(response) {
            this.router.navigate(['/perfilUsuario']);
            this.poNotification.success(this.literals.createdMessage);
           }          
        })
    }        
  }

  cancel() {
    this.router.navigate(['perfilUsuario/']);    
  }

}

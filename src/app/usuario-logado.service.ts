import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioLogadoService {

  public static idUserLogado: number;
  public static nameUserLogado: string;
  public static tipoPerfilUserLogado: number;

  public static profile: any;
  public static menu: any;

  constructor() { }  

  getUsuarioLogado() {
    return UsuarioLogadoService.idUserLogado;
  }

  getTipoPerfilUsuario() {
    return UsuarioLogadoService.tipoPerfilUserLogado;
  }

  setUsuarioLogado(idUser: number, nameUser: string, tipoPerfil: number) {
    UsuarioLogadoService.idUserLogado = idUser;
    UsuarioLogadoService.nameUserLogado = nameUser;
    UsuarioLogadoService.tipoPerfilUserLogado = tipoPerfil;

    /*AppComponent.profile = {
      title: UsuarioLogadoService.nameUserLogado
    };*/

  }

  setMenu(menu: any) {
    UsuarioLogadoService.menu = menu;
  }

  getMenu() {
    return UsuarioLogadoService.menu;
  }
  
  setProfile(profileInput: any) {
    UsuarioLogadoService.profile = profileInput;    
  }

  getProfile() {
    return UsuarioLogadoService.profile;    
  }

  clearUsuarioLogado() {
    UsuarioLogadoService.idUserLogado = 0;
  }
}

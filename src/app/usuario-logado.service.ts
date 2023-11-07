import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuarioLogadoService {

  public static idUserLogado: number;
  public static nameUserLogado: string;

  constructor() { }  

  getUsuarioLogado() {
    return UsuarioLogadoService.idUserLogado;
  }

  setUsuarioLogado(idUser: number, nameUser: string) {
    UsuarioLogadoService.idUserLogado = idUser;
    UsuarioLogadoService.nameUserLogado = nameUser;

    /*AppComponent.profile = {
      title: UsuarioLogadoService.nameUserLogado
    };*/

  }

  clearUsuarioLogado() {
    UsuarioLogadoService.idUserLogado = 0;
  }
}

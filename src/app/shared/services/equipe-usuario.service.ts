import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PoDisclaimer, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { Observable } from 'rxjs';

import { TotvsResponse } from 'dts-backoffice-util';
import { EquipeUsuario, IEquipeUsuario } from '../model/equipe-usuario.model';

@Injectable()
export class EquipeUsuarioService {
    private headers = { headers: { 'X-PO-Screen-Lock': 'true' } };

    private apiBaseUrl = 'http://localhost:3000/equipeUsuario';
    
    private expandables = [''];

    constructor(private http: HttpClient) { }
    query(filters: PoDisclaimer[], page = 1, pageSize = 9999): Observable<TotvsResponse<IEquipeUsuario>> {
        let url = `${this.apiBaseUrl}?pageSize=${pageSize}&page=${page}`;

        if (filters && filters.length > 0) {

            const urlParams = new Array<string>();

            filters.map(filter => {
                urlParams.push(`${filter.property}=${filter.value}`);
            });

            url = `${url}&${urlParams.join('&')}`;
        }
        return this.http.get<TotvsResponse<IEquipeUsuario>>(url);
    }
    queryByEquipe(filters: PoDisclaimer[], page = 1, pageSize = 9999): Observable<TotvsResponse<IEquipeUsuario>> {
        let url = `${this.apiBaseUrl}/byEquipe?pageSize=${pageSize}&page=${page}`;

        if (filters && filters.length > 0) {

            const urlParams = new Array<string>();

            filters.map(filter => {
                urlParams.push(`${filter.property}=${filter.value}`);
            });

            url = `${url}&${urlParams.join('&')}`;
        }
        return this.http.get<TotvsResponse<IEquipeUsuario>>(url);
    }

  

    getById(id: string, expandables: string[]): Observable<IEquipeUsuario> {
        let lstExpandables = this.getExpandables(expandables);
        if (lstExpandables !== '') { lstExpandables = `?${lstExpandables}`; }

        return this.http.get<IEquipeUsuario>(`${this.apiBaseUrl}/${id}${lstExpandables}`, this.headers);
    }

    getMetadata(type = '', id = ''): Observable<any> {
        let url = `${this.apiBaseUrl}/metadata`;
        if (id) { url = `${url}/${id}`; }
        if (type) { url = `${url}/${type}`; }
        return this.http.get<TotvsResponse<IEquipeUsuario>>(url, this.headers);
    }

    getFilteredItems(params: PoLookupFilteredItemsParams): Observable<IEquipeUsuario> {
        const header = { params: { page: params.page.toString(), pageSize: params.pageSize.toString() } };

        if (params.filter && params.filter.length > 0) {
            header.params['code'] = params.filter;
        }

        return this.http.get<IEquipeUsuario>(`${this.apiBaseUrl}`, header);
    }

    getObjectByValue(id: string): Observable<IEquipeUsuario> {
        return this.http.get<IEquipeUsuario>(`${this.apiBaseUrl}/${id}`);
    }

    c
    create(model: IEquipeUsuario): Observable<IEquipeUsuario> {
        return this.http.post<IEquipeUsuario>(this.apiBaseUrl, model, this.headers);
    }


    update(model: IEquipeUsuario): Observable<IEquipeUsuario> {
        return this.http.put<IEquipeUsuario>(`${this.apiBaseUrl}/${EquipeUsuario.getInternalId(model)}`, model, this.headers);
    }

    delete (model: IEquipeUsuario): Observable<IEquipeUsuario>  {
        const id = encodeURIComponent(EquipeUsuario.getInternalId(model));
        return this.http.delete<IEquipeUsuario>(`${this.apiBaseUrl}/${id}`);
    }

    getUrl(urlBase: string, filters: PoDisclaimer[], expandables: string[], page: number, pageSize: number): string {
        const urlParams = new Array<String>();

        urlParams.push(`pageSize=${pageSize}`);
        urlParams.push(`page=${page}`);

        const lstExpandables = this.getExpandables(expandables);
        if (lstExpandables !== '') { urlParams.push(lstExpandables); }

        if (filters && filters.length > 0) {
            filters.map(filter => {
                urlParams.push(`${filter.property}=${filter.value}`);
            });
        }

        return `${urlBase}?${urlParams.join('&')}`;
    }

    getExpandables(expandables: string[]): string {
        let lstExpandables = '';

        if (expandables && expandables.length > 0) {
            expandables.map(expandable => {
                if (expandable !== '' && this.expandables.includes(expandable)) {
                    if (lstExpandables !== '') { lstExpandables = `${lstExpandables},`; }
                    lstExpandables = `${lstExpandables}${expandable}`;
                }
            });
        }

        if (lstExpandables !== '') { lstExpandables = `expand=${lstExpandables}`; }

        return lstExpandables;
    }
}

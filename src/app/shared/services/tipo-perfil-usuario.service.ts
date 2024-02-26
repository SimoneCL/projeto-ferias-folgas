import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PoDisclaimer, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { Observable, map } from 'rxjs';

import { TotvsResponse } from 'dts-backoffice-util';
import { TipoPerfilUsuario, ITipoPerfilUsuario } from '../model/tipo-perfil-usuario.model';

@Injectable()
export class TipoPerfilUsuarioService {
    private headers = { headers: { 'X-PO-Screen-Lock': 'true' } };

    private apiBaseUrl = 'http://10.171.119.19:3000/tipoPerfilUsuario';
    private apiUploadUrl = `${this.apiBaseUrl}/addFile`;

    private expandables = [''];

    constructor(private http: HttpClient) { }

    getApiBaseUrl(): string {
        return this.apiBaseUrl;
    }

    getApiUploadUrl(): string {
        return this.apiUploadUrl;
    }

    query(filters: PoDisclaimer[], expandables: string[], page = 1, pageSize = 20): Observable<TotvsResponse<ITipoPerfilUsuario>> {
        const url = this.getUrl(this.apiBaseUrl, filters, expandables, page, pageSize);

        return this.http.get<TotvsResponse<ITipoPerfilUsuario>>(url, this.headers);
    }

    getById(id: string): Observable<ITipoPerfilUsuario> {
        return this.http.get<ITipoPerfilUsuario>(`${this.apiBaseUrl}/edit/${id}`, this.headers);
    }

    getByDescription(description: string): Observable<ITipoPerfilUsuario> {
        return this.http.get<ITipoPerfilUsuario>(`${this.apiBaseUrl}/edit/${description}`, this.headers);
    }

    getByUser(user: string): Observable<ITipoPerfilUsuario> {
        return this.http.get<ITipoPerfilUsuario>(`${this.apiBaseUrl}/${user}`, this.headers);
    }

    getMetadata(type = '', id = ''): Observable<any> {
        let url = `${this.apiBaseUrl}/metadata`;
        if (id) { url = `${url}/${id}`; }
        if (type) { url = `${url}/${type}`; }
        return this.http.get<TotvsResponse<ITipoPerfilUsuario>>(url, this.headers);
    }

    getFilteredItems(params: PoLookupFilteredItemsParams): Observable<ITipoPerfilUsuario> {
        const header = { params: { page: params.page.toString(), pageSize: params.pageSize.toString() } };

        if (params.filter && params.filter.length > 0) {
            header.params['code'] = params.filter;
        }

        return this.http.get<ITipoPerfilUsuario>(`${this.apiBaseUrl}`, header);
    }

    getObjectByValue(id: any, filterParams: any): Observable<any> {
        if (filterParams && filterParams.multiple) {
            let paramId = Array.isArray(id) ? id : [id];

            const filters = new Array<PoDisclaimer>();
            filters.push({ property: 'descricaoPerfil', value: paramId.join(',') });

            return this.query(filters, null, 1, 999).pipe(map((resp: TotvsResponse<ITipoPerfilUsuario>) => resp.items));
        } else {
            return this.getById(id);
        }
    }

    create(model: ITipoPerfilUsuario): Observable<ITipoPerfilUsuario> {
        return this.http.post<ITipoPerfilUsuario>(this.apiBaseUrl, model, this.headers);
    }

    update(model: ITipoPerfilUsuario): Observable<ITipoPerfilUsuario> {
        return this.http.put<ITipoPerfilUsuario>(`${this.apiBaseUrl}/edit/${TipoPerfilUsuario.getInternalId(model)}`, model, this.headers);
    }

    delete(tipoPerfil: string): Observable<Object> {
        return this.http.delete(`${this.apiBaseUrl}/${tipoPerfil}`, this.headers);
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

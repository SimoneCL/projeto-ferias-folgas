import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PoDisclaimer, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { Observable } from 'rxjs';

import { TotvsResponse } from 'dts-backoffice-util';
import { ITipoEvento, TipoEvento } from '../model/tipo-evento.model';

@Injectable()
export class TipoEventoService {
    private headers = { headers: { 'X-PO-Screen-Lock': 'true' } };

    // private apiBaseUrl = '/dts/datasul-rest/resources/prg/fin/v1/tipoevento';
    private apiBaseUrl = 'http://10.80.129.239:3000/tipoEvento';
    
    private expandables = [''];

    constructor(private http: HttpClient) { }
    
    query(filters: PoDisclaimer[], page = 1, pageSize = 20): Observable<TotvsResponse<ITipoEvento>> {

    
        const url = this.getUrl(this.apiBaseUrl, filters,  this.expandables, page, pageSize);
        return this.http.get<TotvsResponse<ITipoEvento>>(url);
    }

    getById(id: string, expandables: string[]): Observable<ITipoEvento> {
        let lstExpandables = this.getExpandables(expandables);
        if (lstExpandables !== '') { lstExpandables = `?${lstExpandables}`; }

        return this.http.get<ITipoEvento>(`${this.apiBaseUrl}/${id}${lstExpandables}`, this.headers);
    }

    getMetadata(type = '', id = ''): Observable<any> {
        let url = `${this.apiBaseUrl}/metadata`;
        if (id) { url = `${url}/${id}`; }
        if (type) { url = `${url}/${type}`; }
        return this.http.get<TotvsResponse<ITipoEvento>>(url, this.headers);
    }

    getFilteredItems(params: PoLookupFilteredItemsParams): Observable<ITipoEvento> {
        const header = { params: { page: params.page.toString(), pageSize: params.pageSize.toString() } };

        if (params.filter && params.filter.length > 0) {
            header.params['code'] = params.filter;
        }

        return this.http.get<ITipoEvento>(`${this.apiBaseUrl}`, header);
    }

    getObjectByValue(id: string): Observable<ITipoEvento> {
        return this.http.get<ITipoEvento>(`${this.apiBaseUrl}/${id}`);
    }

    create(model: ITipoEvento): Observable<ITipoEvento> {
        return this.http.post<ITipoEvento>(this.apiBaseUrl, model, this.headers);
    }

    update(model: ITipoEvento): Observable<ITipoEvento> {
        return this.http.put<ITipoEvento>(`${this.apiBaseUrl}/${TipoEvento.getInternalId(model)}`, model, this.headers);
    }

    delete(id: string): Observable<any> {
      
        return this.http.delete(`${this.apiBaseUrl}/${id}`);
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

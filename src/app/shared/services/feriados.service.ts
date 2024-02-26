import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PoDisclaimer, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { Observable } from 'rxjs';

import { TotvsResponse } from 'dts-backoffice-util';
import { Feriados, IFeriados } from '../model/feriados.model';

@Injectable()
export class FeriadosService {
    private headers = { headers: { 'X-PO-Screen-Lock': 'true' } };

    // private apiBaseUrl = '/dts/datasul-rest/resources/prg/fin/v1/evento';
    private apiBaseUrl = 'http://10.171.119.19:3000/feriados';
    private apiUploadUrl = `${this.apiBaseUrl}/addFile`;

    private expandables = [''];

    constructor(private http: HttpClient) { }

    getApiBaseUrl(): string {
        return this.apiBaseUrl;
    }

    getApiUploadUrl(): string {
        return this.apiUploadUrl;
    }

    query(filters: PoDisclaimer[], expandables: string[], page = 1, pageSize = 20): Observable<TotvsResponse<IFeriados>> {
        const url = this.getUrl(this.apiBaseUrl, filters, expandables, page, pageSize);

        return this.http.get<TotvsResponse<IFeriados>>(url, this.headers);
    }

    getById(id: string): Observable<IFeriados> {

        return this.http.get<IFeriados>(`${this.apiBaseUrl}/${id}`, this.headers);
    }
    getHoliday(ano: number): Observable<any> {
        return this.http.get<any>(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
    }

    getFilteredItems(params: PoLookupFilteredItemsParams): Observable<IFeriados> {
        const header = { params: { page: params.page.toString(), pageSize: params.pageSize.toString() } };

        if (params.filter && params.filter.length > 0) {
            header.params['code'] = params.filter;
        }

        return this.http.get<IFeriados>(`${this.apiBaseUrl}`, header);
    }

    getObjectByValue(id: string): Observable<IFeriados> {
        return this.http.get<IFeriados>(`${this.apiBaseUrl}/${id}`);
    }

    create(model: IFeriados): Observable<IFeriados> {
        return this.http.post<IFeriados>(this.apiBaseUrl, model, this.headers);
    }

    createFeriadosNacionais(model: Array<IFeriados>): Observable<IFeriados> {
        const url = 'http://10.171.119.19:3000/feriadosNacionais';
        return this.http.post<IFeriados>(url, model, this.headers);
    }

    update(model: IFeriados): Observable<IFeriados> {
        return this.http.put<IFeriados>(`${this.apiBaseUrl}/${Feriados.getInternalId(model)}`, model, this.headers);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiBaseUrl}/${id}`);
    }

    block(id: string): Observable<Object> {
        return this.http.post(`${this.apiBaseUrl}/${id}/block`, null, this.headers);
    }

    duplic(model: IFeriados): Observable<Object> {
        return this.http.post(`${this.apiBaseUrl}/${Feriados.getInternalId(model)}/duplic`, model, this.headers);
    }

    // changeStatus(id: string, status: number): Observable<Object> {
    //     const model = {};
    //     model['status'] = status;

    //     return this.http.post(`${this.apiBaseUrl}/${id}/changeStatus`, model, this.headers);
    // }

    // getTotalByStatus(): Observable<Object> {
    //     return this.http.get('/evento/totBySatus', this.headers);
    // }

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

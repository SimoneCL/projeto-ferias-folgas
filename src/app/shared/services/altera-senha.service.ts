import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PoDisclaimer, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { Observable } from 'rxjs';

import { TotvsResponse } from 'dts-backoffice-util';
import { Login, ILogin } from '../model/login.model';

@Injectable()
export class AlteraSenhaService {
    private headers = { headers: { 'X-PO-Screen-Lock': 'true' } };

    private apiBaseUrl = 'http://localhost:3000/alteraSenha';
    private apiUploadUrl = `${this.apiBaseUrl}/addFile`;

    private expandables = [''];

    constructor(private http: HttpClient) { }

    getApiBaseUrl(): string {
        return this.apiBaseUrl;
    }

    getApiUploadUrl(): string {
        return this.apiUploadUrl;
    }

    query(filters: PoDisclaimer[], expandables: string[], page = 1, pageSize = 20): Observable<TotvsResponse<ILogin>> {
        const url = this.getUrl(this.apiBaseUrl, filters, expandables, page, pageSize);

        return this.http.get<TotvsResponse<ILogin>>(url, this.headers);
    }

    getById(id: string): Observable<ILogin> {
        return this.http.get<ILogin>(`${this.apiBaseUrl}/${id}`, this.headers);
    }

    getByUser(userEmail: string, senha: string): Observable<ILogin> {
        return this.http.get<ILogin>(`${this.apiBaseUrl}/${userEmail}/${senha}`, this.headers);
    }

    getMetadata(type = '', id = ''): Observable<any> {
        let url = `${this.apiBaseUrl}/metadata`;
        if (id) { url = `${url}/${id}`; }
        if (type) { url = `${url}/${type}`; }
        return this.http.get<TotvsResponse<ILogin>>(url, this.headers);
    }

    getFilteredItems(params: PoLookupFilteredItemsParams): Observable<ILogin> {
        const header = { params: { page: params.page.toString(), pageSize: params.pageSize.toString() } };

        if (params.filter && params.filter.length > 0) {
            header.params['code'] = params.filter;
        }

        return this.http.get<ILogin>(`${this.apiBaseUrl}`, header);
    }

    getObjectByValue(id: string): Observable<ILogin> {
        return this.http.get<ILogin>(`${this.apiBaseUrl}/${id}`);
    }

    create(model: ILogin): Observable<ILogin> {
        return this.http.post<ILogin>(this.apiBaseUrl, model, this.headers);
    }

    update(model: ILogin): Observable<ILogin> {
        return this.http.put<ILogin>(`${this.apiBaseUrl}/${Login.getInternalId(model)}`, model, this.headers);
    }

    delete(model: ILogin): Observable<Object> {
        return this.http.delete(`${this.apiBaseUrl}/${model}`, this.headers);
    }

    block(id: string): Observable<Object> {
        return this.http.post(`${this.apiBaseUrl}/${id}/block`, null, this.headers);
    }

    duplic(model: ILogin): Observable<Object> {
        return this.http.post(`${this.apiBaseUrl}/${Login.getInternalId(model)}/duplic`, model, this.headers);
    }

    getFile(id: string): Observable<Object> {
        const url = `/evento/${id}/file`;
        return this.http.get(url, this.headers);
    }

    getQrCode(text: string): Observable<Blob> {
        const url = `/qrcode/download?text=${text}`;
        return this.http.get(url, { responseType: 'blob' });
    }

    changeStatus(id: string, status: number): Observable<Object> {
        const model = {};
        model['status'] = status;

        return this.http.post(`${this.apiBaseUrl}/${id}/changeStatus`, model, this.headers);
    }

    getTotalByStatus(): Observable<Object> {
        return this.http.get('/evento/totBySatus', this.headers);
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


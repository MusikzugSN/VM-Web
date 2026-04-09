import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay, switchMap } from 'rxjs';

export interface LoginConfigDto {
  oAuthAutoCreateUsers: boolean;
  oAuthDefaultGroup: number | null;
  oAuthDefaultRole: number | null;
  oAuthAllowPasswordLogin: boolean;
  disablePasswordLogin: boolean;
  navigationBarText: string | null;
  useCustomImprint: boolean;
  customImpressumLink: string | null;
}

@Injectable({ providedIn: 'root' })
export class LoginConfigService {
  readonly #http = inject(HttpClient);
  readonly baseUrl = 'config/login';

  #reloadSettings = new BehaviorSubject<boolean>(false);

  settings$: Observable<LoginConfigDto> = this.#reloadSettings.pipe(
    switchMap((_x) => this.#http.get<LoginConfigDto>(this.baseUrl)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  save$(dto: Partial<LoginConfigDto>): Observable<void> {
    return this.#http.post<void>(this.baseUrl, dto);
  }

  reloadSettings() {
    this.#reloadSettings.next(true);
  }
}

import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  Observable,
  shareReplay,
} from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { ConfigService, OAuthProvider } from './config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {PermissionType} from './permission.service';

const storage = window.sessionStorage;
const accessTokenKey = 'accessToken';
const providerKeyStorageKey = 'providerName';

interface LoginResponse {
  token: string;
}

export type LoginResult = { success: true } | { success: false; message: string };
export interface PermissionTeaserWithGroupId {
  groupId: number;
  permissionType: PermissionType;
  permissionValue: number;
}

export interface MeInformation {
  id: string;
  username: string;
  provider?: string;
  oAuthSubject?: string;
  isAdmin?: boolean;
  permissions?: PermissionTeaserWithGroupId[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #httpClient = inject(HttpClient);
  readonly #oAuthService = inject(OAuthService);
  readonly #config = inject(ConfigService);
  readonly #router = inject(Router);

  readonly redirectUrl = window.location.origin + '/auth/callback';
  readonly scope = 'openid profile email';

  #currentProvider$: BehaviorSubject<string | null> =
    this.#getValueFromStorage$(providerKeyStorageKey);

  #accessToken$: BehaviorSubject<string | null> = this.#getValueFromStorage$(accessTokenKey, true);
  accessToken$ = this.#accessToken$
    .asObservable()
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  #decodedToken$: Observable<JwtPayload | null> = this.#getDecodedToken$().pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  #myInformation$: BehaviorSubject<MeInformation | null> =
    new BehaviorSubject<MeInformation | null>(null);
  myInformation$ = this.#myInformation$
    .asObservable()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  constructor() {
    this.#oAuthService.events
      .pipe(
        map((e) => e.type),
        filter((e) => e === 'token_refreshed'),
        takeUntilDestroyed(),
      )
      .subscribe((_x) => {
        const token = this.#oAuthService.getAccessToken();
        this.#storeAccessToken(token, this.#currentProvider$.getValue() ?? 'local');
      });
  }

  async #configureOAuthProvider(provider?: OAuthProvider): Promise<boolean> {
    if (provider === undefined) {
      const providerKey = this.#currentProvider$.getValue();
      if (providerKey === null) {
        return false;
      }

      const providers = await firstValueFrom(this.#config.oauthProviders$);
      provider = providers.find((p) => p.providerKey === providerKey);

      if (provider !== undefined) {
        await this.#configureOAuthProvider(provider);
        return true;
      }
      return false;
    }

    this.#oAuthService.configure({
      issuer: provider.issuerUrl,
      clientId: provider.clientId,
      redirectUri: this.redirectUrl,
      scope: this.scope,
      responseType: 'code',
    });

    storage.setItem(providerKeyStorageKey, String(provider.providerKey));
    this.#currentProvider$.next(String(provider.providerKey));
    return true;
  }

  async handleOAuthLoginCallback(): Promise<void> {
    const successful = await this.#configureOAuthProvider();

    if (!successful) {
      await this.#router.navigate(['/auth/login']);
      return;
    }

    await this.#oAuthService.loadDiscoveryDocumentAndTryLogin();

    if (this.#oAuthService.hasValidAccessToken()) {
      this.#oAuthService.setupAutomaticSilentRefresh();
      const token = this.#oAuthService.getAccessToken();
      this.#storeAccessToken(token, this.#currentProvider$.getValue() ?? 'local');
      await this.#loadMyInformation();
    }
  }

  async initOAuthLogin(provider: OAuthProvider): Promise<void> {
    await this.#configureOAuthProvider(provider);

    await this.#oAuthService.loadDiscoveryDocument();
    this.#oAuthService.initLoginFlow();
  }

  async login(username: string, password: string): Promise<LoginResult> {
    const request: Observable<LoginResponse> = this.#httpClient.post<LoginResponse>('auth/login', {
      username: username,
      password: password,
    });
    const response = await firstValueFrom(request);
    if (response.token !== null) {
      this.#storeAccessToken(response.token, 'local');
      if (username !== 'install') {
        await this.#loadMyInformation();
      } else {
        this.#myInformation$.next({
          id: '-1',
          username: username,
          isAdmin: true,
        } as MeInformation);
      }

      return { success: true };
    }

    return { success: false, message: 'Placeholder' };
  }

  logout(): void {
    storage.clear();
    //storage.removeItem(this.#currentProvider$.getValue() + '_' + accessTokenKey);
    this.#accessToken$.next(null);
  }

  isLoggedIn$(): Observable<boolean> {
    return this.#accessToken$.pipe(
      map((token) => !!token),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  isLoginExpired$(): Observable<boolean> {
    return this.#decodedToken$.pipe(
      map((token) => {
        if (token === null) {
          //Aktuelle Definition (ggf. ändern): als nicht angemelete Person ist die Anmeldung ausgelaufen
          return true;
        }

        // exp is in seconds → convert Date.now() to seconds
        //Todo Florian: Performance?
        const now = Math.floor(Date.now() / 1000);
        return (token.exp ?? 0) < now;
      }),
    );
  }

  async #loadMyInformation(): Promise<void> {
    const me = await firstValueFrom(this.#httpClient.get<MeInformation>('auth/me'));
    this.#myInformation$.next(me);
  }

  #getDecodedToken$(): Observable<JwtPayload | null> {
    return this.#accessToken$.pipe(
      map((token) => {
        if (token === null) {
          return null;
        }

        return jwtDecode(token);
      }),
    );
  }

  #storeAccessToken(token: string, providerId: string): void {
    storage.setItem(providerId + '_' + accessTokenKey, token);
    this.#accessToken$.next(token);

    storage.setItem(providerKeyStorageKey, providerId);
    this.#currentProvider$.next(providerId);
  }

  #getValueFromStorage$(key: string, addProviderAsPrefix = false): BehaviorSubject<string | null> {
    if (addProviderAsPrefix) key = this.#currentProvider$.getValue() + '_' + key;

    const value = storage.getItem(key);
    return new BehaviorSubject(value);
  }
}

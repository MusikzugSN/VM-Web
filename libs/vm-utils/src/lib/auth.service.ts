import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  firstValueFrom,
  map,
  Observable,
  shareReplay,
} from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import {OAuthService} from 'angular-oauth2-oidc';

const storage = window.sessionStorage;
const accessTokenKey = 'accessToken';
const providerKeyStorageKey = 'providerName';

interface LoginResponse {
  token: string;
}

export type LoginResult = { success: true } | { success: false; message: string };

export interface OAuthProvider {
  providerKey: string;
  displayName: string;
  issuerUrl: string;
  clientId: string;
}

export interface MeInformation {
  id: string;
  username: string;
  provider?: string;
  oAuthSubject?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #httpClient = inject(HttpClient);
  readonly #oAuthService = inject(OAuthService);

  readonly redirectUrl = window.location.origin + '/auth/callback';
  readonly scope = 'openid profile email';

  oauthProviders$ = this.#httpClient.get<OAuthProvider[]>('auth/oAuthProvider')
    .pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  #currentProvider$: BehaviorSubject<string | null> = this.#getValueFromStorage$(providerKeyStorageKey);

  #accessToken$: BehaviorSubject<string | null> = this.#getValueFromStorage$(accessTokenKey, true);
  accessToken$ = this.#accessToken$
    .asObservable()
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  #decodedToken$: Observable<JwtPayload | null> = this.#getDecodedToken$().pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  #myInformation$: BehaviorSubject<MeInformation | null> = new BehaviorSubject<MeInformation | null>(null);
  myInformation$ = this.#myInformation$.asObservable().pipe(shareReplay({ bufferSize: 1, refCount: true }));

  async #configureOAuthProvider(provider?: OAuthProvider): Promise<void> {
    if (provider === undefined) {
      const providerKey = this.#currentProvider$.getValue();
      if (providerKey === null) {
        return;
      }

      const providers = await firstValueFrom(this.oauthProviders$);
      provider = providers.find((p) => p.providerKey === providerKey);

      if (provider !== undefined) {
        await this.#configureOAuthProvider(provider);
      } else {
        console.log('Could not find provider with name ' + providerKey, providers);
      }
      return;
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
  }

  async handleOAuthLoginCallback(): Promise<void> {
    await this.#configureOAuthProvider();
    await this.#oAuthService.loadDiscoveryDocumentAndTryLogin();

    if (this.#oAuthService.hasValidAccessToken()) {
      const token = this.#oAuthService.getAccessToken();
      this.#storeAccessToken(token, this.#currentProvider$.getValue()!);
      await this.#loadMyInformation();
    }
  }

  async initOAuthLogin(provider: OAuthProvider) {
    await this.#configureOAuthProvider(provider);

    await this.#oAuthService.loadDiscoveryDocument();
    this.#oAuthService.initLoginFlow()
  }

  async login(username: string, password: string): Promise<LoginResult> {
    const request: Observable<LoginResponse> = this.#httpClient.post<LoginResponse>('auth/login', {
      username: username,
      password: password,
    });
    const response = await firstValueFrom(request);
    if (response.token !== null) {
      this.#storeAccessToken(response.token, 'local');
      await this.#loadMyInformation();
      return { success: true };
    }

    return { success: false, message: 'Placeholder' };
  }

  logout(): void {
    storage.clear();
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
    if (addProviderAsPrefix)
      key = this.#currentProvider$.getValue() + '_' + key;

    const value = storage.getItem(key);
    return new BehaviorSubject(value);
  }
}

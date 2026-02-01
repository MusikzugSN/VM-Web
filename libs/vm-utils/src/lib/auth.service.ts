import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, firstValueFrom, map, Observable, shareReplay} from 'rxjs';
import {jwtDecode, JwtPayload} from 'jwt-decode';
import {HttpClient} from '@angular/common/http';

const storage = window.sessionStorage;
const accessTokenKey = 'accessToken';

interface LoginResponse {
  token: string;
}

export type LoginResult = { success: true} | { success: false; message: string };

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly #httpClient = inject(HttpClient);

  #accessToken$: BehaviorSubject<string | null> = this.#getValueFromStorage$(accessTokenKey);
  accessToken$ = this.#accessToken$.asObservable().pipe(shareReplay({ bufferSize: 1, refCount: false}));

  #decodedToken$: Observable<JwtPayload | null> = this.#getDecodedToken$()
    .pipe(distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: false}));

  async login(username: string, password: string): Promise<LoginResult> {
    const request: Observable<LoginResponse> = this.#httpClient.post<LoginResponse>("auth/login", {
      username: username,
      password: password,
    });
    const response = await firstValueFrom(request);
    if (response.token !== null) {
      storage.setItem(accessTokenKey, response.token);
      this.#accessToken$.next(response.token);
      return { success: true };
    }

    return { success: false, message: 'Placeholder' };
  }

  logout(): void {
    storage.removeItem(accessTokenKey);
    this.#accessToken$.next(null);
  }

  isLoggedIn$(): Observable<boolean> {
    return this.#accessToken$.pipe(map(token => !!token), distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true}));
  }

  isLoginExpired$(): Observable<boolean> {
    return this.#decodedToken$.pipe(map(token => {
      if (token === null) {
        //Aktuelle Definition (ggf. ändern): als nicht angemelete Person ist die Anmeldung ausgelaufen
        return true;
      }

      // exp is in seconds → convert Date.now() to seconds
      //Todo Florian: Performance?
      const now = Math.floor(Date.now() / 1000);
      return (token.exp ?? 0) < now;
    }))
  }

  #getDecodedToken$(): Observable<JwtPayload | null> {
    return this.#accessToken$
      .pipe(map(token => {
        if (token === null) {
          return null;
        }

        return jwtDecode(token);
      }))
  }

  #getValueFromStorage$(key: string): BehaviorSubject<string | null> {
    const value = storage.getItem(key);
    return new BehaviorSubject(value);
  }
}

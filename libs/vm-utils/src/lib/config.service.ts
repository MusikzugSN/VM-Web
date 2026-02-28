import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, shareReplay } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface AppConfig {
  backedApiUrl: string;
  images: ImagesConfig;
}

export interface ImagesConfig {
  logo: string;
  loginBanner: string;
}

export interface OAuthProvider {
  providerKey: string;
  displayName: string;
  issuerUrl: string;
  clientId: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  readonly #httpClient = inject(HttpClient);

  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  config$ = this.configSubject.asObservable();

  oauthProviders$ = this.#httpClient
    .get<OAuthProvider[]>('auth/oAuthProvider')
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  constructor() {
    this.#load()
      .then((_r) => console.log('Config loaded!'))
      .catch(console.error);
  }

  async #load(): Promise<void> {
    return fetch('static/config.json')
      .then((response) => response.json())
      .then((config: AppConfig) => {
        this.configSubject.next(config);
      })
      .catch((err) => {
        console.error('Failed to load config.json', err);
        throw err;
      });
  }
}

import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface AppConfig {
  backedApiUrl: string;
}

@Injectable({providedIn: 'root'})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  config$ = this.configSubject.asObservable();

  constructor() {
    this.#load()
      .then(_r => console.log('Config loaded!'))
      .catch(console.error);
  }

  async #load(): Promise<void> {
    return fetch('static/config.json').then(response => response.json()).then((config: AppConfig) => {
      this.configSubject.next(config);
    }).catch(err => {
      console.error('Failed to load config.json', err);
      throw err;
    });
  }
}

import { Component, inject } from '@angular/core';
import {
  convertToDisplayMinutes, convertToDurationValue,
  convertToPatch,
  Dictionary,
  nameOf
} from '@vm-utils';
import {VmcInputField, VmFormField, VmValidFormTypes} from '@vm-components';
import {Score, ScoreService} from '@vm-utils/services';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {firstValueFrom, Observable} from 'rxjs';
import {DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase} from '@vm-utils/dialogs';
import { SnackbarService } from '@vm-utils/snackbar';

// Titel & Link: Buchstaben, Zahlen, Leerzeichen und gängige Sonderzeichen
const TITLE_PATTERN = /^[a-zA-ZäöüÄÖÜß0-9\s\-.,!?()&'"/+]*$/;
// Komponist: nur Buchstaben, Leerzeichen, Bindestrich, Punkt
const COMPOSER_PATTERN = /^[a-zA-ZäöüÄÖÜß\s\-.]*$/;
// Link: alle URL-üblichen Zeichen
const LINK_PATTERN = /^[a-zA-Z0-9äöüÄÖÜß\s\-._~:/?#[\]@!$&'()*+,;=%]*$/;

@Component({
  selector: 'app-score-info-step',
  imports: [VmcInputField, FormsModule, MatInput, MatLabel, MatFormField],
  templateUrl: './app-repository-data-dialog.component.html',
  styleUrl: './app-repository-data-dialog.component.scss',
})
export class AppRepositoryDataDialog extends DialogBase<boolean> {
  readonly #data = inject<Score | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #scoreService = inject(ScoreService);
  readonly #snackbar = inject(SnackbarService);

  #changedValues: Dictionary<string> = {};

  durationDisplay = '';

  titleField: VmFormField = {
    label: 'Titel',
    type: 'text',
    key: nameOf<Score>('title'),
    value: this.#data?.title ?? '',
    placeholder: 'z. B. Pirates of the Caribbean',
    required: true
  };

  composerField: VmFormField = {
    label: 'Komponist',
    type: 'text',
    key: nameOf<Score>('composer'),
    value: this.#data?.composer ?? '',
    placeholder: 'z. B. Hans Zimmer',
    required: true
  };

  linkField: VmFormField = {
    label: 'Link',
    type: 'url',
    key: nameOf<Score>('link'),
    value: this.#data?.link ?? '',
    placeholder: 'z. B. https://youtube.com/',
  };

  constructor() {
    super();

    // Im Edit-Modus bestehende Werte vorbelegen
    if (this.#data) {
      this.#changedValues['title'] = this.#data.title ?? '';
      this.#changedValues['composer'] = this.#data.composer ?? '';
      this.#changedValues['link'] = this.#data.link ?? '';
    }

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      // Fallback: Feldwerte aus FormField-Definitionen wenn User sie nicht geändert hat
      if (!this.#changedValues['title'] && this.titleField.value) {
        this.#changedValues['title'] = this.titleField.value as string;
      }
      if (!this.#changedValues['composer'] && this.composerField.value) {
        this.#changedValues['composer'] = this.composerField.value as string;
      }
      if (!this.#changedValues['link'] && this.linkField.value) {
        this.#changedValues['link'] = this.linkField.value as string;
      }

      if (x === 'create' || x === 'save') {
        const title = this.#changedValues['title'] ?? '';
        const composer = this.#changedValues['composer'] ?? '';
        const link = this.#changedValues['link'] ?? '';

        if (!TITLE_PATTERN.test(title)) {
          this.#snackbar.raiseError('Titel darf nur Buchstaben, Zahlen und gängige Sonderzeichen enthalten.');
          return;
        }
        if (!COMPOSER_PATTERN.test(composer)) {
          this.#snackbar.raiseError('Komponist darf nur Buchstaben enthalten.');
          return;
        }
        if (link && !LINK_PATTERN.test(link)) {
          this.#snackbar.raiseError('Link enthält ungültige Zeichen.');
          return;
        }
      }

      const rawPatch = convertToPatch<Score, VmValidFormTypes>(this.#changedValues);

      // Leere Strings und null entfernen, duration als number konvertieren
      const patch: Partial<Score> = Object.fromEntries(
        Object.entries(rawPatch)
          .filter(([k, v]) => v !== '' && v !== null && !(k === 'duration' && !Number(v)))
          .map(([k, v]) => k === 'duration' ? [k, Number(v)] : [k, v])
      ) as Partial<Score>;

      if (x === 'save') {
        patch.scoreId = this.#data?.scoreId ?? -1;
        await firstValueFrom(this.#scoreService.change$(patch, patch.scoreId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        try {
          await firstValueFrom(this.#scoreService.create$(patch));
        } catch (err: unknown) {
          const httpErr = err as { status?: number };
          // 303 = Backend hat erstellt, antwortet mit Redirect
          if (httpErr?.status !== 303) {
            throw err;
          }
        }
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });

    if (this.#data?.duration) {
      this.durationDisplay = convertToDisplayMinutes(this.#data?.duration ?? 0);
    }
  }

  onDurationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/[^0-9]/g, '');

    if (raw.length > 4) {
      raw = raw.substring(0, 4);
    }

    if (raw.length >= 2) {
      this.durationDisplay = raw.substring(0, 2) + ':' + raw.substring(2);
    } else {
      this.durationDisplay = raw;
    }

    input.value = this.durationDisplay;
    this.storeChangedValue(convertToDurationValue(this.durationDisplay), 'duration');
  }

  storeChangedValue(value: string | number, key: string): void {
    const strValue = value.toString();

    // Zeichen filtern je nach Feld
    if (key === 'title' && !TITLE_PATTERN.test(strValue) && strValue !== '') {
      return; // ungültige Zeichen ignorieren
    }
    if (key === 'composer' && !COMPOSER_PATTERN.test(strValue) && strValue !== '') {
      return;
    }
    if (key === 'link' && !LINK_PATTERN.test(strValue) && strValue !== '') {
      return;
    }

    this.#changedValues[key] = strValue;
  }
}

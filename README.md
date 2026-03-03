![Lizenz: GPL v3](https://img.shields.io/badge/Lizenz-GPLv3-blue.svg)
![Angular](https://img.shields.io/badge/Angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-B7178C.svg?style=for-the-badge&logo=reactivex&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699.svg?style=for-the-badge&logo=sass&logoColor=white)

NOTE: This software is currently not production ready!

# VM-Web

Dieses Repository enthält das Web-Frontend der digitalen Verwaltungsplattform für deinen Musikverein. Die Anwendung basiert auf Angular und bietet allen Musikern sowie der Vereinsverwaltung einen modernen, intuitiven Zugang zu allen relevanten Funktionen.

## 1. Lizenz

Dieses Projekt steht unter der GNU General Public License v3.0 (GPLv3).
Der vollständige Lizenztext befindet sich in der Datei `LICENSE` in diesem Repository.
Mit Beiträgen zu diesem Projekt erklärst du dich einverstanden, dass deine Änderungen ebenfalls unter der GPLv3 veröffentlicht werden.

### Was bedeutet GPLv3 für dich?

- Du darfst die Software frei nutzen, verändern und weitergeben.
- Wenn du veränderte Versionen veröffentlichst, müssen diese ebenfalls unter GPLv3 stehen.
- Die Software wird ohne Garantie bereitgestellt (siehe Lizenztext).

## 2. Funktionen

- **Benutzerverwaltung**: Registrierung, Anmeldung und Profilverwaltung für Musiker und Vereinsadministratoren.
- **Repertoireverwaltung**: Verwaltung von Musikstücken, Noten und Übungsmaterialien.

## 3. Installation und Einrichtung

bald

## 4. Architektur

bald

### Tech-Stack

### Projektstruktur (Web)

- 'libs/': Gemeinsame Bibliotheken und Module.
- 'libs/vm-components/': Wiederverwendbare UI-Komponenten für die Anwendung.
- 'libs/vm-parts/': Teile der Anwendung, die spezifische Funktionalitäten kapseln.
- 'libs/vm-utils/': Hilfsfunktionen und Dienstprogramme.

- 'scr/app/': Hauptanwendungscode. (weitere Ordner werden nach den URL-Pfaden strukturiert)

## 5. Mitwirken

Beiträge zu diesem Projekt sind herzlich willkommen! Wenn du Fehler findest, neue Funktionen vorschlagen möchtest oder Code beisteuern willst, folge bitte diesen Schritten:

1. Forke das Repository.
2. Erstelle einen neuen Branch für deine Änderungen.
3. Führe deine Änderungen durch und teste sie gründlich.
4. Erstelle einen Pull Request mit einer Beschreibung deiner Änderungen.
5. Warte auf Feedback und mögliche Anpassungen.
6. Nach der Genehmigung wird dein Beitrag in das Hauptrepository integriert.

### Richtlinien für Beiträge

1. Halte dich an den bestehenden Code-Stil und die Architektur.
2. Schreibe aussagekräftige Commit-Nachrichten.
3. Füge Tests für neue Funktionen oder Bugfixes hinzu.
4. Respektiere die Lizenzbedingungen (GPLv3).
5. Sei respektvoll und konstruktiv im Umgang mit anderen Mitwirkenden.

#### Coderichtlinien

- Verwende TypeScript und Angular Best Practices.
- Nutze RxJS für asynchrone Programmierung.
- Schreibe modularen und wiederverwendbaren Code.
- Dokumentiere deinen Code ausreichend.

Dateinamen sollten aussagekräftig und konsistent sein (<was-die-datei-macht>.<service | guard | interceptor | ...>.<ts | scss | html>).
Eine Ausnahme stellen Angular-Komponenten dar – bei diesen entfällt der Mittelteil (z. B. app.component.ts).

Für alle Felder sollte ein Datentyp angegeben werden. Der Datentyp any sollte nur in Ausnahmefällen verwendet werden; diese Verwendung muss mit einem Kommentar begründet werden.

In Komponenten werden in der Regel InputSignals oder Signals verwendet.
In Services und anderen Klassen werden Observables genutzt.
Falls ein BehaviorSubject benötigt wird, wird dieses nach außen als Observable exponiert.

Feldernamen sollten im camelCase-Stil geschrieben werden (z. B. mitgliedsBeitrag).
Private Felder werden mit einem Hashtag am Anfang gekennzeichnet (z. B. #mitgliedsBeitrag).
Observable- und BehaviorSubject-Felder werden mit einem Dollarzeichen am Ende gekennzeichnet (z. B. mitgliedsBeitrag$).

#### Gitworkflow

Das Repository verwendet den Gitflow-Workflow.
'main' enthält stets den stabilen, produktionsreifen Code.
'develop' dient als Integrationszweig für neue Features und Bugfixes.

Branch-Konventionen:
Feature-Branches (von develop): feature/<feature-name>
Release-Branches (von develop): release/<version>
Hotfix-Branches (von main): hotfix/<bug-name>

#### Sprache

- Code und Bezeichner sind in Englisch.
- Kommentare im Code sind auf Deutsch.
- Texte der Benutzeroberfläche sind auf Deutsch.
- Die README-Datei ist auf Deutsch.
- Issues und Diskussionen können auf Deutsch oder Englisch geführt werden.

## Contributors

- [Vexance] Florian A. (Haubtentwickler)
- [heri410] Hendrik M. (Projektleitung)

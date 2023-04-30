# Ivan Havran - report č. 7

## Názov aplikácie
### AircraftManager

## Týždeň, za ktorý sa report robí
### 23/04/2023 - 30/04/2023

## Čo bolo v pláne

### Backend
- Pokračovať v práci na CRUD
- Začať skúšať (aspoň POC) ako budú fungovať role
- Opraviť CRUD, ktoré nefungujú správne

### Frontend
- Vylepšiť dizajn aplikácie
- Preusporiadať logickejšie prechod stránkou

## Čo som stihol urobiť

### Backend
- Pridal a upravil som niektoré parametre pre modely - u niektorých som našiel lepšie využitie a naopak napr.
  isMember som zmenil na Number, aby som zistil v koľkých Crews sa nachádza užívateľ [commit](https://github.com/iwanovski/twa-project/commit/8805c9247ae1ac89cc65dd5043f1c312468a4efe)
- Doimplementoval som väčšinu CRUD operácií, ktoré bolo treba na otestovanie [commit](https://github.com/iwanovski/twa-project/commit/a06f6c20e090e0f53710593a98890210c3987183)


### Frontend
- Najviac času som tento týždeň venoval FE časti aplikácie
- Upravil som NewResource forms, aby v nich bola šípka naspäť [commit](https://github.com/iwanovski/twa-project-fe/commit/cb770c643a059de260187dfb48471f1f1e01bb05)
- Rovnaku šípku som pridal do EditForms, okrem toho som tam aj upravil niektoré input fieldy
- Za špecifickú pozornosť stojí parameter memberIds v `aircraftCrew`, kde sa mi páči intuitívnosť riešenia [commit](https://github.com/iwanovski/twa-project-fe/commit/964599cd3e1b624fd894bf9b5deb4928eb162d3b)
- Upravil som stránky: Public welcome page, Login page, Home page - aby mali trošku modernejší dizajn, viz. screenshoty
-[Home](https://github.com/iwanovski/twa-project/blob/main/reports/img/Home.png)
-[Public](https://github.com/iwanovski/twa-project/blob/main/reports/img/Public.png)
-[Login](https://github.com/iwanovski/twa-project/blob/main/reports/img/Login.png)
-[Modal](https://github.com/iwanovski/twa-project/blob/main/reports/img/Modal.png)
- Pridal som čisto nový modal component, ktorý otvorí detail resourcu - umožní mi ľahšie separovať práva podľa toho,
či užívateľ bude môcť len čítať alebo upravovať [commit](https://github.com/iwanovski/twa-project-fe/commit/89ce1a6021252523aa72e59bc6c31f7f4daf2d3f)
- Začal som experimentovať aj s komponentou k roliam - mám otestovanú funkcionalitu a posledný týždeň ju sfinalizujem

## Čo som nestihol urobiť (a prečo)
Tento týždeň som veľmi spokojný s pokrokom a nevidím nič, čo by som vynechal z toho.

## Plán na budúci týždeň

### Backend
- Dokončiť CRUD, ktoré nie sú 100% (najmä kvôli právam)
- Role a ich kontrola


### Frontend
- Zapracovať feedback z bety
- Dokončiť role based access control
- Záverečné testovanie


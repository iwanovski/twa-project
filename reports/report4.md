# Ivan Havran - report č. 4

## Názov aplikácie
### AircraftManager

## Týždeň, za ktorý sa report robí
### 02/04/2023 - 09/04/2023

## Čo bolo v pláne

### Backend
- Deployment aplikácie
- Priebežne dokončovať operácie (po skúsenostiach nedám sľub na všetky CRUD, lebo niektoré nemajú vysokú prioritu)

### Frontend
- Prerobiť existujúce a novo vytvorené (malo by kopírovať backend) do "modernejšieho štýlu"
- Hlavným cieľom bude rovnako deployment a doplnenie viacerých rout

## Čo som stihol urobiť

### Backend
- Naimplentoval som funkcionalitu ohľadom autentifikácie [commit](https://github.com/iwanovski/twa-project/commit/70b69493e1942655cc6d44a8d797fbb7855d3f61)
- Otestoval som to cez postmana

### Frontend
- Doimplentoval som do základného stavu routy ostatných komponent [commit](https://github.com/iwanovski/twa-project-fe/commit/4f5695ef6e9848111083062e83a20c0dbf25cf73)
- Otestoval som POC na editovanie a vytváranie usera (časť funkcionality sa následne presunie aj do iných komponent) [commit](https://github.com/iwanovski/twa-project-fe/commit/423727e1ba3a03c9d4129dd150e5ac887fc8910d)

## Čo som nestihol urobiť (a prečo)
Rozhodol som sa presúnuť deployment na čo najneskôr - nemyslím si, že by bolo správne deploynúť aplikáciu bez funkčného login systému.
CRUD je pre mňa zatiaľ taktiež v prijateľnom stave.

## Plán na budúci týždeň

### Backend
- Dokončiť login
- Uvidíme, ako na tom bude opäť deployment


### Frontend
- Dokončiť login na FE, kde je treba naimplementovať oveľa viac
- Pridať edit a create funkcionalitu aj na iné routy


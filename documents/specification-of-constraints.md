# Rozhodnutia o systéme

## Obmedzenia na systém

V tejto časti by som rád špeficikoval obmedzenia kladené na systém, ktoré neboli špecificky spomenuté.

### Obmedzenia

- v jeden konkrétny dátum môže existovať len jeden let s určitým kódovým označením

- lietadlo môže v daný deň mať maximálne jeden let

- lietadlo môže byť v jedeň deň len jednu naplánovanú údržbu, pri čom v daní deň nemôže mať naplánovaný let

- jedna letová posádka môže v daný deň absolvovať len jeden let

- jeden tím mechanikov môže absolvovať za deň dve naplánované opravy

- užívateľ je člen maximálne jednej posádky

- posádka musí byť spôsobilá letu - musí obsahovať oboch pilotov a aspoň 3 členov mimo nich

- tím mechanikov musí mať aspoň dvoch členov aby mu bolo možné plánovať údržbu

- tím mechanikov nemôže byť vymazaný pokiaľ má naplánovanú údržbu

## Upresnenie špecifikácie

Táto časť sa venuje došpecifikovaniu niektorých pridanách vecí.

#### 28/03/2023
- User má pridaný navyše parameter `isMember: bool`, ktorý charakterizuje, že či je už členom nejakej letovej posádky

#### 15/04/2023
- Rozhodol som sa prerobiť DELETE a UPDATE commandy na `back-ende` aby brali ako vstup `id` - zistil som, že sa to
oveľa jednoduchšie mapuje na štruktúru `front-endu` a zároveň to umožňuje nepovolovať duplicity, čo bolo cieľom
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

#### 24/04/2023

Táto časť sa venuje špecifikácii, kedy môžu byť objekty zmazané/upravené. Nakoľko je v aplikácii viacnásobná závislosť, niektoré
podmienky je nutné kontrolovať pred každým zmazaním/upravením.

Nakoľko sa systém orientuje hlavne na plánovanie letov a opráv, tieto dve schémy by sa sa nikdy nemali dostať do nekonzistentného stavu.
V rámci jednoduchosti práce s aplikáciou povolíme nekonzistenciu pri iných schémach - pri editácii tohto objektu sa následne nepovolí užívateľovi ho uložiť
do nekonzistentného stavu.

##### Aircraft
- Lietadlo sa smie zmazať vtedy, keď sa nenachádza v žiadnom lete a naplánovanej oprave.

- Lietadlu sa pri editácii nedá zmeniť jeho kód, nakoľko to je jeho unikátny kód, ktorý sa pri registrácii vytvára

##### Airport
- Letisko sa zmazať vtedy, keď sa nenachádza v žiadnom lete a naplánovanej oprave.

- 
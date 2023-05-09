### Meno, priezvisko

Ivan Havran

### Nazov projektu

Aircraft Manager

### Link na repozitár (ak je relevantné, aj branch)

Backend: https://github.com/iwanovski/twa-project, branch `main`

Frontend: https://github.com/iwanovski/twa-project-fe, branch `main`

### Link na verejnú inštanciu projektu

https://aircraft-manager.onrender.com/

### Postup ako rozbehať vývojové prostredie

Ako prvé je potrebné mať nainštalovaný Node.js vo verzii `18.13.0`.

Okrem toho je nutné doplniť premenné prostredia do súboru `.env`, a to tieto:

DATABASE_URI: URL na databázu, ktoré je možné zdarma vytvoriť na stránke [MongaDB](https://www.mongodb.com/).

ACCESS_TOKEN_SECRET a REFRESH_TOKEN_SECRET potrebné pre prihlásenie (unikátne hash hodnoty).

Pred spustením prostredia je ešte potrebné nainštalovať dependencies cez `npm install`

Backend: npm run dev

Frontend: npm start

Je možné využiť aj deploynutú aplikáciu.
Nutné je poznať konto + heslo, tie pridelím len individuálne.

### Aké features sú už implementované, rozpracované, neimplementované vôbec?

Je implementované všetko, čo bolo naplánované podľa špecifikácie projektu.

### S čím ste mali problémy?

Najviac času mi zabralo rozbehnúť plne funkčnú a bezpečnú autentifikáciu.

### Keby ste to robili znovu, čo by ste urobili inak?

Aplikáciu by som vyvíjal viac iteratívne - aby mala viac ako nejaké 2-3 verzie ako to bolo tentokrát. Ušetrilo by to viacej času a
bolo by to ucelenejšie.

Venoval by som menej času detailnému premýšlaniu na BE a všetkými obmedzeniami - množstvo z vecí nad ktorými som strávil čas sa mi
darilo riešiť aj na úrovni frontendu.

Menej by som vymýšlal koleso na niektorých veciach - príkladom je napríklad použitie parametrov ako unikátnych a ich následné odkazovanie v iných objektoch,
či napríklad to, ako som pôvodne navrhoval role (a nakoniec to zmenil na štandardnejší postup).

### Ste hrdý na výsledky svojej práce? Ktorý aspekt projektu je podľa Vás najviac kvalitný?
Na výsledok svojej práce som ale hrdý. Aj napriek tomu, že som si veľmi neveril po stránke frontendu sa mi
aplikácia páči a dokázala by splniť svoj účel.

Mne osobne sa najviac páči aj aká taká orientácia na bezpečnosť v súvislosti s implementáciu role-based systému.
Po menších úpravách by bolo možné systém používať a bol by podľa mňa do veľkej časti bezpečný by-design.

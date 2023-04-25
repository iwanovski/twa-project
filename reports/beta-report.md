### Meno, priezvisko

Ivan Havran

### Nazov projektu

Aircraft Manager

### Link na repozitár (ak je relevantné, aj branch)

Backend: https://github.com/iwanovski/twa-project, branch `prod-version`

Frontend: https://github.com/iwanovski/twa-project-fe, branch `prod-version`

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

Implementované: väčšina CRUD operácií, základný frontend, autentifikácia

Rozpracované: komplikovanejšie use-cases, niektoré formy na editáciu/mazanie

Neimplemntované vôbec: Role-based access control

### Aké sú Vaše plány na ďalšie obdobie? Aký je časový plán?

V prvom rade dokončiť celý backend a namapovať frontend.

Potom prejsť na redizajn stránky.

Pokračovať na rolách.

A už len posledný testing a refactor.

### S čím ste mali problémy?

Najviac času mi zabralo rozbehnúť plne funkčnú a bezpečnú autentifikáciu.
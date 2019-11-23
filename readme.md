# Walidator Dostępności

Walidator dostępności html dostosowany do stron napisanych w angularze

# Start
- pobierz projekt git clone
- w konsoli wpisz npm install
- wpisz npm start

## Script
  - npm start - uruchamianie projektu
  - npm run lint - eslinter(airbnb) + prettier
  - npm run test - uruchamianie testów

### Tech

* Electron - Aplikacje desktopowe w JavaScript
* Nightmare - Pozwala na zdalną pracę na wygenerowanym DOM
* dom-parser - Zarządzanie wirtualnym DOM z poziomu node.js
* color - Porównywanie kontraksu na stronie

### Todos

 * Cytaty powinny się znajdować w blockquote lub q+ cite jako źródło cytatu ?
 * Ikony powinny mieć aria-label lub title
 * Skip linki
 * Walidacja aria (Sztuczna inteligencja ???)
 * Pokrycie walidatora testami
 * Dodanie tłumaczenia na język angielski
 * Dodanie rozwiązań problemów w tabelkach
 * Napisanie rozwiązań problmów

### Bugs

 * Znalazłem buga w focusie - elementy niewidoczne na stronie, nie mogę złapać focusa przez co ich style były zestawiane z stylami document.body, naprawiłem to ograniczając sprawdzanie focusa na tylko widoczne elementy ale trzeba przemyśleć co zrobić z resztą. BUG#1
 * checkLinksAndButtons - bug wyłapuje z svg znacznik style i twierdzi że to textContent BUG#2

### License

MIT

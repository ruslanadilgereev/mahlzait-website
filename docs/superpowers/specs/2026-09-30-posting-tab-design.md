# Posting-Tab im Leaderboard: Design

Datum: 30.09.2026 · Status: Entwurf zur Freigabe durch Ruslan

## Ziel

Ein Tab „Posting“ auf mahlzait.de/leaderboard, in dem Ruslan von überall (auch am Handy) sieht, ob die
TikTok-Maschine für @mahlzait (Gabi & Mackie) rund läuft, und in dem er eingreifen kann.

Auslöser: Am 29./30.09. kamen keine Entwürfe nach. Das Tageslimit war durch einen Handversand verbraucht,
danach fiel der 7-Uhr-Lauf nach einem nächtlichen Neustart aus. Beides war nur am Laptop zu sehen.

Erfolgskriterien:

1. Der Tab zeigt die Warteschlange mit Bildern und Caption, den Vorrat in Tagen, die verschickten Entwürfe
   mit Status und Fehlergrund, beide Windows-Tasks (letzter Lauf, Ergebnis, nächster Lauf, verpasste Läufe),
   den letzten Nachschub-Bericht und wann der Laptop zuletzt gemeldet hat.
2. Vom Tab aus lässt sich steuern: Versand pausieren und fortsetzen, einen Post vorziehen, einen Post
   rausnehmen und zurückholen, eine Caption ändern, einen Entwurf jetzt senden, Nachschub jetzt starten.
3. Ein Befehl ist spätestens 5 Minuten nach dem Klick ausgeführt, wenn der Laptop an und angemeldet ist.
   Sonst zeigt der Tab den Befehl als „wartet“ und dass der Laptop nicht gemeldet hat.
4. Der bestehende Versand bleibt, wie er ist: gleiche Limits (3 pro Tag, 5 in 24 Stunden), gleiche Tasks,
   gleiche Ordner.

## Ausgangslage

- Die Maschine läuft lokal unter `C:\Projekte\claude\marketing\` (kein Git-Repo):
  - `tiktok\versand.py`, Task „Mahlzait TikTok Entwurf“, täglich 7:00, 11:30, 17:30.
  - `gabi-mackie\produktion.bat`, Task „Mahlzait TikTok Nachschub“, mittwochs und sonntags 11:00, Claude ohne Nutzer.
  - `gabi-mackie\warteschlange\NNN_id\` mit `01.jpg` … `NN.jpg`, `caption.txt`, `kommentar_anpinnen.txt`.
  - `gabi-mackie\gesendet\`, `versand_log.jsonl`, `STATUS.txt`, `logs\`.
- Die Bilder für TikTok liegen in `gs://mahlzait-social/<slug>/` und sind über `mahlzait.de/social/...`
  öffentlich erreichbar (Vercel-Rewrite).
- Das Leaderboard ist `website/public/leaderboard/index.html` (eine Seite, 10 Tabs, `switchTab`), die Daten
  kommen aus `website/api/*.mjs` mit `DASHBOARD_PASSWORD` und Firestore über `GOOGLE_SA_KEY`.
- Vercel sieht nichts vom Laptop. Die Brücke zwischen beiden ist der Kern dieses Designs.

## Verworfene Ansätze

- **Versand in die Cloud** (Vercel-Cron, Warteschlange in GCS): wäre vom Laptop unabhängig, ist aber ein großer
  Umbau. Das TikTok-Refresh-Token rotiert und müsste aus `cred.json` in die Cloud umziehen, zwei Kopien
  wären eine Bruchstelle. Die Produktion bleibt wegen des Claude-Logins ohnehin lokal. Später möglich, falls
  verpasste Läufe öfter vorkommen.
- **Nur Anzeige**: erfüllt „selber steuern“ nicht.
- **Dauerlauf-Listener auf dem Laptop** (Firestore `on_snapshot`): reagiert sofort, aber der Prozess muss
  überwacht, neu verbunden und neu gestartet werden. Ein Abholer alle 5 Minuten reicht.

## Gewählt: Firestore als Briefkasten, der Laptop führt aus

```
Laptop, alle 5 min (Task "Mahlzait Posting Abholer")                 Vercel
  posting_sync.py                                                    api/posting.mjs
    1. Befehle holen   <---  Firestore posting_commands        <---  POST (Klick im Tab)
    2. ausführen (lokal, nur Whitelist)
    3. Stand melden    --->  Firestore posting_dashboard/state --->  GET (Tab lädt)
       Vorschaubilder  --->  gs://mahlzait-social/vorschau/<token>/  --->  <img> im Tab
```

Die lokalen Dateien bleiben die Wahrheit. Firestore ist nur Postfach (Befehle) und Schaufenster (Stand).
Der Versand selbst hängt nie an Firestore.

## Bausteine

### 1. Lokal: `tiktok\posting_sync.py` (neu)

Ein Lauf arbeitet erst die Befehle ab und meldet dann den Stand.

- **Befehle:** liest alle Dokumente in `posting_commands` mit `status == "wartet"`, älteste zuerst, führt jedes
  aus und setzt `status` auf `erledigt` oder `fehler`, dazu `meldung` und `erledigt_um`.
- **Stand:** baut das Stand-JSON (siehe Datenmodell) und schreibt es bei jedem Lauf. Das sind rund 290
  Schreibvorgänge am Tag, weit unter dem Gratis-Kontingent, und `gemeldet_um` dient gleich als Herzschlag.
- **Vorschaubilder:** lädt die JPGs der Warteschlange und von `aussortiert\` nach
  `gs://mahlzait-social/vorschau/<token>/<post>/<datei>`, nur wenn neu oder geändert (MD5-Vergleich mit dem
  Blob). Vorschau-Ordner von Posts, die nicht mehr da sind, werden gelöscht. `<token>` ist ein Zufallswert,
  einmal erzeugt und in `tiktok\posting_sync.json` abgelegt. Er erreicht den Browser nur über die
  passwortgeschützte API.
- **Task-Lage:** liest für beide Tasks `Get-ScheduledTaskInfo` (LastRunTime, LastTaskResult, NextRunTime,
  NumberOfMissedRuns) und ob sie aktiviert sind, per PowerShell-Aufruf.
- **Firestore-Zugriff:** über die REST-API mit dem vorhandenen `google-auth` und dem Service-Account aus
  `cred.json` (`gcp.service_account_key`), keine neue Abhängigkeit.
- **Betrieb:** läuft über `pythonw.exe`, damit kein Fenster aufblitzt. Log `tiktok\logs\sync_YYYY-MM-DD.log`,
  nur ausgeführte Befehle und Fehler, keine Leerläufe.

### 2. Lokal: Änderung an `tiktok\versand.py`

- Liest `gabi-mackie\steuerung.json`. Fehlt die Datei oder ist sie kaputt, gilt der Standard: nicht pausiert,
  keine Vorzieh-Liste. Eine kaputte Datei vermerkt `STATUS.txt` als Warnung.
- `pausiert: true`: kein Versand, Rückgabe „pausiert“, `STATUS.txt` vermerkt es.
- `bereit()` sortiert zuerst die Posts aus `vorziehen` (in Listenreihenfolge, nur solche, die noch in der
  Warteschlange liegen), dann den Rest nach Nummer. Ein verschickter Post fällt damit von selbst heraus.
- Sonst ändert sich nichts: Limits, Log, Fehler-Ordner bleiben.

`posting_sync.py` schreibt `steuerung.json` atomar (temporäre Datei, dann ersetzen).

### 3. Befehle (Whitelist)

| aktion            | Parameter  | Wirkung auf dem Laptop                                                   |
|-------------------|------------|--------------------------------------------------------------------------|
| `pausieren`       |            | `steuerung.json`: `pausiert = true`                                      |
| `fortsetzen`      |            | `pausiert = false`                                                       |
| `vorziehen`       | post       | Post an den Anfang von `vorziehen`                                       |
| `rausnehmen`      | post       | Ordner nach `gabi-mackie\aussortiert\`, aus `vorziehen` entfernen        |
| `zurueckholen`    | post       | Ordner aus `aussortiert\` zurück nach `warteschlange\`                   |
| `caption`         | post, text | `caption.txt` überschreiben (UTF-8)                                      |
| `jetzt_senden`    |            | `Start-ScheduledTask "Mahlzait TikTok Entwurf"`                          |
| `nachschub_jetzt` |            | `Start-ScheduledTask "Mahlzait TikTok Nachschub"`                        |

Regeln:

- `post` muss auf `^\d{3}_[a-z0-9_]+$` passen und als Ordner am erwarteten Ort liegen, sonst `fehler`.
  Aus einem Befehl wird nie ein Pfad oder Shell-Text übernommen.
- `caption`: nicht leer, höchstens 2.200 Zeichen, kein Gedankenstrich (U+2014, Hausregel). Die API prüft das
  beim Anlegen, der Abholer noch einmal vor dem Schreiben.
- `jetzt_senden` umgeht keine Limits. `versand.py` entscheidet wie immer, das Ergebnis steht nach dem
  nächsten Abholer-Lauf im Stand.
- Sofort-Aktionen laufen über die bestehenden Tasks. Damit entstehen dieselben Logs, und `IgnoreNew`
  verhindert Doppelläufe.
- `jetzt_senden` und `nachschub_jetzt`, die älter als 2 Stunden sind, werden nicht mehr ausgeführt, sondern
  mit `fehler: verfallen` abgeschlossen. Sonst würde ein Klick von vorgestern beim Aufklappen des Laptops
  plötzlich einen Versand auslösen.
- `rausnehmen` löscht nie etwas.

### 4. Vercel: `api/posting.mjs` (neu)

- `GET /api/posting?pw=…` liefert `{ state, befehle }`: das Stand-Dokument und die letzten 20 Befehle nach
  `erstellt_um`.
- `POST /api/posting` mit Body `{ pw, aktion, post?, text? }`: prüft Passwort, Aktion gegen die Whitelist,
  das Post-Muster und die Caption-Regeln, legt ein Befehl-Dokument an und gibt dessen ID zurück.
- Kein Cache, der Tab will den frischen Stand.
- Firestore über REST wie die anderen Endpunkte (`GOOGLE_SA_KEY`, Scope datastore).

### 5. Tab „Posting“ in `public/leaderboard/index.html`

Nach dem Muster der anderen Tabs: Button `tab-posting`, View `view-posting`, Laden in `switchTab`,
Funktionen mit Präfix `po`. Eine Spalte, am Handy bedienbar. Von oben nach unten:

1. **Lage:** Ampel und eine Zeile Klartext, zum Beispiel „Läuft · heute 1 von 3 verschickt · nächster Versand
   11:30 · Vorrat 6 Posts, etwa 2 Tage · Laptop vor 3 min gemeldet“.
   - Rot: Laptop seit mehr als 12 Stunden nicht gemeldet, letzter Versandversuch fehlgeschlagen,
     Warteschlange leer, oder ein Task mit Fehlercode.
   - Gelb: pausiert, Vorrat unter 3 Tagen, verpasste Läufe, oder Laptop seit mehr als 1 Stunde nicht gemeldet.
   - Grün sonst.
   - Buttons: Pausieren/Fortsetzen, Jetzt senden, Nachschub jetzt. Die beiden Sofort-Aktionen brauchen einen
     zweiten Tipp zur Bestätigung (kein Browser-Dialog).
2. **Warteschlange:** eine Karte je Post in Versandreihenfolge, der erste als „als Nächstes“ markiert,
   vorgezogene gekennzeichnet. Titelbild, aufklappbar alle Slides (waagerecht scrollbar), Caption mit
   Bearbeiten und Speichern, angepinnter Kommentar, Buttons Vorziehen und Rausnehmen.
3. **Verschickt:** die letzten 30 Versuche aus `versand_log.jsonl` mit Zeit, Post, Status, Fehlergrund und
   Titelbild von `mahlzait.de/social/<slug>/01.jpg`.
4. **Aussortiert:** Liste mit Zurückholen.
5. **Tasks:** beide Tasks mit letztem Lauf, Ergebnis im Klartext (0 = in Ordnung, 267011 = noch nie gelaufen,
   sonst der Code), nächstem Lauf und verpassten Läufen, darunter der letzte Nachschub-Bericht zum Aufklappen.
6. **Befehle:** die letzten 20 mit Status wartet, erledigt oder Fehler und der Meldung dazu.

Nach einem Klick zeigt der Tab den Befehl sofort als „wartet“ und lädt den Stand alle 30 Sekunden neu,
solange noch ein Befehl wartet.

## Datenmodell

`posting_dashboard/state`, ein Dokument, Feld `json` (String) plus `gemeldet_um` (Timestamp):

```json
{
  "gemeldet_um": "2026-09-30T09:55:00+02:00",
  "pausiert": false,
  "vorziehen": [],
  "heute_gesendet": 1,
  "pro_tag": 3,
  "slots": ["07:00", "11:30", "17:30"],
  "status_txt": "Stand 30.09.2026 09:51 …",
  "warteschlange": [
    {
      "post": "050_gleich_viele_kalorien",
      "bilder": ["https://www.mahlzait.de/social/vorschau/<token>/050_gleich_viele_kalorien/01.jpg"],
      "caption": "…",
      "kommentar": "…"
    }
  ],
  "aussortiert": [{ "post": "…", "bild": "…" }],
  "verschickt": [
    { "zeit": "…", "post": "…", "slug": "…", "ok": true, "status": "SEND_TO_USER_INBOX", "fail_reason": null }
  ],
  "tasks": [
    {
      "name": "Mahlzait TikTok Entwurf",
      "aktiv": true,
      "letzter_lauf": "…",
      "ergebnis": 0,
      "naechster_lauf": "…",
      "verpasst": 0
    }
  ],
  "nachschub_bericht": { "datei": "produktion_2026-09-28.md", "text": "…" }
}
```

`posting_commands/{auto-id}`: `aktion`, `post?`, `text?`, `status` (`wartet` | `erledigt` | `fehler`),
`meldung?`, `erstellt_um`, `erledigt_um?`.

Beide Sammlungen sind nur für den Service-Account erreichbar. `firestore.rules` gibt sie nicht frei, damit
bleiben sie für App-Clients gesperrt.

## Fehlerfälle

- **Laptop aus oder abgemeldet:** Befehle bleiben „wartet“, die Lage-Zeile zeigt, seit wann der Laptop nicht
  gemeldet hat. Nach der Anmeldung holt der Abholer sie der Reihe nach ab (Sofort-Aktionen mit Verfall, s. o.).
- **Firestore oder GCS nicht erreichbar:** der Lauf bricht ab und schreibt ins Log, der nächste Lauf probiert
  es neu. Der Versand läuft unberührt weiter.
- **Befehl für einen inzwischen verschickten Post:** `fehler: nicht mehr in der Warteschlange`.
- **Nachschub-Lauf und Befehle gleichzeitig:** der Wochenlauf legt nur neue Ordner an. `REDAKTION.md` bekommt
  eine Zeile, dass `aussortiert\` Ruslan gehört: nicht als Bestand zählen, nichts verschieben oder löschen.

## Sicherheit

- Gleiches Passwort wie alle Leaderboard-Tabs. POST nur mit Passwort im Body.
- Der Abholer führt nur Aktionen aus der Whitelist aus und prüft `post` gegen Muster und vorhandene Ordner.
- Vorschaubilder liegen unter einem zufälligen Pfad. Wer ihn nicht aus der API hat, findet sie nicht, und
  beim Versand werden die Bilder ohnehin öffentlich.

## Tests

- **Python** (pytest, neben dem bestehenden `test_versand.py`):
  - `versand.py`: pausiert, Vorzieh-Reihenfolge, fehlende und kaputte `steuerung.json`.
  - `posting_sync.py`: jede Aktion auf einem Temp-Ordner, Ablehnung ungültiger Posts, Caption-Regeln, Verfall
    der Sofort-Aktionen, Stand-Aufbau aus Beispiel-Ordnern.
  - Firestore, GCS und PowerShell werden als Funktionen übergeben und im Test ersetzt, nach dem Muster von
    `sende=` in `versand.py`.
- **Website** (`node:test`, Muster `scripts/*.test.mjs`): Validierung in `api/posting.mjs` (Aktion,
  Post-Muster, Caption) und die Ampel-Logik des Tabs als reine Funktion.
- **Einmal echt:** Abholer lokal laufen lassen, Tab lokal gegen die echten Firestore-Daten ansehen, und ein
  harmloser Befehl Ende zu Ende (pausieren, dann fortsetzen).

## Einrichtung und Rollout

- Zuerst prüfen, ob der lokale Service-Account (`ruslanadilgereev@mytemple-460913`) in Firestore schreiben darf.
- Neuer Windows-Task „Mahlzait Posting Abholer“: alle 5 Minuten, nur wenn angemeldet,
  `pythonw.exe posting_sync.py`, `IgnoreNew`, Zeitlimit 4 Minuten.
- Website: Commit im website-Repo. Deploy (Push auf `main`, Vercel) erst nach Ruslans ausdrücklichem Go.
- `REDAKTION.md`: die Zeile zu `aussortiert\`.

## Nicht enthalten

- Ob ein Entwurf auf TikTok tatsächlich veröffentlicht wurde und wie er läuft. Das bräuchte den Scope
  `video.list`, den die Sandbox-App nicht hat.
- Bilder bearbeiten, neue Posts im Tab anlegen, Limits oder den Zeitplan der Tasks ändern.
- Versand ohne Laptop.

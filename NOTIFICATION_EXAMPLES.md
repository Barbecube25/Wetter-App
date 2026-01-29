# Benachrichtigungs-Beispiele / Notification Examples

## Wie sehen die Benachrichtigungen aus? / What do the notifications look like?

Die WetterScoutAI App bietet zwei Arten von Benachrichtigungen, die dir täglich aktuelle Wetterinformationen liefern.

### 📱 Benachrichtigungs-Struktur / Notification Structure

Jede Benachrichtigung besteht aus:
- **Titel** (Title): Kurze Beschreibung der Benachrichtigung
- **Text** (Body): Detaillierte Wetterinformationen mit Emojis 📅🌙⚡☔
- **Zeit** (Time): Individuell einstellbar (Standard: 07:00 Uhr)
- **Wiederholung** (Repeat): Täglich automatisch

---

## 1️⃣ Tägliche Wettervorhersage / Daily Weather Forecast

**Benachrichtigungs-ID**: 1  
**Typ**: Heute-Vorhersage / Today's Forecast  
**Zeitpunkt**: Eingestellte Uhrzeit (z.B. 07:00 Uhr)

### Beispiel 1: Sonniger Tag / Sunny Day

#### 🇩🇪 Deutsch
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 📊 Tages-Bericht                         ║
║                                          ║
║ Jetzt (08:00 Uhr): 18°, gefühlt 17°.    ║
║                                          ║
║ 📅 Heute:                                ║
║ Die Temperatur schwankt heute zwischen   ║
║ 15° und 23°. Ein schöner, trockener Tag  ║
║ – perfekt!                               ║
║                                          ║
║ 🌙 Nachts geht es runter auf 12°.       ║
║                                          ║
║ 🌅 Ausblick auf Morgen (Freitag):       ║
║ Wird ähnlich angenehm mit 16° bis 24°.  ║
║ Bleibt trocken.                          ║
╚══════════════════════════════════════════╝
```

#### 🇬🇧 English
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 📊 Daily Report                          ║
║                                          ║
║ Now (08:00 AM): 64°F, feels like 63°F.  ║
║                                          ║
║ 📅 Today:                                ║
║ Temperatures will vary between 59°F and  ║
║ 73°F throughout the day. It will be a   ║
║ nice, dry day.                           ║
║                                          ║
║ 🌙 Night lows around 54°F.              ║
║                                          ║
║ 🌅 Outlook for Tomorrow (Friday):       ║
║ Similar pleasant conditions with 61°F   ║
║ to 75°F. Staying dry.                   ║
╚══════════════════════════════════════════╝
```

### Beispiel 2: Regnerischer Tag / Rainy Day

#### 🇩🇪 Deutsch
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 📊 Tages-Bericht                         ║
║                                          ║
║ Jetzt (07:00 Uhr): 14°, gefühlt 12°.    ║
║                                          ║
║ 📅 Heute:                                ║
║ Die Temperatur schwankt heute zwischen   ║
║ 12° und 17°. Wird regnerisch (8.5mm) –  ║
║ Schirm mitnehmen!                        ║
║ Regen von 10:00 bis 16:00 Uhr (6.2mm).  ║
║ Regen gegen 20:00 Uhr (2.3mm).          ║
║                                          ║
║ 🌙 Nachts kühlt es auf frische 9° ab    ║
║ (kann am Boden frieren).                 ║
║                                          ║
║ 🌅 Ausblick auf Morgen (Samstag):       ║
║ Freundlicher mit 11° bis 19°. Vielleicht║
║ ein paar Tropfen, aber größtenteils      ║
║ trocken.                                 ║
╚══════════════════════════════════════════╝
```

#### 🇬🇧 English
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 📊 Daily Report                          ║
║                                          ║
║ Now (07:00 AM): 57°F, feels like 54°F.  ║
║                                          ║
║ 📅 Today:                                ║
║ Temperatures will vary between 54°F and  ║
║ 63°F throughout the day. Rainy day      ║
║ (8.5mm), bring an umbrella.             ║
║ Rain from 10:00 AM to 04:00 PM (6.2mm). ║
║ Rain around 08:00 PM (2.3mm).           ║
║                                          ║
║ 🌙 Night cooling to fresh 48°F (ground  ║
║ frost possible).                         ║
║                                          ║
║ 🌅 Outlook for Tomorrow (Saturday):     ║
║ Friendlier with 52°F to 66°F. Isolated  ║
║ showers possible, mostly dry.           ║
╚══════════════════════════════════════════╝
```

### Beispiel 3: Schneetag / Snowy Day

#### 🇩🇪 Deutsch
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 📊 Tages-Bericht                         ║
║                                          ║
║ Jetzt (07:00 Uhr): -2°, gefühlt -6°.    ║
║                                          ║
║ 📅 Heute:                                ║
║ Recht konstante Temperaturen um die -1°  ║
║ (-3° bis 1°). Ein richtig schneereicher  ║
║ Tag (12.5mm Schnee) – zieh dich warm an!║
║ Die Schneewahrscheinlichkeit liegt bei   ║
║ 85%. Der Schnee wird wohl liegen bleiben ║
║ (Taupunkt: -4°C).                        ║
║ Schnee von 08:00 bis 18:00 Uhr (12.5mm).║
║ ❄️ Große Kälte - warm anziehen!         ║
║                                          ║
║ 🌙 Nachts wird's frostig (-5°). Pass auf║
║ Glätte auf!                              ║
╚══════════════════════════════════════════╝
```

#### 🇬🇧 English
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 📊 Daily Report                          ║
║                                          ║
║ Now (07:00 AM): 28°F, feels like 21°F.  ║
║                                          ║
║ 📅 Today:                                ║
║ Pretty steady temperatures around 30°F   ║
║ (27°F to 34°F). Snowy day (12.5mm snow),║
║ dress warmly. Snow probability: 85%.    ║
║ Snow will likely stick (dew point:      ║
║ 25°F).                                   ║
║ Snow from 08:00 AM to 06:00 PM (12.5mm).║
║ ❄️ Severe cold - dress warmly!          ║
║                                          ║
║ 🌙 Night it gets frosty (23°F). Watch   ║
║ for ice!                                 ║
╚══════════════════════════════════════════╝
```

### Beispiel 4: Extremwetter / Extreme Weather

#### 🇩🇪 Deutsch
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 📊 Tages-Bericht                         ║
║                                          ║
║ Jetzt (07:00 Uhr): 26°, gefühlt 28°.    ║
║                                          ║
║ 📅 Heute:                                ║
║ Heute gibt's große Temperaturschwankungen║
║ Los geht's mit 24°, später dann bis zu  ║
║ 37°. Vielleicht ein paar Tropfen, aber  ║
║ größtenteils trocken.                    ║
║ Dazu noch windig mit Böen bis 65 km/h.  ║
║ ⚠️ Hoher UV-Index (9) - Sonnenschutz    ║
║ nicht vergessen!                         ║
║ 🔥 Große Hitze erwartet - viel trinken! ║
║ ⚡ Gewitter im Anmarsch - Schutz suchen! ║
║                                          ║
║ 🌙 Nachts geht es runter auf 19°.       ║
╚══════════════════════════════════════════╝
```

#### 🇬🇧 English
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 📊 Daily Report                          ║
║                                          ║
║ Now (07:00 AM): 79°F, feels like 82°F.  ║
║                                          ║
║ 📅 Today:                                ║
║ Quite a temperature swing today!         ║
║ Starting at 75°F and warming up to 99°F.║
║ Isolated showers possible, mostly dry.  ║
║ Windy with gusts up to 40 mph.          ║
║ ⚠️ High UV index (9) - use sun          ║
║ protection!                              ║
║ 🔥 Extreme heat expected - stay          ║
║ hydrated!                                ║
║ ⚡ Thunderstorms approaching - seek      ║
║ shelter!                                 ║
║                                          ║
║ 🌙 Night lows around 66°F.              ║
╚══════════════════════════════════════════╝
```

---

## 2️⃣ Ausblick auf Morgen / Next Day Outlook

**Benachrichtigungs-ID**: 2  
**Typ**: Morgen-Vorhersage / Tomorrow's Forecast  
**Zeitpunkt**: Eingestellte Uhrzeit (z.B. 07:00 Uhr)

### Beispiel 1: Morgen wird sonnig / Tomorrow will be sunny

#### 🇩🇪 Deutsch
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 🌅 Ausblick auf Morgen                   ║
║                                          ║
║ 🌅 Ausblick auf Morgen (Samstag):       ║
║ Die Temperatur schwankt morgen zwischen  ║
║ 16° und 25°. Ein schöner, trockener Tag  ║
║ – perfekt!                               ║
║                                          ║
║ 🌙 Nachts geht es runter auf 13°.       ║
╚══════════════════════════════════════════╝
```

#### 🇬🇧 English
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 🌅 Outlook for Tomorrow                  ║
║                                          ║
║ 🌅 Outlook for Tomorrow (Saturday):     ║
║ Temperatures will vary between 61°F and  ║
║ 77°F throughout the day. It will be a   ║
║ nice, dry day.                           ║
║                                          ║
║ 🌙 Night lows around 55°F.              ║
╚══════════════════════════════════════════╝
```

### Beispiel 2: Morgen wird regnerisch / Tomorrow will be rainy

#### 🇩🇪 Deutsch
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 🌅 Ausblick auf Morgen                   ║
║                                          ║
║ 🌅 Ausblick auf Morgen (Sonntag):       ║
║ Die Temperatur schwankt morgen zwischen  ║
║ 10° und 15°. Wird regnerisch (15.2mm) – ║
║ Schirm mitnehmen!                        ║
║ Regen von 06:00 bis 20:00 Uhr (15.2mm). ║
║ Dazu noch windig mit Böen bis 72 km/h.  ║
║                                          ║
║ 🌙 Nachts kühlt es auf frische 7° ab    ║
║ (kann am Boden frieren).                 ║
╚══════════════════════════════════════════╝
```

#### 🇬🇧 English
```
╔══════════════════════════════════════════╗
║ WetterScoutAI                            ║
╠══════════════════════════════════════════╣
║ 🌅 Outlook for Tomorrow                  ║
║                                          ║
║ 🌅 Outlook for Tomorrow (Sunday):       ║
║ Temperatures will vary between 50°F and  ║
║ 59°F throughout the day. Rainy day      ║
║ (15.2mm), bring an umbrella.            ║
║ Rain from 06:00 AM to 08:00 PM (15.2mm).║
║ Windy with gusts up to 45 mph.          ║
║                                          ║
║ 🌙 Night cooling to fresh 45°F (ground  ║
║ frost possible).                         ║
╚══════════════════════════════════════════╝
```

---

## 🔧 Technische Details / Technical Details

### Benachrichtigungs-Eigenschaften / Notification Properties

| Eigenschaft | Wert / Value |
|------------|-------------|
| **Sound** | Default System Sound |
| **Icon** | ic_stat_icon_config_sample |
| **Priority** | Default |
| **Wiederholung** | Täglich / Daily |
| **Kanalgruppe** | Standard / Default |

### Wetter-Emojis verwendet / Weather Emojis Used

- 📅 **Heute** / Today
- 🌅 **Morgen** / Tomorrow  
- 🌙 **Nachts** / Night
- ☔ **Regen** / Rain
- ❄️ **Schnee/Kälte** / Snow/Cold
- ⚡ **Gewitter** / Thunderstorm
- 🔥 **Hitze** / Heat
- ⚠️ **Warnung** / Warning
- 🧳 **Reise** / Travel

### Besondere Warnungen / Special Warnings

Die Benachrichtigungen enthalten automatische Warnungen bei:

**Deutsch:**
- ❄️ Große Kälte (< -5°C) - warm anziehen!
- 🔥 Große Hitze (> 35°C) - viel trinken!
- ⚡ Gewitter - Schutz suchen!
- ⚠️ Hoher UV-Index (≥ 8) - Sonnenschutz nicht vergessen!
- 💨 Windig (> 50 km/h)

**English:**
- ❄️ Severe cold (< 23°F) - dress warmly!
- 🔥 Extreme heat (> 95°F) - stay hydrated!
- ⚡ Thunderstorms - seek shelter!
- ⚠️ High UV index (≥ 8) - use sun protection!
- 💨 Windy (> 31 mph)

### Niederschlagsdetails / Precipitation Details

Benachrichtigungen zeigen:
- **Zeitfenster**: Wann genau Regen/Schnee erwartet wird
- **Menge**: Wie viel Niederschlag (in mm)
- **Art**: Regen, Schnee oder Mischniederschlag
- **Wahrscheinlichkeit**: Bei Schnee wird die Schneefallwahrscheinlichkeit angezeigt
- **Bodenfrost**: Information ob Schnee liegen bleibt (basierend auf Taupunkt)

---

## 📱 Aktivierung / Activation

### So aktivierst du Benachrichtigungen:

1. Öffne die WetterScoutAI App
2. Tippe auf **⚙️ Einstellungen**
3. Scrolle zu **"Benachrichtigungen"**
4. Aktiviere:
   - ✅ **Tägliche Wettervorhersage**
   - ✅ **Ausblick auf morgen**
5. Wähle deine **Benachrichtigungszeit** (z.B. 07:00 Uhr)
6. Erlaube Benachrichtigungen in den System-Einstellungen

### How to enable notifications:

1. Open the WetterScoutAI App
2. Tap **⚙️ Settings**
3. Scroll to **"Notifications"**
4. Enable:
   - ✅ **Daily weather forecast**
   - ✅ **Next day outlook**
5. Choose your **Notification time** (e.g., 07:00 AM)
6. Allow notifications in system settings

---

## 🌍 Unterstützte Sprachen / Supported Languages

Benachrichtigungen sind verfügbar in:
- 🇩🇪 Deutsch (German)
- 🇬🇧 English
- 🇫🇷 Français (French)
- 🇪🇸 Español (Spanish)
- 🇮🇹 Italiano (Italian)
- 🇹🇷 Türkçe (Turkish)
- 🇵🇱 Polski (Polish)
- 🇳🇱 Nederlands (Dutch)
- 🇭🇷 Hrvatski (Croatian)
- 🇬🇷 Ελληνικά (Greek)
- 🇩🇰 Dansk (Danish)
- 🇷🇺 Русский (Russian)

Die Benachrichtigungssprache passt sich automatisch an die in der App gewählte Sprache an.

---

## 💡 Hinweise / Notes

- **Zeitpunkt**: Benachrichtigungen werden zur eingestellten Uhrzeit versendet (Standard: 07:00 Uhr)
- **Aktualisierung**: Der Inhalt wird beim Versand mit aktuellen Wetterdaten generiert
- **Android 13+**: Erfordert POST_NOTIFICATIONS Berechtigung (wird automatisch angefragt)
- **Offline**: Benachrichtigungen werden nur versendet wenn Wetterdaten verfügbar sind
- **Genauigkeit**: Wetterdaten von Open-Meteo API (14-Tage Vorhersage)

---

**Erstellt für WetterScoutAI v15.0**  
**Zuletzt aktualisiert: Januar 2026**

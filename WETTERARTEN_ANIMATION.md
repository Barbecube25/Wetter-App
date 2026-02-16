# Wetterarten in der Animation

Diese Datei listet alle Wetterarten auf, die in der animierten SVG-Szene der Wetter-App dargestellt werden.

## Niederschlagsarten

### 1. Regen (Rain)
- **Codes**: 61, 63, 65, 80, 81, 82
- **Varianten**:
  - Leichter Regen (Light Rain): Codes 61, 80
  - Mittlerer Regen (Medium Rain): Codes 63, 81
  - Starker Regen (Heavy Rain): Codes 65, 82
- **Animation**: Fallende blaue Regentropfen (`animate-rain-1`, `animate-rain-2`, `animate-rain-3`, `animate-rain-storm`)
- **Effekt**: 30-60 animierte Regentropfen je nach Intensität mit Splash-Effekt

### 2. Nieselregen (Drizzle)
- **Codes**: 51, 53, 55
- **Animation**: 40 kleine, leichte Regentropfen
- **Effekt**: Sanft fallende, weniger intensive Tropfen

### 3. Schnee (Snow)
- **Codes**: 71, 73, 75, 77, 85, 86
- **Varianten**:
  - Leichter Schnee (Light Snow): Codes 71, 77, 85
  - Mittlerer Schnee (Medium Snow): Code 73
  - Starker Schnee (Heavy Snow): Codes 75, 86
- **Animation**: Fallende weiße Schneeflocken (`animate-snow-slow`, `animate-snow-fast`)
- **Effekt**: 40-80 rotierende Schneeflocken je nach Intensität, weiße Schneedecke auf Bergen und Boden

### 4. Mischniederschlag / Schneeregen (Sleet)
- **Codes**: 56, 57, 66, 67
- **Details**:
  - 56: Leichter gefrierender Nieselregen
  - 57: Dichter gefrierender Nieselregen  
  - 66: Leichter gefrierender Regen (Freezing Rain)
  - 67: Starker gefrierender Regen (Freezing Rain)
- **Varianten**:
  - Leichter Mischniederschlag (Light Sleet): Codes 56, 66
  - Starker Mischniederschlag (Heavy Sleet): Codes 57, 67
- **Animation**: Spezialisierte Mischniederschlag-Animation (`animate-sleet`)
- **Effekt**: 35-50 gemischte Partikel (50% eisige Regentropfen in Grau-Blau, 50% Eis/Schneepartikel in Weiß), weiße Bergspitzen, eisige Bodenoberfläche mit Glitzereffekt, Intensität je nach Wettercode

### 5. Hagel (Hail)
- **Codes**: 96, 99
- **Animation**: Fallende weiße Hagelkörner (`animate-hail`)
- **Effekt**: 60 rotierende Hagelkörner

## Wetterereignisse

### 6. Gewitter (Storm/Thunderstorm)
- **Codes**: 17, 95, 96, 99
- **Animation**: Blitze (`anim-lightning`), starkes Baumschütteln (`anim-tree-storm`)
- **Effekt**: Gelber Blitz mit Leuchten, dunkle Wolken, weiße Flash-Overlays

### 7. Nebel (Fog)
- **Codes**: 45, 48
- **Animation**: Fließende Nebelschichten (`anim-fog-1`, `anim-fog-2`)
- **Effekt**: Zwei überlagerte, horizontal bewegende Nebelschichten

## Bewölkung

### 8. Klar / Sonnig (Clear/Sunny)
- **Codes**: 0, 1
- **Animation**: Pulsierende Sonne (`animate-ray`), rotierende Sonnenstrahlen (`animate-spin-slow`)
- **Effekt**: Leuchtende Sonne mit 8 rotierenden Strahlen

### 9. Teilweise bewölkt (Partly Cloudy)
- **Code**: 2
- **Animation**: Schwebende Wolken (`anim-clouds`)
- **Effekt**: 1-2 bewegende Wolken

### 10. Bewölkt / Bedeckt (Overcast)
- **Codes**: 3, 45, 48
- **Animation**: Schwebende Wolken (`anim-clouds`)
- **Effekt**: 3-5 bewegende Wolken, je nach Bewölkungsgrad

## Temperaturextreme

### 11. Extreme Hitze (Extreme Heat)
- **Bedingung**: Temperatur ≥ 30°C
- **Animation**: Hitzeflirrern (`anim-heat`)
- **Effekt**: Orangefarbener, wellenförmiger Hitze-Overlay

### 12. Starker Frost (Deep Freeze)
- **Bedingung**: Temperatur ≤ -5°C
- **Animation**: Funkelnde Eiskristalle (`anim-sparkle`)
- **Effekt**: Weiße Schneedecke, funkelnde Eiskristalle auf dem Boden, weiße Bergspitzen

### 13. Gefrierpunkt (Freezing)
- **Bedingung**: Temperatur ≤ 0°C
- **Animation**: Bei Regen: Funkelnde Eiskristalle (`anim-sparkle`)
- **Effekt**: Eisige Bodenoberfläche mit Glitzereffekt

### 14. Tropennacht (Tropical Night)
- **Bedingung**: Nacht und Temperatur > 20°C
- **Animation**: Tropischer Schein (`anim-tropical`)
- **Effekt**: Warmer, goldener Glow über der Szene

## Windverhältnisse

### 15. Windig (Windy)
- **Bedingung**: Windgeschwindigkeit ≥ 30 km/h
- **Animation**: Baumschütteln (`anim-tree-windy`)
- **Effekt**: Mittleres Schütteln der Bäume

### 16. Sturm (Stormy Wind)
- **Bedingung**: Windgeschwindigkeit ≥ 60 km/h
- **Animation**: Starkes Baumschütteln (`anim-tree-storm`), schräger Niederschlag
- **Effekt**: Intensives Schütteln der Bäume, 20° Neigung bei Regen/Schnee

## Tag/Nacht-Effekte

### 17. Nacht (Night)
- **Bedingung**: `is_day` = 0
- **Animation**: Funkelnde Sterne (`animate-twinkle-1`, `animate-twinkle-2`, `animate-twinkle-3`)
- **Effekt**: Mond, 10 twinkelnde Sterne, dunkle Farbpalette

### 18. Tag (Day)
- **Bedingung**: `is_day` = 1
- **Animation**: Pulsierende Sonne (`animate-ray`)
- **Effekt**: Helle Sonne, helle Farbpalette

## Saisonale Effekte (Bonus)

### 19. Frühling (Spring)
- **Animation**: Statische Blüten auf Bäumen und Boden
- **Effekt**: Rosa und pinke Blüten

### 20. Herbst (Autumn)
- **Animation**: Fallende Herbstblätter (`animate-leaves`)
- **Effekt**: 15 orange, rote und gelbe fallende Blätter

### 21. Winter (Winter)
- **Animation**: Schnee auf Baumästen
- **Effekt**: Weiße Schneedecken auf Ästen

## Event-basierte Animationen (Bonus)

### 22. Weihnachten (Christmas)
- **Animation**: Statische Weihnachtskugeln auf Bäumen
- **Effekt**: Rote, gelbe und blaue Ornamente

### 23. Ostern (Easter)
- **Animation**: Statischer Osterhase und versteckte Eier
- **Effekt**: Hase neben dem Haus, bunte Ostereier

### 24. Halloween (Halloween)
- **Animation**: Statische Kürbisse
- **Effekt**: Orange Kürbisse auf dem Boden

### 25. Silvester (New Year)
- **Animation**: Explodierende Feuerwerke (SVG animate)
- **Effekt**: 5 mehrfarbige Feuerwerke am Himmel

## Animationstypen

Die App verwendet folgende CSS-Keyframe-Animationen:

- **rain-drop**: Fallende Regentropfen mit Splash-Effekt
- **snow-fall-slow**: Langsam fallende, rotierende Schneeflocken
- **snow-fall-fast**: Schnell fallende Schneeflocken
- **sleet-fall**: Mischniederschlag-Animation (halb drehende, fallende Partikel für gemischten Niederschlag)
- **fog-flow**: Horizontal fließende Nebelschichten
- **heat-shimmer**: Hitzeflirrern-Effekt
- **ice-sparkle**: Funkelnde Eiskristalle
- **tree-shake-gentle**: Sanftes Baumschütteln
- **tree-shake-windy**: Mittleres Baumschütteln bei Wind
- **tree-shake-storm**: Starkes Baumschütteln bei Sturm
- **ray-pulse**: Pulsierende Sonnenstrahlen
- **twinkle**: Funkelnde Sterne
- **lightning-flash**: Blitz-Effekt
- **hail-fall**: Fallende Hagelkörner
- **tropical-glow**: Tropischer Nacht-Schein
- **float-leaves**: Fallende Herbstblätter
- **float-clouds**: Horizontal schwebende Wolken

## Astronomische Effekte

Die App berechnet und berücksichtigt auch astronomische Daten:

### 26. Mondphasen (Moon Phases)
- **Funktion**: `getMoonPhase()` berechnet 8 Mondphasen
- **Phasen**: Neumond, zunehmende Sichel, erstes Viertel, zunehmender Mond, Vollmond, abnehmender Mond, letztes Viertel, abnehmende Sichel
- **Effekt**: Der Mond wird bei Nacht entsprechend der aktuellen Phase dargestellt

## Kombinierte Wetterphänomene

Die folgenden Phänomene entstehen durch Kombination mehrerer Bedingungen:

### 27. Blizzard (Schneesturm)
- **Bedingungen**: `isHeavySnow` + `isStormyWind` (Starker Schnee + Windgeschwindigkeit ≥ 60 km/h)
- **Effekt**: Maximale Schneeintensität (80+ Flocken) mit 20° Neigung und extremem Baumschütteln

### 28. Gefrierender Regen (Freezing Rain)
- **Codes**: 66, 67 (in der App als Sleet/Schneeregen klassifiziert)
- **Bedingungen**: Niederschlag bei `isFreezing` (≤ 0°C)
- **Effekt**: Regentropfen mit eisiger Bodenoberfläche und funkelnden Eiskristallen

### 29. Eisregen bei Minusgraden
- **Bedingungen**: `isRain` + `isFreezing` (Regen + Temperatur ≤ 0°C)
- **Effekt**: Eisige, bläuliche Bodenoberfläche mit Glitzereffekt

## Zukünftige Erweiterungsmöglichkeiten

Die folgenden Wetterarten sind in der aktuellen Version noch nicht implementiert, könnten aber in Zukunft hinzugefügt werden:

### Atmosphärische Phänomene (WMO-Erweiterung)
- **Dunst/Haze** (WMO Codes 4, 5): Trockener Trübungszustand durch Staub/Rauch
- **Trockenes Gewitter** (Code 17): Blitze ohne Niederschlag
- **Sandsturm/Staubsturm** (Codes 30-35): Für internationale Regionen
- **Tornado/Windhose** (Code 19): Extremwetterereignis

### Astronomische Zusatzeffekte
- **Sternenklare Nacht**: Intensivere Sternenanzeige bei Code 0 + Nacht
- **Polarlichter (Aurora)**: Für nördliche Breitengrade bei klarem Himmel
- **Regenbogen**: Bei `isRain` + `isClear`/`isPartlyCloudy` (Sonne scheint)

### Erweiterte Temperaturlogik
- **Schwül/Drückend**: Temperatur > 25°C + hohe Luftfeuchtigkeit (>70%)
- **Bodenfrost**: Lufttemperatur knapp über 0°C, aber Bodentemperatur unter 0°C

### Kombinierte Wetterevents
- **Gewitterböen (Squalls)**: Plötzliche Windstöße vor Gewittern
- **Raureif**: Eisablagerungen bei Nebel und Frost

**Hinweis**: Diese Erweiterungen würden zusätzliche API-Daten (Luftfeuchtigkeit, Sichtweite, Bodentemperatur) oder erweiterte WMO-Wettercodes erfordern. Die Open-Meteo API unterstützt aktuell hauptsächlich die Codes 0-99.

## Zusammenfassung

Insgesamt werden **derzeit 29 verschiedene Wetterarten, Bedingungen und Ereignisse** in der animierten Szene dargestellt (inklusive Mondphasen und kombinierter Phänomene), mit über **15 verschiedenen CSS-Keyframe-Animationen**. Die Animationen passen sich dynamisch an die aktuellen Wetterbedingungen, Tageszeit, Jahreszeit und besondere Ereignisse an.

Die App nutzt die **Open-Meteo API** mit WMO-Wettercodes 0-99 und kombiniert diese mit berechneten Schwellenwerten für Temperatur, Wind und Niederschlag, um ein umfassendes Bild der Wetterlage zu vermitteln.

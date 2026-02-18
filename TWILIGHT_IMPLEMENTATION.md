# Morgendämmerung und Abenddämmerung - Implementierung

## Übersicht

Diese Implementierung fügt sanfte Übergänge für Morgen- und Abenddämmerung in der Wetter-Animation hinzu, um einen fließenden Übergang zur Nacht und zum Tag zu schaffen.

## Änderungen

### 1. Verlängerte Dämmerungszeiten

- **Hauptübergang**: 60 Minuten (vorher: 45 Minuten)
- **Erweiterte Dämmerung**: 30 Minuten zusätzlich
- **Gesamt**: 90 Minuten für vollständigen Sternen-Ein-/Ausblendeffekt

### 2. Verstärkte Dämmerungsfarben

- **Morgenrot (Dawn)**: Gold/Orange-Farbverlauf während der Morgendämmerung
- **Abendrot (Dusk)**: Pink/Magenta-Farbverlauf während der Abenddämmerung
- **Deckkraft**: Erhöht von 1.0 auf 1.2 für deutlichere Dämmerungsfarben

### 3. Sanfte Sternen-Übergänge ⭐

#### Vorher:
- Sterne erschienen/verschwanden sofort bei Sonnenauf-/untergang
- Abrupter Wechsel zwischen Tag und Nacht

#### Nachher:
- Sterne blenden sich über 90 Minuten sanft ein/aus
- **Morgendämmerung**: Sterne blenden aus (100% → 0%) nach Sonnenaufgang
- **Abenddämmerung**: Sterne blenden ein (0% → 100%) um Sonnenuntergang
- Fließende CSS-Übergänge (4 Sekunden)

## Technische Details

### Konstanten

```javascript
TRANSITION_DURATION = 1.0          // Hauptübergang: 60 Minuten
TWILIGHT_EXTENSION = 0.5           // Erweiterte Dämmerung: 30 Minuten  
EXTENDED_TWILIGHT_DURATION = 1.5   // Gesamt: 90 Minuten
DAWN_DUSK_OPACITY_MULTIPLIER = 1.2 // Dämmerungsfarben-Intensität
```

### Sternen-Deckkraft Berechnung

Die Deckkraft der Sterne (`starOpacity`) wird basierend auf der aktuellen Uhrzeit im Verhältnis zu Sonnenauf- und -untergang berechnet:

#### Morgendämmerung (nach Sonnenaufgang):
```javascript
starOpacity = max(0, 1 - (timeSinceSunrise / EXTENDED_TWILIGHT_DURATION))
```
- Bei Sonnenaufgang: 100% sichtbar
- Nach 90 Minuten: 0% sichtbar (vollständig ausgeblendet)

#### Abenddämmerung (um Sonnenuntergang):
```javascript  
starOpacity = max(0, 1 - (timeUntilSunset / EXTENDED_TWILIGHT_DURATION))
```
- 30 Min vor Sonnenuntergang: Beginnen einzublenden
- Bei Sonnenuntergang: ~67% sichtbar
- 30 Min nach Sonnenuntergang: 100% sichtbar

#### Vollständige Nacht:
```javascript
starOpacity = 1.0  // 100% sichtbar
```

#### Vollständiger Tag:
```javascript
starOpacity = 0.0  // Unsichtbar
```

## Zeitplan Beispiel

Für Berlin mit:
- Sonnenaufgang: 07:16 Uhr
- Sonnenuntergang: 17:24 Uhr

### Morgendämmerung (Sonnenaufgang):
- **07:16 Uhr**: Sonnenaufgang beginnt, Sterne bei 100%
- **07:45 Uhr**: Sterne bei ~67%
- **08:00 Uhr**: Sterne bei ~50%
- **08:30 Uhr**: Sterne bei ~17%
- **08:46 Uhr**: Sterne vollständig ausgeblendet (0%)

### Abenddämmerung (Sonnenuntergang):
- **16:54 Uhr**: Sterne beginnen einzublenden (30 Min vor Sonnenuntergang)
- **17:24 Uhr**: Sonnenuntergang, Sterne bei ~67%
- **17:45 Uhr**: Sterne bei ~86%
- **17:54 Uhr**: Sterne vollständig eingeblendet (100%)

## Code-Qualität

- ✅ Keine Sicherheitslücken (CodeQL)
- ✅ Code-Review bestanden
- ✅ Konstanten extrahiert für bessere Wartbarkeit
- ✅ Umfassende Kommentare
- ✅ Behandlung von Sonderfällen (Mitternachts-Übergang)

## Visueller Effekt

Die Implementierung schafft einen **fließenden Übergang** zwischen Tag und Nacht:

1. **Sanfte Himmelsfarbübergänge**: Blau → Gold/Pink → Schwarz
2. **Allmähliche Sternsichtbarkeit**: Wie in der Natur
3. **Realistische Dämmerungsperioden**: Entspricht natürlichen Lichtverhältnissen
4. **CSS-Animationen**: Weiche Übergänge ohne Sprünge

## Fazit

Die Animation bietet jetzt eine realistische und visuell ansprechende Darstellung von Morgen- und Abenddämmerung, die den natürlichen Übergang zwischen Tag und Nacht widerspiegelt.

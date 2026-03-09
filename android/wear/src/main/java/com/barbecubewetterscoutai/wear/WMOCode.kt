package com.barbecubewetterscoutai.wear

/**
 * Maps WMO weather interpretation codes (WW) to a human-readable German description
 * and an emoji icon. Based on Open-Meteo / WMO table.
 */
object WMOCode {

    fun description(code: Int): String = when (code) {
        0 -> "Klar"
        1 -> "Überwiegend klar"
        2 -> "Teilweise bewölkt"
        3 -> "Bedeckt"
        45 -> "Nebel"
        48 -> "Reifnebel"
        51 -> "Leichter Nieselregen"
        53 -> "Nieselregen"
        55 -> "Starker Nieselregen"
        56 -> "Gefrierender Nieselregen"
        57 -> "Starker gefrierender Nieselregen"
        61 -> "Leichter Regen"
        63 -> "Regen"
        65 -> "Starker Regen"
        66 -> "Leichter gefrierender Regen"
        67 -> "Gefrierender Regen"
        71 -> "Leichter Schneefall"
        73 -> "Schneefall"
        75 -> "Starker Schneefall"
        77 -> "Schneekörner"
        80 -> "Leichte Regenschauer"
        81 -> "Regenschauer"
        82 -> "Starke Regenschauer"
        85 -> "Schneeschauer"
        86 -> "Starke Schneeschauer"
        95 -> "Gewitter"
        96 -> "Gewitter mit Hagel"
        99 -> "Gewitter mit schwerem Hagel"
        else -> "Unbekannt"
    }

    fun emoji(code: Int): String = when (code) {
        0 -> "☀️"
        1 -> "🌤️"
        2 -> "⛅"
        3 -> "☁️"
        45, 48 -> "🌫️"
        51, 53, 55 -> "🌦️"
        56, 57 -> "🌧️"
        61 -> "🌦️"
        63 -> "🌧️"
        65 -> "🌧️"
        66, 67 -> "🌨️"
        71, 73, 75, 77 -> "❄️"
        80, 81, 82 -> "🌧️"
        85, 86 -> "🌨️"
        95, 96, 99 -> "⛈️"
        else -> "🌡️"
    }
}

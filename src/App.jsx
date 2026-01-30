import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, RefreshCw, Info, CalendarDays, TrendingUp, Droplets, Navigation, Wind, Sun, Cloud, CloudRain, Snowflake, CloudLightning, Clock, Crosshair, Home, Download, Moon, Star, Umbrella, ShieldCheck, AlertTriangle, BarChart2, List, Database, Map as MapIcon, Sparkles, Thermometer, Waves, ChevronDown, ChevronUp, Save, CloudFog, Siren, X, ExternalLink, User, Share, Palette, Zap, ArrowRight, Gauge, Timer, MessageSquarePlus, CheckCircle2, CloudDrizzle, CloudSnow, CloudHail, ArrowLeft, Trash2, Plus, Plane, Calendar, Search, Edit2, Check, Settings, Globe, Languages, Sunrise, Sunset, Eye, Activity } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { StatusBar } from '@capacitor/status-bar';

// --- 1. KONSTANTEN & CONFIG & ÜBERSETZUNGEN ---

// ÄNDERUNG: Standard ist jetzt null (leer), damit der User es einrichten muss
const DEFAULT_LOC = null; 

// TEXT RESSOURCEN
const TRANSLATIONS = {
  de: {
    home: "Home",
    gps: "GPS",
    places: "Orte",
    settings: "Einstellungen",
    language: "Sprache",
    units: "Einheiten",
    theme: "Design",
    themeAuto: "Automatisch",
    themeLight: "Hell",
    themeDark: "Dunkel",
    changeHome: "Heimatort ändern",
    save: "Speichern",
    cancel: "Abbrechen",
    loading: "Lade...",
    error: "Fehler",
    reset: "Reset",
    updated: "Stand",
    feelsLike: "Gefühlt",
    wind: "Wind",
    gusts: "Böen",
    precip: "Niederschlag",
    precip24h: "Niederschlag in den nächsten 24 Stunden",
    humidity: "Feuchte",
    dewPoint: "Taupkt.",
    uv: "UV",
    pressure: "Luftdruck",
    visibility: "Sicht",
    airQuality: "Luftqualität",
    aqiGood: "Gut",
    aqiModerate: "Mittel",
    aqiUnhealthy: "Ungesund",
    aqiVeryUnhealthy: "Sehr ungesund",
    aqiHazardous: "Gefährlich",
    overview: "Verlauf",
    longterm: "14 Tage",
    radar: "Radar",
    compare: "Vergleich",
    travel: "Reise",
    source: "Datenbasis & Laufzeiten (Geschätzt)",
    install: "Installieren",
    installTitle: "App installieren",
    installDesc: "Tippen Sie unten auf \"Teilen\" und dann \"Zum Home-Bildschirm\".",
    feedback: "Wetter melden",
    feedbackTitle: "Wetter melden",
    feedbackSend: "Feedback senden",
    feedbackThanks: "Danke!",
    feedbackDesc: "Dein Feedback hilft uns.",
    managePlaces: "Orte verwalten",
    searchPlace: "Stadt suchen...",
    savedPlaces: "Gespeicherte Orte",
    addCurrent: "Aktuellen Ort speichern",
    myLocation: "Mein Standort",
    homeLoc: "Heimatort",
    noPlaces: "Keine weiteren Orte.",
    welcome: "Willkommen!",
    welcomeDesc: "Um zu starten, legen Sie bitte Ihren Heimatort fest.",
    useGps: "Standort verwenden",
    orSearch: "Oder suchen",
    locFound: "Ort gefunden!",
    nameLoc: "Wie möchten Sie diesen Ort nennen?",
    saveStart: "Speichern & Starten",
    dailyReport: "Tages-Bericht",
    trend: "7-Tage-Trend",
    threeDayForecast: "3-Tage-Vorhersage",
    precipRadar: "Niederschlags-Radar",
    modelCheck: "Modell-Check",
    longtermList: "14-Tage Liste",
    travelPlanner: "Reiseplaner",
    travelDesc: "Planen Sie Ihren Ausflug und checken Sie die Wetter-Wahrscheinlichkeit.",
    whereTo: "Wohin soll es gehen?",
    startDate: "Startdatum",
    endDate: "Enddatum (Optional)",
    startTime: "Startzeit",
    endTime: "Endzeit",
    checkWeather: "Wetter prüfen",
    saveTrip: "Reise speichern",
    myTrips: "Meine Reisen",
    tripSaved: "Reise gespeichert!",
    radarCredit: "Radarbild bereitgestellt von Windy.com", // Radar data from Windy.com
    noRain: "Trocken",
    rain: "Regen",
    snow: "Schnee",
    probability: "Wahrsch.",
    safe: "Sicher",
    officialWarning: "Amtliche Warnung",
    instruction: "Handlungsempfehlung",
    activeWarnings: "aktive Warnung(en)",
    weatherReport: "Wetter-Bericht",
    showDetails: "Ausführliche Details",
    showLess: "Weniger anzeigen",
    nextRain: "Nächster Niederschlag",
    rainNow: "Aktueller Niederschlag",
    rainSoon: "Regen beginnt bald",
    noRainExp: "In den nächsten 24h bleibt es trocken.",
    noPrecipExp: "Aktuell kein Niederschlag zu erwarten",
    startingNow: "beginnt jetzt",
    startingSoon: "beginnt bald",
    inMinutes: "in",
    currentIntensity: "Aktuelle Stärke",
    peakRainAt: "Stärkster Regen um",
    nextHours: "Nächste Stunden",
    hourlyForecast: "Stündliche Vorhersage",
    precipitationDetails: "Niederschlagsdetails",
    timeLabel: "Uhrzeit",
    amountLabel: "Menge",
    hours: "Std",
    now: "Jetzt",
    ab: "Ab",
    oclock: "Uhr",
    unknown: "Unbekannt",
    sunny: "Sonnig",
    clear: "Klar",
    partlyCloudy: "Heiter",
    cloudy: "Wolkig",
    overcast: "Bedeckt",
    fog: "Nebel",
    drizzle: "Sprühregen",
    showers: "Regenschauer",
    heavyRain: "Starkregen",
    sleet: "Schneeregen/Eis",
    thunderstorm: "Gewitter",
    today: "Heute",
    tomorrow: "Morgen",
    restOfDay: "Rest des Tages",
    evening: "Der Abend",
    night: "In der Nacht",
    outlook: "Ausblick auf",
    restOfWeek: "Restliche Woche",
    nextWeek: "Ausblick nächste Woche",
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    sunday: "Sonntag",
    // Tutorial
    tutorialSkip: "Überspringen",
    tutorialNext: "Weiter",
    tutorialPrev: "Zurück",
    tutorialFinish: "Los geht's!",
    tutorialWelcomeTitle: "Willkommen zur Wetter-App!",
    tutorialWelcomeDesc: "Lass uns die App gemeinsam einrichten. Du kannst dieses Tutorial jederzeit überspringen.",
    tutorialLangTitle: "Wähle deine Sprache",
    tutorialLangDesc: "Die App unterstützt mehrere Sprachen für dein Wettererlebnis.",
    tutorialHomeTitle: "Setze deinen Heimatort",
    tutorialHomeDesc: "Dein Heimatort wird als Standard-Standort verwendet.",
    tutorialOverviewTitle: "Übersicht Tab",
    tutorialOverviewDesc: "Hier findest du eine detaillierte Übersicht mit Tagesbericht, Niederschlags-Prognose und 7-Tage-Trend.",
    tutorialLongtermTitle: "14-Tage Prognose",
    tutorialLongtermDesc: "Plane voraus mit der erweiterten 14-Tage Wettervorhersage.",
    tutorialRadarTitle: "Niederschlags-Radar",
    tutorialRadarDesc: "Verfolge Regen und Schnee in Echtzeit mit dem interaktiven Radar.",
    tutorialChartTitle: "Vergleichs-Charts",
    tutorialChartDesc: "Vergleiche verschiedene Wettermodelle und analysiere Trends.",
    tutorialTravelTitle: "Reiseplaner",
    tutorialTravelDesc: "Plane deine Reisen und überprüfe die Wetterwahrscheinlichkeit für deinen Ausflug.",
    tutorialSettingsTitle: "Einstellungen",
    tutorialSettingsDesc: "Hier kannst du die Sprache, Einheiten (°C/°F/K), das Design (Hell/Dunkel/Auto) und deinen Heimatort anpassen.",
    tutorialComplete: "Tutorial abgeschlossen! Du kannst jederzeit in den Einstellungen Änderungen vornehmen.",
    noGpsAvailable: "GPS nicht verfügbar",
    locationDenied: "Standortzugriff verweigert",
    changeLocation: "Ort ändern",
    locFound: "Ort gefunden!",
    homeLocation: "Zuhause",
    gpsAvailable: "GPS-Daten verfügbar",
    gpsNotAvailable: "Keine GPS-Daten",
    usingGpsData: "Verwendet GPS-Position",

  },
  en: {
    home: "Home",
    gps: "GPS",
    places: "Places",
    settings: "Settings",
    language: "Language",
    units: "Units",
    theme: "Theme",
    themeAuto: "Auto",
    themeLight: "Light",
    themeDark: "Dark",
    changeHome: "Change Home Location",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    error: "Error",
    reset: "Reset",
    updated: "Updated",
    feelsLike: "Feels like",
    wind: "Wind",
    gusts: "Gusts",
    precip: "Precip",
    precip24h: "Precipitation in the next 24 hours",
    humidity: "Humidity",
    dewPoint: "Dew Pt.",
    uv: "UV",
    pressure: "Pressure",
    visibility: "Visibility",
    airQuality: "Air Quality",
    aqiGood: "Good",
    aqiModerate: "Moderate",
    aqiUnhealthy: "Unhealthy",
    aqiVeryUnhealthy: "Very Unhealthy",
    aqiHazardous: "Hazardous",
    overview: "Overview",
    longterm: "14 Days",
    radar: "Radar",
    compare: "Compare",
    travel: "Travel",
    source: "Data basis & Runtimes (Est.)",
    install: "Install",
    installTitle: "Install App",
    installDesc: "Tap \"Share\" below and then \"Add to Home Screen\".",
    feedback: "Report Weather",
    feedbackTitle: "Report Weather",
    feedbackSend: "Send Feedback",
    feedbackThanks: "Thanks!",
    feedbackDesc: "Your feedback helps us.",
    managePlaces: "Manage Places",
    searchPlace: "Search city...",
    savedPlaces: "Saved Places",
    addCurrent: "Save Current Location",
    myLocation: "My Location",
    homeLoc: "Home Location",
    noPlaces: "No other places.",
    welcome: "Welcome!",
    welcomeDesc: "To start, please set your home location.",
    useGps: "Use Location",
    orSearch: "Or search",
    locFound: "Location found!",
    nameLoc: "What do you want to call this place?",
    saveStart: "Save & Start",
    dailyReport: "Daily Report",
    trend: "7-Day Trend",
    threeDayForecast: "3-Day Forecast",
    precipRadar: "Precipitation Radar",
    modelCheck: "Model Check",
    longtermList: "14-Day List",
    travelPlanner: "Travel Planner",
    travelDesc: "Plan your trip and check weather probability.",
    whereTo: "Where are you going?",
    startDate: "Start Date",
    endDate: "End Date (Optional)",
    startTime: "Start Time",
    endTime: "End Time",
    checkWeather: "Check Weather",
    saveTrip: "Save Trip",
    myTrips: "My Trips",
    tripSaved: "Trip saved!",
    radarCredit: "Radar image provided by Windy.com", // Radar data from Windy.com
    noRain: "Dry",
    rain: "Rain",
    snow: "Snow",
    probability: "Prob.",
    safe: "Safe",
    officialWarning: "Official Warning",
    instruction: "Instruction",
    activeWarnings: "active warning(s)",
    weatherReport: "Weather Report",
    showDetails: "Show Details",
    showLess: "Show Less",
    nextRain: "Next Precipitation",
    rainNow: "Current Precipitation",
    rainSoon: "Rain starting soon",
    noRainExp: "It will remain dry for the next 24h.",
    noPrecipExp: "Currently no precipitation expected",
    startingNow: "starting now",
    startingSoon: "starting soon",
    inMinutes: "in",
    currentIntensity: "Current Intensity",
    peakRainAt: "Peak rain at",
    nextHours: "Next Hours",
    hourlyForecast: "Hourly Forecast",
    precipitationDetails: "Precipitation Details",
    timeLabel: "Time",
    amountLabel: "Amount",
    hours: "hrs",
    now: "Now",
    ab: "From",
    oclock: "",
    unknown: "Unknown",
    sunny: "Sunny",
    clear: "Clear",
    partlyCloudy: "Partly Cloudy",
    cloudy: "Cloudy",
    overcast: "Overcast",
    fog: "Fog",
    drizzle: "Drizzle",
    showers: "Showers",
    heavyRain: "Heavy Rain",
    sleet: "Sleet/Ice",
    thunderstorm: "Thunderstorm",
    today: "Today",
    tomorrow: "Tomorrow",
    restOfDay: "Rest of the day",
    evening: "Evening",
    night: "Overnight",
    outlook: "Outlook for",
    restOfWeek: "Rest of the week",
    nextWeek: "Outlook next week",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    // Tutorial
    tutorialSkip: "Skip",
    tutorialNext: "Next",
    tutorialPrev: "Back",
    tutorialFinish: "Let's go!",
    tutorialWelcomeTitle: "Welcome to Weather App!",
    tutorialWelcomeDesc: "Let's set up the app together. You can skip this tutorial at any time.",
    tutorialLangTitle: "Choose your language",
    tutorialLangDesc: "The app supports multiple languages for your weather experience.",
    tutorialHomeTitle: "Set your home location",
    tutorialHomeDesc: "Your home location will be used as the default location.",
    tutorialOverviewTitle: "Overview Tab",
    tutorialOverviewDesc: "Here you'll find a detailed overview with daily report, precipitation forecast and 7-day trend.",
    tutorialLongtermTitle: "14-Day Forecast",
    tutorialLongtermDesc: "Plan ahead with the extended 14-day weather forecast.",
    tutorialRadarTitle: "Precipitation Radar",
    tutorialRadarDesc: "Track rain and snow in real-time with the interactive radar.",
    tutorialChartTitle: "Comparison Charts",
    tutorialChartDesc: "Compare different weather models and analyze trends.",
    tutorialTravelTitle: "Travel Planner",
    tutorialTravelDesc: "Plan your trips and check weather probability for your excursion.",
    tutorialSettingsTitle: "Settings",
    tutorialSettingsDesc: "Here you can customize language, units (°C/°F/K), theme (Light/Dark/Auto) and your home location.",
    tutorialComplete: "Tutorial complete! You can make changes in settings at any time.",
    noGpsAvailable: "GPS not available",
    locationDenied: "Location access denied",
    changeLocation: "Change location",
    locFound: "Location found!",
    homeLocation: "Home",
    gpsAvailable: "GPS data available",
    gpsNotAvailable: "No GPS data",
    usingGpsData: "Using GPS position",

  },
  fr: {
    home: "Accueil",
    gps: "GPS",
    places: "Lieux",
    settings: "Paramètres",
    language: "Langue",
    units: "Unités",
    theme: "Thème",
    themeAuto: "Auto",
    themeLight: "Clair",
    themeDark: "Sombre",
    changeHome: "Changer le lieu principal",
    save: "Enregistrer",
    cancel: "Annuler",
    loading: "Chargement...",
    error: "Erreur",
    reset: "Réinitialiser",
    updated: "Mis à jour",
    feelsLike: "Ressenti",
    wind: "Vent",
    gusts: "Rafales",
    precip: "Précip.",
    precip24h: "Précipitations dans les prochaines 24 heures",
    humidity: "Humidité",
    dewPoint: "Pt. rosée",
    uv: "UV",
    pressure: "Pression",
    visibility: "Visibilité",
    airQuality: "Qualité de l'air",
    aqiGood: "Bonne",
    aqiModerate: "Moyenne",
    aqiUnhealthy: "Mauvaise",
    aqiVeryUnhealthy: "Très mauvaise",
    aqiHazardous: "Dangereuse",
    overview: "Historique",
    longterm: "14 jours",
    radar: "Radar",
    compare: "Comparer",
    travel: "Voyage",
    source: "Source de données & Délais (Est.)",
    install: "Installer",
    installTitle: "Installer l'app",
    installDesc: "Appuyez sur \"Partager\" ci-dessous puis \"Sur l'écran d'accueil\".",
    feedback: "Signaler la météo",
    feedbackTitle: "Signaler la météo",
    feedbackSend: "Envoyer un avis",
    feedbackThanks: "Merci !",
    feedbackDesc: "Vos commentaires nous aident.",
    managePlaces: "Gérer les lieux",
    searchPlace: "Rechercher une ville...",
    savedPlaces: "Lieux enregistrés",
    addCurrent: "Enregistrer le lieu actuel",
    myLocation: "Ma position",
    homeLoc: "Lieu principal",
    noPlaces: "Aucun autre lieu.",
    welcome: "Bienvenue !",
    welcomeDesc: "Pour commencer, veuillez définir votre lieu principal.",
    useGps: "Utiliser la position",
    orSearch: "Ou rechercher",
    locFound: "Lieu trouvé !",
    nameLoc: "Comment voulez-vous nommer ce lieu ?",
    saveStart: "Enregistrer & Démarrer",
    dailyReport: "Rapport du jour",
    trend: "Tendance 7 jours",
    threeDayForecast: "Prévisions à 3 jours",
    precipRadar: "Radar de précipitations",
    modelCheck: "Vérification modèle",
    longtermList: "Liste 14 jours",
    travelPlanner: "Planificateur de voyage",
    travelDesc: "Planifiez votre sortie et vérifiez les probabilités météo.",
    whereTo: "Où allez-vous ?",
    startDate: "Date de début",
    endDate: "Date de fin (facultatif)",
    startTime: "Heure de début",
    endTime: "Heure de fin",
    checkWeather: "Vérifier la météo",
    saveTrip: "Enregistrer le voyage",
    myTrips: "Mes voyages",
    tripSaved: "Voyage enregistré !",
    radarCredit: "Image radar fournie par Windy.com",
    noRain: "Sec",
    rain: "Pluie",
    snow: "Neige",
    probability: "Prob.",
    safe: "Sûr",
    officialWarning: "Alerte officielle",
    instruction: "Recommandations",
    activeWarnings: "alerte(s) active(s)",
    weatherReport: "Bulletin météo",
    showDetails: "Afficher les détails",
    showLess: "Afficher moins",
    nextRain: "Prochaines précipitations",
    rainNow: "Précipitations actuelles",
    rainSoon: "Pluie imminente",
    noRainExp: "Temps sec pour les prochaines 24h.",
    noPrecipExp: "Aucune précipitation attendue actuellement",
    startingNow: "commence maintenant",
    startingSoon: "commence bientôt",
    inMinutes: "dans",
    currentIntensity: "Intensité actuelle",
    peakRainAt: "Pluie maximale à",
    nextHours: "Prochaines heures",
    hourlyForecast: "Prévisions horaires",
    precipitationDetails: "Détails des précipitations",
    timeLabel: "Heure",
    amountLabel: "Quantité",
    hours: "h",
    now: "Maintenant",
    ab: "À partir de",
    oclock: "h",
    unknown: "Inconnu",
    sunny: "Ensoleillé",
    clear: "Dégagé",
    partlyCloudy: "Partiellement nuageux",
    cloudy: "Nuageux",
    overcast: "Couvert",
    fog: "Brouillard",
    drizzle: "Bruine",
    showers: "Averses",
    heavyRain: "Pluie forte",
    sleet: "Neige fondue/Verglas",
    thunderstorm: "Orage",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    restOfDay: "Reste de la journée",
    evening: "La soirée",
    night: "La nuit",
    outlook: "Perspectives pour",
    restOfWeek: "Reste de la semaine",
    nextWeek: "Perspectives semaine prochaine",
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
    // Tutorial
    tutorialSkip: "Passer",
    tutorialNext: "Suivant",
    tutorialPrev: "Retour",
    tutorialFinish: "C'est parti !",
    tutorialWelcomeTitle: "Bienvenue sur l'app météo !",
    tutorialWelcomeDesc: "Configurons l'application ensemble. Vous pouvez ignorer ce tutoriel à tout moment.",
    tutorialLangTitle: "Choisissez votre langue",
    tutorialLangDesc: "L'application prend en charge plusieurs langues pour votre expérience météo.",
    tutorialHomeTitle: "Définir votre lieu principal",
    tutorialHomeDesc: "Votre lieu principal sera utilisé comme emplacement par défaut.",
    tutorialOverviewTitle: "Onglet Historique",
    tutorialOverviewDesc: "Vous trouverez ici un aperçu détaillé avec rapport quotidien, prévisions de précipitations et tendance sur 7 jours.",
    tutorialLongtermTitle: "Prévisions 14 jours",
    tutorialLongtermDesc: "Planifiez à l'avance avec les prévisions météo étendues sur 14 jours.",
    tutorialRadarTitle: "Radar de précipitations",
    tutorialRadarDesc: "Suivez la pluie et la neige en temps réel avec le radar interactif.",
    tutorialChartTitle: "Graphiques de comparaison",
    tutorialChartDesc: "Comparez différents modèles météo et analysez les tendances.",
    tutorialTravelTitle: "Planificateur de voyage",
    tutorialTravelDesc: "Planifiez vos voyages et vérifiez la probabilité météo pour votre sortie.",
    tutorialSettingsTitle: "Paramètres",
    tutorialSettingsDesc: "Ici vous pouvez personnaliser la langue, les unités (°C/°F/K), le thème (Clair/Sombre/Auto) et votre lieu principal.",
    tutorialComplete: "Tutoriel terminé ! Vous pouvez modifier les paramètres à tout moment.",
    noGpsAvailable: "GPS non disponible",
    locationDenied: "Accès à la localisation refusé",
    changeLocation: "Changer de lieu",
    locFound: "Lieu trouvé !",
    homeLocation: "Maison",
    gpsAvailable: "Données GPS disponibles",
    gpsNotAvailable: "Aucune donnée GPS",
    usingGpsData: "Utilise la position GPS",

  },
  es: {
    home: "Inicio",
    gps: "GPS",
    places: "Lugares",
    settings: "Ajustes",
    language: "Idioma",
    units: "Unidades",
    theme: "Tema",
    themeAuto: "Auto",
    themeLight: "Claro",
    themeDark: "Oscuro",
    changeHome: "Cambiar ubicación principal",
    save: "Guardar",
    cancel: "Cancelar",
    loading: "Cargando...",
    error: "Error",
    reset: "Restablecer",
    updated: "Actualizado",
    feelsLike: "Sensación",
    wind: "Viento",
    gusts: "Ráfagas",
    precip: "Precip.",
    precip24h: "Precipitación en las próximas 24 horas",
    humidity: "Humedad",
    dewPoint: "Pto. rocío",
    uv: "UV",
    pressure: "Presión",
    visibility: "Visibilidad",
    airQuality: "Calidad del aire",
    aqiGood: "Buena",
    aqiModerate: "Moderada",
    aqiUnhealthy: "Mala",
    aqiVeryUnhealthy: "Muy mala",
    aqiHazardous: "Peligrosa",
    overview: "Historial",
    longterm: "14 días",
    radar: "Radar",
    compare: "Comparar",
    travel: "Viaje",
    source: "Fuente de datos & Tiempos (Est.)",
    install: "Instalar",
    installTitle: "Instalar app",
    installDesc: "Toque \"Compartir\" abajo y luego \"Añadir a pantalla de inicio\".",
    feedback: "Reportar clima",
    feedbackTitle: "Reportar clima",
    feedbackSend: "Enviar opinión",
    feedbackThanks: "¡Gracias!",
    feedbackDesc: "Tus comentarios nos ayudan.",
    managePlaces: "Gestionar lugares",
    searchPlace: "Buscar ciudad...",
    savedPlaces: "Lugares guardados",
    addCurrent: "Guardar ubicación actual",
    myLocation: "Mi ubicación",
    homeLoc: "Ubicación principal",
    noPlaces: "No hay otros lugares.",
    welcome: "¡Bienvenido!",
    welcomeDesc: "Para empezar, establezca su ubicación principal.",
    useGps: "Usar ubicación",
    orSearch: "O buscar",
    locFound: "¡Ubicación encontrada!",
    nameLoc: "¿Cómo quieres llamar este lugar?",
    saveStart: "Guardar e Iniciar",
    dailyReport: "Informe diario",
    trend: "Tendencia 7 días",
    threeDayForecast: "Pronóstico de 3 días",
    precipRadar: "Radar de precipitación",
    modelCheck: "Verificación modelo",
    longtermList: "Lista 14 días",
    travelPlanner: "Planificador de viajes",
    travelDesc: "Planifica tu viaje y comprueba la probabilidad meteorológica.",
    whereTo: "¿Adónde vas?",
    startDate: "Fecha de inicio",
    endDate: "Fecha de fin (opcional)",
    startTime: "Hora de inicio",
    endTime: "Hora de fin",
    checkWeather: "Comprobar clima",
    saveTrip: "Guardar viaje",
    myTrips: "Mis viajes",
    tripSaved: "¡Viaje guardado!",
    radarCredit: "Imagen de radar proporcionada por Windy.com",
    noRain: "Seco",
    rain: "Lluvia",
    snow: "Nieve",
    probability: "Prob.",
    safe: "Seguro",
    officialWarning: "Aviso oficial",
    instruction: "Recomendaciones",
    activeWarnings: "aviso(s) activo(s)",
    weatherReport: "Informe meteorológico",
    showDetails: "Mostrar detalles",
    showLess: "Mostrar menos",
    nextRain: "Próximas precipitaciones",
    rainNow: "Precipitación actual",
    rainSoon: "Lluvia inminente",
    noRainExp: "Permanecerá seco durante las próximas 24h.",
    noPrecipExp: "Actualmente no se esperan precipitaciones",
    startingNow: "comienza ahora",
    startingSoon: "comienza pronto",
    inMinutes: "en",
    currentIntensity: "Intensidad actual",
    peakRainAt: "Lluvia máxima a las",
    nextHours: "Próximas horas",
    hourlyForecast: "Previsión horaria",
    precipitationDetails: "Detalles de precipitación",
    timeLabel: "Hora",
    amountLabel: "Cantidad",
    hours: "h",
    now: "Ahora",
    ab: "Desde",
    oclock: "h",
    unknown: "Desconocido",
    sunny: "Soleado",
    clear: "Despejado",
    partlyCloudy: "Parcialmente nublado",
    cloudy: "Nublado",
    overcast: "Cubierto",
    fog: "Niebla",
    drizzle: "Llovizna",
    showers: "Chubascos",
    heavyRain: "Lluvia fuerte",
    sleet: "Aguanieve/Hielo",
    thunderstorm: "Tormenta",
    today: "Hoy",
    tomorrow: "Mañana",
    restOfDay: "Resto del día",
    evening: "La tarde",
    night: "La noche",
    outlook: "Previsión para",
    restOfWeek: "Resto de la semana",
    nextWeek: "Previsión próxima semana",
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
    // Tutorial
    tutorialSkip: "Saltar",
    tutorialNext: "Siguiente",
    tutorialPrev: "Atrás",
    tutorialFinish: "¡Empecemos!",
    tutorialWelcomeTitle: "¡Bienvenido a la app del tiempo!",
    tutorialWelcomeDesc: "Configuremos la aplicación juntos. Puedes omitir este tutorial en cualquier momento.",
    tutorialLangTitle: "Elige tu idioma",
    tutorialLangDesc: "La aplicación admite varios idiomas para tu experiencia meteorológica.",
    tutorialHomeTitle: "Establece tu ubicación principal",
    tutorialHomeDesc: "Tu ubicación principal se utilizará como ubicación predeterminada.",
    tutorialOverviewTitle: "Pestaña Resumen",
    tutorialOverviewDesc: "Aquí encontrarás un resumen detallado con informe diario, pronóstico de precipitaciones y tendencia de 7 días.",
    tutorialLongtermTitle: "Pronóstico de 14 días",
    tutorialLongtermDesc: "Planifica con anticipación con el pronóstico meteorológico extendido de 14 días.",
    tutorialRadarTitle: "Radar de precipitaciones",
    tutorialRadarDesc: "Rastrea lluvia y nieve en tiempo real con el radar interactivo.",
    tutorialChartTitle: "Gráficos de comparación",
    tutorialChartDesc: "Compara diferentes modelos meteorológicos y analiza tendencias.",
    tutorialTravelTitle: "Planificador de viajes",
    tutorialTravelDesc: "Planifica tus viajes y verifica la probabilidad meteorológica para tu excursión.",
    tutorialSettingsTitle: "Ajustes",
    tutorialSettingsDesc: "Aquí puedes personalizar el idioma, unidades (°C/°F/K), tema (Claro/Oscuro/Auto) y tu ubicación principal.",
    tutorialComplete: "¡Tutorial completo! Puedes realizar cambios en los ajustes en cualquier momento.",
    noGpsAvailable: "GPS no disponible",
    locationDenied: "Acceso a ubicación denegado",
    changeLocation: "Cambiar ubicación",
    locFound: "¡Ubicación encontrada!",
    homeLocation: "Casa",
    gpsAvailable: "Datos GPS disponibles",
    gpsNotAvailable: "Sin datos GPS",
    usingGpsData: "Usando posición GPS",

  },
  it: {
    home: "Home",
    gps: "GPS",
    places: "Luoghi",
    settings: "Impostazioni",
    language: "Lingua",
    units: "Unità",
    theme: "Tema",
    themeAuto: "Auto",
    themeLight: "Chiaro",
    themeDark: "Scuro",
    changeHome: "Cambia luogo principale",
    save: "Salva",
    cancel: "Annulla",
    loading: "Caricamento...",
    error: "Errore",
    reset: "Ripristina",
    updated: "Aggiornato",
    feelsLike: "Percepita",
    wind: "Vento",
    gusts: "Raffiche",
    precip: "Precip.",
    precip24h: "Precipitazioni nelle prossime 24 ore",
    humidity: "Umidità",
    dewPoint: "Pto. rugiada",
    uv: "UV",
    pressure: "Pressione",
    visibility: "Visibilità",
    airQuality: "Qualità dell'aria",
    aqiGood: "Buona",
    aqiModerate: "Moderata",
    aqiUnhealthy: "Malsana",
    aqiVeryUnhealthy: "Molto malsana",
    aqiHazardous: "Pericolosa",
    overview: "Storico",
    longterm: "14 giorni",
    radar: "Radar",
    compare: "Confronta",
    travel: "Viaggio",
    source: "Base dati & Tempi (Stim.)",
    install: "Installa",
    installTitle: "Installa app",
    installDesc: "Tocca \"Condividi\" sotto e poi \"Aggiungi a Home\".",
    feedback: "Segnala meteo",
    feedbackTitle: "Segnala meteo",
    feedbackSend: "Invia feedback",
    feedbackThanks: "Grazie!",
    feedbackDesc: "Il tuo feedback ci aiuta.",
    managePlaces: "Gestisci luoghi",
    searchPlace: "Cerca città...",
    savedPlaces: "Luoghi salvati",
    addCurrent: "Salva posizione attuale",
    myLocation: "La mia posizione",
    homeLoc: "Luogo principale",
    noPlaces: "Nessun altro luogo.",
    welcome: "Benvenuto!",
    welcomeDesc: "Per iniziare, imposta il tuo luogo principale.",
    useGps: "Usa posizione",
    orSearch: "O cerca",
    locFound: "Luogo trovato!",
    nameLoc: "Come vuoi chiamare questo luogo?",
    saveStart: "Salva e Avvia",
    dailyReport: "Resoconto giornaliero",
    trend: "Tendenza 7 giorni",
    threeDayForecast: "Previsioni a 3 giorni",
    precipRadar: "Radar precipitazioni",
    modelCheck: "Controllo modello",
    longtermList: "Lista 14 giorni",
    travelPlanner: "Pianificatore viaggi",
    travelDesc: "Pianifica la tua gita e controlla le probabilità meteo.",
    whereTo: "Dove vai?",
    startDate: "Data inizio",
    endDate: "Data fine (opzionale)",
    startTime: "Ora inizio",
    endTime: "Ora fine",
    checkWeather: "Controlla meteo",
    saveTrip: "Salva viaggio",
    myTrips: "I miei viaggi",
    tripSaved: "Viaggio salvato!",
    radarCredit: "Immagine radar fornita da Windy.com",
    noRain: "Asciutto",
    rain: "Pioggia",
    snow: "Neve",
    probability: "Prob.",
    safe: "Sicuro",
    officialWarning: "Avviso ufficiale",
    instruction: "Raccomandazioni",
    activeWarnings: "avviso/i attivo/i",
    weatherReport: "Bollettino meteo",
    showDetails: "Mostra dettagli",
    showLess: "Mostra meno",
    nextRain: "Prossime precipitazioni",
    rainNow: "Precipitazioni attuali",
    rainSoon: "Pioggia imminente",
    noRainExp: "Rimarrà asciutto per le prossime 24h.",
    noPrecipExp: "Attualmente non sono previste precipitazioni",
    startingNow: "inizia ora",
    startingSoon: "inizia presto",
    inMinutes: "tra",
    currentIntensity: "Intensità attuale",
    peakRainAt: "Pioggia massima alle",
    nextHours: "Prossime ore",
    hourlyForecast: "Previsioni orarie",
    precipitationDetails: "Dettagli precipitazioni",
    timeLabel: "Ora",
    amountLabel: "Quantità",
    hours: "ore",
    now: "Adesso",
    ab: "Da",
    oclock: "",
    unknown: "Sconosciuto",
    sunny: "Soleggiato",
    clear: "Sereno",
    partlyCloudy: "Parzialmente nuvoloso",
    cloudy: "Nuvoloso",
    overcast: "Coperto",
    fog: "Nebbia",
    drizzle: "Pioggerella",
    showers: "Rovesci",
    heavyRain: "Pioggia forte",
    sleet: "Nevischio/Ghiaccio",
    thunderstorm: "Temporale",
    today: "Oggi",
    tomorrow: "Domani",
    restOfDay: "Resto della giornata",
    evening: "La sera",
    night: "La notte",
    outlook: "Previsioni per",
    restOfWeek: "Resto della settimana",
    nextWeek: "Previsioni prossima settimana",
    monday: "Lunedì",
    tuesday: "Martedì",
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    sunday: "Domenica",
    // Tutorial
    tutorialSkip: "Salta",
    tutorialNext: "Avanti",
    tutorialPrev: "Indietro",
    tutorialFinish: "Andiamo!",
    tutorialWelcomeTitle: "Benvenuto nell'app meteo!",
    tutorialWelcomeDesc: "Configuriamo l'app insieme. Puoi saltare questo tutorial in qualsiasi momento.",
    tutorialLangTitle: "Scegli la tua lingua",
    tutorialLangDesc: "L'app supporta più lingue per la tua esperienza meteo.",
    tutorialHomeTitle: "Imposta il tuo luogo principale",
    tutorialHomeDesc: "Il tuo luogo principale verrà utilizzato come posizione predefinita.",
    tutorialOverviewTitle: "Scheda Panoramica",
    tutorialOverviewDesc: "Qui troverai una panoramica dettagliata con rapporto giornaliero, previsioni precipitazioni e tendenza 7 giorni.",
    tutorialLongtermTitle: "Previsioni a 14 giorni",
    tutorialLongtermDesc: "Pianifica in anticipo con le previsioni meteo estese a 14 giorni.",
    tutorialRadarTitle: "Radar precipitazioni",
    tutorialRadarDesc: "Traccia pioggia e neve in tempo reale con il radar interattivo.",
    tutorialChartTitle: "Grafici di confronto",
    tutorialChartDesc: "Confronta diversi modelli meteorologici e analizza le tendenze.",
    tutorialTravelTitle: "Pianificatore di viaggio",
    tutorialTravelDesc: "Pianifica i tuoi viaggi e controlla la probabilità meteo per la tua escursione.",
    tutorialSettingsTitle: "Impostazioni",
    tutorialSettingsDesc: "Qui puoi personalizzare lingua, unità (°C/°F/K), tema (Chiaro/Scuro/Auto) e il tuo luogo principale.",
    tutorialComplete: "Tutorial completato! Puoi apportare modifiche nelle impostazioni in qualsiasi momento.",
    noGpsAvailable: "GPS non disponibile",
    locationDenied: "Accesso alla posizione negato",
    changeLocation: "Cambia posizione",
    locFound: "Posizione trovata!",
    homeLocation: "Casa",
    gpsAvailable: "Dati GPS disponibili",
    gpsNotAvailable: "Nessun dato GPS",
    usingGpsData: "Usa posizione GPS",

  },
  tr: {
    home: "Ana Sayfa",
    gps: "GPS",
    places: "Yerler",
    settings: "Ayarlar",
    language: "Dil",
    units: "Birim",
    theme: "Tema",
    themeAuto: "Otomatik",
    themeLight: "Açık",
    themeDark: "Koyu",
    changeHome: "Ana konumu değiştir",
    save: "Kaydet",
    cancel: "İptal",
    loading: "Yükleniyor...",
    error: "Hata",
    reset: "Sıfırla",
    updated: "Güncellendi",
    feelsLike: "Hissedilen",
    wind: "Rüzgar",
    gusts: "Rüzgar hızı",
    precip: "Yağış",
    precip24h: "Önümüzdeki 24 saatte yağış",
    humidity: "Nem",
    dewPoint: "Çiy noktası",
    uv: "UV",
    pressure: "Basınç",
    visibility: "Görüş",
    airQuality: "Hava Kalitesi",
    aqiGood: "İyi",
    aqiModerate: "Orta",
    aqiUnhealthy: "Sağlıksız",
    aqiVeryUnhealthy: "Çok sağlıksız",
    aqiHazardous: "Tehlikeli",
    overview: "Geçmiş",
    longterm: "14 Gün",
    radar: "Radar",
    compare: "Karşılaştır",
    travel: "Seyahat",
    source: "Veri kaynağı & Süreler (Tah.)",
    install: "Yükle",
    installTitle: "Uygulamayı yükle",
    installDesc: "Aşağıdaki \"Paylaş\"a dokunun ve \"Ana Ekrana Ekle\"yi seçin.",
    feedback: "Hava durumunu bildir",
    feedbackTitle: "Hava durumunu bildir",
    feedbackSend: "Geri bildirim gönder",
    feedbackThanks: "Teşekkürler!",
    feedbackDesc: "Geri bildiriminiz bize yardımcı olur.",
    managePlaces: "Yerleri yönet",
    searchPlace: "Şehir ara...",
    savedPlaces: "Kayıtlı yerler",
    addCurrent: "Mevcut konumu kaydet",
    myLocation: "Konumum",
    homeLoc: "Ana konum",
    noPlaces: "Başka yer yok.",
    welcome: "Hoş geldiniz!",
    welcomeDesc: "Başlamak için lütfen ana konumunuzu ayarlayın.",
    useGps: "Konumu kullan",
    orSearch: "Veya ara",
    locFound: "Konum bulundu!",
    nameLoc: "Bu yere ne ad vermek istersiniz?",
    saveStart: "Kaydet ve Başlat",
    dailyReport: "Günlük rapor",
    trend: "7 günlük eğilim",
    threeDayForecast: "3 günlük tahmin",
    precipRadar: "Yağış radarı",
    modelCheck: "Model kontrolü",
    longtermList: "14 günlük liste",
    travelPlanner: "Seyahat planlayıcı",
    travelDesc: "Gezinizi planlayın ve hava durumu olasılığını kontrol edin.",
    whereTo: "Nereye gidiyorsunuz?",
    startDate: "Başlangıç tarihi",
    endDate: "Bitiş tarihi (İsteğe bağlı)",
    startTime: "Başlangıç saati",
    endTime: "Bitiş saati",
    checkWeather: "Hava durumunu kontrol et",
    saveTrip: "Seyahati kaydet",
    myTrips: "Seyahatlerim",
    tripSaved: "Seyahat kaydedildi!",
    radarCredit: "Radar görüntüsü Windy.com tarafından sağlanmıştır",
    noRain: "Kuru",
    rain: "Yağmur",
    snow: "Kar",
    probability: "Olas.",
    safe: "Güvenli",
    officialWarning: "Resmi uyarı",
    instruction: "Tavsiyeler",
    activeWarnings: "aktif uyarı(lar)",
    weatherReport: "Hava durumu raporu",
    showDetails: "Detayları göster",
    showLess: "Daha az göster",
    nextRain: "Sonraki yağış",
    rainNow: "Şu anki yağış",
    rainSoon: "Yağmur yakında başlayacak",
    noRainExp: "Önümüzdeki 24 saat kuru kalacak.",
    noPrecipExp: "Şu anda yağış beklenmemektedir",
    startingNow: "şimdi başlıyor",
    startingSoon: "yakında başlayacak",
    inMinutes: "içinde",
    currentIntensity: "Mevcut yoğunluk",
    peakRainAt: "En yoğun yağış saati",
    nextHours: "Önümüzdeki saatler",
    hourlyForecast: "Saatlik tahmin",
    precipitationDetails: "Yağış detayları",
    timeLabel: "Saat",
    amountLabel: "Miktar",
    hours: "saat",
    now: "Şimdi",
    ab: "İtibaren",
    oclock: "",
    unknown: "Bilinmiyor",
    sunny: "Güneşli",
    clear: "Açık",
    partlyCloudy: "Parçalı bulutlu",
    cloudy: "Bulutlu",
    overcast: "Kapalı",
    fog: "Sis",
    drizzle: "Çisenti",
    showers: "Sağanak",
    heavyRain: "Şiddetli yağmur",
    sleet: "Karla karışık yağmur/Buz",
    thunderstorm: "Fırtına",
    today: "Bugün",
    tomorrow: "Yarın",
    restOfDay: "Günün geri kalanı",
    evening: "Akşam",
    night: "Gece",
    outlook: "İçin tahmin",
    restOfWeek: "Haftanın geri kalanı",
    nextWeek: "Gelecek hafta tahmini",
    monday: "Pazartesi",
    tuesday: "Salı",
    wednesday: "Çarşamba",
    thursday: "Perşembe",
    friday: "Cuma",
    saturday: "Cumartesi",
    sunday: "Pazar",
    // Tutorial
    tutorialSkip: "Atla",
    tutorialNext: "İleri",
    tutorialPrev: "Geri",
    tutorialFinish: "Hadi başlayalım!",
    tutorialWelcomeTitle: "Hava durumu uygulamasına hoş geldiniz!",
    tutorialWelcomeDesc: "Uygulamayı birlikte kuralım. Bu öğreticiyi istediğiniz zaman atlayabilirsiniz.",
    tutorialLangTitle: "Dilinizi seçin",
    tutorialLangDesc: "Uygulama, hava durumu deneyiminiz için birden fazla dili destekler.",
    tutorialHomeTitle: "Ana konumunuzu ayarlayın",
    tutorialHomeDesc: "Ana konumunuz varsayılan konum olarak kullanılacaktır.",
    tutorialOverviewTitle: "Genel Bakış Sekmesi",
    tutorialOverviewDesc: "Burada günlük rapor, yağış tahmini ve 7 günlük trend ile ayrıntılı bir genel bakış bulacaksınız.",
    tutorialLongtermTitle: "14 Günlük Tahmin",
    tutorialLongtermDesc: "Genişletilmiş 14 günlük hava durumu tahmini ile önceden planlayın.",
    tutorialRadarTitle: "Yağış Radarı",
    tutorialRadarDesc: "Etkileşimli radar ile yağmur ve karı gerçek zamanlı olarak takip edin.",
    tutorialChartTitle: "Karşılaştırma Grafikleri",
    tutorialChartDesc: "Farklı hava durumu modellerini karşılaştırın ve trendleri analiz edin.",
    tutorialTravelTitle: "Seyahat Planlayıcı",
    tutorialTravelDesc: "Seyahatlerinizi planlayın ve geziniz için hava durumu olasılığını kontrol edin.",
    tutorialSettingsTitle: "Ayarlar",
    tutorialSettingsDesc: "Burada dil, birimler (°C/°F/K), tema (Açık/Koyu/Otomatik) ve ana konumunuzu özelleştirebilirsiniz.",
    tutorialComplete: "Öğretici tamamlandı! Ayarlarda istediğiniz zaman değişiklik yapabilirsiniz.",
    noGpsAvailable: "GPS mevcut değil",
    locationDenied: "Konum erişimi reddedildi",
    changeLocation: "Konumu değiştir",
    locFound: "Konum bulundu!",
    homeLocation: "Ev",
    gpsAvailable: "GPS verileri mevcut",
    gpsNotAvailable: "GPS verisi yok",
    usingGpsData: "GPS konumunu kullanıyor",

  },
  pl: {
    home: "Start",
    gps: "GPS",
    places: "Miejsca",
    settings: "Ustawienia",
    language: "Język",
    units: "Jednostki",
    theme: "Motyw",
    themeAuto: "Auto",
    themeLight: "Jasny",
    themeDark: "Ciemny",
    changeHome: "Zmień miejsce główne",
    save: "Zapisz",
    cancel: "Anuluj",
    loading: "Ładowanie...",
    error: "Błąd",
    reset: "Resetuj",
    updated: "Zaktualizowano",
    feelsLike: "Odczuwalna",
    wind: "Wiatr",
    gusts: "Porywy",
    precip: "Opady",
    precip24h: "Opady w ciągu najbliższych 24 godzin",
    humidity: "Wilgotność",
    dewPoint: "Pkt rosy",
    uv: "UV",
    pressure: "Ciśnienie",
    visibility: "Widoczność",
    airQuality: "Jakość powietrza",
    aqiGood: "Dobra",
    aqiModerate: "Umiarkowana",
    aqiUnhealthy: "Niezdrowa",
    aqiVeryUnhealthy: "Bardzo niezdrowa",
    aqiHazardous: "Niebezpieczna",
    overview: "Historia",
    longterm: "14 dni",
    radar: "Radar",
    compare: "Porównaj",
    travel: "Podróż",
    source: "Źródło danych & Czasy (Szac.)",
    install: "Zainstaluj",
    installTitle: "Zainstaluj aplikację",
    installDesc: "Dotknij \"Udostępnij\" poniżej, a następnie \"Dodaj do ekranu głównego\".",
    feedback: "Zgłoś pogodę",
    feedbackTitle: "Zgłoś pogodę",
    feedbackSend: "Wyślij opinię",
    feedbackThanks: "Dziękujemy!",
    feedbackDesc: "Twoja opinia nam pomaga.",
    managePlaces: "Zarządzaj miejscami",
    searchPlace: "Szukaj miasta...",
    savedPlaces: "Zapisane miejsca",
    addCurrent: "Zapisz bieżącą lokalizację",
    myLocation: "Moja lokalizacja",
    homeLoc: "Miejsce główne",
    noPlaces: "Brak innych miejsc.",
    welcome: "Witamy!",
    welcomeDesc: "Aby rozpocząć, ustaw swoje miejsce główne.",
    useGps: "Użyj lokalizacji",
    orSearch: "Lub szukaj",
    locFound: "Lokalizacja znaleziona!",
    nameLoc: "Jak chcesz nazwać to miejsce?",
    saveStart: "Zapisz i Rozpocznij",
    dailyReport: "Raport dzienny",
    trend: "Trend 7-dniowy",
    threeDayForecast: "Prognoza 3-dniowa",
    precipRadar: "Radar opadów",
    modelCheck: "Sprawdzenie modelu",
    longtermList: "Lista 14-dniowa",
    travelPlanner: "Planer podróży",
    travelDesc: "Zaplanuj wycieczkę i sprawdź prawdopodobieństwo pogody.",
    whereTo: "Dokąd się wybierasz?",
    startDate: "Data rozpoczęcia",
    endDate: "Data zakończenia (opcjonalnie)",
    startTime: "Godzina rozpoczęcia",
    endTime: "Godzina zakończenia",
    checkWeather: "Sprawdź pogodę",
    saveTrip: "Zapisz podróż",
    myTrips: "Moje podróże",
    tripSaved: "Podróż zapisana!",
    radarCredit: "Obraz radarowy dostarczony przez Windy.com",
    noRain: "Sucho",
    rain: "Deszcz",
    snow: "Śnieg",
    probability: "Prawdop.",
    safe: "Bezpiecznie",
    officialWarning: "Oficjalne ostrzeżenie",
    instruction: "Zalecenia",
    activeWarnings: "aktywne ostrzeżenie/a",
    weatherReport: "Raport pogodowy",
    showDetails: "Pokaż szczegóły",
    showLess: "Pokaż mniej",
    nextRain: "Następne opady",
    rainNow: "Aktualne opady",
    rainSoon: "Deszcz wkrótce",
    noRainExp: "Przez najbliższe 24h pozostanie sucho.",
    noPrecipExp: "Obecnie nie oczekuje się opadów",
    startingNow: "zaczyna się teraz",
    startingSoon: "zaczyna się wkrótce",
    inMinutes: "za",
    currentIntensity: "Obecna intensywność",
    peakRainAt: "Najsilniejszy deszcz o",
    nextHours: "Następne godziny",
    hourlyForecast: "Prognoza godzinowa",
    precipitationDetails: "Szczegóły opadów",
    timeLabel: "Czas",
    amountLabel: "Ilość",
    hours: "godz",
    now: "Teraz",
    ab: "Od",
    oclock: "",
    unknown: "Nieznane",
    sunny: "Słonecznie",
    clear: "Bezchmurnie",
    partlyCloudy: "Częściowo pochmurno",
    cloudy: "Pochmurno",
    overcast: "Zachmurzenie całkowite",
    fog: "Mgła",
    drizzle: "Mżawka",
    showers: "Przelotne opady",
    heavyRain: "Silny deszcz",
    sleet: "Deszcz ze śniegiem/Lód",
    thunderstorm: "Burza",
    today: "Dziś",
    tomorrow: "Jutro",
    restOfDay: "Reszta dnia",
    evening: "Wieczór",
    night: "Noc",
    outlook: "Prognoza na",
    restOfWeek: "Reszta tygodnia",
    nextWeek: "Prognoza na przyszły tydzień",
    monday: "Poniedziałek",
    tuesday: "Wtorek",
    wednesday: "Środa",
    thursday: "Czwartek",
    friday: "Piątek",
    saturday: "Sobota",
    sunday: "Niedziela",
    // Tutorial
    tutorialSkip: "Pomiń",
    tutorialNext: "Dalej",
    tutorialPrev: "Wstecz",
    tutorialFinish: "Zaczynamy!",
    tutorialWelcomeTitle: "Witamy w aplikacji pogodowej!",
    tutorialWelcomeDesc: "Skonfigurujmy aplikację razem. Możesz pominąć ten samouczek w dowolnym momencie.",
    tutorialLangTitle: "Wybierz swój język",
    tutorialLangDesc: "Aplikacja obsługuje wiele języków dla Twojego doświadczenia pogodowego.",
    tutorialHomeTitle: "Ustaw swoją lokalizację domową",
    tutorialHomeDesc: "Twoja lokalizacja domowa będzie używana jako domyślna lokalizacja.",
    tutorialOverviewTitle: "Karta Przegląd",
    tutorialOverviewDesc: "Tutaj znajdziesz szczegółowy przegląd z raportem dziennym, prognozą opadów i trendem 7-dniowym.",
    tutorialLongtermTitle: "Prognoza 14-dniowa",
    tutorialLongtermDesc: "Planuj z wyprzedzeniem dzięki rozszerzonej prognozie pogody na 14 dni.",
    tutorialRadarTitle: "Radar opadów",
    tutorialRadarDesc: "Śledź deszcz i śnieg w czasie rzeczywistym za pomocą interaktywnego radaru.",
    tutorialChartTitle: "Wykresy porównawcze",
    tutorialChartDesc: "Porównaj różne modele pogodowe i analizuj trendy.",
    tutorialTravelTitle: "Planowanie podróży",
    tutorialTravelDesc: "Zaplanuj swoje podróże i sprawdź prawdopodobieństwo pogody dla swojej wycieczki.",
    tutorialSettingsTitle: "Ustawienia",
    tutorialSettingsDesc: "Tutaj możesz dostosować język, jednostki (°C/°F/K), motyw (Jasny/Ciemny/Auto) i swoją lokalizację domową.",
    tutorialComplete: "Samouczek ukończony! Możesz wprowadzać zmiany w ustawieniach w dowolnym momencie.",
    noGpsAvailable: "GPS niedostępny",
    locationDenied: "Dostęp do lokalizacji został odrzucony",
    changeLocation: "Zmień lokalizację",
    locFound: "Lokalizacja znaleziona!",
    homeLocation: "Dom",
    gpsAvailable: "Dane GPS dostępne",
    gpsNotAvailable: "Brak danych GPS",
    usingGpsData: "Używa pozycji GPS",

  },
  nl: {
    home: "Home",
    gps: "GPS",
    places: "Plaatsen",
    settings: "Instellingen",
    language: "Taal",
    units: "Eenheden",
    theme: "Thema",
    themeAuto: "Auto",
    themeLight: "Licht",
    themeDark: "Donker",
    changeHome: "Hoofdlocatie wijzigen",
    save: "Opslaan",
    cancel: "Annuleren",
    loading: "Laden...",
    error: "Fout",
    reset: "Resetten",
    updated: "Bijgewerkt",
    feelsLike: "Gevoelstemperatuur",
    wind: "Wind",
    gusts: "Windstoten",
    precip: "Neerslag",
    precip24h: "Neerslag in de komende 24 uur",
    humidity: "Vochtigheid",
    dewPoint: "Dauwpunt",
    uv: "UV",
    pressure: "Druk",
    visibility: "Zicht",
    airQuality: "Luchtkwaliteit",
    aqiGood: "Goed",
    aqiModerate: "Matig",
    aqiUnhealthy: "Ongezond",
    aqiVeryUnhealthy: "Zeer ongezond",
    aqiHazardous: "Gevaarlijk",
    overview: "Verloop",
    longterm: "14 dagen",
    radar: "Radar",
    compare: "Vergelijken",
    travel: "Reis",
    source: "Gegevensbron & Tijden (Gesch.)",
    install: "Installeren",
    installTitle: "App installeren",
    installDesc: "Tik hieronder op \"Delen\" en vervolgens op \"Zet op beginscherm\".",
    feedback: "Weer melden",
    feedbackTitle: "Weer melden",
    feedbackSend: "Feedback versturen",
    feedbackThanks: "Bedankt!",
    feedbackDesc: "Jouw feedback helpt ons.",
    managePlaces: "Plaatsen beheren",
    searchPlace: "Stad zoeken...",
    savedPlaces: "Opgeslagen plaatsen",
    addCurrent: "Huidige locatie opslaan",
    myLocation: "Mijn locatie",
    homeLoc: "Hoofdlocatie",
    noPlaces: "Geen andere plaatsen.",
    welcome: "Welkom!",
    welcomeDesc: "Om te beginnen, stel je hoofdlocatie in.",
    useGps: "Locatie gebruiken",
    orSearch: "Of zoeken",
    locFound: "Locatie gevonden!",
    nameLoc: "Hoe wil je deze plaats noemen?",
    saveStart: "Opslaan & Starten",
    dailyReport: "Dagrapport",
    trend: "7-daagse trend",
    threeDayForecast: "3-daagse voorspelling",
    precipRadar: "Neerslagradar",
    modelCheck: "Modelcontrole",
    longtermList: "14-daagse lijst",
    travelPlanner: "Reisplanner",
    travelDesc: "Plan je uitstapje en controleer de weerskans.",
    whereTo: "Waar ga je heen?",
    startDate: "Startdatum",
    endDate: "Einddatum (optioneel)",
    startTime: "Starttijd",
    endTime: "Eindtijd",
    checkWeather: "Weer controleren",
    saveTrip: "Reis opslaan",
    myTrips: "Mijn reizen",
    tripSaved: "Reis opgeslagen!",
    radarCredit: "Radarbeeld geleverd door Windy.com",
    noRain: "Droog",
    rain: "Regen",
    snow: "Sneeuw",
    probability: "Kans",
    safe: "Veilig",
    officialWarning: "Officiële waarschuwing",
    instruction: "Aanbevelingen",
    activeWarnings: "actieve waarschuwing(en)",
    weatherReport: "Weerbericht",
    showDetails: "Details tonen",
    showLess: "Minder tonen",
    nextRain: "Volgende neerslag",
    rainNow: "Huidige neerslag",
    rainSoon: "Regen begint binnenkort",
    noRainExp: "Het blijft de komende 24u droog.",
    noPrecipExp: "Momenteel geen neerslag verwacht",
    startingNow: "begint nu",
    startingSoon: "begint binnenkort",
    inMinutes: "over",
    currentIntensity: "Huidige intensiteit",
    peakRainAt: "Zwaarste regen om",
    nextHours: "Volgende uren",
    hourlyForecast: "Uurlijkse voorspelling",
    precipitationDetails: "Neerslagdetails",
    timeLabel: "Tijd",
    amountLabel: "Hoeveelheid",
    hours: "uur",
    now: "Nu",
    ab: "Vanaf",
    oclock: "uur",
    unknown: "Onbekend",
    sunny: "Zonnig",
    clear: "Helder",
    partlyCloudy: "Halfbewolkt",
    cloudy: "Bewolkt",
    overcast: "Zwaar bewolkt",
    fog: "Mist",
    drizzle: "Motregen",
    showers: "Buien",
    heavyRain: "Zware regen",
    sleet: "Natte sneeuw/IJs",
    thunderstorm: "Onweer",
    today: "Vandaag",
    tomorrow: "Morgen",
    restOfDay: "Rest van de dag",
    evening: "De avond",
    night: "De nacht",
    outlook: "Vooruitzicht voor",
    restOfWeek: "Rest van de week",
    nextWeek: "Vooruitzicht volgende week",
    monday: "Maandag",
    tuesday: "Dinsdag",
    wednesday: "Woensdag",
    thursday: "Donderdag",
    friday: "Vrijdag",
    saturday: "Zaterdag",
    sunday: "Zondag",
    // Tutorial
    tutorialSkip: "Overslaan",
    tutorialNext: "Volgende",
    tutorialPrev: "Terug",
    tutorialFinish: "Laten we gaan!",
    tutorialWelcomeTitle: "Welkom bij de weer-app!",
    tutorialWelcomeDesc: "Laten we de app samen instellen. U kunt deze handleiding op elk moment overslaan.",
    tutorialLangTitle: "Kies uw taal",
    tutorialLangDesc: "De app ondersteunt meerdere talen voor uw weerervaring.",
    tutorialHomeTitle: "Stel uw thuislocatie in",
    tutorialHomeDesc: "Uw thuislocatie wordt gebruikt als standaardlocatie.",
    tutorialOverviewTitle: "Overzicht-tabblad",
    tutorialOverviewDesc: "Hier vindt u een gedetailleerd overzicht met dagrapport, neerslagverwachting en 7-daagse trend.",
    tutorialLongtermTitle: "14-daagse voorspelling",
    tutorialLongtermDesc: "Plan vooruit met de uitgebreide weersvoorspelling van 14 dagen.",
    tutorialRadarTitle: "Neerslag Radar",
    tutorialRadarDesc: "Volg regen en sneeuw in realtime met de interactieve radar.",
    tutorialChartTitle: "Vergelijkingsgrafieken",
    tutorialChartDesc: "Vergelijk verschillende weermodellen en analyseer trends.",
    tutorialTravelTitle: "Reisplanner",
    tutorialTravelDesc: "Plan uw reizen en controleer de weerskans voor uw excursie.",
    tutorialSettingsTitle: "Instellingen",
    tutorialSettingsDesc: "Hier kunt u de taal, eenheden (°C/°F/K), thema (Licht/Donker/Auto) en uw thuislocatie aanpassen.",
    tutorialComplete: "Handleiding voltooid! U kunt op elk moment wijzigingen aanbrengen in de instellingen.",
    noGpsAvailable: "GPS niet beschikbaar",
    locationDenied: "Toegang tot locatie geweigerd",
    changeLocation: "Locatie wijzigen",
    locFound: "Locatie gevonden!",
    homeLocation: "Thuis",
    gpsAvailable: "GPS-gegevens beschikbaar",
    gpsNotAvailable: "Geen GPS-gegevens",
    usingGpsData: "Gebruikt GPS-positie",

  },
  hr: {
    home: "Početna",
    gps: "GPS",
    places: "Mjesta",
    settings: "Postavke",
    language: "Jezik",
    units: "Jedinice",
    theme: "Tema",
    themeAuto: "Automatski",
    themeLight: "Svijetla",
    themeDark: "Tamna",
    changeHome: "Promijeni glavnu lokaciju",
    save: "Spremi",
    cancel: "Odustani",
    loading: "Učitavanje...",
    error: "Greška",
    reset: "Resetiraj",
    updated: "Ažurirano",
    feelsLike: "Osjeća se",
    wind: "Vjetar",
    gusts: "Udari",
    precip: "Oborina",
    precip24h: "Oborina u sljedećih 24 sata",
    humidity: "Vlažnost",
    dewPoint: "Rosište",
    uv: "UV",
    pressure: "Tlak",
    visibility: "Vidljivost",
    airQuality: "Kvaliteta zraka",
    aqiGood: "Dobra",
    aqiModerate: "Umjerena",
    aqiUnhealthy: "Nezdravo",
    aqiVeryUnhealthy: "Vrlo nezdravo",
    aqiHazardous: "Opasno",
    overview: "Pregled",
    longterm: "14 dana",
    radar: "Radar",
    compare: "Usporedi",
    travel: "Putovanje",
    source: "Izvor podataka & Vremena (Procj.)",
    install: "Instaliraj",
    installTitle: "Instaliraj aplikaciju",
    installDesc: "Dodirnite \"Podijeli\" ispod, a zatim \"Dodaj na početni zaslon\".",
    feedback: "Prijavi vrijeme",
    feedbackTitle: "Prijavi vrijeme",
    feedbackSend: "Pošalji povratnu informaciju",
    feedbackThanks: "Hvala!",
    feedbackDesc: "Vaše mišljenje nam pomaže.",
    managePlaces: "Upravljaj mjestima",
    searchPlace: "Traži grad...",
    savedPlaces: "Spremljena mjesta",
    addCurrent: "Spremi trenutnu lokaciju",
    myLocation: "Moja lokacija",
    homeLoc: "Glavna lokacija",
    noPlaces: "Nema drugih mjesta.",
    welcome: "Dobrodošli!",
    welcomeDesc: "Za početak, postavite svoju glavnu lokaciju.",
    useGps: "Koristi lokaciju",
    orSearch: "Ili traži",
    locFound: "Lokacija pronađena!",
    nameLoc: "Kako želite nazvati ovo mjesto?",
    saveStart: "Spremi i Pokreni",
    dailyReport: "Dnevno izvješće",
    trend: "7-dnevni trend",
    threeDayForecast: "3-dnevna prognoza",
    precipRadar: "Radar oborine",
    modelCheck: "Provjera modela",
    longtermList: "14-dnevni popis",
    travelPlanner: "Planer putovanja",
    travelDesc: "Planirajte izlet i provjerite vjerojatnost vremena.",
    whereTo: "Kamo idete?",
    startDate: "Datum početka",
    endDate: "Datum završetka (opcionalno)",
    startTime: "Vrijeme početka",
    endTime: "Vrijeme završetka",
    checkWeather: "Provjeri vrijeme",
    saveTrip: "Spremi putovanje",
    myTrips: "Moja putovanja",
    tripSaved: "Putovanje spremljeno!",
    radarCredit: "Radarsku sliku omogućio Windy.com",
    noRain: "Suho",
    rain: "Kiša",
    snow: "Snijeg",
    probability: "Vjeroj.",
    safe: "Sigurno",
    officialWarning: "Službeno upozorenje",
    instruction: "Preporuke",
    activeWarnings: "aktivno/a upozorenje/a",
    weatherReport: "Vremenska prognoza",
    showDetails: "Prikaži detalje",
    showLess: "Prikaži manje",
    nextRain: "Sljedeća oborina",
    rainNow: "Trenutna oborina",
    rainSoon: "Kiša uskoro počinje",
    noRainExp: "Ostat će suho sljedećih 24h.",
    noPrecipExp: "Trenutno se ne očekuje oborina",
    startingNow: "počinje sada",
    startingSoon: "uskoro počinje",
    inMinutes: "za",
    currentIntensity: "Trenutni intenzitet",
    peakRainAt: "Najjača kiša u",
    nextHours: "Sljedeći sati",
    hourlyForecast: "Satna prognoza",
    precipitationDetails: "Detalji o oborinama",
    timeLabel: "Vrijeme",
    amountLabel: "Količina",
    hours: "sati",
    now: "Sada",
    ab: "Od",
    oclock: "h",
    unknown: "Nepoznato",
    sunny: "Sunčano",
    clear: "Vedro",
    partlyCloudy: "Djelomično oblačno",
    cloudy: "Oblačno",
    overcast: "Potpuno oblačno",
    fog: "Magla",
    drizzle: "Sitna kiša",
    showers: "Pljuskovi",
    heavyRain: "Jaka kiša",
    sleet: "Susnježica/Led",
    thunderstorm: "Grmljavina",
    today: "Danas",
    tomorrow: "Sutra",
    restOfDay: "Ostatak dana",
    evening: "Večer",
    night: "Noć",
    outlook: "Izgledi za",
    restOfWeek: "Ostatak tjedna",
    nextWeek: "Izgledi sljedećeg tjedna",
    monday: "Ponedjeljak",
    tuesday: "Utorak",
    wednesday: "Srijeda",
    thursday: "Četvrtak",
    friday: "Petak",
    saturday: "Subota",
    sunday: "Nedjelja",
    // Tutorial
    tutorialSkip: "Preskoči",
    tutorialNext: "Sljedeće",
    tutorialPrev: "Natrag",
    tutorialFinish: "Krenimo!",
    tutorialWelcomeTitle: "Dobrodošli u aplikaciju za vrijeme!",
    tutorialWelcomeDesc: "Postavimo aplikaciju zajedno. Možete preskočiti ovaj vodič u bilo kojem trenutku.",
    tutorialLangTitle: "Odaberite svoj jezik",
    tutorialLangDesc: "Aplikacija podržava više jezika za vaše vremensko iskustvo.",
    tutorialHomeTitle: "Postavite svoju osnovnu lokaciju",
    tutorialHomeDesc: "Vaša osnovna lokacija će se koristiti kao zadana lokacija.",
    tutorialOverviewTitle: "Kartica pregleda",
    tutorialOverviewDesc: "Ovdje ćete pronaći detaljan pregled s dnevnim izvješćem, prognozom oborina i 7-dnevnim trendom.",
    tutorialLongtermTitle: "14-dnevna prognoza",
    tutorialLongtermDesc: "Planirajte unaprijed s proširenom vremenskom prognozom od 14 dana.",
    tutorialRadarTitle: "Radar oborina",
    tutorialRadarDesc: "Pratite kišu i snijeg u stvarnom vremenu s interaktivnim radarom.",
    tutorialChartTitle: "Grafikoni usporedbe",
    tutorialChartDesc: "Usporedite različite vremenske modele i analizirajte trendove.",
    tutorialTravelTitle: "Planer putovanja",
    tutorialTravelDesc: "Planirajte svoja putovanja i provjerite vremensku vjerojatnost za vaš izlet.",
    tutorialSettingsTitle: "Postavke",
    tutorialSettingsDesc: "Ovdje možete prilagoditi jezik, jedinice (°C/°F/K), temu (Svijetla/Tamna/Auto) i svoju osnovnu lokaciju.",
    tutorialComplete: "Vodič završen! Možete napraviti promjene u postavkama u bilo kojem trenutku.",
    noGpsAvailable: "GPS nije dostupan",
    locationDenied: "Pristup lokaciji odbijen",
    changeLocation: "Promijenite lokaciju",
    locFound: "Lokacija pronađena!",
    homeLocation: "Kuća",
    gpsAvailable: "GPS podaci dostupni",
    gpsNotAvailable: "Nema GPS podataka",
    usingGpsData: "Koristi GPS poziciju",

  },
  el: {
    home: "Αρχική",
    gps: "GPS",
    places: "Τοποθεσίες",
    settings: "Ρυθμίσεις",
    language: "Γλώσσα",
    units: "Μονάδες",
    theme: "Θέμα",
    themeAuto: "Αυτόματο",
    themeLight: "Φωτεινό",
    themeDark: "Σκοτεινό",
    changeHome: "Αλλαγή κύριας τοποθεσίας",
    save: "Αποθήκευση",
    cancel: "Ακύρωση",
    loading: "Φόρτωση...",
    error: "Σφάλμα",
    reset: "Επαναφορά",
    updated: "Ενημερώθηκε",
    feelsLike: "Αίσθηση",
    wind: "Άνεμος",
    gusts: "Ριπές",
    precip: "Βροχή",
    precip24h: "Κατακρημνίσματα τις επόμενες 24 ώρες",
    humidity: "Υγρασία",
    dewPoint: "Σημείο δρόσου",
    uv: "UV",
    pressure: "Πίεση",
    visibility: "Ορατότητα",
    airQuality: "Ποιότητα αέρα",
    aqiGood: "Καλή",
    aqiModerate: "Μέτρια",
    aqiUnhealthy: "Ανθυγιεινή",
    aqiVeryUnhealthy: "Πολύ ανθυγιεινή",
    aqiHazardous: "Επικίνδυνη",
    overview: "Ιστορικό",
    longterm: "14 ημέρες",
    radar: "Radar",
    compare: "Σύγκριση",
    travel: "Ταξίδι",
    source: "Πηγή δεδομένων & Χρόνοι (Εκτ.)",
    install: "Εγκατάσταση",
    installTitle: "Εγκατάσταση εφαρμογής",
    installDesc: "Πατήστε \"Κοινοποίηση\" παρακάτω και μετά \"Προσθήκη στην αρχική οθόνη\".",
    feedback: "Αναφορά καιρού",
    feedbackTitle: "Αναφορά καιρού",
    feedbackSend: "Αποστολή σχολίων",
    feedbackThanks: "Ευχαριστούμε!",
    feedbackDesc: "Τα σχόλιά σας μας βοηθούν.",
    managePlaces: "Διαχείριση τοποθεσιών",
    searchPlace: "Αναζήτηση πόλης...",
    savedPlaces: "Αποθηκευμένες τοποθεσίες",
    addCurrent: "Αποθήκευση τρέχουσας τοποθεσίας",
    myLocation: "Η τοποθεσία μου",
    homeLoc: "Κύρια τοποθεσία",
    noPlaces: "Καμία άλλη τοποθεσία.",
    welcome: "Καλώς ήρθατε!",
    welcomeDesc: "Για να ξεκινήσετε, ορίστε την κύρια τοποθεσία σας.",
    useGps: "Χρήση τοποθεσίας",
    orSearch: "Ή αναζητήστε",
    locFound: "Βρέθηκε τοποθεσία!",
    nameLoc: "Πώς θέλετε να ονομάσετε αυτό το μέρος;",
    saveStart: "Αποθήκευση & Έναρξη",
    dailyReport: "Ημερήσια αναφορά",
    trend: "Τάση 7 ημερών",
    precipRadar: "Radar κατακρημνισμάτων",
    modelCheck: "Έλεγχος μοντέλου",
    longtermList: "Λίστα 14 ημερών",
    travelPlanner: "Σχεδιαστής ταξιδιού",
    travelDesc: "Σχεδιάστε την εκδρομή σας και ελέγξτε την πιθανότητα καιρού.",
    whereTo: "Πού πηγαίνετε;",
    startDate: "Ημερομηνία έναρξης",
    endDate: "Ημερομηνία λήξης (προαιρετικά)",
    startTime: "Ώρα έναρξης",
    endTime: "Ώρα λήξης",
    checkWeather: "Έλεγχος καιρού",
    saveTrip: "Αποθήκευση ταξιδιού",
    myTrips: "Τα ταξίδια μου",
    tripSaved: "Το ταξίδι αποθηκεύτηκε!",
    radarCredit: "Εικόνα radar παρέχεται από το Windy.com",
    noRain: "Στεγνό",
    rain: "Βροχή",
    snow: "Χιόνι",
    probability: "Πιθαν.",
    safe: "Ασφαλές",
    officialWarning: "Επίσημη προειδοποίηση",
    instruction: "Συστάσεις",
    activeWarnings: "ενεργή/ές προειδοποίηση/εις",
    weatherReport: "Δελτίο καιρού",
    showDetails: "Εμφάνιση λεπτομερειών",
    showLess: "Εμφάνιση λιγότερων",
    nextRain: "Επόμενη βροχή",
    rainNow: "Τρέχοντα κατακρημνίσματα",
    rainSoon: "Η βροχή ξεκινά σύντομα",
    noRainExp: "Θα παραμείνει στεγνό τις επόμενες 24 ώρες.",
    noPrecipExp: "Δεν αναμένονται επί του παρόντος κατακρημνίσματα",
    startingNow: "ξεκινά τώρα",
    startingSoon: "ξεκινά σύντομα",
    inMinutes: "σε",
    currentIntensity: "Τρέχουσα ένταση",
    peakRainAt: "Μέγιστη βροχή στις",
    nextHours: "Επόμενες ώρες",
    hourlyForecast: "Ωριαία πρόβλεψη",
    precipitationDetails: "Λεπτομέρειες κατακρημνισμάτων",
    timeLabel: "Ώρα",
    amountLabel: "Ποσότητα",
    hours: "ώρες",
    now: "Τώρα",
    ab: "Από",
    oclock: "",
    unknown: "Άγνωστο",
    sunny: "Ηλιόλουστος",
    clear: "Καθαρός",
    partlyCloudy: "Μερικώς νεφελώδης",
    cloudy: "Συννεφιασμένος",
    overcast: "Καλυμμένος",
    fog: "Ομίχλη",
    drizzle: "Ψιλόβροχο",
    showers: "Μπόρες",
    heavyRain: "Δυνατή βροχή",
    sleet: "Χιονόνερο/Πάγος",
    thunderstorm: "Καταιγίδα",
    today: "Σήμερα",
    tomorrow: "Αύριο",
    restOfDay: "Υπόλοιπο ημέρας",
    evening: "Το βράδυ",
    night: "Τη νύχτα",
    outlook: "Προοπτική για",
    restOfWeek: "Υπόλοιπο εβδομάδας",
    nextWeek: "Προοπτική επόμενης εβδομάδας",
    monday: "Δευτέρα",
    tuesday: "Τρίτη",
    wednesday: "Τετάρτη",
    thursday: "Πέμπτη",
    friday: "Παρασκευή",
    saturday: "Σάββατο",
    sunday: "Κυριακή",
    // Tutorial
    tutorialSkip: "Παράλειψη",
    tutorialNext: "Επόμενο",
    tutorialPrev: "Πίσω",
    tutorialFinish: "Πάμε!",
    tutorialWelcomeTitle: "Καλώς ήρθατε στην εφαρμογή καιρού!",
    tutorialWelcomeDesc: "Ας ρυθμίσουμε την εφαρμογή μαζί. Μπορείτε να παραλείψετε αυτό το σεμινάριο ανά πάσα στιγμή.",
    tutorialLangTitle: "Επιλέξτε τη γλώσσα σας",
    tutorialLangDesc: "Η εφαρμογή υποστηρίζει πολλές γλώσσες για την εμπειρία καιρού σας.",
    tutorialHomeTitle: "Ορίστε την κύρια τοποθεσία σας",
    tutorialHomeDesc: "Η κύρια τοποθεσία σας θα χρησιμοποιηθεί ως προεπιλεγμένη τοποθεσία.",
    tutorialOverviewTitle: "Καρτέλα Επισκόπησης",
    tutorialOverviewDesc: "Εδώ θα βρείτε μια λεπτομερή επισκόπηση με ημερήσια αναφορά, πρόβλεψη βροχόπτωσης και 7ήμερη τάση.",
    tutorialLongtermTitle: "Πρόβλεψη 14 ημερών",
    tutorialLongtermDesc: "Σχεδιάστε εκ των προτέρων με την εκτεταμένη πρόβλεψη καιρού 14 ημερών.",
    tutorialRadarTitle: "Ραντάρ βροχόπτωσης",
    tutorialRadarDesc: "Παρακολουθήστε τη βροχή και το χιόνι σε πραγματικό χρόνο με το διαδραστικό ραντάρ.",
    tutorialChartTitle: "Γραφήματα σύγκρισης",
    tutorialChartDesc: "Συγκρίνετε διαφορετικά μοντέλα καιρού και αναλύστε τις τάσεις.",
    tutorialTravelTitle: "Σχεδιαστής ταξιδιού",
    tutorialTravelDesc: "Σχεδιάστε τα ταξίδια σας και ελέγξτε την πιθανότητα καιρού για την εκδρομή σας.",
    tutorialSettingsTitle: "Ρυθμίσεις",
    tutorialSettingsDesc: "Εδώ μπορείτε να προσαρμόσετε τη γλώσσα, τις μονάδες (°C/°F/K), το θέμα (Φωτεινό/Σκοτεινό/Αυτόματο) και την κύρια τοποθεσία σας.",
    tutorialComplete: "Το σεμινάριο ολοκληρώθηκε! Μπορείτε να κάνετε αλλαγές στις ρυθμίσεις ανά πάσα στιγμή.",
    noGpsAvailable: "Το GPS δεν είναι διαθέσιμο",
    locationDenied: "Η πρόσβαση στην τοποθεσία απορρίφθηκε",
    changeLocation: "Αλλαγή τοποθεσίας",
    locFound: "Η τοποθεσία βρέθηκε!",
    homeLocation: "Σπίτι",
    gpsAvailable: "Διαθέσιμα δεδομένα GPS",
    gpsNotAvailable: "Χωρίς δεδομένα GPS",
    usingGpsData: "Χρήση θέσης GPS",

  },
  da: {
    home: "Hjem",
    gps: "GPS",
    places: "Steder",
    settings: "Indstillinger",
    language: "Sprog",
    units: "Enheder",
    theme: "Tema",
    themeAuto: "Auto",
    themeLight: "Lys",
    themeDark: "Mørk",
    changeHome: "Skift hovedplacering",
    save: "Gem",
    cancel: "Annuller",
    loading: "Indlæser...",
    error: "Fejl",
    reset: "Nulstil",
    updated: "Opdateret",
    feelsLike: "Føles som",
    wind: "Vind",
    gusts: "Vindstød",
    precip: "Nedbør",
    precip24h: "Nedbør i de næste 24 timer",
    humidity: "Fugtighed",
    dewPoint: "Dugpunkt",
    uv: "UV",
    pressure: "Tryk",
    visibility: "Sigtbarhed",
    airQuality: "Luftkvalitet",
    aqiGood: "God",
    aqiModerate: "Moderat",
    aqiUnhealthy: "Usund",
    aqiVeryUnhealthy: "Meget usund",
    aqiHazardous: "Farlig",
    overview: "Oversigt",
    longterm: "14 dage",
    radar: "Radar",
    compare: "Sammenlign",
    travel: "Rejse",
    source: "Datakilde & Tider (Skøn)",
    install: "Installer",
    installTitle: "Installer app",
    installDesc: "Tryk på \"Del\" nedenfor og derefter \"Føj til hjemmeskærm\".",
    feedback: "Rapporter vejr",
    feedbackTitle: "Rapporter vejr",
    feedbackSend: "Send feedback",
    feedbackThanks: "Tak!",
    feedbackDesc: "Din feedback hjælper os.",
    managePlaces: "Administrer steder",
    searchPlace: "Søg by...",
    savedPlaces: "Gemte steder",
    addCurrent: "Gem nuværende placering",
    myLocation: "Min placering",
    homeLoc: "Hovedplacering",
    noPlaces: "Ingen andre steder.",
    welcome: "Velkommen!",
    welcomeDesc: "For at starte, indstil venligst din hovedplacering.",
    useGps: "Brug placering",
    orSearch: "Eller søg",
    locFound: "Placering fundet!",
    nameLoc: "Hvad vil du kalde dette sted?",
    saveStart: "Gem & Start",
    dailyReport: "Dagsrapport",
    trend: "7-dages trend",
    threeDayForecast: "3-dages prognose",
    precipRadar: "Nedbørsradar",
    modelCheck: "Modeltjek",
    longtermList: "14-dages liste",
    travelPlanner: "Rejseplanlægger",
    travelDesc: "Planlæg din tur og tjek vejrsandsynligheden.",
    whereTo: "Hvor skal du hen?",
    startDate: "Startdato",
    endDate: "Slutdato (valgfrit)",
    startTime: "Starttidspunkt",
    endTime: "Sluttidspunkt",
    checkWeather: "Tjek vejr",
    saveTrip: "Gem rejse",
    myTrips: "Mine rejser",
    tripSaved: "Rejse gemt!",
    radarCredit: "Radarbillede leveret af Windy.com",
    noRain: "Tørt",
    rain: "Regn",
    snow: "Sne",
    probability: "Sandsynl.",
    safe: "Sikkert",
    officialWarning: "Officiel advarsel",
    instruction: "Anbefalinger",
    activeWarnings: "aktiv(e) advarsel(er)",
    weatherReport: "Vejrrapport",
    showDetails: "Vis detaljer",
    showLess: "Vis mindre",
    nextRain: "Næste nedbør",
    rainNow: "Nuværende nedbør",
    rainSoon: "Regn starter snart",
    noRainExp: "Det forbliver tørt de næste 24 timer.",
    noPrecipExp: "I øjeblikket forventes ingen nedbør",
    startingNow: "starter nu",
    startingSoon: "starter snart",
    inMinutes: "om",
    currentIntensity: "Nuværende intensitet",
    peakRainAt: "Kraftigste regn kl.",
    nextHours: "Næste timer",
    hourlyForecast: "Timeprognose",
    precipitationDetails: "Nedbørsdetaljer",
    timeLabel: "Tid",
    amountLabel: "Mængde",
    hours: "timer",
    now: "Nu",
    ab: "Fra",
    oclock: "",
    unknown: "Ukendt",
    sunny: "Solrigt",
    clear: "Klart",
    partlyCloudy: "Delvist skyet",
    cloudy: "Skyet",
    overcast: "Overskyet",
    fog: "Tåge",
    drizzle: "Støvregn",
    showers: "Byger",
    heavyRain: "Kraftig regn",
    sleet: "Slud/Is",
    thunderstorm: "Tordenvejr",
    today: "I dag",
    tomorrow: "I morgen",
    restOfDay: "Resten af dagen",
    evening: "Aftenen",
    night: "Natten",
    outlook: "Udsigt for",
    restOfWeek: "Resten af ugen",
    nextWeek: "Udsigt næste uge",
    monday: "Mandag",
    tuesday: "Tirsdag",
    wednesday: "Onsdag",
    thursday: "Torsdag",
    friday: "Fredag",
    saturday: "Lørdag",
    sunday: "Søndag",
    // Tutorial
    tutorialSkip: "Spring over",
    tutorialNext: "Næste",
    tutorialPrev: "Tilbage",
    tutorialFinish: "Lad os komme i gang!",
    tutorialWelcomeTitle: "Velkommen til vejr-appen!",
    tutorialWelcomeDesc: "Lad os konfigurere appen sammen. Du kan springe denne vejledning over når som helst.",
    tutorialLangTitle: "Vælg dit sprog",
    tutorialLangDesc: "Appen understøtter flere sprog til din vejroplevelse.",
    tutorialHomeTitle: "Indstil din hjemmeplacering",
    tutorialHomeDesc: "Din hjemmeplacering vil blive brugt som standardplacering.",
    tutorialOverviewTitle: "Oversigtsfane",
    tutorialOverviewDesc: "Her finder du en detaljeret oversigt med daglig rapport, nedbørsprognose og 7-dages tendens.",
    tutorialLongtermTitle: "14-dages prognose",
    tutorialLongtermDesc: "Planlæg forud med den udvidede vejrudsigt på 14 dage.",
    tutorialRadarTitle: "Nedbørsradar",
    tutorialRadarDesc: "Spor regn og sne i realtid med den interaktive radar.",
    tutorialChartTitle: "Sammenligningsdiagrammer",
    tutorialChartDesc: "Sammenlign forskellige vejrmodeller og analyser tendenser.",
    tutorialTravelTitle: "Rejseplanlægger",
    tutorialTravelDesc: "Planlæg dine ture og tjek vejrsandsynligheden for din udflugt.",
    tutorialSettingsTitle: "Indstillinger",
    tutorialSettingsDesc: "Her kan du tilpasse sprog, enheder (°C/°F/K), tema (Lys/Mørk/Auto) og din hjemmeplacering.",
    tutorialComplete: "Vejledning fuldført! Du kan foretage ændringer i indstillingerne når som helst.",
    noGpsAvailable: "GPS ikke tilgængelig",
    locationDenied: "Adgang til placering nægtet",
    changeLocation: "Skift placering",
    locFound: "Placering fundet!",
    homeLocation: "Hjem",
    gpsAvailable: "GPS-data tilgængelige",
    gpsNotAvailable: "Ingen GPS-data",
    usingGpsData: "Bruger GPS-position",

  },
  ru: {
    home: "Главная",
    gps: "GPS",
    places: "Места",
    settings: "Настройки",
    language: "Язык",
    units: "Единицы",
    theme: "Тема",
    themeAuto: "Авто",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    changeHome: "Изменить основное местоположение",
    save: "Сохранить",
    cancel: "Отмена",
    loading: "Загрузка...",
    error: "Ошибка",
    reset: "Сброс",
    updated: "Обновлено",
    feelsLike: "Ощущается",
    wind: "Ветер",
    gusts: "Порывы",
    precip: "Осадки",
    precip24h: "Осадки в ближайшие 24 часа",
    humidity: "Влажность",
    dewPoint: "Точка росы",
    uv: "УФ",
    pressure: "Давление",
    visibility: "Видимость",
    airQuality: "Качество воздуха",
    aqiGood: "Хорошее",
    aqiModerate: "Умеренное",
    aqiUnhealthy: "Вредное",
    aqiVeryUnhealthy: "Очень вредное",
    aqiHazardous: "Опасное",
    overview: "История",
    longterm: "14 дней",
    radar: "Радар",
    compare: "Сравнить",
    travel: "Путешествие",
    source: "Источник данных & Время (Прибл.)",
    install: "Установить",
    installTitle: "Установить приложение",
    installDesc: "Нажмите \"Поделиться\" ниже, затем \"На экран Домой\".",
    feedback: "Сообщить о погоде",
    feedbackTitle: "Сообщить о погоде",
    feedbackSend: "Отправить отзыв",
    feedbackThanks: "Спасибо!",
    feedbackDesc: "Ваш отзыв помогает нам.",
    managePlaces: "Управление местами",
    searchPlace: "Поиск города...",
    savedPlaces: "Сохранённые места",
    addCurrent: "Сохранить текущее местоположение",
    myLocation: "Моё местоположение",
    homeLoc: "Основное местоположение",
    noPlaces: "Нет других мест.",
    welcome: "Добро пожаловать!",
    welcomeDesc: "Чтобы начать, установите основное местоположение.",
    useGps: "Использовать местоположение",
    orSearch: "Или искать",
    locFound: "Местоположение найдено!",
    nameLoc: "Как вы хотите назвать это место?",
    saveStart: "Сохранить и Начать",
    dailyReport: "Дневной отчёт",
    trend: "Тенденция 7 дней",
    threeDayForecast: "Прогноз на 3 дня",
    precipRadar: "Радар осадков",
    modelCheck: "Проверка модели",
    longtermList: "Список 14 дней",
    travelPlanner: "Планировщик путешествий",
    travelDesc: "Спланируйте поездку и проверьте вероятность погоды.",
    whereTo: "Куда вы направляетесь?",
    startDate: "Дата начала",
    endDate: "Дата окончания (необязательно)",
    startTime: "Время начала",
    endTime: "Время окончания",
    checkWeather: "Проверить погоду",
    saveTrip: "Сохранить поездку",
    myTrips: "Мои поездки",
    tripSaved: "Поездка сохранена!",
    radarCredit: "Радарное изображение предоставлено Windy.com",
    noRain: "Сухо",
    rain: "Дождь",
    snow: "Снег",
    probability: "Вероятн.",
    safe: "Безопасно",
    officialWarning: "Официальное предупреждение",
    instruction: "Рекомендации",
    activeWarnings: "активное/ые предупреждение/я",
    weatherReport: "Прогноз погоды",
    showDetails: "Показать подробности",
    showLess: "Показать меньше",
    nextRain: "Следующие осадки",
    rainNow: "Текущие осадки",
    rainSoon: "Дождь скоро начнётся",
    noRainExp: "В ближайшие 24 часа будет сухо.",
    noPrecipExp: "В настоящее время осадков не ожидается",
    startingNow: "начинается сейчас",
    startingSoon: "скоро начнётся",
    inMinutes: "через",
    currentIntensity: "Текущая интенсивность",
    peakRainAt: "Максимальный дождь в",
    nextHours: "Следующие часы",
    hourlyForecast: "Почасовой прогноз",
    precipitationDetails: "Детали осадков",
    timeLabel: "Время",
    amountLabel: "Количество",
    hours: "ч",
    now: "Сейчас",
    ab: "С",
    oclock: "",
    unknown: "Неизвестно",
    sunny: "Солнечно",
    clear: "Ясно",
    partlyCloudy: "Переменная облачность",
    cloudy: "Облачно",
    overcast: "Пасмурно",
    fog: "Туман",
    drizzle: "Морось",
    showers: "Ливни",
    heavyRain: "Сильный дождь",
    sleet: "Мокрый снег/Лёд",
    thunderstorm: "Гроза",
    today: "Сегодня",
    tomorrow: "Завтра",
    restOfDay: "Остаток дня",
    evening: "Вечером",
    night: "Ночью",
    outlook: "Прогноз на",
    restOfWeek: "Остаток недели",
    nextWeek: "Прогноз на следующую неделю",
    monday: "Понедельник",
    tuesday: "Вторник",
    wednesday: "Среда",
    thursday: "Четверг",
    friday: "Пятница",
    saturday: "Суббота",
    sunday: "Воскресенье",
    // Tutorial
    tutorialSkip: "Пропустить",
    tutorialNext: "Далее",
    tutorialPrev: "Назад",
    tutorialFinish: "Поехали!",
    tutorialWelcomeTitle: "Добро пожаловать в приложение погоды!",
    tutorialWelcomeDesc: "Давайте настроим приложение вместе. Вы можете пропустить это руководство в любое время.",
    tutorialLangTitle: "Выберите свой язык",
    tutorialLangDesc: "Приложение поддерживает несколько языков для вашего погодного опыта.",
    tutorialHomeTitle: "Установите домашнее местоположение",
    tutorialHomeDesc: "Ваше домашнее местоположение будет использоваться по умолчанию.",
    tutorialOverviewTitle: "Вкладка Обзор",
    tutorialOverviewDesc: "Здесь вы найдете подробный обзор с ежедневным отчетом, прогнозом осадков и 7-дневным трендом.",
    tutorialLongtermTitle: "Прогноз на 14 дней",
    tutorialLongtermDesc: "Планируйте заранее с расширенным прогнозом погоды на 14 дней.",
    tutorialRadarTitle: "Радар осадков",
    tutorialRadarDesc: "Отслеживайте дождь и снег в реальном времени с помощью интерактивного радара.",
    tutorialChartTitle: "Сравнительные графики",
    tutorialChartDesc: "Сравнивайте различные модели погоды и анализируйте тенденции.",
    tutorialTravelTitle: "Планировщик путешествий",
    tutorialTravelDesc: "Планируйте свои поездки и проверяйте вероятность погоды для вашей экскурсии.",
    tutorialSettingsTitle: "Настройки",
    tutorialSettingsDesc: "Здесь вы можете настроить язык, единицы измерения (°C/°F/K), тему (Светлая/Темная/Авто) и ваше домашнее местоположение.",
    tutorialComplete: "Руководство завершено! Вы можете вносить изменения в настройках в любое время.",
    noGpsAvailable: "GPS недоступен",
    locationDenied: "Доступ к местоположению запрещён",
    changeLocation: "Изменить местоположение",
    homeLocation: "Дом",
    gpsAvailable: "Данные GPS доступны",
    gpsNotAvailable: "Нет данных GPS",
    usingGpsData: "Используется позиция GPS",

  }
};

const getSavedHomeLocation = () => {
  try {
    const saved = localStorage.getItem('weather_home_loc');
    return saved ? JSON.parse(saved) : DEFAULT_LOC;
  } catch (e) { return DEFAULT_LOC; }
};

const getSavedLocations = () => {
    try {
        const saved = localStorage.getItem('weather_locations');
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
};

const getSavedTrips = () => {
    try {
        const saved = localStorage.getItem('weather_trips');
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
};

const getSavedSettings = () => {
    try {
        const saved = localStorage.getItem('weather_settings');
        // Default Settings erweitert um theme: 'auto'
        const defaults = { 
            language: 'de', 
            unit: 'celsius', 
            theme: 'auto',
            windUnit: 'kmh',
            precipUnit: 'mm'
        };
        if (!saved) return defaults;
        const parsed = JSON.parse(saved);
        const merged = { ...defaults, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
        if (!['celsius', 'fahrenheit', 'kelvin'].includes(merged.unit)) {
            merged.unit = 'celsius';
        }
        if (!['kmh', 'ms', 'mph'].includes(merged.windUnit)) {
            merged.windUnit = 'kmh';
        }
        if (!['mm', 'in'].includes(merged.precipUnit)) {
            merged.precipUnit = 'mm';
        }
        return merged;
    } catch (e) { 
        return { 
            language: 'de', 
            unit: 'celsius', 
            theme: 'auto',
            windUnit: 'kmh',
            precipUnit: 'mm'
        }; 
    }
};

const getTutorialCompleted = () => {
    try {
        const completed = localStorage.getItem('weather_tutorial_completed');
        return completed === 'true';
    } catch (e) { return false; }
};

const setTutorialCompleted = () => {
    try {
        localStorage.setItem('weather_tutorial_completed', 'true');
    } catch (e) { console.error('Failed to save tutorial status', e); }
};

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var R = 6371; 
  var dLat = deg2rad(lat2-lat1);  
  var dLon = deg2rad(lon2-lon1); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; 
  return d;
}

const deg2rad = (deg) => deg * (Math.PI/180);

// Hilfsfunktion: Datum strikt als lokale Zeit parsen (ROBUSTER)
const parseLocalTime = (isoString) => {
  if (!isoString) return new Date();
  try {
    if (isoString.length === 10) {
        const [y, m, d] = isoString.split('-').map(Number);
        return new Date(y, m - 1, d, 12, 0, 0);
    }
    // Check if T exists for standard ISO
    if (isoString.includes('T')) {
        const [datePart, timePart] = isoString.split('T');
        const [y, m, d] = datePart.split('-').map(Number);
        const [hr, min] = timePart.split(':').map(Number);
        // Konstruiere lokales Date Objekt (Sekunden und MS = 0)
        return new Date(y, m - 1, d, hr, min, 0, 0);
    }
    // Fallback normal parsing
    return new Date(isoString);
  } catch (e) {
    console.error("Date parse error", e);
    return new Date();
  }
};

const styles = `
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
  @keyframes float-clouds { 0% { transform: translateX(0px); } 50% { transform: translateX(15px); } 100% { transform: translateX(0px); } }
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  /* --- NIEDERSCHLAG & WIND --- */
  @keyframes rain-drop { 
    0% { transform: translateY(-20px) scaleY(1); opacity: 0; } 
    20% { opacity: 0.8; } 
    90% { opacity: 0.8; transform: translateY(140px) scaleY(1); }
    100% { transform: translateY(150px) scaleY(0.5) scaleX(1.5); opacity: 0; } /* Splash effect simulation */
  }
  
  @keyframes snow-fall-slow { 
    0% { transform: translateY(-20px) translateX(-5px) rotate(0deg); opacity: 0; } 
    10% { opacity: 0.9; } 
    50% { transform: translateY(80px) translateX(5px) rotate(180deg); }
    100% { transform: translateY(160px) translateX(-10px) rotate(360deg); opacity: 0; } 
  }
  
  @keyframes snow-fall-fast { 
    0% { transform: translateY(-20px) translateX(0px); opacity: 0; } 
    10% { opacity: 0.8; } 
    100% { transform: translateY(180px) translateX(20px); opacity: 0; } 
  }

  /* --- NEBEL & ATMOSPHÄRE --- */
  @keyframes fog-flow { 
    0% { transform: translateX(-5%); opacity: 0.3; } 
    50% { opacity: 0.6; transform: translateX(5%); } 
    100% { transform: translateX(-5%); opacity: 0.3; } 
  }

  @keyframes heat-shimmer {
    0% { opacity: 0.3; transform: scaleY(1) skewX(0deg); }
    50% { opacity: 0.5; transform: scaleY(1.05) skewX(2deg); }
    100% { opacity: 0.3; transform: scaleY(1) skewX(0deg); }
  }

  @keyframes ice-sparkle {
    0%, 100% { opacity: 0; transform: scale(0.5); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  
  /* --- BÄUME & STURM --- */
  /* WICHTIG: transform-box: fill-box sorgt dafür, dass sich der Baum um sich selbst dreht */
  @keyframes tree-shake-gentle { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(1deg); } }
  @keyframes tree-shake-windy { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(4deg); } }
  @keyframes tree-shake-storm { 0%, 100% { transform: rotate(-5deg); } 20% { transform: rotate(10deg); } 40% { transform: rotate(-8deg); } 60% { transform: rotate(5deg); } }

  /* --- SONSTIGES --- */
  @keyframes ray-pulse { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
  @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
  @keyframes pulse-red { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
  @keyframes lightning-flash { 0%, 92%, 100% { opacity: 0; } 93%, 95% { opacity: 1; background: white; } }
  @keyframes sunrise-glow { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }
  @keyframes hail-fall { 
    0% { transform: translateY(-20px) rotate(0deg); opacity: 0; } 
    10% { opacity: 1; } 
    100% { transform: translateY(180px) rotate(360deg); opacity: 0; } 
  }
  @keyframes tropical-glow { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.4; } }
  @keyframes firework { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
  @keyframes float-leaves { 
    0% { transform: translateY(-20px) translateX(0px) rotate(0deg); opacity: 0; } 
    10% { opacity: 0.8; } 
    50% { transform: translateY(80px) translateX(15px) rotate(180deg); }
    100% { transform: translateY(160px) translateX(-20px) rotate(360deg); opacity: 0; } 
  }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .anim-clouds { animation: float-clouds 20s ease-in-out infinite; }
  .animate-spin-slow { animation: spin-slow 12s linear infinite; }
  
  .animate-rain-1 { animation: rain-drop 0.8s infinite linear; animation-delay: 0.1s; }
  .animate-rain-2 { animation: rain-drop 0.7s infinite linear; animation-delay: 0.3s; }
  .animate-rain-3 { animation: rain-drop 0.6s infinite linear; animation-delay: 0.5s; }
  .animate-rain-storm { animation: rain-drop 0.4s infinite linear; }
  
  .animate-snow-slow { animation: snow-fall-slow 6s infinite linear; }
  .animate-snow-fast { animation: snow-fall-fast 3.5s infinite linear; }
  
  .anim-fog-1 { animation: fog-flow 12s ease-in-out infinite; }
  .anim-fog-2 { animation: fog-flow 18s ease-in-out infinite reverse; }
  
  .animate-ray { animation: ray-pulse 3s infinite ease-in-out; }
  .animate-twinkle-1 { animation: twinkle 3s infinite ease-in-out; animation-delay: 0.5s; }
  .animate-twinkle-2 { animation: twinkle 4s infinite ease-in-out; animation-delay: 1.5s; }
  .animate-twinkle-3 { animation: twinkle 5s infinite ease-in-out; animation-delay: 2.5s; }
  .animate-pulse-red { animation: pulse-red 2s infinite ease-in-out; }
  .anim-lightning { animation: lightning-flash 5s infinite; }
  .anim-glow { animation: sunrise-glow 4s ease-in-out infinite; }
  
  .anim-tree-gentle { animation: tree-shake-gentle 4s ease-in-out infinite; transform-origin: bottom center; transform-box: fill-box; }
  .anim-tree-windy { animation: tree-shake-windy 1s ease-in-out infinite; transform-origin: bottom center; transform-box: fill-box; }
  .anim-tree-storm { animation: tree-shake-storm 0.8s ease-in-out infinite; transform-origin: bottom center; transform-box: fill-box; }
  
  .anim-heat { animation: heat-shimmer 2s infinite linear; }
  .anim-sparkle { animation: ice-sparkle 3s infinite ease-in-out; }
  .animate-hail { animation: hail-fall 1.2s infinite linear; }
  .anim-tropical { animation: tropical-glow 3s infinite ease-in-out; }
  .anim-firework { animation: firework 2s infinite ease-out; }
  .animate-leaves { animation: float-leaves 8s infinite linear; }
`;

// --- 2. HILFSFUNKTIONEN ---

const formatDateShort = (date, lang = 'de') => {
  if (!date) return "";
  const locale = lang === 'en' ? 'en-US' : 'de-DE';
  try { return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(date); } catch (e) { return ""; }
};

const getWindColorClass = (speed, isDark = false) => {
  // In dark mode, use brighter colors for better contrast
  if (isDark) {
    if (speed >= 60) return "text-red-400 font-extrabold";
    if (speed >= 40) return "text-cyan-400 font-bold";
    if (speed >= 20) return "text-blue-400 font-bold";
    return "text-gray-300 font-medium";
  }
  // Light mode colors
  if (speed >= 60) return "text-m3-error font-extrabold";
  if (speed >= 40) return "text-m3-tertiary font-bold";
  if (speed >= 20) return "text-m3-primary font-bold";
  return "text-m3-on-surface-variant font-medium";
};

const getUvColorClass = (uv, isDark = false) => {
  // In dark mode, use brighter colors for better contrast
  if (isDark) {
    if (uv >= 11) return "text-red-400";
    if (uv >= 8) return "text-orange-400";
    if (uv >= 6) return "text-cyan-400";
    if (uv >= 3) return "text-blue-400";
    return "text-gray-300";
  }
  // Light mode colors
  if (uv >= 11) return "text-m3-error";
  if (uv >= 8) return "text-m3-error";
  if (uv >= 6) return "text-m3-tertiary";
  if (uv >= 3) return "text-m3-primary";
  return "text-m3-secondary";
};

const getUvBadgeClass = (uv) => {
  if (uv >= 11) return "bg-m3-error-container text-m3-on-error-container border-m3-error";
  if (uv >= 8) return "bg-m3-error-container text-m3-on-error-container border-m3-error";
  if (uv >= 6) return "bg-m3-tertiary-container text-m3-on-tertiary-container border-m3-tertiary";
  if (uv >= 3) return "bg-m3-primary-container text-m3-on-primary-container border-m3-primary";
  return "bg-m3-secondary-container text-m3-on-secondary-container border-m3-secondary";
};

const getConfidenceColor = (percent) => {
  if (percent >= 80) return "text-m3-secondary";
  if (percent >= 50) return "text-m3-primary";
  return "text-m3-error";
};

const getDwdColorClass = (severity) => {
  const sev = severity ? severity.toLowerCase() : 'minor';
  if (sev === 'extreme') return "bg-m3-error-container border-m3-error text-m3-on-error-container";
  if (sev === 'severe') return "bg-m3-tertiary-container border-m3-tertiary text-m3-on-tertiary-container";
  if (sev === 'moderate') return "bg-m3-primary-container border-m3-primary text-m3-on-primary-container";
  return "bg-m3-secondary-container border-m3-secondary text-m3-on-secondary-container";
};

const getModelRunTime = (intervalHours, processingDelayHours) => {
  const now = new Date();
  const currentUtcHour = now.getUTCHours();
  let effectiveHour = currentUtcHour - processingDelayHours;
  if (effectiveHour < 0) effectiveHour += 24;
  const runHourUtc = Math.floor(effectiveHour / intervalHours) * intervalHours;
  const runDate = new Date();
  if (currentUtcHour - processingDelayHours < 0) runDate.setDate(runDate.getDate() - 1);
  runDate.setUTCHours(runHourUtc, 0, 0, 0);
  return runDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + " Lauf";
};

// Weather codes for snow and sleet precipitation types
// Snow codes: 71 (light), 73 (moderate), 75 (heavy), 77 (snow grains), 85 (light showers), 86 (heavy showers)
// Sleet codes: 56 (light freezing drizzle), 57 (dense freezing drizzle), 66 (light freezing rain), 67 (heavy freezing rain)
const SNOW_WEATHER_CODES = [71, 73, 75, 77, 85, 86, 56, 57, 66, 67];

const getWeatherConfig = (code, isDay = 1, lang = 'de') => {
  const isNight = isDay === 0;
  const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];
  
  if (code === 0) return isNight ? { text: t.clear, icon: Moon } : { text: t.sunny, icon: Sun };
  if (code === 1) return isNight ? { text: t.partlyCloudy, icon: Moon } : { text: t.partlyCloudy, icon: Sun };
  if (code === 2) return { text: t.cloudy, icon: Cloud };
  if (code === 3) return { text: t.overcast, icon: Cloud };
  if ([45, 48].includes(code)) return { text: t.fog, icon: CloudFog };
  if ([51, 53, 55].includes(code)) return { text: t.drizzle, icon: CloudRain };
  if ([61, 63].includes(code)) return { text: t.rain, icon: CloudRain };
  if ([80, 81].includes(code)) return { text: t.showers, icon: CloudRain };
  if ([65, 82].includes(code)) return { text: t.heavyRain, icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: t.snow, icon: Snowflake };
  if ([56, 57, 66, 67].includes(code)) return { text: t.sleet, icon: Snowflake };
  if ([95, 96, 99].includes(code)) return { text: t.thunderstorm, icon: CloudLightning };
  return { text: t.unknown, icon: Info };
};

const getMoonPhase = (d) => {
  if (!d) return 0;
  const dateObj = new Date(d);
  const newMoon = new Date(2000, 0, 6, 18, 14).getTime();
  const phaseSeconds = 2551443;
  let sec = (dateObj.getTime() - newMoon) / 1000;
  let currentSec = sec % phaseSeconds;
  if (currentSec < 0) currentSec += phaseSeconds;
  return Math.round((currentSec / phaseSeconds) * 8) % 8;
};

// --- 3. KI LOGIK (REVISED - MIT STRUKTURIERTEN DATEN & SPRACHE) ---
const generateAIReport = (type, data, lang = 'de', extraData = null) => {
  if (!data) return { title: "Lade...", summary: "Warte auf Daten...", details: null, warning: null, confidence: null };
  if (Array.isArray(data) && data.length === 0) return { title: "Lade...", summary: "Warte auf Daten...", details: null, warning: null, confidence: null };
  
  const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];
  const locale = lang === 'en' ? 'en-US' : 'de-DE';

  let title = "";
  let summary = "";
  let details = null; 
  let warning = null;
  let confidence = null;
  let structuredDetails = null; // New field for list view

  if (type === 'trip') {
      const { location, mode, startDate, endDate, summary: daySummary, items, reliability } = data;
      title = `${lang === 'en' ? 'Travel Check' : 'Reise-Check'}: ${location.name}`;
      confidence = reliability;

      if ((mode === 'multi' && items.length === 0) || (mode === 'single' && !daySummary)) {
          summary = "⚠️ " + (lang === 'en' ? "No weather data available." : "Keine Wetterdaten verfügbar.");
          details = lang === 'en' ? "The selected date might be too far in the future (max 14 days)." : "Der gewählte Zeitraum liegt möglicherweise zu weit in der Zukunft (max. 14 Tage).";
          confidence = 0;
      } else if (mode === 'single' && daySummary) {
          const dateStr = startDate.toLocaleDateString(locale, {weekday:'long', day:'2-digit', month:'long'});
          let tempText = lang === 'en' 
             ? `Expect max ${Math.round(daySummary.maxTemp)}° and min ${Math.round(daySummary.minTemp)}°.`
             : `Das Thermometer zeigt zwischen ${Math.round(daySummary.minTemp)}° und ${Math.round(daySummary.maxTemp)}°.`;
          
          let condText = "";
          const precip = daySummary.totalPrecip || 0;
          if (precip < 0.2) condText = lang === 'en' ? "It will likely stay dry." : "Bleibt trocken – perfekt für draußen!";
          else if (precip > 5) condText = lang === 'en' ? `Expect rain (${precip.toFixed(1)}mm). Bring an umbrella!` : `Regenschirm nicht vergessen – es gibt etwa ${precip.toFixed(1)}mm Regen!`;
          else condText = lang === 'en' ? "Scattered showers possible." : "Ab und zu könnte es ein paar Tropfen geben.";

          if (daySummary.maxWind > 45) warning = lang === 'en' ? "Windy" : "Windig";
          if (daySummary.maxWind > 65) warning = lang === 'en' ? "Stormy" : "Stürmisch";

          summary = `📅 ${lang === 'en' ? 'Trip on' : 'Ausflug am'} ${dateStr}:\n${tempText} ${condText}`;
          details = lang === 'en' 
             ? `Rain probability approx. ${daySummary.avgProb || 0}%. Wind gusts up to ${Math.round(daySummary.maxWind)} km/h.`
             : `Für deinen Ausflug nach ${location.name}: ${daySummary.avgProb || 0}% Regenwahrscheinlichkeit. Der Wind bläst mit bis zu ${Math.round(daySummary.maxWind)} km/h.`;
          
          if (daySummary.isTimeWindow) {
              details += lang === 'en' ? `\n\nForecast precision for time window (${daySummary.startH}-${daySummary.endH}h).` : `\n\nDie Vorhersage bezieht sich auf ${daySummary.startH}-${daySummary.endH} Uhr.`;
          }
      } else {
          // Multi Day Trip Text
          const daysCount = items.length;
          const tripDuration = Math.round((new Date(endDate).setHours(0,0,0,0) - new Date(startDate).setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)) + 1;
          
          const startStr = startDate.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
          const endStr = endDate.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
          
          const avgMax = Math.round(items.reduce((a,b)=>a+b.max,0)/daysCount);
          const totalRain = items.reduce((a,b)=>a+b.precipSum,0);
          const rainDays = items.filter(d=>d.precipSum > 1.0).length;

          let availText = daysCount === tripDuration ? "" : (lang === 'en' ? `(Weather available for ${daysCount} of ${tripDuration} days)` : `(Wetter für ${daysCount} von ${tripDuration} Tagen verfügbar)`);
          summary = `🧳 ${lang === 'en' ? 'Trip' : 'Urlaub'} (${startStr} - ${endStr}):\n${availText}\n${lang === 'en' ? 'Avg' : 'Durchschnittlich'} ${avgMax}°. `;
          
          if (rainDays === 0) summary += lang === 'en' ? "Looks like a dry period." : "Sieht nach einer trockenen Phase aus – top!";
          else if (rainDays >= daysCount/2) summary += lang === 'en' ? "Unsettled weather expected." : "Das Wetter wird wohl etwas wechselhaft.";
          else summary += lang === 'en' ? "Mix of sun and clouds." : "Ein bunter Mix aus Sonne und Wolken.";

          let detailList = items.map(d => `- ${d.date.toLocaleDateString(locale,{weekday:'short'})}: ${Math.round(d.max)}°, ${d.precipSum > 0.5 ? d.precipSum.toFixed(1)+'mm' : (lang === 'en' ? 'Dry' : 'Trocken')}`).join('\n');
          details = `${lang === 'en' ? 'Weather trend for' : 'Wettertrend für'} ${location.name}:\n${detailList}\n\n${lang === 'en' ? 'Total precip approx.' : 'Insgesamt etwa'} ${totalRain.toFixed(1)}mm ${lang === 'de' ? 'Niederschlag' : ''}.`;
      }
  }

  if (type === 'daily') {
    title = t.dailyReport;
    const now = new Date();
    const currentHour = now.getHours();
    
    const current = data[0];
    let intro = `${t.now} (${current.displayTime} ${t.oclock}): ${Math.round(current.temp)}°`;
    if (Math.abs(current.appTemp - current.temp) > 2) intro += `, ${t.feelsLike} ${Math.round(current.appTemp)}°.`;
    else intro += `.`;
    
    let parts = [intro];
    
    // Show forecast for remaining hours of today (after current hour).
    // This naturally provides time-appropriate forecasts:
    // - In the morning: forecast covers the whole day ahead
    // - At midday: forecast covers afternoon and evening
    // - In the afternoon/evening: forecast covers remaining evening/night hours
    const todayData = data.filter(d => d.time.getDate() === now.getDate() && d.time.getHours() > currentHour);
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const nightData = data.filter(d => {
        const h = d.time.getHours();
        const isTonightLate = d.time.getDate() === now.getDate() && h >= 22;
        const isTomorrowEarly = d.time.getDate() === tomorrowDate.getDate() && h < 6;
        return isTonightLate || isTomorrowEarly;
    });
    
    // ÄNDERUNG: Filter erweitert!
    // Vorher: ... && d.time.getHours() >= 6 && d.time.getHours() <= 22
    // Jetzt:  ... && d.time.getHours() >= 6
    // Damit wird alles ab 6 Uhr morgens bis zum Ende des Tages (23 Uhr) berücksichtigt.
    const tomorrowDayData = data.filter(d => d.time.getDate() === tomorrowDate.getDate() && d.time.getHours() >= 6);

    if (todayData.length > 0) {
        let todayText = `📅 ${t.today}:\n`;
        const maxToday = Math.max(...todayData.map(d => d.temp));
        const minToday = Math.min(...todayData.map(d => d.temp));
        const rainSumToday = todayData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        const snowSumToday = todayData.reduce((acc, c) => acc + parseFloat(c.snow || 0), 0);
        const maxWind = Math.max(...todayData.map(d => d.gust));
        const maxUV = Math.max(...todayData.map(d => d.uvIndex || 0));
        const hasThunderstorm = todayData.some(d => [95, 96, 99].includes(d.code));
        
        // Calculate snow probability (average of hours with snow > 0.1mm)
        const hoursWithSnow = todayData.filter(d => parseFloat(d.snow || 0) > 0.1);
        const snowProbToday = hoursWithSnow.length > 0 
            ? Math.round(hoursWithSnow.reduce((acc, d) => acc + (d.precipProb || 0), 0) / hoursWithSnow.length)
            : 0;
        
        // Check if snow will stick (dew point < -1°C)
        const minDewPoint = Math.min(...todayData.map(d => d.dewPoint || 0));
        const snowWillStick = minDewPoint < -1 && snowSumToday > 0.5;
        
        // Detect rain/snow periods
        const rainPeriods = [];
        let inRainPeriod = false;
        let periodStart = null;
        let periodEnd = null;
        let periodAmount = 0;
        let periodRain = 0;
        let periodSnow = 0;
        
        todayData.forEach((d, idx) => {
            const hasPrecip = parseFloat(d.precip || 0) > 0.1 || parseFloat(d.snow || 0) > 0.1;
            
            if (hasPrecip && !inRainPeriod) {
                // Start new period
                inRainPeriod = true;
                periodStart = d.time;
                periodAmount = parseFloat(d.precip) + parseFloat(d.snow || 0);
                periodRain = parseFloat(d.precip || 0);
                periodSnow = parseFloat(d.snow || 0);
            } else if (hasPrecip && inRainPeriod) {
                // Continue period
                periodEnd = d.time;
                periodAmount += parseFloat(d.precip) + parseFloat(d.snow || 0);
                periodRain += parseFloat(d.precip || 0);
                periodSnow += parseFloat(d.snow || 0);
            } else if (!hasPrecip && inRainPeriod) {
                // End period
                rainPeriods.push({
                    start: periodStart,
                    end: periodEnd || periodStart,
                    amount: periodAmount,
                    rain: periodRain,
                    snow: periodSnow,
                    isSnow: periodSnow > periodRain,
                    isMixed: periodRain > 0.1 && periodSnow > 0.1
                });
                inRainPeriod = false;
                periodStart = null;
                periodEnd = null;
                periodAmount = 0;
                periodRain = 0;
                periodSnow = 0;
            }
        });
        
        // Close last period if still open
        if (inRainPeriod) {
            rainPeriods.push({
                start: periodStart,
                end: periodEnd || periodStart,
                amount: periodAmount,
                rain: periodRain,
                snow: periodSnow,
                isSnow: periodSnow > periodRain,
                isMixed: periodRain > 0.1 && periodSnow > 0.1
            });
        }
        
        // Temperature text with more natural language
        const tempRange = Math.round(maxToday) - Math.round(minToday);
        let tempDesc = "";
        if (tempRange > 15) {
            tempDesc = lang === 'en' 
                ? `Quite a temperature swing today! Starting at ${Math.round(minToday)}° and warming up to ${Math.round(maxToday)}°. `
                : `Heute gibt's große Temperaturschwankungen! Los geht's mit ${Math.round(minToday)}°, später dann bis zu ${Math.round(maxToday)}°. `;
        } else if (tempRange > 8) {
            tempDesc = lang === 'en' 
                ? `Temperatures will vary between ${Math.round(minToday)}° and ${Math.round(maxToday)}° throughout the day. `
                : `Die Temperatur schwankt heute zwischen ${Math.round(minToday)}° und ${Math.round(maxToday)}°. `;
        } else {
            tempDesc = lang === 'en' 
                ? `Pretty steady temperatures around ${Math.round((minToday + maxToday) / 2)}° (${Math.round(minToday)}° to ${Math.round(maxToday)}°). `
                : `Recht konstante Temperaturen um die ${Math.round((minToday + maxToday) / 2)}° (${Math.round(minToday)}° bis ${Math.round(maxToday)}°). `;
        }
        todayText += tempDesc;
        
        // Precipitation text with snow details
        if (rainSumToday + snowSumToday > 2.0) {
            if (snowSumToday > rainSumToday) {
                todayText += lang === 'en' 
                    ? `Snowy day (${snowSumToday.toFixed(1)}mm snow${rainSumToday > 0.1 ? `, ${rainSumToday.toFixed(1)}mm rain` : ''}), dress warmly.`
                    : `Ein richtig schneereicher Tag (${snowSumToday.toFixed(1)}mm Schnee${rainSumToday > 0.1 ? `, ${rainSumToday.toFixed(1)}mm Regen` : ''}) – zieh dich warm an!`;
                
                // Add snow probability and sticking info
                if (snowProbToday > 0) {
                    todayText += lang === 'en'
                        ? ` Snow probability: ${snowProbToday}%.`
                        : ` Die Schneewahrscheinlichkeit liegt bei ${snowProbToday}%.`;
                }
                if (snowWillStick) {
                    todayText += lang === 'en'
                        ? ` Snow will likely stick (dew point: ${Math.round(minDewPoint)}°C).`
                        : ` Der Schnee wird wohl liegen bleiben (Taupunkt: ${Math.round(minDewPoint)}°C).`;
                } else if (snowSumToday > 0.5) {
                    todayText += lang === 'en'
                        ? ` Snow may not stick (dew point: ${Math.round(minDewPoint)}°C).`
                        : ` Könnte aber auch schnell wieder wegtauen (Taupunkt: ${Math.round(minDewPoint)}°C).`;
                }
            } else {
                todayText += lang === 'en' 
                    ? `Rainy day (${rainSumToday.toFixed(1)}mm), bring an umbrella.`
                    : `Wird regnerisch (${rainSumToday.toFixed(1)}mm) – Schirm mitnehmen!`;
            }
        } else if (rainSumToday + snowSumToday > 0.1) {
            if (snowSumToday > 0.1) {
                todayText += lang === 'en' 
                    ? `Isolated snow showers possible (${snowSumToday.toFixed(1)}mm), mostly dry.`
                    : `Hier und da könnte es schneien (${snowSumToday.toFixed(1)}mm), bleibt aber meist trocken.`;
                if (snowWillStick) {
                    todayText += lang === 'en'
                        ? ` Snow may stick.`
                        : ` Der Schnee könnte liegen bleiben.`;
                }
            } else {
                todayText += lang === 'en' 
                    ? "Isolated showers possible, mostly dry."
                    : "Vielleicht ein paar Tropfen, aber größtenteils trocken.";
            }
        } else {
            todayText += lang === 'en' 
                ? "It will be a nice, dry day."
                : "Ein schöner, trockener Tag – perfekt!";
        }
        
        // Add rain/snow timing details if present
        if (rainPeriods.length > 0) {
            todayText += "\n";
            rainPeriods.forEach((period, idx) => {
                const startTime = period.start.toLocaleTimeString(locale, {hour:'2-digit', minute:'2-digit'});
                const endTime = period.end.toLocaleTimeString(locale, {hour:'2-digit', minute:'2-digit'});
                let precipType;
                if (period.isMixed) {
                    precipType = lang === 'en' ? 'Mixed precipitation' : 'Mischniederschlag';
                } else {
                    precipType = period.isSnow ? (lang === 'en' ? 'Snow' : 'Schnee') : (lang === 'en' ? 'Rain' : 'Regen');
                }
                
                let precipDetails = `${period.amount.toFixed(1)}mm`;
                if (period.isMixed && (period.rain > 0.1 || period.snow > 0.1)) {
                    precipDetails = lang === 'en' 
                        ? `${period.rain.toFixed(1)}mm rain, ${period.snow.toFixed(1)}mm snow`
                        : `${period.rain.toFixed(1)}mm Regen, ${period.snow.toFixed(1)}mm Schnee`;
                } else if (period.isSnow && period.snow > 0.1) {
                    precipDetails = `${period.snow.toFixed(1)}mm`;
                }
                
                if (startTime === endTime) {
                    todayText += lang === 'en'
                        ? `${precipType} around ${startTime} (${precipDetails}). `
                        : `${precipType} gegen ${startTime} Uhr (${precipDetails}). `;
                } else {
                    todayText += lang === 'en'
                        ? `${precipType} from ${startTime} to ${endTime} (${precipDetails}). `
                        : `${precipType} von ${startTime} bis ${endTime} Uhr (${precipDetails}). `;
                }
            });
        }
        
        // Wind text
        if (maxWind > 50) { 
            todayText += lang === 'en' 
                ? ` Windy with gusts up to ${Math.round(maxWind)} km/h.` 
                : ` Dazu noch windig mit Böen bis ${Math.round(maxWind)} km/h.`; 
        }
        
        // UV warning
        if (maxUV >= 8) {
            todayText += lang === 'en'
                ? ` ⚠️ High UV index (${maxUV}) - use sun protection!`
                : ` ⚠️ Hoher UV-Index (${maxUV}) - Sonnenschutz nicht vergessen!`;
        }
        
        // Extreme heat warning
        if (maxToday > 35) {
            todayText += lang === 'en'
                ? ` 🔥 Extreme heat expected - stay hydrated!`
                : ` 🔥 Große Hitze erwartet - viel trinken!`;
        }
        
        // Extreme cold warning
        if (minToday < -5) {
            todayText += lang === 'en'
                ? ` ❄️ Severe cold - dress warmly!`
                : ` ❄️ Große Kälte - warm anziehen!`;
        }
        
        // Thunderstorm warning
        if (hasThunderstorm) {
            todayText += lang === 'en'
                ? ` ⚡ Thunderstorms approaching - seek shelter!`
                : ` ⚡ Gewitter im Anmarsch - Schutz suchen!`;
        }
        
        parts.push(todayText);
    }
    if (nightData.length > 0) {
        const minNight = Math.min(...nightData.map(d => d.temp));
        let nightText = `🌙 ${t.night} `;
        if (minNight < 1) nightText += lang === 'en' ? `it gets frosty (${Math.round(minNight)}°). Watch for ice!` : `wird's frostig (${Math.round(minNight)}°). Pass auf Glätte auf!`;
        else if (minNight < 4) nightText += lang === 'en' ? `cooling to fresh ${Math.round(minNight)}° (ground frost possible).` : `kühlt es auf frische ${Math.round(minNight)}° ab (kann am Boden frieren).`;
        else nightText += lang === 'en' ? `lows around ${Math.round(minNight)}°.` : `geht es runter auf ${Math.round(minNight)}°.`;
        parts.push(nightText);
    }
    if (tomorrowDayData.length > 0) {
        const tMax = Math.max(...tomorrowDayData.map(d => d.temp));
        const tMin = Math.min(...tomorrowDayData.map(d => d.temp)); 
        const tRain = tomorrowDayData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        const tSnow = tomorrowDayData.reduce((acc, c) => acc + parseFloat(c.snow || 0), 0);
        const tGust = Math.max(...tomorrowDayData.map(d => d.gust));
        const tMaxUV = Math.max(...tomorrowDayData.map(d => d.uvIndex || 0));
        const tHasThunderstorm = tomorrowDayData.some(d => [95, 96, 99].includes(d.code));
        
        // Calculate snow probability for tomorrow
        const hoursWithSnowTomorrow = tomorrowDayData.filter(d => parseFloat(d.snow || 0) > 0.1);
        const snowProbTomorrow = hoursWithSnowTomorrow.length > 0 
            ? Math.round(hoursWithSnowTomorrow.reduce((acc, d) => acc + (d.precipProb || 0), 0) / hoursWithSnowTomorrow.length)
            : 0;
        
        // Check if snow will stick tomorrow
        const minDewPointTomorrow = Math.min(...tomorrowDayData.map(d => d.dewPoint || 0));
        const snowWillStickTomorrow = minDewPointTomorrow < -1 && tSnow > 0.5;
        
        // Detect snow/rain periods for tomorrow
        const precipPeriodsTomorrow = [];
        let inPrecipPeriod = false;
        let periodStart = null;
        let periodEnd = null;
        let periodAmount = 0;
        let periodRain = 0;
        let periodSnow = 0;
        
        tomorrowDayData.forEach((d, idx) => {
            const hasPrecip = d.precip > 0.1 || d.snow > 0.1;
            const isSnow = parseFloat(d.snow || 0) > parseFloat(d.precip || 0);
            
            if (hasPrecip && !inPrecipPeriod) {
                // Start new period
                inPrecipPeriod = true;
                periodStart = d.time;
                periodAmount = parseFloat(d.precip) + parseFloat(d.snow || 0);
                periodRain = parseFloat(d.precip || 0);
                periodSnow = parseFloat(d.snow || 0);
            } else if (hasPrecip && inPrecipPeriod) {
                // Continue period
                periodEnd = d.time;
                periodAmount += parseFloat(d.precip) + parseFloat(d.snow || 0);
                periodRain += parseFloat(d.precip || 0);
                periodSnow += parseFloat(d.snow || 0);
            } else if (!hasPrecip && inPrecipPeriod) {
                // End period
                precipPeriodsTomorrow.push({
                    start: periodStart,
                    end: periodEnd || periodStart,
                    amount: periodAmount,
                    rain: periodRain,
                    snow: periodSnow,
                    isSnow: periodSnow > periodRain,
                    isMixed: periodRain > 0.1 && periodSnow > 0.1
                });
                inPrecipPeriod = false;
                periodStart = null;
                periodEnd = null;
                periodAmount = 0;
                periodRain = 0;
                periodSnow = 0;
            }
        });
        
        // Close last period if still open
        if (inPrecipPeriod) {
            precipPeriodsTomorrow.push({
                start: periodStart,
                end: periodEnd || periodStart,
                amount: periodAmount,
                rain: periodRain,
                snow: periodSnow,
                isSnow: periodSnow > periodRain,
                isMixed: periodRain > 0.1 && periodSnow > 0.1
            });
        }
        
        let tomorrowText = `🌅 ${t.outlook} ${t.tomorrow} (${tomorrowDate.toLocaleDateString(locale, {weekday:'long'})}):\n`;
        
        // More natural temperature description for tomorrow
        const tomorrowTempDiff = Math.round(tMax) - Math.round(tMin);
        if (tomorrowTempDiff > 12) {
            tomorrowText += lang === 'en'
                ? `A cool start at ${Math.round(tMin)}° in the morning, then warming nicely to ${Math.round(tMax)}° by afternoon. `
                : `Morgens noch frische ${Math.round(tMin)}°, dann wird's richtig angenehm mit bis zu ${Math.round(tMax)}° am Nachmittag. `;
        } else {
            tomorrowText += lang === 'en'
                ? `Temperatures ranging from ${Math.round(tMin)}° in the morning to ${Math.round(tMax)}° in the afternoon. `
                : `Morgens etwa ${Math.round(tMin)}°, nachmittags klettert das Thermometer auf ${Math.round(tMax)}°. `;
        }
        
        // Precipitation text with snow details
        if (tRain + tSnow > 2.0) {
            if (tSnow > tRain) {
                tomorrowText += lang === 'en' 
                    ? `Snowy day (${tSnow.toFixed(1)}mm snow${tRain > 0.1 ? `, ${tRain.toFixed(1)}mm rain` : ''}), dress warmly.`
                    : `Ein schneereicher Tag (${tSnow.toFixed(1)}mm Schnee${tRain > 0.1 ? `, ${tRain.toFixed(1)}mm Regen` : ''}) – dick einpacken!`;
                
                // Add snow probability and sticking info
                if (snowProbTomorrow > 0) {
                    tomorrowText += lang === 'en'
                        ? ` Snow probability: ${snowProbTomorrow}%.`
                        : ` Die Schneewahrscheinlichkeit liegt bei ${snowProbTomorrow}%.`;
                }
                if (snowWillStickTomorrow) {
                    tomorrowText += lang === 'en'
                        ? ` Snow will likely stick (dew point: ${Math.round(minDewPointTomorrow)}°C).`
                        : ` Der Schnee bleibt wohl liegen (Taupunkt: ${Math.round(minDewPointTomorrow)}°C).`;
                } else if (tSnow > 0.5) {
                    tomorrowText += lang === 'en'
                        ? ` Snow may not stick (dew point: ${Math.round(minDewPointTomorrow)}°C).`
                        : ` Kann aber auch recht schnell wegtauen (Taupunkt: ${Math.round(minDewPointTomorrow)}°C).`;
                }
            } else {
                tomorrowText += lang === 'en' 
                    ? `Rainy day (${tRain.toFixed(1)}mm), bring an umbrella.` 
                    : `Regnerisches Wetter (${tRain.toFixed(1)}mm) – Schirm einpacken!`;
            }
        } else if (tRain + tSnow > 0.1) {
            if (tSnow > 0.1) {
                tomorrowText += lang === 'en' 
                    ? `Isolated snow showers possible (${tSnow.toFixed(1)}mm), mostly dry.`
                    : `Vielleicht ein bisschen Schnee (${tSnow.toFixed(1)}mm), aber meistens trocken.`;
                if (snowWillStickTomorrow) {
                    tomorrowText += lang === 'en'
                        ? ` Snow may stick.`
                        : ` Könnte liegen bleiben.`;
                }
            } else {
                tomorrowText += lang === 'en' 
                    ? "Isolated showers possible, mostly dry." 
                    : "Kann mal kurz regnen, bleibt aber überwiegend trocken.";
            }
        } else {
            tomorrowText += lang === 'en' 
                ? "It will be a nice, sunny day." 
                : "Ein schöner, sonniger Tag – super!";
        }
        
        // Add precipitation timing details if present
        if (precipPeriodsTomorrow.length > 0) {
            tomorrowText += "\n";
            precipPeriodsTomorrow.forEach((period, idx) => {
                const startTime = period.start.toLocaleTimeString(locale, {hour:'2-digit', minute:'2-digit'});
                const endTime = period.end.toLocaleTimeString(locale, {hour:'2-digit', minute:'2-digit'});
                let precipType;
                if (period.isMixed) {
                    precipType = lang === 'en' ? 'Mixed precipitation' : 'Mischniederschlag';
                } else {
                    precipType = period.isSnow ? (lang === 'en' ? 'Snow' : 'Schnee') : (lang === 'en' ? 'Rain' : 'Regen');
                }
                
                let precipDetails = `${period.amount.toFixed(1)}mm`;
                if (period.isMixed && (period.rain > 0.1 || period.snow > 0.1)) {
                    precipDetails = lang === 'en' 
                        ? `${period.rain.toFixed(1)}mm rain, ${period.snow.toFixed(1)}mm snow`
                        : `${period.rain.toFixed(1)}mm Regen, ${period.snow.toFixed(1)}mm Schnee`;
                } else if (period.isSnow && period.snow > 0.1) {
                    precipDetails = `${period.snow.toFixed(1)}mm`;
                }
                
                if (startTime === endTime) {
                    tomorrowText += lang === 'en'
                        ? `${precipType} around ${startTime} (${precipDetails}). `
                        : `${precipType} gegen ${startTime} Uhr (${precipDetails}). `;
                } else {
                    tomorrowText += lang === 'en'
                        ? `${precipType} from ${startTime} to ${endTime} (${precipDetails}). `
                        : `${precipType} von ${startTime} bis ${endTime} Uhr (${precipDetails}). `;
                }
            });
        }
        
        if (tGust > 50) { 
            tomorrowText += lang === 'en' ? ` Windy with gusts up to ${tGust} km/h.` : ` Dazu noch windig mit Böen bis ${tGust} km/h.`; 
            if (!warning) warning = lang === 'en' ? "WINDY (Tomorrow)" : "WINDIG (Morgen)"; 
        }
        
        // UV warning for tomorrow
        if (tMaxUV >= 8) {
            tomorrowText += lang === 'en'
                ? ` ⚠️ High UV index (${tMaxUV}) - use sun protection!`
                : ` ⚠️ Hoher UV-Index (${tMaxUV}) - Sonnenschutz nicht vergessen!`;
            if (!warning) warning = lang === 'en' ? "HIGH UV (Tomorrow)" : "HOHER UV (Morgen)";
        }
        
        // Extreme heat warning for tomorrow
        if (tMax > 35) {
            tomorrowText += lang === 'en'
                ? ` 🔥 Extreme heat expected - stay hydrated!`
                : ` 🔥 Große Hitze erwartet - viel trinken!`;
            if (!warning) warning = lang === 'en' ? "EXTREME HEAT (Tomorrow)" : "GROSSE HITZE (Morgen)";
        }
        
        // Extreme cold warning for tomorrow
        if (tMin < -5) {
            tomorrowText += lang === 'en'
                ? ` ❄️ Severe cold - dress warmly!`
                : ` ❄️ Große Kälte - warm anziehen!`;
            if (!warning) warning = lang === 'en' ? "SEVERE COLD (Tomorrow)" : "GROSSE KÄLTE (Morgen)";
        }
        
        // Thunderstorm warning for tomorrow
        if (tHasThunderstorm) {
            tomorrowText += lang === 'en'
                ? ` ⚡ Thunderstorms expected - be prepared!`
                : ` ⚡ Gewitter erwartet - vorbereitet sein!`;
            if (!warning) warning = lang === 'en' ? "THUNDERSTORMS (Tomorrow)" : "GEWITTER (Morgen)";
        }
        
        parts.push(tomorrowText);
    }
    summary = parts.join("\n\n");
    confidence = 90; 
    const maxGustNow = Math.max(...(todayData.map(d=>d.gust)||[]), 0);
    const maxUVNow = Math.max(...(todayData.map(d=>d.uvIndex||0)), 0);
    const maxTempNow = Math.max(...(todayData.map(d=>d.temp)||[]), 0);
    const minTempNow = Math.min(...(todayData.map(d=>d.temp)||[]), 0) || 0;
    const hasThunderstormNow = todayData.some(d => [95, 96, 99].includes(d.code));
    
    // Set warnings based on today's data (prioritized by severity)
    if (maxGustNow > 60) warning = lang === 'en' ? "GALE GUSTS (Today)" : "STURMBÖEN (Heute)";
    else if (hasThunderstormNow) warning = lang === 'en' ? "THUNDERSTORMS (Today)" : "GEWITTER (Heute)";
    else if (maxTempNow > 35) warning = lang === 'en' ? "EXTREME HEAT (Today)" : "GROSSE HITZE (Heute)";
    else if (minTempNow < -5) warning = lang === 'en' ? "SEVERE COLD (Today)" : "GROSSE KÄLTE (Heute)";
    else if (maxUVNow >= 8) warning = lang === 'en' ? "HIGH UV (Today)" : "HOHER UV (Heute)";
    
    // Add structured details for 3-day forecast if extraData (threeDayForecast) is provided
    if (extraData && Array.isArray(extraData) && extraData.length > 0) {
      structuredDetails = [{
        title: t.threeDayForecast,
        items: extraData.map(d => ({
          day: d.dayName,
          date: d.dateShort,
          code: d.code,
          min: Math.round(d.min),
          max: Math.round(d.max),
          rain: parseFloat(d.rain),
          wind: d.wind
        }))
      }];
    }
  }

  if (type === 'longterm') {
    title = t.trend;
    const analysisData = data.slice(1); // Start tomorrow
    
    // Split Data
    const thisWeek = [];
    const nextWeek = [];
    let foundNextMon = false;
    let foundWeekAfter = false; // NEU: Marker für den Start der übernächsten Woche

    analysisData.forEach(d => {
        const isMonday = d.date.getDay() === 1;

        // Wenn wir den ersten Montag finden -> Start nächste Woche
        if (isMonday && !foundNextMon) {
            foundNextMon = true;
        } 
        // Wenn wir BEREITS in der nächsten Woche sind und WIEDER einen Montag finden -> Stopp
        else if (isMonday && foundNextMon) {
            foundWeekAfter = true;
        }

        // Wenn wir die übernächste Woche erreicht haben, fügen wir nichts mehr hinzu
        if (foundWeekAfter) return;

        if (foundNextMon) nextWeek.push(d);
        else thisWeek.push(d);
    });

    let parts = [];
    let overallConfidence = 0;

    // --- TEIL 1: DIESE WOCHE ---
    if (thisWeek.length > 0) {
        const twMax = Math.max(...thisWeek.map(d=>d.max));
        const twMin = Math.min(...thisWeek.map(d=>d.min));
        const twAvgMax = Math.round(thisWeek.reduce((a,b)=>a+b.max,0)/thisWeek.length);
        const twRain = thisWeek.reduce((a,b)=>a+parseFloat(b.rain),0);
        const twSnow = thisWeek.reduce((a,b)=>a+parseFloat(b.snow || 0),0);
        const twRainDays = thisWeek.filter(d=>parseFloat(d.rain)>1.0).length;
        const twSnowDays = thisWeek.filter(d=>parseFloat(d.snow || 0)>1.0).length;
        const twSunDays = thisWeek.filter(d=>d.code<=2).length;
        const twRel = Math.round(thisWeek.reduce((a,b)=>a+b.reliability,0) / thisWeek.length);
        
        // Trend detection (start vs end of period)
        const startTemp = thisWeek[0].max;
        const endTemp = thisWeek[thisWeek.length-1].max;
        let trendTextDe = "die Temperaturen bleiben etwa gleich";
        let trendTextEn = "temperatures remain stable";
        
        if (endTemp > startTemp + 2) {
            trendTextDe = "es wird allmählich wärmer";
            trendTextEn = "getting warmer";
        } else if (endTemp < startTemp - 2) {
            trendTextDe = "es wird kühler";
            trendTextEn = "cooling down";
        }
        
        let twText = `📅 ${t.restOfWeek}:\n`;
        // Handle edge case if "tomorrow" is Sunday or Monday already
        if (thisWeek.length === 1 && thisWeek[0].date.getDay() === 0) twText = `📅 ${t.tomorrow} (${t.sunday}):\n`;

        // Temperature text
        twText += lang === 'en' 
            ? `Expect daily highs averaging ${twAvgMax}° (${trendTextEn}). `
            : `Die Tageshöchstwerte pendeln sich bei etwa ${twAvgMax}° ein (${trendTextDe}). `;
        
        // Precipitation text with details
        if (twRain + twSnow > 10 || twRainDays + twSnowDays >= 3) {
            // Collect rain/snow days with amounts
            const snowDaysDetails = thisWeek
                .filter(d => parseFloat(d.snow || 0) > 1.0)
                .map(d => `${d.dayName} (${parseFloat(d.snow).toFixed(0)}mm)`);
            const rainDaysDetails = thisWeek
                .filter(d => parseFloat(d.rain) > 1.0)
                .map(d => d.dayName);
            
            if (twSnow > twRain && twSnowDays > 0) {
                twText += lang === 'en' 
                    ? `Snowy weather expected with snow on approx. ${twSnowDays} days (Total: ${twSnow.toFixed(0)}mm snow${twRain > 1 ? `, ${twRain.toFixed(0)}mm rain` : ''}).`
                    : `Wird ziemlich winterlich: An etwa ${twSnowDays} Tagen schneit es (Gesamt: ${twSnow.toFixed(0)}mm Schnee${twRain > 1 ? `, ${twRain.toFixed(0)}mm Regen` : ''}).`;
                
                // Add specific snow days if not too many
                if (snowDaysDetails.length > 0 && snowDaysDetails.length <= 4) {
                    twText += lang === 'en' 
                        ? ` Snowy days: ${snowDaysDetails.join(', ')}.`
                        : ` Schnee gibt's am: ${snowDaysDetails.join(', ')}.`;
                }
            } else if (twSnowDays > 0) {
                twText += lang === 'en' 
                    ? `Unsettled weather expected with rain on approx. ${twRainDays} days and snow on ${twSnowDays} days (Total: ${twRain.toFixed(0)}mm rain, ${twSnow.toFixed(0)}mm snow).`
                    : `Wechselhaftes Wetter: An etwa ${twRainDays} Tagen regnet es, an ${twSnowDays} Tagen schneit es (Gesamt: ${twRain.toFixed(0)}mm Regen, ${twSnow.toFixed(0)}mm Schnee).`;
                
                // Add specific snow days if not too many
                if (snowDaysDetails.length > 0 && snowDaysDetails.length <= 3) {
                    twText += lang === 'en' 
                        ? ` Snow on: ${snowDaysDetails.join(', ')}.`
                        : ` Schnee gibt's am: ${snowDaysDetails.join(', ')}.`;
                }
            } else {
                twText += lang === 'en' 
                    ? `Unsettled weather expected with rain on approx. ${twRainDays} days (Total: ${twRain.toFixed(0)}mm).`
                    : `Unbeständiges Wetter: An etwa ${twRainDays} Tagen regnet es (Gesamt: ${twRain.toFixed(0)}mm).`;
                
                if (rainDaysDetails.length > 0 && thisWeek.length <= 5) {
                    twText += lang === 'en' ? ` Wet days: ${rainDaysDetails.join(', ')}.` : ` Regentage: ${rainDaysDetails.join(', ')}.`;
                }
            }
        } else if (twRain + twSnow > 1) {
             const totalPrecipDays = twRainDays + twSnowDays;
             if (twSnowDays > 0) {
                 twText += lang === 'en'
                    ? `Mix of sun and clouds, mostly dry (only ${twSnowDays} snowy ${twSnowDays === 1 ? 'day' : 'days'}${twRainDays > 0 ? `, ${twRainDays} rainy ${twRainDays === 1 ? 'day' : 'days'}` : ''}).`
                    : `Mal Sonne, mal Wolken – bleibt meistens trocken (nur ${twSnowDays} Schneetag${twSnowDays === 1 ? '' : 'e'}${twRainDays > 0 ? `, ${twRainDays} Regentag${twRainDays === 1 ? '' : 'e'}` : ''}).`;
             } else {
                 twText += lang === 'en'
                    ? `Mix of sun and clouds, mostly dry (only ${totalPrecipDays} rainy ${totalPrecipDays === 1 ? 'day' : 'days'}).`
                    : `Mal Sonne, mal Wolken – bleibt größtenteils trocken (nur ${totalPrecipDays} Regentag${totalPrecipDays === 1 ? '' : 'e'}).`;
             }
        } else {
             if (twSunDays >= thisWeek.length / 2) twText += lang === 'en' ? "High pressure influence likely: Mostly sunny and dry." : "Hochdruckeinfluss wahrscheinlich: Überwiegend sonnig und trocken – schön!";
             else twText += lang === 'en' ? "Cloudy but dry conditions expected." : "Eher bewölkt, aber trocken.";
        }
        
        twText += `\n(${lang === 'en' ? 'Certainty' : 'Prognosesicherheit'}: ${twRel}%)`;
        
        parts.push(twText);
        overallConfidence += thisWeek.reduce((a,b)=>a+b.reliability,0) / thisWeek.length;
    }

    // --- TEIL 2: NÄCHSTE WOCHE ---
    if (nextWeek.length > 0) {
        const nwMax = Math.max(...nextWeek.map(d=>d.max));
        const nwMinLow = Math.min(...nextWeek.map(d=>d.min));
        // NEU: Detailliertere Analyse
        const nwAvgMax = Math.round(nextWeek.reduce((a,b)=>a+b.max,0)/nextWeek.length);
        const nwRain = nextWeek.reduce((a,b)=>a+parseFloat(b.rain),0);
        const nwSnow = nextWeek.reduce((a,b)=>a+parseFloat(b.snow || 0),0);
        const nwRainDays = nextWeek.filter(d=>parseFloat(d.rain)>1.0).length;
        const nwSnowDays = nextWeek.filter(d=>parseFloat(d.snow || 0)>1.0).length;
        const nwRel = Math.round(nextWeek.reduce((a,b)=>a+b.reliability,0) / nextWeek.length);
        
        // Trend-Ermittlung (Anfang vs Ende der Woche)
        const startTemp = nextWeek[0].max;
        const endTemp = nextWeek[nextWeek.length-1].max;
        let trendTextDe = "die Temperaturen bleiben etwa gleich";
        let trendTextEn = "temperatures remain stable";
        
        if (endTemp > startTemp + 2) {
            trendTextDe = "zum Wochenende wird's wärmer";
            trendTextEn = "getting warmer towards the weekend";
        } else if (endTemp < startTemp - 2) {
            trendTextDe = "im Wochenverlauf wird's kühler";
            trendTextEn = "cooling down throughout the week";
        }

        let nwText = `🔮 ${t.nextWeek} (${t.ab} ${t.monday}, ${nextWeek[0].date.toLocaleDateString(locale, {day:'2-digit', month:'2-digit'})}.):\n`;
        
        // Temperatur Text
        nwText += lang === 'en' 
            ? `Expect daily highs averaging ${nwAvgMax}° (${trendTextEn}). `
            : `Die Tageshöchstwerte pendeln sich so um ${nwAvgMax}° ein (${trendTextDe}). `;
        
        // Niederschlags Text mit Schneedetails
        if (nwRain + nwSnow > 10 || nwRainDays + nwSnowDays >= 4) {
            // Collect snow days with amounts
            const snowDaysDetails = nextWeek
                .filter(d => parseFloat(d.snow || 0) > 1.0)
                .map(d => `${d.dayName} (${parseFloat(d.snow).toFixed(0)}mm)`);
            
            if (nwSnow > nwRain && nwSnowDays > 0) {
                nwText += lang === 'en' 
                    ? `Snowy weather expected with snow on approx. ${nwSnowDays} days (Total: ${nwSnow.toFixed(0)}mm snow${nwRain > 1 ? `, ${nwRain.toFixed(0)}mm rain` : ''}).`
                    : `Wird ziemlich winterlich: An etwa ${nwSnowDays} Tagen schneit es (Gesamt: ${nwSnow.toFixed(0)}mm Schnee${nwRain > 1 ? `, ${nwRain.toFixed(0)}mm Regen` : ''}).`;
                
                // Add specific snow days if not too many
                if (snowDaysDetails.length > 0 && snowDaysDetails.length <= 4) {
                    nwText += lang === 'en' 
                        ? ` Snowy days: ${snowDaysDetails.join(', ')}.`
                        : ` Schnee gibt's am: ${snowDaysDetails.join(', ')}.`;
                }
            } else if (nwSnowDays > 0) {
                nwText += lang === 'en' 
                    ? `Unsettled weather expected with rain on approx. ${nwRainDays} days and snow on ${nwSnowDays} days (Total: ${nwRain.toFixed(0)}mm rain, ${nwSnow.toFixed(0)}mm snow).`
                    : `Wechselhaftes Wetter: An etwa ${nwRainDays} Tagen regnet es, an ${nwSnowDays} Tagen schneit es (Gesamt: ${nwRain.toFixed(0)}mm Regen, ${nwSnow.toFixed(0)}mm Schnee).`;
                
                // Add specific snow days if not too many
                if (snowDaysDetails.length > 0 && snowDaysDetails.length <= 3) {
                    nwText += lang === 'en' 
                        ? ` Snow on: ${snowDaysDetails.join(', ')}.`
                        : ` Schnee gibt's am: ${snowDaysDetails.join(', ')}.`;
                }
            } else {
                nwText += lang === 'en' 
                    ? `Unsettled weather expected with rain on approx. ${nwRainDays} days (Total: ${nwRain.toFixed(0)}mm).`
                    : `Unbeständiges Wetter: An etwa ${nwRainDays} Tagen regnet es (Gesamt: ${nwRain.toFixed(0)}mm).`;
            }
        } else if (nwRain + nwSnow > 1) {
            if (nwSnowDays > 0) {
                nwText += lang === 'en'
                    ? `Mix of sun and clouds, mostly dry (only ${nwSnowDays} snowy ${nwSnowDays === 1 ? 'day' : 'days'}${nwRainDays > 0 ? `, ${nwRainDays} rainy ${nwRainDays === 1 ? 'day' : 'days'}` : ''}).`
                    : `Mal Sonne, mal Wolken – bleibt meistens trocken (nur ${nwSnowDays} Schneetag${nwSnowDays === 1 ? '' : 'e'}${nwRainDays > 0 ? `, ${nwRainDays} Regentag${nwRainDays === 1 ? '' : 'e'}` : ''}).`;
            } else {
                nwText += lang === 'en'
                    ? `Mix of sun and clouds, mostly dry (only ${nwRainDays} rain days).`
                    : `Mal Sonne, mal Wolken – bleibt größtenteils trocken (nur ${nwRainDays} Regentage).`;
            }
        } else {
             nwText += lang === 'en'
                ? `High pressure influence likely: Mostly sunny and dry.`
                : `Hochdruckeinfluss wahrscheinlich: Überwiegend sonnig und trocken!`;
        }
        
        nwText += `\n(${lang === 'en' ? 'Certainty' : 'Prognosesicherheit'}: ${nwRel}%)`;
        
        parts.push(nwText);
        if (thisWeek.length > 0) overallConfidence = (overallConfidence + nwRel) / 2;
        else overallConfidence = nwRel;
    }
    
    summary = parts.join("\n\n");
    confidence = Math.round(overallConfidence);
    
    // STRUCTURED DETAILS for List View
    structuredDetails = [];
    const formatItem = (d) => ({
        day: d.dayName,
        date: d.dateShort,
        code: d.code,
        min: Math.round(d.min),
        max: Math.round(d.max),
        rain: parseFloat(d.rain),
        wind: d.wind
    });

    if (thisWeek.length > 0) {
        structuredDetails.push({ 
            title: (thisWeek.length === 1 && thisWeek[0].date.getDay() === 0) ? `${t.tomorrow} (${t.sunday})` : t.restOfWeek, 
            items: thisWeek.map(formatItem) 
        });
    }
    if (nextWeek.length > 0) {
        structuredDetails.push({ title: t.nextWeek, items: nextWeek.map(formatItem) });
    }
    // Set text details to null to force usage of structured view in UI
    details = null; 
  }
  
  if (type === 'model-hourly') {
     title = lang === 'en' ? "Model Check (48h)" : "Modell-Check (48h)";
     let totalDiff = 0;
     data.forEach(d => { if (d.temp_icon !== null && d.temp_gfs !== null) totalDiff += Math.abs(d.temp_icon - d.temp_gfs); });
     const avgDiff = totalDiff / data.length;
     if (avgDiff < 1.0) { summary = lang === 'en' ? "✅ High agreement: Models match almost perfectly." : "✅ Hohe Einigkeit: Die Modelle rechnen fast identisch."; confidence = 95; }
     else if (avgDiff < 2.5) { summary = lang === 'en' ? "⚠️ Slight uncertainties in detail." : "⚠️ Leichte Unsicherheiten im Detail."; confidence = 70; }
     else { summary = lang === 'en' ? "❌ Large discrepancy: Models disagree." : "❌ Große Diskrepanz: Modelle rechnen verschieden."; confidence = 40; warning = lang === 'en' ? "UNCERTAIN" : "UNSICHER"; }
     details = lang === 'en' ? "Comparison of ICON (DE), GFS (US), and AROME (FR) shows forecast certainty." : "Der Vergleich von ICON (DE), GFS (US) und AROME (FR) zeigt, wie sicher die Vorhersage ist. Bei großer Abweichung (❌) ist das Wetter schwer vorherzusagen.";
  }

  if (type === 'model-daily') {
    title = lang === 'en' ? "Model Compare (Longterm)" : "Modell-Vergleich (Langzeit)";
    const slicedData = data.slice(0, 6); 
    const diff = slicedData.reduce((acc, d) => acc + (d.max_gfs - d.max_icon), 0);
    if (Math.abs(diff) < 5) summary = lang === 'en' ? "Longterm models are mostly synchronized." : "Die Langzeitmodelle sind weitgehend synchron.";
    else if (diff > 0) summary = lang === 'en' ? "GFS (US) predicts warmer than ICON (EU)." : "GFS (US) rechnet wärmer als ICON (EU).";
    else summary = lang === 'en' ? "ICON (EU) sees the week warmer than GFS." : "ICON (EU) sieht die Woche wärmer als GFS.";
    details = lang === 'en' ? "Comparison of max daily temps between US GFS and German ICON model." : "Vergleich der maximalen Tagestemperaturen zwischen dem amerikanischen GFS und dem deutschen ICON Modell über die nächsten 6 Tage.";
    confidence = 80;
  }

  return { title, summary, details, structuredDetails, warning, confidence };
};

// --- 4. KOMPONENTEN ---
// --- SETTINGS MODAL (NEU) ---
const SettingsModal = ({ isOpen, onClose, settings, onSave, onChangeHome }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    if (!isOpen) return null;

    const t = TRANSLATIONS[localSettings.language] || TRANSLATIONS['de'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-m3-surface rounded-m3-xl max-w-sm w-full max-h-[90vh] shadow-m3-5 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                 <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-m3-outline-variant flex-shrink-0">
                     <h2 className="text-xl font-bold text-m3-on-surface flex items-center gap-2">
                         <Settings size={24} className="text-m3-primary"/> {t.settings}
                     </h2>
                     <button onClick={onClose}><X className="text-m3-on-surface-variant"/></button>
                 </div>
                 
                 <div className="overflow-y-auto px-6 py-4 flex-1">

                 {/* CHANGE HOME LOCATION (NEU) */}
                 <div className="mb-6">
                     <label className="text-sm font-bold text-m3-on-surface-variant uppercase tracking-wide mb-3 flex items-center gap-2">
                        <MapIcon size={16}/> {t.homeLoc}
                     </label>
                     <button 
                         onClick={() => { onClose(); onChangeHome(); }}
                         className="w-full py-3 bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface font-bold rounded-m3-md transition flex items-center justify-center gap-2"
                     >
                         <Edit2 size={16}/> {t.changeHome}
                     </button>
                 </div>

                 {/* LANGUAGE */}
                 <div className="mb-6">
                     <label className="text-sm font-bold text-m3-on-surface-variant uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Globe size={16}/> {t.language}
                     </label>
                     <div className="grid grid-cols-2 gap-2 bg-m3-surface-container p-2 rounded-m3-md max-h-60 overflow-y-auto">
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'de'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'de' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇩🇪 Deutsch
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'en'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'en' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇬🇧 English
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'fr'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'fr' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇫🇷 Français
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'es'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'es' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇪🇸 Español
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'it'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'it' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇮🇹 Italiano
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'tr'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'tr' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇹🇷 Türkçe
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'pl'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'pl' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇵🇱 Polski
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'nl'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'nl' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇳🇱 Nederlands
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'hr'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'hr' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇭🇷 Hrvatski
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'el'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'el' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇬🇷 Ελληνικά
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'da'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'da' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇩🇰 Dansk
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'ru'})}
                             className={`py-2 px-3 rounded-m3-sm text-sm font-bold transition ${localSettings.language === 'ru' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             🇷🇺 Русский
                         </button>
                     </div>
                 </div>

                 {/* THEME (NEU) */}
                 <div className="mb-6">
                     <label className="text-sm font-bold text-m3-on-surface-variant uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Palette size={16}/> {t.theme}
                     </label>
                     <div className="flex gap-2 bg-m3-surface-container p-1 rounded-m3-md">
                         <button 
                             onClick={() => setLocalSettings({...localSettings, theme: 'auto'})}
                             className={`flex-1 py-2 rounded-m3-sm text-xs sm:text-sm font-bold transition ${localSettings.theme === 'auto' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             {t.themeAuto}
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, theme: 'light'})}
                             className={`flex-1 py-2 rounded-m3-sm text-xs sm:text-sm font-bold transition ${localSettings.theme === 'light' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             {t.themeLight}
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, theme: 'dark'})}
                             className={`flex-1 py-2 rounded-m3-sm text-xs sm:text-sm font-bold transition ${localSettings.theme === 'dark' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                         >
                             {t.themeDark}
                         </button>
                     </div>
                 </div>

                  {/* UNITS */}
                  <div className="mb-6">
                      <label className="text-sm font-bold text-m3-on-surface-variant uppercase tracking-wide mb-3 flex items-center gap-2">
                         <Thermometer size={16}/> {t.units}
                      </label>
                      <div className="flex flex-wrap gap-2 bg-m3-surface-container p-1 rounded-m3-md">
                          <button 
                              onClick={() => setLocalSettings({...localSettings, unit: 'celsius'})}
                              className={`flex-1 py-2 rounded-m3-sm text-xs sm:text-sm font-bold transition ${localSettings.unit === 'celsius' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                          >
                              °C (Celsius)
                          </button>
                          <button 
                              onClick={() => setLocalSettings({...localSettings, unit: 'fahrenheit'})}
                              className={`flex-1 py-2 rounded-m3-sm text-xs sm:text-sm font-bold transition ${localSettings.unit === 'fahrenheit' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                          >
                              °F (Fahrenheit)
                          </button>
                          <button 
                              onClick={() => setLocalSettings({...localSettings, unit: 'kelvin'})}
                              className={`flex-1 py-2 rounded-m3-sm text-xs sm:text-sm font-bold transition ${localSettings.unit === 'kelvin' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                          >
                              K (Kelvin)
                          </button>
                      </div>
                  </div>

                  {/* WIND */}
                  <div className="mb-6">
                      <label className="text-sm font-bold text-m3-on-surface-variant uppercase tracking-wide mb-3 flex items-center gap-2">
                         <Wind size={16}/> {t.wind}
                      </label>
                      <div className="flex gap-2 bg-m3-surface-container p-1 rounded-m3-md">
                          <button 
                              onClick={() => setLocalSettings({...localSettings, windUnit: 'kmh'})}
                              className={`flex-1 py-2 rounded-m3-sm text-xs sm:text-sm font-bold transition ${localSettings.windUnit === 'kmh' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                          >
                              km/h
                          </button>
                          <button 
                              onClick={() => setLocalSettings({...localSettings, windUnit: 'ms'})}
                              className={`flex-1 py-2 rounded-m3-sm text-xs sm:text-sm font-bold transition ${localSettings.windUnit === 'ms' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                          >
                              m/s
                          </button>
                          <button 
                              onClick={() => setLocalSettings({...localSettings, windUnit: 'mph'})}
                              className={`flex-1 py-2 rounded-m3-sm text-xs sm:text-sm font-bold transition ${localSettings.windUnit === 'mph' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                          >
                              mph
                          </button>
                      </div>
                  </div>

                  {/* PRECIP */}
                  <div className="mb-8">
                      <label className="text-sm font-bold text-m3-on-surface-variant uppercase tracking-wide mb-3 flex items-center gap-2">
                         <Droplets size={16}/> {t.precip}
                      </label>
                      <div className="flex gap-2 bg-m3-surface-container p-1 rounded-m3-md">
                          <button 
                              onClick={() => setLocalSettings({...localSettings, precipUnit: 'mm'})}
                              className={`flex-1 py-2 rounded-m3-sm text-xs sm:text-sm font-bold transition ${localSettings.precipUnit === 'mm' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                          >
                              mm
                          </button>
                          <button 
                              onClick={() => setLocalSettings({...localSettings, precipUnit: 'in'})}
                              className={`flex-1 py-2 rounded-m3-sm text-xs sm:text-sm font-bold transition ${localSettings.precipUnit === 'in' ? 'bg-m3-primary-container shadow-m3-1 text-m3-on-primary-container' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                          >
                              in
                          </button>
                      </div>
                  </div>

                 </div>

                 <div className="px-6 pb-6 pt-4 border-t border-m3-outline-variant flex-shrink-0">
                     <button 
                        onClick={() => { onSave(localSettings); onClose(); }}
                        className="w-full py-3 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold rounded-m3-md shadow-m3-2 transition active:scale-95"
                     >
                         {t.save}
                     </button>
                 </div>
             </div>
        </div>
    );
};

const WeatherLandscape = ({ code, isDay, date, temp, sunrise, sunset, windSpeed, cloudCover = 0, precipitation = 0, snowfall = 0, lang='de', demoWeather, demoSeason, demoEvent, demoTime, demoWindSpeed }) => {
  // Move helper to top of component to use it for initial variables
  const getDecimalHour = (dateInput) => {
    if (!dateInput) return 0;
    // Wenn es ein ISO-String ist, parsen
    const d = typeof dateInput === 'string' ? parseLocalTime(dateInput) : new Date(dateInput);
    // ÄNDERUNG: Sekunden hinzufügen für smoothere Bewegung
    return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  };
    
  const d = date ? new Date(date) : new Date();
  
  // Override time if demoTime is provided (format: "HH:MM")
  let currentHour = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  if (demoTime) {
    const [hours, minutes] = demoTime.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      currentHour = hours + minutes / 60;
    }
  }
  
  // Override windSpeed if demoWindSpeed is provided
  if (demoWindSpeed !== null && demoWindSpeed !== undefined) {
    windSpeed = demoWindSpeed;
  }
  
  // FIX: Nutze || statt ?? damit 0 (fehlende Daten) als false gewertet wird und der Default greift
  const sunriseHour = getDecimalHour(sunrise) || 6.5; 
  const sunsetHour = getDecimalHour(sunset) || 20.5;

  // WICHTIG: Überschreibe isNight, falls echte Uhrzeit (date) übergeben wurde
  // Damit synchronisieren wir Tag/Nacht exakt mit Sonnenaufgang/untergang,
  // unabhängig vom stündlichen API-Flag "is_day".
  let calculatedIsDay = isDay;
  
  // Wir prüfen, ob sunrise/sunset valide (>0) sind, bevor wir die Berechnung überschreiben
  if (date && sunriseHour > 0 && sunsetHour > 0) {
      // ÄNDERUNG: < sunsetHour (statt <=), damit bei Sonnenuntergang sofort Nacht ist
      calculatedIsDay = (currentHour >= sunriseHour && currentHour < sunsetHour) ? 1 : 0;
  }
  const isNight = calculatedIsDay === 0;
  
  // Override weather/temp if demo mode (before weather condition checks)
  if (demoWeather) {
    const demoMap = {
      // Clear/Cloudy conditions
      'clear': 0, 
      'slightly_cloudy': 2, 
      'cloudy': 2, 
      'overcast': 3,
      'strongly_overcast': 3,
      
      // Rain conditions
      'drizzle': 51,
      'light_rain': 61, 
      'medium_rain': 63,
      'rain': 63,
      'heavy_rain': 65,
      'storm': 95,
      
      // Snow conditions
      'light_snow': 71,
      'medium_snow': 73,
      'snow': 73,
      'heavy_snow': 75,
      
      // Other conditions
      'sleet': 56,
      'fog': 45,
      'hail': 96,
      'thunderstorm': 95
    };
    code = demoMap[demoWeather] !== undefined ? demoMap[demoWeather] : code;
    
    // Temperature overrides
    if (demoWeather === 'heat') temp = 35;
    if (demoWeather === 'freeze') temp = -10;
    if (demoWeather === 'tropical_night') temp = 25;
  }
  
  // --- WETTERZUSTÄNDE ---
  const isHail = [96, 99].includes(code);
  const isClear = code === 0 || code === 1;
  const isPartlyCloudy = code === 2;
  const isOvercast = code === 3 || code === 45 || code === 48; 
  // Nieselregen: Codes 51, 53, 55
  const isDrizzle = [51, 53, 55].includes(code);
  const isLightRain = [61, 80].includes(code);
  const isMediumRain = [63, 81].includes(code);
  const isHeavyRain = [65, 82].includes(code);
  const isRain = isLightRain || isMediumRain || isHeavyRain;
  const isLightSnow = [71, 77, 85].includes(code);
  const isMediumSnow = [73].includes(code);
  const isHeavySnow = [75, 86].includes(code);
  const isSnow = isLightSnow || isMediumSnow || isHeavySnow;
  const isSleet = [56, 57, 66, 67].includes(code);
  const isStorm = [95, 96, 99].includes(code);
  const isFog = [45, 48].includes(code);
  const isExtremeHeat = temp >= 30;
  const isDeepFreeze = temp <= -5;
  const isFreezing = temp <= 0;
  const isWindy = windSpeed >= 30;
  const isStormyWind = windSpeed >= 60;
  const isTropicalNight = isNight && temp > 20;

  // --- CLOUD ANIMATION LOGIC (NEW) ---
  // Calculate number of clouds based on cloudCover percentage or weather code
  // cloudCover is 0-100, we want 0-5 clouds
  let numClouds;
  
  // If cloudCover data is available and > 0, use it
  if (cloudCover && cloudCover > 0) {
    numClouds = Math.min(5, Math.max(0, Math.round(cloudCover / 20)));
  } else {
    // Fallback: determine cloud count based on weather code
    if (isClear) {
      numClouds = 0;
    } else if (isPartlyCloudy) {
      numClouds = 2;
    } else if (isOvercast || isRain || isSnow || isStorm || isSleet || isDrizzle || isFog) {
      numClouds = 5; // Full cloud coverage for these conditions
    } else {
      numClouds = 0;
    }
  }
  
  // Calculate cloud color based on precipitation
  // If raining or snowing, clouds should be gray
  // The more precipitation, the darker the gray
  const totalPrecipitation = (Number(precipitation) || 0) + (Number(snowfall) || 0);
  const hasPrecipitation = totalPrecipitation > 0.1;
  
  let cloudColor = "white";
  let cloudOpacity = 0.8;
  
  if (hasPrecipitation) {
    // Calculate darkness based on precipitation intensity
    // Light: 0.1-1mm -> lighter gray
    // Medium: 1-5mm -> medium gray
    // Heavy: 5+ mm -> dark gray
    if (totalPrecipitation < 1) {
      cloudColor = "#cbd5e1"; // Light gray (slate-300)
    } else if (totalPrecipitation < 5) {
      cloudColor = "#94a3b8"; // Medium gray (slate-400)
    } else {
      cloudColor = "#64748b"; // Dark gray (slate-500)
    }
    cloudOpacity = 0.9;
  } else if (isStorm) {
    cloudColor = "#475569"; // Storm dark gray (slate-600)
    cloudOpacity = 0.95;
  } else if (isRain || isSnow || isSleet || isDrizzle) {
    // If it's raining/snowing but precipitation amount is very low
    cloudColor = "#cbd5e1"; // Light gray
    cloudOpacity = 0.85;
  }

  // --- SEASON DETECTION ---
  const month = d.getMonth(); // 0-11 (0=Jan, 11=Dec)
  let detectedSeason = 'winter'; // Default to winter for Dec (11), Jan (0), Feb (1)
  if (month >= 2 && month <= 4) detectedSeason = 'spring'; // Mar-May (2-4)
  else if (month >= 5 && month <= 7) detectedSeason = 'summer'; // Jun-Aug (5-7)
  else if (month >= 8 && month <= 10) detectedSeason = 'autumn'; // Sep-Nov (8-10)
  const season = demoSeason || detectedSeason;

  // --- SEASONAL EVENTS ---
  const dayOfMonth = d.getDate();
  let detectedEvent = 'none';
  // Christmas: Dec 1-25 (leave gap for New Year)
  if (month === 11 && dayOfMonth >= 1 && dayOfMonth <= 25) detectedEvent = 'christmas';
  // New Year's Eve: Dec 31
  else if (month === 11 && dayOfMonth === 31) detectedEvent = 'newyear';
  // Easter: Narrower range around typical Easter dates (late March to mid-April)
  else if ((month === 2 && dayOfMonth >= 25) || (month === 3 && dayOfMonth <= 20)) detectedEvent = 'easter';
  // Halloween: Oct 20-31
  else if (month === 9 && dayOfMonth >= 20 && dayOfMonth <= 31) detectedEvent = 'halloween';
  const event = demoEvent || detectedEvent;

  
  let celestialX = -50;
  let celestialY = 200; 
  let celestialType = 'none';
  let isDawn = false;
  let isDusk = false;

  // ÄNDERUNG: < sunsetHour (nicht <=), damit bei Sonnenuntergang die Sonne sofort verschwindet
  if (currentHour >= sunriseHour && currentHour < sunsetHour) {
     celestialType = 'sun';
     const dayLength = sunsetHour - sunriseHour;
     // Schutz vor Division durch Null
     const safeDayLength = dayLength > 0 ? dayLength : 12;
     const dayProgress = (currentHour - sunriseHour) / safeDayLength; 
     
     celestialX = 40 + dayProgress * 280; 
     
     // OPTIMIERTE PARABEL: 
     // Y=145 ist ca. Horizont-Linie. 
     // ÄNDERUNG: Faktor auf 0.0075 erhöht, damit die Sonne an den Rändern tiefer (ca. Y=170) startet/endet.
     // Dadurch "ploppt" sie nicht am Himmel auf, sondern geht wirklich am Horizont auf/unter.
     celestialY = 25 + 0.0075 * Math.pow(celestialX - 180, 2); 

     if (currentHour - sunriseHour < 0.75) isDawn = true;
     if (sunsetHour - currentHour < 0.75) isDusk = true;
  } else {
     celestialType = 'moon';
     let nightDuration = (24 - sunsetHour) + sunriseHour;
     const safeNightDuration = nightDuration > 0 ? nightDuration : 12;
     let timeSinceSunset = currentHour - sunsetHour;
     if (timeSinceSunset < 0) timeSinceSunset += 24; 
     
     const nightProgress = timeSinceSunset / safeNightDuration;
     celestialX = 40 + nightProgress * 280;
     celestialY = 25 + 0.0075 * Math.pow(celestialX - 180, 2);
  }

  const moonPhase = date ? getMoonPhase(date) : 0;
  
  const groundColor = (isSnow || isDeepFreeze) ? "#e2e8f0" : (isNight ? "#0f172a" : "#4ade80"); // Nachts dunklerer Boden
  const mountainColor = (isSnow || isDeepFreeze) ? "#f1f5f9" : (isNight ? "#1e293b" : "#64748b"); 
  const treeTrunk = isNight ? "#4a3830" : "#78350f";
  
  // Season-based tree colors
  let treeLeaf = "#16a34a"; // default green
  let showDeciduousLeaves = true; // Flag to show/hide leaves on deciduous trees
  
  if (season === 'autumn') {
    treeLeaf = "#f59e0b"; // orange/amber
    showDeciduousLeaves = true;
  } else if (season === 'winter') {
    // In winter: deciduous trees are bare (no leaves), evergreens stay green
    showDeciduousLeaves = false; // Hide leaves on deciduous trees
  } else if (season === 'spring') {
    treeLeaf = isNight ? "#86efac" : "#22c55e"; // bright spring green with some pink blossoms
    showDeciduousLeaves = true;
  } else if (season === 'summer') {
    treeLeaf = isNight ? "#15803d" : "#16a34a"; // rich deep green
    showDeciduousLeaves = true;
  }
  
  // Evergreen color (stays the same in all seasons)
  const evergreenColor = (isSnow || isDeepFreeze) ? "#1e7b42" : (isNight ? "#15803d" : "#16a34a");
  
  const houseWall = isNight ? "#78350f" : "#b45309"; 
  const houseRoof = (isSnow || isDeepFreeze) ? "#f1f5f9" : (isNight ? "#451a03" : "#7c2d12");
  const windowColor = isNight ? "#fbbf24" : "#94a3b8";
  const windowStroke = isNight ? "#b45309" : "#475569";

  let treeAnim = "anim-tree-gentle";
  if (isStormyWind) treeAnim = "anim-tree-storm";
  else if (isWindy) treeAnim = "anim-tree-windy";

  const rainRotation = isStormyWind ? "rotate(20)" : "rotate(0)";

  // Reusable bare branches element for winter deciduous trees
  const bareBranches = (
    <>
      <line x1="10" y1="10" x2="5" y2="5" stroke={treeTrunk} strokeWidth="1" />
      <line x1="10" y1="10" x2="15" y2="5" stroke={treeTrunk} strokeWidth="1" />
      <line x1="10" y1="7" x2="6" y2="3" stroke={treeTrunk} strokeWidth="0.8" />
      <line x1="10" y1="7" x2="14" y2="3" stroke={treeTrunk} strokeWidth="0.8" />
      <line x1="10" y1="4" x2="7" y2="0" stroke={treeTrunk} strokeWidth="0.8" />
      <line x1="10" y1="4" x2="13" y2="0" stroke={treeTrunk} strokeWidth="0.8" />
    </>
  );

  return (
    <svg viewBox="0 0 360 160" className="w-full h-full overflow-hidden" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="daySkyGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id="dawnGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="duskGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#be185d" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fogGradient" x1="0" x2="1" y1="0" y2="0">
           <stop offset="0%" stopColor="white" stopOpacity="0.1" />
           <stop offset="20%" stopColor="white" stopOpacity="0.5" />
           <stop offset="80%" stopColor="white" stopOpacity="0.5" />
           <stop offset="100%" stopColor="white" stopOpacity="0.1" />
        </linearGradient>
         <filter id="iceGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 1  0 0 0 18 -7" result="glow" />
            <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="glow" />
            </feMerge>
        </filter>
      </defs>

      {/* Sky background - blue gradient for day, black for night */}
      {isNight ? (
        <rect x="0" y="0" width="360" height="160" fill="#0a0a0a" />
      ) : (
        <rect x="0" y="0" width="360" height="160" fill="url(#daySkyGradient)" />
      )}
      
      {isDawn && <rect x="-100" y="0" width="600" height="160" fill="url(#dawnGradient)" opacity="0.3" className="anim-glow" />}
      {isDusk && <rect x="-100" y="0" width="600" height="160" fill="url(#duskGradient)" opacity="0.3" className="anim-glow" />}

      {/* SONNE UND MOND - IMMER GERENDERT, ABER HINTER WOLKEN WENN OVERCAST */}
      {celestialType === 'sun' && (
        <g transform={`translate(${celestialX}, ${celestialY})`}>
          {/* Outer Glow */}
          <circle r="25" fill="#fbbf24" opacity="0.4" filter="blur(8px)" />
          {/* Sun Body */}
          <circle r="14" fill="#fbbf24" className="animate-ray" />
          {/* Rays */}
          <g className="animate-spin-slow">
            {[...Array(8)].map((_, i) => (
              <line key={i} x1="0" y1="-20" x2="0" y2="-16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 45})`} />
            ))}
          </g>
        </g>
      )}

      {celestialType === 'moon' && (
        <g transform={`translate(${celestialX}, ${celestialY})`}>
           {/* Moon Glow */}
           <circle r="20" fill="white" opacity="0.2" filter="blur(5px)" />
           <circle r="12" fill="white" opacity="0.9" />
           {moonPhase !== 4 && <circle r="12" fill="black" opacity="0.5" transform={`translate(${moonPhase < 4 ? -6 : 6}, 0)`} />}
        </g>
      )}
      
      {/* Stars visible at night regardless of weather conditions */}
      {isNight && (
         <g>
            <circle cx="50" cy="30" r="1" fill="white" className="animate-twinkle-1" style={{animationDelay: '0s'}} />
            <circle cx="300" cy="40" r="1.5" fill="white" className="animate-twinkle-2" style={{animationDelay: '1s'}} />
            <circle cx="200" cy="20" r="1" fill="white" className="animate-twinkle-3" style={{animationDelay: '2s'}} />
            <circle cx="100" cy="50" r="1" fill="white" className="animate-twinkle-2" style={{animationDelay: '1.5s'}} />
            <circle cx="350" cy="25" r="1" fill="white" className="animate-twinkle-1" style={{animationDelay: '0.5s'}} />
            {/* Additional stars for better visual effect */}
            <circle cx="150" cy="35" r="0.8" fill="white" className="animate-twinkle-3" style={{animationDelay: '0.8s'}} />
            <circle cx="250" cy="45" r="1.2" fill="white" className="animate-twinkle-1" style={{animationDelay: '1.2s'}} />
            <circle cx="320" cy="15" r="0.8" fill="white" className="animate-twinkle-2" style={{animationDelay: '0.3s'}} />
            <circle cx="80" cy="20" r="1" fill="white" className="animate-twinkle-3" style={{animationDelay: '1.8s'}} />
            <circle cx="180" cy="55" r="0.9" fill="white" className="animate-twinkle-1" style={{animationDelay: '2.2s'}} />
         </g>
      )}

      <path d="M-50 160 L120 40 L280 160 Z" fill={mountainColor} />
      <path d="M200 160 L320 70 L460 160 Z" fill={mountainColor} opacity="0.8" />
      {(isSnow || isDeepFreeze || isSleet) && <path d="M120 40 L150 70 L90 70 Z" fill="white" />} 
      {(isSnow || isDeepFreeze || isSleet) && <path d="M320 70 L340 90 L300 90 Z" fill="white" />}

      <path d="M-50 140 Q 50 130 150 145 T 450 135 V 170 H -50 Z" fill={groundColor} />
      
      {(isSleet || (isRain && isFreezing) || isDeepFreeze) && (
        <path d="M-50 142 Q 50 132 150 147 T 450 137 V 170 H -50 Z" fill="#bae6fd" opacity="0.4" />
      )}
      {(isDeepFreeze || (isRain && isFreezing)) && (
          <g>
             <circle cx="100" cy="150" r="2" fill="white" className="anim-sparkle" />
             <circle cx="250" cy="160" r="1.5" fill="white" className="anim-sparkle" style={{animationDelay: '1s'}} />
             <circle cx="180" cy="155" r="2" fill="white" className="anim-sparkle" style={{animationDelay: '2s'}} />
          </g>
      )}

      {/* --- HAUS (zuerst gerendert, damit Bäume davor können) --- */}
      <g transform="translate(140, 120)">
          <rect x="45" y="-10" width="6" height="15" fill="#57534e" />
          <rect x="25" y="10" width="40" height="30" fill={houseWall} />
          <path d="M18 10 L45 -15 L72 10 Z" fill={houseRoof} filter={isSnow ? "brightness(1.1)" : "none"} />
          <rect x="32" y="18" width="10" height="10" fill={windowColor} stroke={windowStroke} strokeWidth="1"/>
          <line x1="37" y1="18" x2="37" y2="28" stroke={windowStroke} strokeWidth="1" />
          <line x1="32" y1="23" x2="42" y2="23" stroke={windowStroke} strokeWidth="1" />
          <rect x="50" y="22" width="10" height="18" fill="#3f2e22" />
          {isNight && <circle cx="37" cy="23" r="8" fill="#fbbf24" opacity="0.6" filter="blur(4px)" />}
      </g>

      {/* --- BÄUME --- */}
      
      {/* Baum Links - Rand (Deciduous tree) */}
      <g transform="translate(40, 120)">
        <g className={treeAnim}>
            <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
            {showDeciduousLeaves ? (
              <>
                <path d="M10 0 L20 15 H0 Z" fill={treeLeaf} />
                <path d="M10 -10 L18 5 H2 Z" fill={treeLeaf} />
              </>
            ) : bareBranches}
        </g>
      </g>

      {/* Baumgruppe Rechts (Deciduous tree) */}
      <g transform="translate(280, 135) scale(0.9)">
        <g className={treeAnim} style={{animationDelay: '0.5s'}}>
            <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
            {showDeciduousLeaves ? (
              <>
                <path d="M10 0 L20 15 H0 Z" fill={treeLeaf} />
                <path d="M10 -10 L18 5 H2 Z" fill={treeLeaf} />
              </>
            ) : bareBranches}
        </g>
      </g>
      
      {/* Baum Rechts - Rand (Evergreen - Pine tree) */}
      <g transform="translate(320, 134) scale(0.8)">
        <g className={treeAnim} style={{animationDelay: '0.7s'}}>
            <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
            <path d="M10 0 L20 15 H0 Z" fill={evergreenColor} />
            <path d="M10 -10 L18 5 H2 Z" fill={evergreenColor} />
        </g>
      </g>

      {/* Zusätzliche Bäume auf der Wiese */}
      
      {/* Kleiner Baum zwischen Links und Haus (Deciduous tree) */}
      <g transform="translate(100, 130) scale(0.7)">
        <g className={treeAnim} style={{animationDelay: '0.3s'}}>
            <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
            {showDeciduousLeaves ? (
              <>
                <path d="M10 0 L20 15 H0 Z" fill={treeLeaf} />
                <path d="M10 -10 L18 5 H2 Z" fill={treeLeaf} />
              </>
            ) : bareBranches}
        </g>
      </g>

      {/* Kleiner Baum rechts vom Haus (Evergreen - Pine tree) */}
      <g transform="translate(230, 128) scale(0.75)">
        <g className={treeAnim} style={{animationDelay: '0.4s'}}>
            <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
            <path d="M10 0 L20 15 H0 Z" fill={evergreenColor} />
            <path d="M10 -10 L18 5 H2 Z" fill={evergreenColor} />
        </g>
      </g>

      {/* Zusätzlicher kleiner Baum links (Evergreen - Pine tree) */}
      <g transform="translate(70, 135) scale(0.65)">
        <g className={treeAnim} style={{animationDelay: '0.6s'}}>
            <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
            <path d="M10 0 L20 15 H0 Z" fill={evergreenColor} />
            <path d="M10 -10 L18 5 H2 Z" fill={evergreenColor} />
        </g>
      </g>

      {/* DYNAMIC CLOUD RENDERING BASED ON CLOUDINESS */}
      {numClouds > 0 && (
        <g className="anim-clouds">
          {/* Cloud paths - render based on cloudCover percentage */}
          {/* Cloud 1 (left side) - shows at 10%+ cloudiness */}
          {numClouds >= 1 && (
            <path d="M40 50 Q 55 35 70 50 T 100 50 T 120 60 H 40 Z" 
                  fill={cloudColor} 
                  fillOpacity={cloudOpacity * 0.85} 
                  transform="translate(0,0)" />
          )}
          
          {/* Cloud 2 (center-right) - shows at 30%+ cloudiness */}
          {numClouds >= 2 && (
            <path d="M240 40 Q 255 25 270 40 T 300 40 T 320 50 H 240 Z" 
                  fill={cloudColor} 
                  fillOpacity={cloudOpacity} 
                  transform="translate(20,10)" />
          )}
          
          {/* Cloud 3 (center-left) - shows at 50%+ cloudiness */}
          {numClouds >= 3 && (
            <path d="M140 30 Q 155 15 170 30 T 200 30 T 220 40 H 140 Z" 
                  fill={cloudColor} 
                  fillOpacity={cloudOpacity * 0.9} 
                  transform="translate(-10,5)" />
          )}
          
          {/* Cloud 4 (far right) - shows at 70%+ cloudiness */}
          {numClouds >= 4 && (
            <path d="M280 55 Q 295 40 310 55 T 340 55 T 360 65 H 280 Z" 
                  fill={cloudColor} 
                  fillOpacity={cloudOpacity * 0.8} 
                  transform="translate(10,0)" />
          )}
          
          {/* Cloud 5 (upper center) - shows at 90%+ cloudiness */}
          {numClouds >= 5 && (
            <path d="M180 20 Q 195 5 210 20 T 240 20 T 260 30 H 180 Z" 
                  fill={cloudColor} 
                  fillOpacity={cloudOpacity * 0.85} 
                  transform="translate(0,-5)" />
          )}
          
          {/* Dark overlay for storms and heavy rain */}
          {(isStorm || isHeavyRain) && <rect x="-50" y="0" width="460" height="160" fill="black" opacity="0.3" />}
        </g>
      )}

      {isFog && (
         <g>
            <rect x="-50" y="80" width="500" height="40" fill="url(#fogGradient)" className="anim-fog-1" opacity="0.6" />
            <rect x="-50" y="100" width="500" height="50" fill="url(#fogGradient)" className="anim-fog-2" opacity="0.5" />
         </g>
      )}

      {isExtremeHeat && (
          <g className="anim-heat">
             <rect x="-50" y="80" width="500" height="80" fill="orange" opacity="0.1" style={{mixBlendMode: 'overlay'}} />
          </g>
      )}

      {isDrizzle && (
         <g fill="#93c5fd" opacity="0.4" transform={rainRotation}>
            {[...Array(40)].map((_, i) => (
               <rect key={i} x={Math.random() * 400 - 20} y="40" width="0.8" height="6" 
                     className={`animate-rain-${i%3 === 0 ? '1' : i%3 === 1 ? '2' : '3'}`} 
                     style={{animationDelay: `${Math.random()}s`}} />
            ))}
         </g>
      )}

      {(isRain || isSleet) && (
         <g fill={isSleet ? "#cbd5e1" : "#93c5fd"} opacity={0.8} transform={rainRotation}>
            {[...Array(isHeavyRain ? 60 : isMediumRain ? 40 : 30)].map((_, i) => (
               <rect key={i} x={Math.random() * 400 - 20} y="40" 
                     width={isHeavyRain ? 2 : isMediumRain ? 1.7 : 1.5} 
                     height={isHeavyRain ? 15 : isMediumRain ? 13 : 12} 
                     className={isHeavyRain ? "animate-rain-storm" : `animate-rain-${i%3 === 0 ? '1' : i%3 === 1 ? '2' : '3'}`} 
                     style={{animationDelay: `${Math.random()}s`}} />
            ))}
         </g>
      )}

      {(isSnow || isSleet) && (
         <g fill="white" opacity="0.9" transform={rainRotation}>
            {[...Array(isHeavySnow ? 80 : isMediumSnow ? 60 : 40)].map((_, i) => {
               const startX = Math.random() * 400 - 20;
               const delay = Math.random() * 5;
               const size = isHeavySnow ? Math.random() * 3 + 1.5 : isMediumSnow ? Math.random() * 2.5 + 1 : Math.random() * 2 + 1;
               const isSlow = i % 2 === 0;
               return (
                  <circle 
                    key={i} 
                    cx={startX} 
                    cy="-10" 
                    r={size} 
                    className={isHeavySnow || isStormyWind ? "animate-snow-fast" : isMediumSnow ? "animate-snow-fast" : "animate-snow-slow"} 
                    style={{
                        animationDelay: `${delay}s`, 
                        opacity: Math.random() * 0.5 + 0.5
                    }} 
                  />
               );
            })}
         </g>
      )}
      
      {isStorm && (
         <g className="anim-lightning">
            <path d="M160 30 L140 60 L155 60 L135 130" stroke="#fef08a" strokeWidth="3" fill="none" filter="url(#iceGlow)" />
            <rect x="-50" y="0" width="500" height="200" fill="white" opacity="0.1" />
         </g>
      )}

      {/* Hail */}
      {isHail && (
         <g fill="white" opacity="0.9">
            {[...Array(60)].map((_, i) => (
               <circle 
                 key={i} 
                 cx={Math.random() * 400 - 20} 
                 cy="-10" 
                 r={Math.random() * 2 + 1.5} 
                 className="animate-hail" 
                 style={{animationDelay: `${Math.random() * 1.2}s`}} 
               />
            ))}
         </g>
      )}

      {/* Tropical Night Glow */}
      {isTropicalNight && (
         <g className="anim-tropical">
            <rect x="-50" y="0" width="500" height="160" fill="#fbbf24" opacity="0.15" />
         </g>
      )}

      {/* Spring Blossoms */}
      {season === 'spring' && !isSnow && (
         <g>
            <circle cx="45" cy="108" r="2" fill="#fecdd3" />
            <circle cx="50" cy="105" r="1.5" fill="#fda4af" />
            <circle cx="160" cy="110" r="2" fill="#fecdd3" />
            <circle cx="165" cy="107" r="1.5" fill="#fda4af" />
            <circle cx="285" cy="125" r="2" fill="#fecdd3" />
            <circle cx="325" cy="123" r="1.5" fill="#fda4af" />
            {/* Ground flowers */}
            <circle cx="80" cy="155" r="2" fill="#fda4af" />
            <circle cx="120" cy="153" r="2" fill="#fecdd3" />
            <circle cx="240" cy="157" r="2" fill="#fda4af" />
            <circle cx="300" cy="154" r="2" fill="#fecdd3" />
         </g>
      )}

      {/* Autumn Falling Leaves */}
      {season === 'autumn' && (
         <g>
            {[...Array(15)].map((_, i) => {
               const colors = ['#f59e0b', '#dc2626', '#eab308'];
               const color = colors[i % 3];
               return (
                  <ellipse 
                    key={i} 
                    cx={Math.random() * 400 - 20} 
                    cy="-10" 
                    rx="3" 
                    ry="2" 
                    fill={color} 
                    className="animate-leaves" 
                    style={{animationDelay: `${Math.random() * 8}s`}} 
                  />
               );
            })}
            {/* Ground leaves */}
            <ellipse cx="90" cy="155" rx="3" ry="2" fill="#dc2626" opacity="0.7" />
            <ellipse cx="140" cy="153" rx="3" ry="2" fill="#f59e0b" opacity="0.7" />
            <ellipse cx="190" cy="156" rx="3" ry="2" fill="#eab308" opacity="0.7" />
            <ellipse cx="250" cy="154" rx="3" ry="2" fill="#dc2626" opacity="0.7" />
         </g>
      )}

      {/* Winter - Bare deciduous trees (already handled by treeLeaf color) */}
      {season === 'winter' && (isSnow || isDeepFreeze) && (
         <g>
            {/* Snow on tree branches */}
            <ellipse cx="45" cy="110" rx="4" ry="2" fill="white" opacity="0.8" />
            <ellipse cx="160" cy="112" rx="4" ry="2" fill="white" opacity="0.8" />
            <ellipse cx="285" cy="127" rx="4" ry="2" fill="white" opacity="0.8" />
            <ellipse cx="325" cy="126" rx="3" ry="1.5" fill="white" opacity="0.8" />
         </g>
      )}

      {/* Christmas Decorations */}
      {event === 'christmas' && (
         <g>
            {/* Ornaments on trees */}
            <circle cx="42" cy="112" r="2" fill="#dc2626" />
            <circle cx="48" cy="108" r="2" fill="#eab308" />
            <circle cx="158" cy="114" r="2" fill="#dc2626" />
            <circle cx="164" cy="110" r="2" fill="#3b82f6" />
            <circle cx="283" cy="129" r="2" fill="#eab308" />
            <circle cx="287" cy="125" r="2" fill="#dc2626" />
         </g>
      )}

      {/* Easter */}
      {event === 'easter' && (
         <g>
            {/* Easter bunny near house */}
            <ellipse cx="175" cy="137" rx="3" ry="4" fill="#d4d4d4" />
            <circle cx="175" cy="133" r="2" fill="#d4d4d4" />
            <ellipse cx="174" cy="131" rx="0.5" ry="1.5" fill="#d4d4d4" />
            <ellipse cx="176" cy="131" rx="0.5" ry="1.5" fill="#d4d4d4" />
            {/* Hidden eggs */}
            <ellipse cx="100" cy="153" rx="2" ry="2.5" fill="#fda4af" />
            <ellipse cx="260" cy="156" rx="2" ry="2.5" fill="#93c5fd" />
            <ellipse cx="180" cy="155" rx="2" ry="2.5" fill="#bef264" />
         </g>
      )}

      {/* Halloween Pumpkins */}
      {event === 'halloween' && (
         <g>
            <ellipse cx="170" cy="138" rx="4" ry="3.5" fill="#f97316" />
            <rect x="169" y="135" width="2" height="1" fill="#451a03" />
            <ellipse cx="240" cy="139" rx="3" ry="2.5" fill="#f97316" />
            <rect x="239" y="137" width="2" height="1" fill="#451a03" />
         </g>
      )}

      {/* New Year Fireworks */}
      {event === 'newyear' && (
         <g>
            {[...Array(5)].map((_, i) => (
               <g key={i}>
                  <circle cx={80 + i * 60} cy={30 + (i % 2) * 20} r="0.5" fill="#fef08a">
                     <animate attributeName="r" values="0.5;8;0.5" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                     <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                  </circle>
                  {[...Array(8)].map((_, j) => {
                     const angle = (j * 45) * Math.PI / 180;
                     return (
                        <line 
                          key={j}
                          x1={80 + i * 60} 
                          y1={30 + (i % 2) * 20} 
                          x2={80 + i * 60 + Math.cos(angle) * 10} 
                          y2={30 + (i % 2) * 20 + Math.sin(angle) * 10} 
                          stroke={['#fef08a', '#fda4af', '#93c5fd'][i % 3]} 
                          strokeWidth="1.5"
                        >
                          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                          <animate attributeName="x2" values={`${80 + i * 60};${80 + i * 60 + Math.cos(angle) * 15};${80 + i * 60}`} dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                          <animate attributeName="y2" values={`${30 + (i % 2) * 20};${30 + (i % 2) * 20 + Math.sin(angle) * 15};${30 + (i % 2) * 20}`} dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                        </line>
                     );
                  })}
               </g>
            ))}
         </g>
      )}

    </svg>
  );
};

// --- NEU: HOURLY TEMPERATURE TILES (Horizontal tiles with next hours temps) ---
const HourlyTemperatureTiles = ({ data, lang='de', formatTemp, getTempUnitSymbol }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];
  
  if (!data || data.length === 0) return null;
  
  // Take next 12 hours
  const hourlyData = data.slice(0, 12);
  
  return (
    <div className="bg-m3-surface-container-high/60 backdrop-blur-sm rounded-m3-2xl p-4 border border-m3-outline-variant/40 shadow-m3-2">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={18} className="text-m3-on-surface-variant" />
        <span className="text-m3-label-large font-bold text-m3-on-surface">{t.nextHours}</span>
      </div>
      
      <div className="overflow-x-auto pb-2 -mx-2 px-2" tabIndex="0">
        <div className="flex gap-3">
          {hourlyData.map((hour) => {
            const WeatherIcon = getWeatherConfig(hour.code, hour.isDay, lang).icon;
            return (
              <div 
                key={hour.time.toISOString()} 
                className="flex flex-col items-center bg-m3-surface-container/80 backdrop-blur-sm rounded-m3-xl p-3 min-w-[70px] border border-m3-outline-variant/30 shadow-m3-1 hover:shadow-m3-2 transition-all"
              >
                <span className="text-m3-label-small text-m3-on-surface-variant mb-1">
                  {hour.displayTime}
                </span>
                <WeatherIcon size={24} className="text-m3-on-surface mb-2" />
                <span className="text-m3-title-medium font-bold text-m3-on-surface">
                  {formatTemp(hour.temp)}{getTempUnitSymbol ? getTempUnitSymbol() : '°'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- NEU: PRECIPITATION TILE (Wann, Wie lang, Wie viel) ---
const PrecipitationTile = ({ data, minutelyData, lang='de', formatPrecip, getPrecipUnitLabel }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];

  // Analyse der nächsten 24h
  const analysis = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Wir betrachten nur die Zukunft (ab jetzt)
    const now = new Date();
    const futureData = data.filter(d => d.time > now);
    
    if (futureData.length === 0) return null;
    
    // Ist es gerade nass? (in der aktuellen Stunde oder nächsten Stunde)
    const current = data[0]; 
    // Only consider it "raining now" if there's actual measurable precipitation (minimum 0.1mm)
    const isRainingNow = current.precip > 0.1 || current.snow > 0.1;
    
    let result = { 
       type: 'none', // none, rain_now, rain_later, snow_now, snow_later, mixed_now, mixed_later
       startTime: null,
       endTime: null,
       amount: 0,
       rainAmount: 0,
       snowAmount: 0,
       duration: 0,
       isSnow: false,
       isMixed: false,
       maxIntensity: 0,
       minutelyStart: null,
       currentIntensity: 0,
       peakTime: null,
       hourlyForecast: [] // Array of {time, amount, rain, snow} for next hours
    };

    // 1. Check Minutely Data for precise start time (Next 2 hours)
    if (minutelyData && minutelyData.precipitation) {
        const mTime = minutelyData.time;
        const mPrecip = minutelyData.precipitation;
        
        // Find index for "now"
        const nowMs = now.getTime();
        let startIndex = -1;
        
        for(let i=0; i<mTime.length; i++) {
            const t = new Date(mTime[i]).getTime();
            if (t >= nowMs) {
                startIndex = i;
                break;
            }
        }
        
        if (startIndex !== -1) {
            // Check next 2 hours (8 * 15min slots) - only show if precipitation >= 0.1mm
            for(let i=startIndex; i < Math.min(startIndex + 8, mTime.length); i++) {
                if (mPrecip[i] > 0.1) {
                     result.minutelyStart = new Date(mTime[i]);
                     break; 
                }
            }
        }
    }

    // Calculate total precipitation for next 24 hours (for display on tile)
    // Include current hour + next 23 hours to match modal behavior
    let total24hPrecip = 0;
    let total24hRain = 0;
    let total24hSnow = 0;
    const next24Hours = data.slice(0, 24); // Include current hour (data[0])
    for (let i = 0; i < next24Hours.length; i++) {
        const d = next24Hours[i];
        total24hPrecip += (d.precip || 0) + (d.snow || 0);
        total24hRain += (d.precip || 0);
        total24hSnow += (d.snow || 0);
    }
    
    let foundStart = false;
    let peakIntensity = 0;
    let peakTime = null;
    
    // Loop to find start and end (Hourly Data) - limit to 24 hours
    for (let i = 0; i < Math.min(futureData.length, 24); i++) {
       const d = futureData[i];
       // Only consider precipitation if actual amount >= 0.1mm (no false positives from trace amounts)
       const hasPrecip = d.precip > 0.1 || d.snow > 0.1;
       
       if (hasPrecip) {
           if (!foundStart) {
               foundStart = true;
               result.startTime = result.minutelyStart || d.time; // Use minutely if available
               // Check weather code to verify actual snow event (codes: 71,73,75,77,85,86 for snow, 56,57,66,67 for sleet)
               // Snow should be treated like rain - only show if weather code explicitly indicates snow, not based on temperature
               const isSnowCode = d.code && SNOW_WEATHER_CODES.includes(d.code);
               result.isSnow = isSnowCode;
           }
           const hourlyAmount = d.precip + d.snow;
           const hourlyRain = d.precip > 0 ? d.precip : 0;
           const hourlySnow = d.snow > 0 ? d.snow : 0;
           
           result.maxIntensity = Math.max(result.maxIntensity, hourlyAmount);
           result.duration++;
           
           // Track peak time and hourly forecast (next 6 hours)
           if (hourlyAmount > peakIntensity) {
               peakIntensity = hourlyAmount;
               peakTime = d.time;
           }
           if (i < 6) { // Only first 6 hours for hourly forecast
               result.hourlyForecast.push({ time: d.time, amount: hourlyAmount, rain: hourlyRain, snow: hourlySnow });
           }
       } else {
           if (foundStart) {
               // Regen hat aufgehört
               result.endTime = d.time; 
               break; 
           }
       }
    }
    
    // Use 24h totals for display
    result.amount = total24hPrecip;
    result.rainAmount = total24hRain;
    result.snowAmount = total24hSnow;
    
    result.peakTime = peakTime;
    
    // Determine if it's mixed precipitation
    if (result.rainAmount > 0.1 && result.snowAmount > 0.1) {
        result.isMixed = true;
    }
    
    // Check if it's currently raining FIRST (highest priority)
    if (isRainingNow) {
        // Es regnet/schneit jetzt
        const hourlyRain = current.precip || 0;
        const hourlySnow = current.snow || 0;
        const hourlyAmount = hourlyRain + hourlySnow;
        result.currentIntensity = hourlyAmount;
        
        // Check weather code to verify actual snow event
        // Snow should be treated like rain - only show if weather code explicitly indicates snow, not based on temperature
        const isSnowCode = current.code && SNOW_WEATHER_CODES.includes(current.code);
        
        // Determine if mixed precipitation now
        const isMixedNow = hourlyRain > 0.1 && hourlySnow > 0.1;
        
        if (isMixedNow) {
            result.type = 'mixed_now';
            result.isMixed = true;
        } else {
            result.type = isSnowCode ? 'snow_now' : 'rain_now';
        }
        
        // If we haven't found future rain, set duration and peak for current hour
        if (!foundStart) {
            result.duration = 1; 
            result.maxIntensity = hourlyAmount;
            result.startTime = current.time;
            result.peakTime = current.time;
        } else {
            // Include current hour in duration count
            result.duration++;
            // Compare current intensity with future peak intensity
            if (hourlyAmount > result.maxIntensity) {
                result.maxIntensity = hourlyAmount;
                result.peakTime = current.time;
            }
        }
        // Note: result.amount, rainAmount, and snowAmount remain as 24h totals
        // Otherwise, keep the future rain data we already collected
    } else if (foundStart) {
        // Not raining now, but will rain later
        // Determine type based on startTime closeness
        const startDiff = result.startTime - now;
        const isNow = startDiff <= 0; // Or very close
        
        if (isNow) {
            if (result.isMixed) {
                result.type = 'mixed_now';
            } else {
                result.type = result.isSnow ? 'snow_now' : 'rain_now';
            }
        } else {
            if (result.isMixed) {
                result.type = 'mixed_later';
            } else {
                result.type = result.isSnow ? 'snow_later' : 'rain_later';
            }
        }
    }
    
    return result;
  }, [data, minutelyData]);

  if (!analysis) return null;

  const { type, startTime, duration, amount, rainAmount, snowAmount, isSnow, isMixed, maxIntensity, minutelyStart, currentIntensity, peakTime, hourlyForecast } = analysis;
  const isRain = type.includes('rain');
  const isNow = type.includes('now');
  const isMixedPrecip = type.includes('mixed');
  
  // Zeit-Logik
  const now = new Date();
  const diffMs = startTime ? startTime - now : 0;
  // "Später" definiert als > 90 min (wenn kein Minutely Data da ist)
  const isLaterThan2h = !isNow && startTime && (diffMs > 90 * 60 * 1000);
  // "Gleich" definiert als < 60min
  const isSoon = !isNow && startTime && (diffMs > 0 && diffMs < 60 * 60 * 1000);

  // Datum Check
  const isTomorrow = startTime && startTime.getDate() !== now.getDate();
  const dayPrefix = isTomorrow ? (t.tomorrow + " ") : "";
  
  // Custom headline logic
  let headline = t.nextRain;
  let timeDisplay = "--:--";
  
  // Improved locale mapping for all supported languages
  const localeMap = {
    'de': 'de-DE',
    'en': 'en-US',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'it': 'it-IT',
    'tr': 'tr-TR',
    'pl': 'pl-PL',
    'nl': 'nl-NL',
    'hr': 'hr-HR',
    'el': 'el-GR',
    'da': 'da-DK',
    'ru': 'ru-RU'
  };
  const locale = localeMap[lang] || 'de-DE';

  if (type === 'none') {
      headline = t.noPrecipExp;
  } else if (isNow) {
      if (isMixedPrecip) {
          headline = lang === 'en' ? 'Mixed Precipitation Now' : 'Mischniederschlag jetzt';
      } else {
          headline = t.rainNow;
      }
      timeDisplay = t.now;
  } else if (minutelyStart) {
      // Precise start time
      const diffMins = Math.round((minutelyStart - now) / 60000);
      let precipType;
      if (isMixedPrecip) {
          precipType = lang === 'en' ? 'Mixed Precip.' : 'Mischniederschlag';
      } else {
          precipType = isSnow ? t.snow : t.rain;
      }
      if (diffMins <= 0) {
           headline = `${precipType} ${t.startingNow}`;
           timeDisplay = t.now;
      } else {
           headline = `${precipType} ${t.inMinutes} ${diffMins} min`;
           timeDisplay = minutelyStart.toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'});
      }
  } else if (isSoon) {
      let precipType;
      if (isMixedPrecip) {
          precipType = lang === 'en' ? 'Mixed Precip.' : 'Mischniederschlag';
      } else {
          precipType = isSnow ? t.snow : t.rain;
      }
      headline = `${precipType} ${t.startingSoon}`;
      timeDisplay = startTime ? startTime.toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'}) : "Gleich";
  } else {
      headline = t.nextRain;
      timeDisplay = startTime ? (isTomorrow ? (dayPrefix + " ") : "") + startTime.toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'}) : '--:--';
  }

  // If type is 'none', we just show the "No precipitation" box
  if (type === 'none') {
      return (
        <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between shadow-sm mb-4">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-m3-secondary-container rounded-full text-m3-on-secondary-container"><Sun size={28} /></div>
                <div>
                    <div className="font-bold text-m3-on-surface text-m3-title-large">{headline}</div>
                    <div className="text-m3-body-large text-m3-on-surface-variant font-medium">{t.noRainExp}</div>
                </div>
            </div>
        </div>
      );
  }

  const Icon = isMixedPrecip ? CloudSnow : (isSnow ? Snowflake : CloudRain);
  const colorClass = isMixedPrecip ? "text-m3-tertiary bg-m3-tertiary-container border-m3-tertiary" : (isSnow ? "text-m3-secondary bg-m3-secondary-container border-m3-secondary" : "text-m3-primary bg-m3-primary-container border-m3-primary");
  const bgClass = isMixedPrecip ? "bg-m3-tertiary-container/30" : (isSnow ? "bg-m3-secondary-container/30" : "bg-m3-primary-container/30");

  // Intensitäts-Logik
  const getIntensityInfo = (rate) => {
      // Basic translation mapping for intensity
      if (rate < 0.5) {
          if (isMixedPrecip) return { label: lang === 'en' ? 'Light' : 'Leicht', percent: 25, color: 'bg-m3-tertiary' };
          if (isSnow) return { label: lang === 'en' ? 'Light' : 'Leicht', percent: 25, color: 'bg-m3-secondary' };
          return { label: lang === 'en' ? 'Light' : 'Leicht', percent: 25, color: 'bg-m3-primary' };
      }
      if (rate < 1.0) {
          if (isMixedPrecip) return { label: lang === 'en' ? 'Moderate' : 'Mäßig', percent: 50, color: 'bg-m3-tertiary' };
          if (isSnow) return { label: lang === 'en' ? 'Moderate' : 'Mäßig', percent: 50, color: 'bg-m3-secondary' };
          return { label: lang === 'en' ? 'Moderate' : 'Mäßig', percent: 50, color: 'bg-m3-primary' };
      }
      if (rate < 4.0) {
          if (isMixedPrecip) return { label: lang === 'en' ? 'Heavy' : 'Stark', percent: 75, color: 'bg-m3-tertiary' };
          if (isSnow) return { label: lang === 'en' ? 'Heavy' : 'Stark', percent: 75, color: 'bg-m3-secondary' };
          return { label: lang === 'en' ? 'Heavy' : 'Stark', percent: 75, color: 'bg-m3-primary' };
      }
      if (isMixedPrecip) return { label: lang === 'en' ? 'Very Heavy' : 'Sehr Stark', percent: 100, color: 'bg-m3-error' };
      if (isSnow) return { label: lang === 'en' ? 'Very Heavy' : 'Sehr Stark', percent: 100, color: 'bg-m3-error' };
      return { label: lang === 'en' ? 'Very Heavy' : 'Sehr Stark', percent: 100, color: 'bg-m3-error' };
  };

  const intensity = getIntensityInfo(maxIntensity);

  return (
    <div className={`${bgClass} border ${isMixedPrecip ? 'border-m3-tertiary' : (isSnow ? 'border-m3-secondary' : 'border-m3-primary')} rounded-2xl p-4 shadow-sm mb-4 relative overflow-hidden`}>
        <div className="flex justify-between items-center z-10 relative">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${colorClass} bg-opacity-30`}>
                    <Icon size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <div className="font-bold text-m3-on-surface text-m3-title-large uppercase tracking-wide opacity-80 mb-0.5">
                        {headline}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Time Display Logic */}
                        {!isNow && isLaterThan2h && !minutelyStart && <span className="text-m3-body-large font-bold text-m3-on-surface-variant">{t.ab}</span>}
                        <span className="text-m3-display-small font-black text-m3-on-surface tracking-tight leading-none">
                            {timeDisplay}
                        </span>
                        {!isNow && !isSoon && !minutelyStart && <span className="text-m3-label-large font-bold text-m3-on-surface-variant uppercase">{t.oclock}</span>}
                        
                        {/* Ping Animation if Raining Now or very soon */}
                        {(isNow || (minutelyStart && (minutelyStart - now) < 300000)) && (
                            <span className="flex h-4 w-4 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-m3-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-m3-primary"></span>
                            </span>
                        )}
                    </div>
                    <div className="text-m3-label-large font-bold uppercase text-m3-on-surface-variant tracking-wide mt-1">
                {isMixedPrecip ? (lang === 'en' ? 'Mixed Precipitation' : 'Mischniederschlag') : (isSnow ? t.snow : t.rain)} • {intensity.label}
              </div>
            </div>
          </div>

          <div className="text-right">
                <div className="text-m3-title-large font-bold text-m3-on-surface leading-tight">{formatPrecip ? formatPrecip(amount) : amount.toFixed(1)}<span className="text-m3-label-large text-m3-on-surface-variant font-normal ml-0.5">{getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}</span></div>
                {isMixedPrecip && (rainAmount > 0.1 || snowAmount > 0.1) && (
                    <div className="text-m3-label-small text-m3-on-surface-variant mt-1">
                        {rainAmount > 0.1 && <span className="flex items-center justify-end gap-1"><CloudRain size={12}/>{formatPrecip ? formatPrecip(rainAmount) : rainAmount.toFixed(1)}{getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}</span>}
                        {snowAmount > 0.1 && <span className="flex items-center justify-end gap-1"><Snowflake size={12}/>{formatPrecip ? formatPrecip(snowAmount) : snowAmount.toFixed(1)}{getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}</span>}
                    </div>
                )}
                <div className="text-m3-title-medium font-medium text-m3-on-surface-variant leading-tight">{duration} <span className="text-m3-label-large">{t.hours}</span></div>
            </div>
        </div>

        <div className="mt-4 h-3 w-full bg-white/40 rounded-full overflow-hidden relative">
            <div 
                className={`h-full ${intensity.color} rounded-full transition-all duration-1000 ease-out`} 
                style={{ width: `${intensity.percent}%` }}
            ></div>
        </div>
        
        {/* Additional Details Section */}
        <div className="mt-4 space-y-3">
            {/* Current Intensity (only when raining now) */}
            {isNow && currentIntensity > 0 && (
                <div className="flex items-center justify-between bg-m3-surface-container/50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                        <Droplets size={18} className="text-m3-primary" />
                        <span className="text-m3-label-large font-bold text-m3-on-surface">{t.currentIntensity}</span>
                    </div>
                    <span className="text-m3-body-large font-bold text-m3-on-surface">{formatPrecip ? formatPrecip(currentIntensity) : currentIntensity.toFixed(1)} {getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}/h</span>
                </div>
            )}
            
            {/* Peak Rain Time */}
            {peakTime && maxIntensity > 0 && (
                <div className="flex items-center justify-between bg-white/30 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-blue-600" />
                        <span className="text-sm font-bold text-slate-700">{t.peakRainAt}</span>
                    </div>
                    <span className="text-base font-bold text-slate-800">
                        {peakTime.toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'})} ({formatPrecip ? formatPrecip(maxIntensity) : maxIntensity.toFixed(1)} {getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}/h)
                    </span>
                </div>
            )}
            
            {/* Hourly Forecast (if available) */}
            {hourlyForecast.length > 0 && (
                <div className="bg-white/30 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart2 size={18} className={isMixedPrecip ? "text-purple-600" : "text-blue-600"} />
                        <span className="text-sm font-bold text-slate-700">{t.nextHours}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {hourlyForecast.slice(0, 6).map((forecast, idx) => {
                            const hasMixedInHour = forecast.rain > 0.1 && forecast.snow > 0.1;
                            return (
                                <div key={idx} className="flex flex-col items-center bg-white/40 rounded-lg p-2">
                                    <span className="text-xs font-medium text-slate-600">
                                        {forecast.time.toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    {hasMixedInHour ? (
                                        <div className="text-xs font-bold mt-1">
                                            <div className="flex items-center gap-1 text-blue-600">
                                                <CloudRain size={10}/>{formatPrecip ? formatPrecip(forecast.rain) : forecast.rain.toFixed(1)}{getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}
                                            </div>
                                            <div className="flex items-center gap-1 text-cyan-600">
                                                <Snowflake size={10}/>{formatPrecip ? formatPrecip(forecast.snow) : forecast.snow.toFixed(1)}{getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className={`text-sm font-bold mt-1 ${forecast.snow > 0.1 ? 'text-cyan-600' : 'text-blue-600'}`}>
                                            {formatPrecip ? formatPrecip(forecast.amount) : forecast.amount.toFixed(1)} {getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

// --- NEU: FEEDBACK MODAL (ERWEITERT) ---
const FeedbackModal = ({ onClose, currentTemp, lang='de' }) => {
    const [sent, setSent] = useState(false);
    const [tempAdjustment, setTempAdjustment] = useState(0); // Offset in Grad
    const [selectedCondition, setSelectedCondition] = useState(null);

    const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];

    const conditions = [
        { id: 'sun', label: t.sunny, icon: Sun, color: 'text-amber-500 bg-amber-50 border-amber-200' },
        { id: 'cloudy', label: t.cloudy, icon: Cloud, color: 'text-slate-500 bg-slate-50 border-slate-200' },
        { id: 'overcast', label: t.overcast, icon: Cloud, color: 'text-slate-700 bg-slate-100 border-slate-300' }, // Neu
        { id: 'fog', label: t.fog, icon: CloudFog, color: 'text-slate-400 bg-slate-50/50 border-slate-200' },
        { id: 'drizzle', label: t.drizzle, icon: CloudDrizzle, color: 'text-cyan-500 bg-cyan-50 border-cyan-200' },
        { id: 'rain', label: t.rain, icon: CloudRain, color: 'text-blue-500 bg-blue-50 border-blue-200' },
        { id: 'storm', label: t.thunderstorm, icon: CloudLightning, color: 'text-purple-600 bg-purple-50 border-purple-200' }, // Neu
        { id: 'snow', label: t.snow, icon: CloudSnow, color: 'text-sky-300 bg-sky-50 border-sky-100' }, // Neu
        { id: 'hail', label: 'Hagel', icon: CloudHail, color: 'text-teal-600 bg-teal-50 border-teal-200' }, // Neu
        { id: 'wind', label: 'Wind', icon: Wind, color: 'text-slate-600 bg-slate-100 border-slate-300' }, // Neu
    ];

    const handleSend = () => {
        if (!selectedCondition && tempAdjustment === 0) return; // Nichts zu senden

        setSent(true);
        // Hier würde normalerweise der API-Call zum Backend stehen mit:
        // condition: selectedCondition
        // tempCorrection: tempAdjustment
        setTimeout(() => {
            onClose();
            setSent(false);
        }, 2000);
    };

    if (sent) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">{t.feedbackThanks}</h3>
                    <p className="text-slate-500">{t.feedbackDesc}</p>
                </div>
            </div>
        );
    }

    const displayTemp = Math.round(currentTemp + tempAdjustment);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquarePlus size={18} className="text-blue-500"/> {t.feedbackTitle}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} className="text-slate-400" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {/* Temperatur Slider */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-4">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Temperatur</label>
                            <div className="text-3xl font-black text-slate-800">{displayTemp}°</div>
                        </div>
                        <input 
                            type="range" 
                            min="-10" 
                            max="10" 
                            step="1" 
                            value={tempAdjustment} 
                            onChange={(e) => setTempAdjustment(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                            <span>-10°</span>
                            <span>OK</span>
                            <span>+10°</span>
                        </div>
                    </div>

                    {/* Wetter Grid */}
                    <div className="mb-6">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 block">{t.weatherReport}</label>
                        <div className="grid grid-cols-3 gap-2">
                            {conditions.map((c) => (
                                <button 
                                    key={c.id}
                                    onClick={() => setSelectedCondition(c.id)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${selectedCondition === c.id ? `ring-2 ring-offset-1 ring-blue-500 ${c.color}` : 'border-slate-100 hover:bg-slate-50'}`}
                                >
                                    <c.icon size={24} className={selectedCondition === c.id ? '' : 'text-slate-400'} />
                                    <span className={`text-xs font-medium mt-2 ${selectedCondition === c.id ? '' : 'text-slate-600'}`}>{c.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleSend} 
                        disabled={!selectedCondition && tempAdjustment === 0}
                        className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    >
                        {t.feedbackSend}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DwdAlertItem = ({ alert, lang='de' }) => {
  const [expanded, setExpanded] = useState(false);
  const colorClass = getDwdColorClass(alert.severity);
  const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];

  return (
    <div className={`rounded-xl border-l-4 shadow-sm relative overflow-hidden transition-all duration-300 ${colorClass} mb-3`}>
      <div className="p-4 flex items-start gap-3 relative z-10 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <Siren className="shrink-0 animate-pulse-red mt-1" size={24} />
        <div className="flex-1">
           <div className="flex justify-between items-start">
              <div>
                <div className="font-extrabold uppercase text-xs tracking-wider opacity-80 mb-0.5">{t.officialWarning} ({alert.severity})</div>
                <div className="font-bold text-lg leading-tight">{alert.headline_de || alert.event_de}</div>
              </div>
              <div className="opacity-60 ml-2 mt-1">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
           </div>
           {!expanded && <div className="text-xs font-medium opacity-70 mt-1">{t.showDetails}...</div>}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pl-12 relative z-10 animate-in fade-in slide-in-from-top-2 duration-200">
           <p className="text-sm opacity-90 leading-relaxed whitespace-pre-line mb-3 border-t border-black/10 pt-2">{alert.description_de}</p>
           <div className="text-xs font-medium opacity-70 flex flex-col sm:flex-row sm:justify-between gap-1 bg-white/30 p-2 rounded">
              <span><strong>Von:</strong> {new Date(alert.effective).toLocaleString('de-DE')}</span>
              <span><strong>Bis:</strong> {new Date(alert.expires).toLocaleString('de-DE')}</span>
           </div>
           {alert.instruction_de && <div className="mt-2 text-xs opacity-80 italic"><span className="font-bold not-italic">{t.instruction}:</span> {alert.instruction_de}</div>}
        </div>
      )}
    </div>
  );
};

const AIReportBox = ({ report, dwdWarnings, lang='de', tempFunc, formatWind, getWindUnitLabel, formatPrecip, getPrecipUnitLabel, getTempUnitSymbol }) => {
  const [expanded, setExpanded] = useState(false);
  if (!report) return null;
  const { title, summary, details, warning: localWarning, confidence, structuredDetails } = report;
  
  const hasDwd = dwdWarnings && dwdWarnings.length > 0;
  const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];
  const getWindUnitLabelSafe = getWindUnitLabel || (() => 'km/h');
  const formatWindSafe = formatWind || ((val) => (val ?? '--'));
  const getPrecipUnitLabelSafe = getPrecipUnitLabel || (() => 'mm');
  const formatPrecipSafe = formatPrecip || ((val) => (val ?? '--'));
  
  let maxSeverityLevel = 0; 
  if (hasDwd) {
      dwdWarnings.forEach(w => {
          const s = w.severity.toLowerCase();
          let lvl = 1;
          if (s === 'moderate') lvl = 2;
          if (s === 'severe') lvl = 3;
          if (s === 'extreme') lvl = 4;
          if (lvl > maxSeverityLevel) maxSeverityLevel = lvl;
      });
  }
  
  let bannerClass = "bg-blue-100 text-blue-900 border-blue-300"; 
  let icon = <Info size={20} />;
  
  if (maxSeverityLevel === 1) { bannerClass = "bg-yellow-100 text-yellow-900 border-yellow-300"; icon = <AlertTriangle size={20} />; }
  else if (maxSeverityLevel === 2) { bannerClass = "bg-orange-100 text-orange-900 border-orange-300"; icon = <AlertTriangle size={20} />; }
  else if (maxSeverityLevel >= 3) { bannerClass = "bg-red-100 text-red-900 border-red-300 animate-pulse-red"; icon = <Siren size={20} />; }

  return (
    <>
      <div className="mb-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden transition-all duration-500">
        
        {/* HEADER BEREICH */}
        <div className="p-4 relative z-10">
            {/* DWD Warnings */}
            {hasDwd && (
              <div className="mb-3">
                <button onClick={() => setExpanded(!expanded)} className={`w-full p-3 rounded-lg border-l-4 shadow-sm flex items-center justify-between gap-3 text-left transition hover:brightness-95 ${bannerClass}`}>
                  <div className="flex items-center gap-3">
                     <div className="shrink-0">{icon}</div>
                     <div>
                       <div className="font-extrabold uppercase text-[10px] tracking-wider opacity-80">{t.officialWarning}</div>
                       <div className="font-bold leading-tight text-sm">{dwdWarnings.length} {t.activeWarnings}</div>
                     </div>
                  </div>
                  <div className="opacity-60">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
                </button>
                {expanded && (
                   <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {dwdWarnings.map((alert, i) => <DwdAlertItem key={i} alert={alert} lang={lang} />)}
                      <div className="text-[10px] text-center opacity-50 pt-1">Quelle: DWD via Brightsky</div>
                   </div>
                )}
              </div>
            )}

            {/* Custom Warning */}
            {!hasDwd && localWarning && (
              <div className="mb-3 p-3 bg-red-100 border-l-4 border-red-500 text-red-900 rounded-r shadow-sm flex items-start gap-3 animate-pulse-red relative z-10">
                <AlertTriangle className="shrink-0 text-red-600 mt-0.5" size={20} />
                <div>
                  <div className="font-extrabold uppercase text-xs tracking-wider mb-0.5">Wettertrend Warnung</div>
                  <div className="font-bold leading-tight text-sm">{localWarning}</div>
                </div>
              </div>
            )}
            
            {/* Main Report Title & Summary */}
            <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-900/60 mb-1 flex items-center gap-1">
                    <Sparkles size={12} className="text-indigo-500"/> 
                    {title || t.weatherReport}
                </div>
                {confidence !== null && (
                    <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${confidence > 70 ? 'bg-green-100 text-green-700 border-green-200' : confidence > 40 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {confidence}% {t.safe}
                    </div>
                )}
            </div>
            
            {/* Hinzugefügt: whitespace-pre-line für korrekte Zeilenumbrüche im Daily Report */}
            {/* NOTE: We might need to run temp conversion on summary string but that's complex with regex. For now summary remains as generated (mostly C) unless we rebuild AI report completely with units. */}
            <p className="text-lg text-slate-800 leading-relaxed font-semibold relative z-10 whitespace-pre-line">{summary}</p>
            
            {/* Toggle Button */}
            {(details || structuredDetails) && (
                <button 
                    onClick={() => setExpanded(!expanded)} 
                    className="mt-3 text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors"
                >
                    {expanded ? t.showLess : t.showDetails} {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>
            )}
        </div>

        {/* EXPANDABLE DETAILS */}
        {expanded && (
            <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="h-px w-full bg-indigo-200/50 mb-3"></div>
                
                {/* Fallback Text Details */}
                {details && (
                    <div className="text-base text-slate-700 leading-relaxed space-y-2 whitespace-pre-line mb-4">
                        {details}
                    </div>
                )}

                {/* Structured Details (List View) */}
                {structuredDetails && (
                   <div className="space-y-6 mt-2">
                       {structuredDetails.map((group, idx) => (
                           <div key={idx}>
                               <h4 className="text-[10px] font-extrabold uppercase text-indigo-400 mb-2 tracking-widest pl-1">{group.title}</h4>
                               <div className="space-y-2">
                                   {group.items.map((item, i) => {
                                       const Icon = getWeatherConfig(item.code, 1, lang).icon;
                                       return (
                                           <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/60 hover:bg-white/80 transition border border-white/40 shadow-sm text-sm">
                                               {/* Date & Icon */}
                                               <div className="flex items-center gap-3 min-w-[100px]">
                                                   <div className="w-10 text-center">
                                                       <div className="font-bold text-slate-700">{item.day}</div>
                                                       <div className="text-[10px] font-medium text-slate-400">{item.date}</div>
                                                   </div>
                                                   <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                                                        <Icon size={20}/>
                                                   </div>
                                               </div>
                                               
                                                {/* Temp */}
                                                <div className="flex items-center gap-1 flex-1 justify-center">
                                                    <span className="font-bold text-slate-800 text-base">{tempFunc(item.max)}{getTempUnitSymbol ? getTempUnitSymbol() : '°'}</span>
                                                    <span className="text-slate-400 text-xs font-medium">/ {tempFunc(item.min)}{getTempUnitSymbol ? getTempUnitSymbol() : '°'}</span>
                                                </div>

                                               {/* Rain/Wind */}
                                               <div className="text-right min-w-[80px] flex flex-col items-end gap-0.5">
                                                    {item.rain > 0.1 ? (
                                                        <div className="flex items-center justify-end gap-1 text-blue-600 font-bold text-xs bg-blue-50 px-1.5 py-0.5 rounded-md w-max">
                                                            <Droplets size={10}/> {formatPrecipSafe(item.rain)}{getPrecipUnitLabelSafe()}
                                                        </div>
                                                    ) : <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5">{t.noRain}</span>}
                                                   
                                                    {item.wind > 20 && (
                                                        <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${getWindColorClass(item.wind, false)}`}>
                                                            <Wind size={10}/> {formatWindSafe(item.wind)} {getWindUnitLabelSafe()}
                                                        </div>
                                                    )}
                                               </div>
                                           </div>
                                       );
                                   })}
                               </div>
                           </div>
                       ))}
                   </div>
               )}
            </div>
        )}
      </div>
    </>
  );
};

// --- PRECIPITATION DETAILS MODAL ---
const PrecipitationDetailsModal = ({ isOpen, onClose, hourlyData, lang='de', formatPrecip, getPrecipUnitLabel }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];
  
  if (!isOpen) return null;
  
  // Get next 24 hours of data with precipitation info
  // processedShort already filters to start from current interval
  const next24Hours = hourlyData
    .slice(0, 24)
    .map(hour => {
      const totalPrecip = (hour.precip || 0) + (hour.snow || 0);
      const hasSnow = (hour.snow || 0) > 0.1;
      const hasRain = (hour.precip || 0) > 0.1;
      
      return {
        time: hour.time,
        displayTime: hour.time.toLocaleTimeString(lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : lang === 'it' ? 'it-IT' : 'de-DE', { hour: '2-digit', minute: '2-digit' }),
        amount: totalPrecip,
        rain: hour.precip || 0,
        snow: hour.snow || 0,
        hasSnow,
        hasRain,
        hasPrecip: totalPrecip > 0.1
      };
    });
  
  const totalAmount = next24Hours.reduce((sum, hour) => sum + hour.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CloudRain size={18} className="text-blue-500"/> 
            {t.precipitationDetails}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        
        {/* Summary */}
        <div className="p-4 bg-blue-50/50 border-b border-blue-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">{t.precip24h}</span>
            <span className="text-lg font-bold text-blue-600">
              {formatPrecip ? formatPrecip(totalAmount) : totalAmount.toFixed(1)} {getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}
            </span>
          </div>
        </div>
        
        {/* Scrollable hourly list */}
        <div className="overflow-y-auto p-4 space-y-2">
          {next24Hours.map((hour, idx) => (
            <div 
              key={idx}
              className={`flex justify-between items-center p-3 rounded-xl transition-colors ${
                hour.hasPrecip 
                  ? 'bg-blue-50 border border-blue-100' 
                  : 'bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {hour.hasPrecip ? (
                  hour.hasSnow ? (
                    <Snowflake size={18} className="text-cyan-500" />
                  ) : (
                    <CloudRain size={18} className="text-blue-500" />
                  )
                ) : (
                  <Sun size={18} className="text-slate-300" />
                )}
                <span className="font-medium text-slate-700">
                  {hour.displayTime}
                </span>
              </div>
              <div className="text-right">
                {hour.hasPrecip ? (
                  <>
                    <div className="font-bold text-slate-800">
                      {formatPrecip ? formatPrecip(hour.amount) : hour.amount.toFixed(1)} {getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}
                    </div>
                    {hour.hasRain && hour.hasSnow && (
                      <div className="text-xs text-slate-500">
                        <CloudRain className="inline w-3 h-3" /> {formatPrecip ? formatPrecip(hour.rain) : hour.rain.toFixed(1)}{getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}
                        {' '}
                        <Snowflake className="inline w-3 h-3" /> {formatPrecip ? formatPrecip(hour.snow) : hour.snow.toFixed(1)}{getPrecipUnitLabel ? getPrecipUnitLabel() : 'mm'}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-slate-400">{t.noRain}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- LOCATION MODAL ---
const LocationModal = ({ isOpen, onClose, savedLocations, onSelectLocation, onAddCurrentLocation, onDeleteLocation, currentLoc, onRenameLocation, onRenameHome, homeLoc, lang='de' }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // States for Editing Names
    const [editingId, setEditingId] = useState(null);
    const [tempName, setTempName] = useState("");
    const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];

    if (!isOpen) return null;

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            // FIX: .trim() hinzugefügt, um Leerzeichen zu entfernen
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=5&language=de&format=json`);
            const data = await res.json();
            setSearchResults(data.results || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddFoundLocation = (loc) => {
        const newLoc = { name: loc.name, lat: loc.latitude, lon: loc.longitude, type: 'saved', id: crypto.randomUUID() };
        onSelectLocation(newLoc); 
        onClose();
    };

    const startEditing = (loc) => {
        setEditingId(loc.id);
        setTempName(loc.name);
    };

    const saveName = (loc) => {
        if (loc.id === 'home_default' || (homeLoc && loc.id === homeLoc.id)) {
            onRenameHome(tempName);
        } else {
            onRenameLocation(loc.id, tempName);
        }
        setEditingId(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><MapIcon size={18} className="text-blue-500"/> {t.managePlaces}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} className="text-slate-400" /></button>
                </div>
                
                <div className="p-4 overflow-y-auto">
                    {/* Search Section */}
                    <div className="mb-6 space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder={t.searchPlace}
                                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 text-slate-800"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button 
                                onClick={handleSearch}
                                className="absolute right-2 top-2 p-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                            >
                                {isSearching ? <RefreshCw className="animate-spin" size={16}/> : <ArrowRight size={16}/>}
                            </button>
                        </div>
                        
                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-1">
                                {searchResults.map((res) => (
                                    <button 
                                        key={res.id}
                                        onClick={() => handleAddFoundLocation(res)}
                                        className="w-full text-left p-3 hover:bg-blue-50 border-b border-slate-50 last:border-0 flex justify-between items-center transition group"
                                    >
                                        <div>
                                            <div className="font-bold text-slate-700 text-sm">{res.name}</div>
                                            <div className="text-[10px] text-slate-400">{res.admin1}, {res.country}</div>
                                        </div>
                                        <Plus size={16} className="text-blue-400 group-hover:text-blue-600"/>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Current Location Button */}
                    <button 
                        onClick={onAddCurrentLocation}
                        className="w-full mb-4 p-3 rounded-xl border border-dashed border-blue-300 bg-blue-50 text-blue-600 font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition"
                    >
                        <Crosshair size={18} /> {t.addCurrent}
                    </button>

                    <div className="space-y-2">
                        {/* HOME LOCATION EDITABLE */}
                        {homeLoc && (
                            <div className={`p-3 rounded-xl border flex items-center justify-between group transition ${currentLoc.id === homeLoc.id ? 'border-amber-500 bg-amber-50' : 'border-amber-200 hover:border-amber-300'}`}>
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                     <div className="p-2 rounded-full bg-amber-100 text-amber-600 shrink-0">
                                         <Home size={16} />
                                     </div>
                                     <div className="w-full">
                                         {editingId === homeLoc.id ? (
                                             <div className="flex gap-1 w-full">
                                                <input 
                                                    type="text" 
                                                    className="w-full text-sm font-bold border-b border-amber-300 bg-transparent focus:outline-none"
                                                    value={tempName}
                                                    onChange={(e) => setTempName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveName(homeLoc)}
                                                    autoFocus
                                                />
                                                <button onClick={() => saveName(homeLoc)} className="text-green-600"><Check size={16}/></button>
                                             </div>
                                         ) : (
                                             <button onClick={() => { onSelectLocation(homeLoc); onClose(); }} className="text-left w-full">
                                                 <div className="font-bold text-slate-700 text-sm truncate">{homeLoc.name}</div>
                                                 <div className="text-[10px] text-slate-400">{t.homeLoc}</div>
                                             </button>
                                         )}
                                     </div>
                                </div>
                                <button 
                                    onClick={() => startEditing(homeLoc)}
                                    className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-100 rounded-full transition"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )}

                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">{t.savedPlaces}</div>
                        {savedLocations.length === 0 ? (
                            <div className="text-center text-slate-400 py-4 text-sm italic">{t.noPlaces}</div>
                        ) : (
                            savedLocations.map((loc, index) => (
                                <div key={loc.id || index} className={`p-3 rounded-xl border flex items-center justify-between group transition ${currentLoc.name === loc.name ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                        <div className="p-2 rounded-full bg-slate-100 text-slate-600 shrink-0">
                                            <MapPin size={16} />
                                        </div>
                                        <div className="w-full">
                                             {editingId === loc.id ? (
                                                 <div className="flex gap-1 w-full">
                                                    <input 
                                                        type="text" 
                                                        className="w-full text-sm font-bold border-b border-blue-300 bg-transparent focus:outline-none"
                                                        value={tempName}
                                                        onChange={(e) => setTempName(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && saveName(loc)}
                                                        autoFocus
                                                    />
                                                    <button onClick={() => saveName(loc)} className="text-green-600"><Check size={16}/></button>
                                                 </div>
                                             ) : (
                                                 <button onClick={() => { onSelectLocation(loc); onClose(); }} className="text-left w-full">
                                                    <div className="font-bold text-slate-700 text-sm truncate">{loc.name}</div>
                                                    <div className="text-[10px] text-slate-400">Lat: {loc.lat.toFixed(2)}</div>
                                                 </button>
                                             )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => startEditing(loc)}
                                            className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteLocation(index)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NEU: HOME SETUP MODAL (Für den allerersten Start) ---
const HomeSetupModal = ({ onSave, lang='de' }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    
    // Schritt 2: Name vergeben
    const [selectedLoc, setSelectedLoc] = useState(null);
    const [customName, setCustomName] = useState("");
    
    const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoading(true);
        try {
            // FIX: .trim() hinzugefügt
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=5&language=de&format=json`);
            const data = await res.json();
            setResults(data.results || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUseGPS = async () => {
        setGpsLoading(true);
        
        // Check and request permissions first
        const permissionResult = await checkAndRequestLocationPermission();
        
        if (!permissionResult.granted) {
            alert(permissionResult.error);
            setGpsLoading(false);
            return;
        }
        
        try {
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 5000
            });
            
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
                // Name auflösen
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=de&format=json`);
                const data = await res.json();
                const city = data.results?.[0]?.name || t.myLocation;
                
                const loc = { name: city, lat, lon, id: 'home_default', type: 'home' };
                setSelectedLoc(loc);
                setCustomName(city);
            } catch (e) {
                const loc = { name: "GPS Standort", lat, lon, id: 'home_default', type: 'home' };
                setSelectedLoc(loc);
                setCustomName("Zuhause");
            }
        } catch (error) {
            alert("Standortzugriff konnte nicht abgerufen werden: " + (error.message || 'Unbekannter Fehler'));
        } finally {
            setGpsLoading(false);
        }
    };

    const handleSelect = (res) => {
        const loc = { name: res.name, lat: res.latitude, lon: res.longitude, id: 'home_default', type: 'home' };
        setSelectedLoc(loc);
        setCustomName(res.name);
    };

    const handleFinalSave = () => {
        if (!selectedLoc) return;
        onSave({ ...selectedLoc, name: customName });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-500">
             <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                 {!selectedLoc ? (
                     <>
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Home size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">{t.welcome}</h2>
                        <p className="text-slate-500 mb-6 text-sm">{t.welcomeDesc}</p>
                        
                        <button 
                            onClick={handleUseGPS}
                            disabled={gpsLoading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 mb-4 shadow-lg shadow-blue-500/30 transition active:scale-95"
                        >
                            {gpsLoading ? <RefreshCw className="animate-spin"/> : <Crosshair size={20}/>}
                            {t.useGps}
                        </button>

                        <div className="relative mb-2">
                             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                             <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">{t.orSearch}</span></div>
                        </div>

                        <div className="relative mb-4">
                            <input 
                                type="text" 
                                placeholder={t.searchPlace}
                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 text-slate-800"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button onClick={handleSearch} className="absolute right-2 top-2 p-1.5 bg-slate-200 rounded-lg text-slate-600">
                                {loading ? <RefreshCw className="animate-spin" size={16}/> : <ArrowRight size={16}/>}
                            </button>
                        </div>

                        {results.length > 0 && (
                            <div className="text-left border border-slate-100 rounded-xl overflow-hidden max-h-[150px] overflow-y-auto">
                                {results.map(res => (
                                    <button key={res.id} onClick={() => handleSelect(res)} className="w-full p-3 hover:bg-blue-50 text-left border-b border-slate-50 last:border-0 text-sm font-bold text-slate-700">
                                        {res.name} <span className="font-normal text-slate-400">({res.country})</span>
                                    </button>
                                ))}
                            </div>
                        )}
                     </>
                 ) : (
                     <>
                        <button onClick={() => setSelectedLoc(null)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600"><ArrowLeft size={24}/></button>
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">{t.locFound}</h2>
                        <p className="text-slate-500 mb-6 text-sm">{t.nameLoc}</p>
                        
                        <div className="bg-slate-50 p-4 rounded-xl mb-6">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block text-left">Name</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    className="w-full bg-transparent font-bold text-xl text-slate-800 focus:outline-none border-b-2 border-blue-500 pb-1"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    autoFocus
                                />
                                <Edit2 size={16} className="text-slate-400"/>
                            </div>
                        </div>

                        <button 
                            onClick={handleFinalSave}
                            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition active:scale-95"
                        >
                            {t.saveStart}
                        </button>
                     </>
                 )}
             </div>
        </div>
    );
};

// Language flags for tutorial
const LANGUAGE_FLAGS = {
    de: '🇩🇪',
    en: '🇬🇧',
    fr: '🇫🇷',
    es: '🇪🇸',
    it: '🇮🇹',
    tr: '🇹🇷',
    pl: '🇵🇱',
    nl: '🇳🇱',
    hr: '🇭🇷',
    el: '🇬🇷',
    da: '🇩🇰',
    ru: '🇷🇺'
};

// --- TUTORIAL COMPONENT (Für den allerersten Start) ---
const TutorialModal = ({ onComplete, onSkip, settings, setSettings, lang = 'de' }) => {
    const [step, setStep] = useState(0);
    const [homeLocation, setHomeLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [customHomeName, setCustomHomeName] = useState("");
    const [selectedHomeLoc, setSelectedHomeLoc] = useState(null);
    
    const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];
    
    // Hide status bar and navigation bar on mount, restore on unmount
    useEffect(() => {
        let isMounted = true;
        
        const hideStatusBar = async () => {
            try {
                await StatusBar.hide();
            } catch (e) {
                // Status bar not available (e.g., in browser)
                console.log('Status bar hide not available:', e);
            }
        };
        
        const showStatusBar = async () => {
            try {
                if (isMounted) {
                    await StatusBar.show();
                }
            } catch (e) {
                console.log('Status bar show not available:', e);
            }
        };
        
        hideStatusBar();
        
        return () => {
            isMounted = false;
            showStatusBar();
        };
    }, []);
    
    // Home location search handler
    const handleHomeSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const searchLang = settings?.language || lang || 'de';
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=5&language=${searchLang}&format=json`);
            const data = await res.json();
            setSearchResults(data.results || []);
        } catch (e) {
            console.error(e);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };
    
    // GPS handler
    const handleUseGPS = async () => {
        setGpsLoading(true);
        
        // Check and request permissions first
        const permissionResult = await checkAndRequestLocationPermission();
        
        if (!permissionResult.granted) {
            alert(permissionResult.error || t.locationDenied);
            setGpsLoading(false);
            return;
        }
        
        try {
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 5000
            });
            
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
                const searchLang = settings?.language || lang || 'de';
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=${searchLang}&format=json`);
                const data = await res.json();
                const city = data.results?.[0]?.name || t.myLocation;
                const loc = { name: city, lat, lon, id: 'home_default', type: 'home' };
                setSelectedHomeLoc(loc);
                setCustomHomeName(city);
                setHomeLocation(loc);
            } catch (e) {
                const loc = { name: "GPS Standort", lat, lon, id: 'home_default', type: 'home' };
                setSelectedHomeLoc(loc);
                setCustomHomeName(t.homeLocation);
                setHomeLocation(loc);
            }
        } catch (error) {
            alert(t.locationDenied || "Standortzugriff konnte nicht abgerufen werden");
        } finally {
            setGpsLoading(false);
        }
    };
    
    // Select location from search results
    const handleSelectHome = (result) => {
        const loc = { 
            name: result.name, 
            lat: result.latitude, 
            lon: result.longitude, 
            id: 'home_default', 
            type: 'home' 
        };
        setSelectedHomeLoc(loc);
        setCustomHomeName(result.name);
        setHomeLocation(loc);
        setSearchResults([]);
        setSearchQuery("");
    };
    
    const steps = [
        {
            title: t.tutorialWelcomeTitle,
            desc: t.tutorialWelcomeDesc,
            icon: Sparkles,
            showSkip: true
        },
        {
            title: t.tutorialLangTitle,
            desc: t.tutorialLangDesc,
            icon: Languages,
            content: 'language'
        },
        {
            title: t.tutorialHomeTitle,
            desc: t.tutorialHomeDesc,
            icon: Home,
            content: 'home'
        },
        {
            title: t.tutorialOverviewTitle,
            desc: t.tutorialOverviewDesc,
            icon: List,
            content: 'tab'
        },
        {
            title: t.tutorialLongtermTitle,
            desc: t.tutorialLongtermDesc,
            icon: CalendarDays,
            content: 'tab'
        },
        {
            title: t.tutorialRadarTitle,
            desc: t.tutorialRadarDesc,
            icon: MapIcon,
            content: 'tab'
        },
        {
            title: t.tutorialChartTitle,
            desc: t.tutorialChartDesc,
            icon: BarChart2,
            content: 'tab'
        },
        {
            title: t.tutorialTravelTitle,
            desc: t.tutorialTravelDesc,
            icon: Plane,
            content: 'tab'
        },
        {
            title: t.tutorialSettingsTitle,
            desc: t.tutorialSettingsDesc,
            icon: Settings,
            content: 'settings'
        }
    ];
    
    const currentStep = steps[step];
    const Icon = currentStep.icon;
    const isLastStep = step === steps.length - 1;
    
    const handleNext = () => {
        if (isLastStep) {
            onComplete(homeLocation);
        } else {
            setStep(step + 1);
        }
    };
    
    const handlePrev = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-m3-surface/95 backdrop-blur-lg animate-in fade-in duration-500">
            <div className="bg-m3-surface-container rounded-m3-xl max-w-md w-full shadow-m3-5 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 max-h-[90vh] flex flex-col">
                {/* Header with Progress */}
                <div className="bg-m3-primary p-6 text-m3-on-primary relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-14 h-14 bg-m3-primary-container/30 backdrop-blur-md rounded-m3-lg flex items-center justify-center shadow-m3-2">
                                <Icon size={28} />
                            </div>
                            {currentStep.showSkip && (
                                <button 
                                    onClick={onSkip}
                                    className="px-4 py-2 bg-m3-primary-container/30 hover:bg-m3-primary-container/40 backdrop-blur-md rounded-m3-md text-sm font-bold transition"
                                >
                                    {t.tutorialSkip}
                                </button>
                            )}
                        </div>
                        <h2 className="text-2xl font-black mb-2">{currentStep.title}</h2>
                        <p className="text-m3-on-primary/90 text-sm leading-relaxed">{currentStep.desc}</p>
                    </div>
                    
                    {/* Progress Dots */}
                    <div className="flex gap-1.5 mt-4 relative z-10">
                        {steps.map((_, idx) => (
                            <div 
                                key={idx}
                                className={`flex-1 h-1.5 rounded-m3-full transition-all duration-300 ${
                                    idx === step ? 'bg-m3-on-primary shadow-m3-1' : 
                                    idx < step ? 'bg-m3-on-primary/60' : 'bg-m3-on-primary/20'
                                }`}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1 bg-m3-surface">
                    {currentStep.content === 'language' && (
                        <div className="grid grid-cols-3 gap-3">
                            {['de', 'en', 'fr', 'es', 'it', 'tr', 'pl', 'nl', 'hr', 'el', 'da', 'ru'].map(l => (
                                <button
                                    key={l}
                                    onClick={() => setSettings({ ...settings, language: l })}
                                    className={`p-4 rounded-m3-md font-bold text-center flex flex-col items-center justify-center gap-2 transition ${
                                        settings.language === l 
                                            ? 'bg-m3-primary text-m3-on-primary shadow-m3-2 scale-105' 
                                            : 'bg-m3-surface-container text-m3-on-surface hover:bg-m3-surface-container-high'
                                    }`}
                                >
                                    <span className="text-3xl">{LANGUAGE_FLAGS[l]}</span>
                                    <span className="text-xs">{TRANSLATIONS[l]?.language || l.toUpperCase()}</span>
                                    {settings.language === l && <Check size={16} />}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {currentStep.content === 'home' && (
                        <div className="space-y-4">
                            {!selectedHomeLoc ? (
                                <>
                                    <p className="text-m3-on-surface-variant text-sm mb-4">{t.welcomeDesc}</p>
                                    
                                    <button 
                                        onClick={handleUseGPS}
                                        disabled={gpsLoading}
                                        className="w-full py-3 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold rounded-m3-md flex items-center justify-center gap-2 shadow-m3-2 transition active:scale-95 disabled:opacity-50"
                                    >
                                        {gpsLoading ? <RefreshCw className="animate-spin" size={20}/> : <Crosshair size={20}/>}
                                        {t.useGps}
                                    </button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-m3-outline-variant"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-m3-surface px-2 text-m3-on-surface-variant">{t.orSearch}</span>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder={t.searchPlace}
                                            className="w-full pl-4 pr-12 py-3 rounded-m3-md border border-m3-outline focus:ring-2 focus:ring-m3-primary focus:outline-none bg-m3-surface-container text-m3-on-surface"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleHomeSearch()}
                                        />
                                        <button 
                                            onClick={handleHomeSearch} 
                                            className="absolute right-2 top-2 p-1.5 bg-m3-surface-container-high rounded-m3-sm text-m3-on-surface-variant hover:bg-m3-surface-container-highest transition"
                                        >
                                            {isSearching ? <RefreshCw className="animate-spin" size={16}/> : <Search size={16}/>}
                                        </button>
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div className="text-left border border-m3-outline-variant rounded-m3-md overflow-hidden max-h-[200px] overflow-y-auto">
                                            {searchResults.map(res => (
                                                <button 
                                                    key={res.id} 
                                                    onClick={() => handleSelectHome(res)} 
                                                    className="w-full p-3 hover:bg-m3-primary-container text-left border-b border-m3-outline-variant last:border-0 text-sm font-bold text-m3-on-surface transition"
                                                >
                                                    {res.name} <span className="font-normal text-m3-on-surface-variant">({res.country})</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-m3-tertiary-container rounded-m3-lg p-6 border border-m3-tertiary">
                                    <div className="w-16 h-16 bg-m3-tertiary text-m3-on-tertiary rounded-m3-full flex items-center justify-center mx-auto mb-4 shadow-m3-3">
                                        <Check size={32} />
                                    </div>
                                    <p className="text-m3-on-tertiary-container font-bold mb-4 text-center">{t.locFound || "Ort gefunden!"}</p>
                                    
                                    <div className="bg-m3-surface/50 p-4 rounded-m3-md">
                                        <label className="text-xs font-bold text-m3-on-tertiary-container uppercase tracking-wide mb-2 block">{t.homeLoc}</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent font-bold text-lg text-m3-on-tertiary-container focus:outline-none border-b-2 border-m3-tertiary pb-1"
                                                value={customHomeName}
                                                onChange={(e) => {
                                                    const newName = e.target.value;
                                                    setCustomHomeName(newName);
                                                    if (newName.trim()) {
                                                        setHomeLocation({ ...homeLocation, name: newName.trim() });
                                                    }
                                                }}
                                            />
                                            <Edit2 size={16} className="text-m3-on-tertiary-container"/>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => {
                                            setSelectedHomeLoc(null);
                                            setHomeLocation(null);
                                            setSearchQuery("");
                                            setSearchResults([]);
                                        }}
                                        className="mt-4 text-sm text-m3-on-tertiary-container hover:text-m3-tertiary flex items-center gap-1 mx-auto"
                                    >
                                        <ArrowLeft size={14} /> {t.changeLocation || "Ort ändern"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {currentStep.content === 'tab' && (
                        <div className="bg-m3-surface-container rounded-m3-lg p-6 border border-m3-outline-variant">
                            <div className="w-full aspect-video bg-m3-surface-container-high rounded-m3-md mb-4 flex items-center justify-center">
                                <Icon size={48} className="text-m3-on-surface-variant" />
                            </div>
                            <p className="text-m3-on-surface-variant text-sm leading-relaxed">{currentStep.desc}</p>
                        </div>
                    )}
                    
                    {currentStep.content === 'settings' && (
                        <div className="space-y-4">
                            <div className="bg-m3-surface-container rounded-m3-md p-4 border border-m3-outline-variant">
                                <div className="flex items-center gap-3 mb-2">
                                    <Globe size={20} className="text-m3-primary" />
                                    <span className="font-bold text-m3-on-surface">{t.language}</span>
                                </div>
                                <p className="text-xs text-m3-on-surface-variant ml-8">{t.tutorialLangDesc}</p>
                            </div>
                            
                            <div className="bg-m3-surface-container rounded-m3-md p-4 border border-m3-outline-variant">
                                <div className="flex items-center gap-3 mb-2">
                                    <Thermometer size={20} className="text-m3-error" />
                                    <span className="font-bold text-m3-on-surface">{t.units}</span>
                                </div>
                                <p className="text-xs text-m3-on-surface-variant ml-8">°C / °F / K • km/h / m/s / mph • mm / in</p>
                            </div>
                            
                            <div className="bg-m3-surface-container rounded-m3-md p-4 border border-m3-outline-variant">
                                <div className="flex items-center gap-3 mb-2">
                                    <Palette size={20} className="text-m3-tertiary" />
                                    <span className="font-bold text-m3-on-surface">{t.theme}</span>
                                </div>
                                <p className="text-xs text-m3-on-surface-variant ml-8">{t.themeLight} / {t.themeDark} / {t.themeAuto}</p>
                            </div>
                            
                            <div className="bg-m3-surface-container rounded-m3-md p-4 border border-m3-outline-variant">
                                <div className="flex items-center gap-3 mb-2">
                                    <Home size={20} className="text-m3-tertiary" />
                                    <span className="font-bold text-m3-on-surface">{t.homeLoc}</span>
                                </div>
                                <p className="text-xs text-m3-on-surface-variant ml-8">{t.changeHome}</p>
                            </div>
                        </div>
                    )}
                    
                    {isLastStep && (
                        <div className="bg-m3-tertiary-container rounded-m3-lg p-6 text-center border border-m3-tertiary mt-4">
                            <div className="w-16 h-16 bg-m3-tertiary text-m3-on-tertiary rounded-m3-full flex items-center justify-center mx-auto mb-4 shadow-m3-3">
                                <CheckCircle2 size={32} />
                            </div>
                            <p className="text-m3-on-tertiary-container font-bold text-lg mb-2">{t.tutorialComplete}</p>
                        </div>
                    )}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex gap-3 p-6 pt-0 flex-shrink-0 bg-m3-surface">
                    {step > 0 && (
                        <button
                            onClick={handlePrev}
                            className="px-6 py-3 rounded-m3-md font-bold text-m3-on-surface hover:bg-m3-surface-container transition flex items-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            {t.tutorialPrev}
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={currentStep.content === 'home' && !homeLocation}
                        className={`flex-1 py-3 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold rounded-m3-md shadow-m3-2 transition flex items-center justify-center gap-2 ${
                            currentStep.content === 'home' && !homeLocation ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLastStep ? t.tutorialFinish : t.tutorialNext}
                        {!isLastStep && <ArrowRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Helper function to check and request location permissions ---
const checkAndRequestLocationPermission = async () => {
  try {
    // Check current permission status
    const permStatus = await Geolocation.checkPermissions();
    
    if (permStatus.location === 'granted') {
      return { granted: true };
    }
    
    // Request permissions if not granted
    const requestResult = await Geolocation.requestPermissions();
    
    if (requestResult.location === 'granted') {
      return { granted: true };
    }
    
    return { granted: false, error: 'Standortzugriff verweigert. Bitte erlauben Sie den Zugriff in den App-Einstellungen.' };
  } catch (error) {
    console.error('Permission check error:', error);
    return { granted: false, error: 'Fehler beim Überprüfen der Standortberechtigung.' };
  }
};


// --- 4. MAIN APP COMPONENT ---

export default function WeatherApp() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState(() => getSavedLocations());
  const [homeLoc, setHomeLoc] = useState(() => getSavedHomeLocation());
  // Startet als null, bis Home gesetzt ist
  const [currentLoc, setCurrentLoc] = useState(homeLoc); 
  const [showHomeSetup, setShowHomeSetup] = useState(false);
  const [settings, setSettings] = useState(() => getSavedSettings()); // NEU
  const [showTutorial, setShowTutorial] = useState(() => !getTutorialCompleted()); // TUTORIAL STATE

  const [shortTermData, setShortTermData] = useState(null);
  const [longTermData, setLongTermData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [dwdWarnings, setDwdWarnings] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartView, setChartView] = useState('hourly');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAllHours, setShowAllHours] = useState(false); 
  const [sunriseSunset, setSunriseSunset] = useState({ sunrise: null, sunset: null });
  const [gpsAvailable, setGpsAvailable] = useState(false); // Track GPS data availability
  const [modelRuns, setModelRuns] = useState({ icon: '', gfs: '', arome: '' });
  const [showIosInstall, setShowIosInstall] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // NEU
  const [showPrecipModal, setShowPrecipModal] = useState(false);
  const [viewMode, setViewMode] = useState(null);

  // Demo mode state
  const [showDemoPanel, setShowDemoPanel] = useState(false);
  const [demoWeather, setDemoWeather] = useState(null);
  const [demoSeason, setDemoSeason] = useState(null);
  const [demoEvent, setDemoEvent] = useState(null);
  const [demoTime, setDemoTime] = useState(null); // Time override for demo mode (HH:MM format)
  const [demoWindSpeed, setDemoWindSpeed] = useState(null); // Wind speed override for demo mode

  // WICHTIG: Echtzeit-State für die Animation (NEU)
  const [now, setNow] = useState(new Date());

  // Timer: Aktualisiere 'now' JEDE SEKUNDE, damit die Sonne wandert (NEU)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000); // 1000ms = 1 Sekunde für präzise Animation
    return () => clearInterval(timer);
  }, []);

  // --- HELPER: Berechne die ECHTE Ortszeit basierend auf dem API-Offset ---
  // Das verhindert, dass es "hell" ist, obwohl am Ort schon die Sonne untergegangen ist,
  // nur weil der User in einer anderen Zeitzone sitzt.
  const locationTime = useMemo(() => {
      if (!shortTermData?.utc_offset_seconds && shortTermData?.utc_offset_seconds !== 0) return now;
      
      const nowMs = now.getTime();
      const localOffsetMs = now.getTimezoneOffset() * 60 * 1000; // Browser Offset (z.B. Berlin -120min)
      const targetOffsetMs = shortTermData.utc_offset_seconds * 1000; // API Offset (z.B. London +3600s)
      
      // Wir erstellen ein Date-Objekt, das visuell die Uhrzeit am Zielort anzeigt
      return new Date(nowMs + targetOffsetMs + localOffsetMs);
  }, [now, shortTermData]);

  // Update localStorage when settings change
  useEffect(() => {
      localStorage.setItem('weather_settings', JSON.stringify(settings));
  }, [settings]);

  // --- Helpers for Display ---
  const t = (key) => TRANSLATIONS[settings.language]?.[key] || TRANSLATIONS['de'][key] || key;
  const lang = settings.language;
  
  const getTempUnitSymbol = useCallback(() => {
      if (settings.unit === 'kelvin') return 'K';
      return '°';
  }, [settings.unit]);

  const formatTemp = useCallback((val) => {
      if (val === null || val === undefined) return "--";
      if (settings.unit === 'fahrenheit') {
          return Math.round(val * 9/5 + 32);
      }
      if (settings.unit === 'kelvin') {
          return Math.round(val + 273.15);
      }
      return Math.round(val);
  }, [settings.unit]);

  const getWindUnitLabel = useCallback(() => {
      if (settings.windUnit === 'ms') return 'm/s';
      if (settings.windUnit === 'mph') return 'mph';
      return 'km/h';
  }, [settings.windUnit]);

  const formatWind = useCallback((val) => {
      if (val === null || val === undefined) return "--";
      const numeric = Number(val);
      if (Number.isNaN(numeric)) return "--";
      if (settings.windUnit === 'ms') {
          return Math.round(numeric / 3.6);
      }
      if (settings.windUnit === 'mph') {
          return Math.round(numeric * 0.621371);
      }
      return Math.round(numeric);
  }, [settings.windUnit]);

  const getPrecipUnitLabel = useCallback(() => {
      if (settings.precipUnit === 'in') return 'in';
      return 'mm';
  }, [settings.precipUnit]);

  const formatPrecip = useCallback((val, digits = 1) => {
      if (val === null || val === undefined) return "--";
      const numeric = Number(val);
      if (Number.isNaN(numeric)) return "--";
      if (settings.precipUnit === 'in') {
          return (numeric / 25.4).toFixed(digits);
      }
      return numeric.toFixed(digits);
  }, [settings.precipUnit]);

  const formatTime = (dateStr) => {
      if (!dateStr) return "--:--";
      const d = new Date(dateStr);
      return d.toLocaleTimeString(lang === 'en' ? 'en-US' : 'de-DE', {hour: '2-digit', minute:'2-digit'});
  };
  
  const getCacheAgeText = () => {
    if (!isUsingCache || !lastUpdated) return '';
    const ageMs = Date.now() - lastUpdated.getTime();
    const ageMinutes = Math.floor(ageMs / 60000);
    
    if (ageMinutes < 1) {
      return lang === 'en' ? ' (just now)' : ' (gerade eben)';
    } else if (ageMinutes < 60) {
      return lang === 'en' ? ` (${ageMinutes}m ago)` : ` (vor ${ageMinutes}m)`;
    } else {
      const ageHours = Math.floor(ageMinutes / 60);
      return lang === 'en' ? ` (${ageHours}h ago)` : ` (vor ${ageHours}h)`;
    }
  };
  
  const getAQILevel = (aqi) => {
    if (!aqi) return null;
    if (aqi <= 20) return 'good';
    if (aqi <= 40) return 'moderate';
    if (aqi <= 60) return 'unhealthy';
    if (aqi <= 80) return 'veryUnhealthy';
    return 'hazardous';
  };
  
  const getAQILabel = (aqi) => {
    const level = getAQILevel(aqi);
    if (!level) return '';
    const labels = {
      good: t('aqiGood'),
      moderate: t('aqiModerate'),
      unhealthy: t('aqiUnhealthy'),
      veryUnhealthy: t('aqiVeryUnhealthy'),
      hazardous: t('aqiHazardous')
    };
    return labels[level];
  };
  
  const getAQIColor = (aqi, isNight = false) => {
    const level = getAQILevel(aqi);
    if (!level) return isNight ? 'text-m3-dark-on-surface' : 'text-m3-on-surface';
    
    const colors = {
      good: 'text-green-600',
      moderate: 'text-yellow-600',
      unhealthy: 'text-orange-600',
      veryUnhealthy: 'text-red-600',
      hazardous: 'text-purple-700'
    };
    return colors[level];
  };


  // --- Travel Planner State ---
  const [savedTrips, setSavedTrips] = useState(() => getSavedTrips());
  const [travelQuery, setTravelQuery] = useState("");
  const [travelStartDate, setTravelStartDate] = useState("");
  const [travelEndDate, setTravelEndDate] = useState("");
  const [travelStartTime, setTravelStartTime] = useState("");
  const [travelEndTime, setTravelEndTime] = useState("");
  const [travelResult, setTravelResult] = useState(null);
  const [travelLoading, setTravelLoading] = useState(false);
  // Trip Report
  const [tripReport, setTripReport] = useState(null);

  // Initial Location Logic / Home Check
  useEffect(() => {
    // Show tutorial first if not completed
    if (showTutorial) {
        setLoading(false);
        return;
    }
    
    // Wenn kein Home Location existiert (nach Tutorial), zeige Setup
    if (!homeLoc) {
        setShowHomeSetup(true);
        setLoading(false);
        return;
    }

    const initLocation = async () => {
        // Check URL parameters for widget mode
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        if (view) setViewMode(view);

        // Check and request permissions first
        const permissionResult = await checkAndRequestLocationPermission();
        
        if (!permissionResult.granted) {
            setCurrentLoc(homeLoc);
            setGpsAvailable(false); // Permission not granted
            return;
        }

        try {
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 5000
            });
            
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Check distance to Home
            const dist = getDistanceFromLatLonInKm(lat, lon, homeLoc.lat, homeLoc.lon);
            if (dist < 2.0) { // If closer than 2km to home
                setCurrentLoc(homeLoc);
                setGpsAvailable(true); // GPS is available
            } else {
                // Fetch City Name
                try {
                    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=de&format=json`);
                    const data = await res.json();
                    const city = data.results?.[0]?.name || t('myLocation');
                    setCurrentLoc({ name: city, lat, lon, type: 'gps' });
                    setGpsAvailable(true); // GPS is available
                } catch (e) {
                    setCurrentLoc({ name: t('myLocation'), lat, lon, type: 'gps' });
                    setGpsAvailable(true); // GPS is available
                }
            }
        } catch (err) {
            console.warn("GPS Access denied or failed", err);
            setCurrentLoc(homeLoc); // Fallback to Home
            setGpsAvailable(false); // GPS failed
        }
    };

    initLocation();
  }, [homeLoc, showTutorial]); // Re-run init if homeLoc or tutorial status changes

  // Safety timeout: Force loading to false if stuck
  useEffect(() => {
    if (!loading) return; // Only set timeout when loading is true
    
    const timeout = setTimeout(() => {
      console.warn('Loading timeout reached - forcing render');
      setLoading(false);
    }, 5000); // 5 second maximum wait
    
    return () => clearTimeout(timeout);
  }, [loading]);

  // Update localStorage when locations change
  useEffect(() => {
      localStorage.setItem('weather_locations', JSON.stringify(locations));
  }, [locations]);

  // Update localStorage when home changes
  useEffect(() => {
    localStorage.setItem('weather_home_loc', JSON.stringify(homeLoc));
  }, [homeLoc]);

  // Update localStorage when trips change
  useEffect(() => {
    localStorage.setItem('weather_trips', JSON.stringify(savedTrips));
  }, [savedTrips]);


  // NEU: iOS Erkennung
  useEffect(() => {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // Zeige Hinweis nur, wenn noch nicht installiert (standalone check)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIos && !isStandalone) {
      setShowIosInstall(true);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => { 
        e.preventDefault(); 
        setDeferredPrompt(e); 
        console.log("Install prompt captured");
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleAddLocation = () => {
      // Avoid duplicates based on name/coords
      const exists = locations.some(l => l.name === currentLoc.name);
      if (!exists) {
          setLocations([...locations, { ...currentLoc, type: 'saved', id: crypto.randomUUID() }]);
      }
      setShowLocationModal(false);
  };

  const handleDeleteLocation = (index) => {
      const newLocs = [...locations];
      newLocs.splice(index, 1);
      setLocations(newLocs);
  };

  const handleRenameLocation = (id, newName) => {
      setLocations(locations.map(l => l.id === id ? { ...l, name: newName } : l));
  };
  
  const handleRenameHome = (newName) => {
      if (!homeLoc) return;
      const updated = { ...homeLoc, name: newName };
      setHomeLoc(updated);
      // Wenn der aktuelle Ort Home ist, update auch currentLoc Titel
      if (currentLoc && currentLoc.id === homeLoc.id) {
          setCurrentLoc(updated);
      }
  };

  const handleSetHome = () => {
    setCurrentLoc(homeLoc);
    setGpsAvailable(homeLoc && homeLoc.type === 'gps'); // Update GPS availability
  };
  
  const handleSetCurrent = async () => {
    setLoading(true);
    setError(null); // Reset Error vor neuem Versuch
    console.log("Starte GPS-Suche..."); 
    
    // Check and request permissions first
    const permissionResult = await checkAndRequestLocationPermission();
    
    if (!permissionResult.granted) {
      setError(permissionResult.error);
      setGpsAvailable(false);
      setLoading(false);
      return;
    }
    
    try {
      // Use Capacitor Geolocation API
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 5000
      });
      
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      console.log(`GPS Position erfolgreich: ${lat}, ${lon} (Genauigkeit: ${position.coords.accuracy}m)`);

      // 1. Prüfen: Sind wir zu Hause? (Distanz < 2km)
      if (homeLoc) {
        const dist = getDistanceFromLatLonInKm(lat, lon, homeLoc.lat, homeLoc.lon);
        if (dist < 2.0) { 
          setCurrentLoc(homeLoc);
          setGpsAvailable(true); // GPS data is available (near home)
          if (currentLoc && currentLoc.id === homeLoc.id) fetchData();
          setLoading(false);
          return;
        }
      }

      // 2. Wir sind woanders -> Echten Ortsnamen + Region ermitteln
      let cityName = t('myLocation');
      let regionName = "";
      let countryName = "";

      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=de&format=json`);
        const data = await res.json();
        if (data.results && data.results[0]) {
          cityName = data.results[0].name;
          regionName = data.results[0].admin1 || ""; 
          countryName = data.results[0].country || ""; 
        }
      } catch (e) {
        console.warn("Reverse Geocoding failed", e);
      }

      setCurrentLoc({ 
        name: cityName, 
        lat, 
        lon, 
        type: 'gps',
        region: regionName,
        country: countryName
      });
      setGpsAvailable(true); // GPS data is available
      setLoading(false);
    } catch (err) { 
      console.error("GPS Fehler:", err);
      setGpsAvailable(false); // GPS data is not available
      let msg = "Standort konnte nicht ermittelt werden.";
      
      // Detaillierte Fehleranalyse für den User
      if (err.message && err.message.includes('User denied')) {
        msg = "Standortzugriff verweigert. Bitte erlauben Sie den Zugriff in den App-Einstellungen.";
      } else if (err.message && err.message.includes('location unavailable')) {
        msg = "Standortinformationen sind zurzeit nicht verfügbar (kein GPS-Signal).";
      } else if (err.message && err.message.includes('timeout')) {
        msg = "Zeitüberschreitung bei der Standortsuche. Bitte versuchen Sie es erneut.";
      } else {
        msg = `GPS Fehler: ${err.message || 'Unbekannter Fehler'}`;
      }
      
      setError(msg); 
      setLoading(false); 
    }
  };
  
  // --- CACHE HELPER FUNCTIONS ---
  const CACHE_KEY_SHORT = 'weather_cache_short';
  const CACHE_KEY_LONG = 'weather_cache_long';
  const CACHE_KEY_TIMESTAMP = 'weather_cache_timestamp';
  const CACHE_KEY_LOCATION = 'weather_cache_location';
  const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
  
  const saveWeatherCache = (shortData, longData, location) => {
    try {
      localStorage.setItem(CACHE_KEY_SHORT, JSON.stringify(shortData));
      localStorage.setItem(CACHE_KEY_LONG, JSON.stringify(longData));
      localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
      localStorage.setItem(CACHE_KEY_LOCATION, JSON.stringify(location));
    } catch (e) {
      console.warn('Failed to cache weather data:', e);
    }
  };
  
  const loadWeatherCache = () => {
    try {
      const cachedShort = localStorage.getItem(CACHE_KEY_SHORT);
      const cachedLong = localStorage.getItem(CACHE_KEY_LONG);
      const cachedTimestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);
      const cachedLocation = localStorage.getItem(CACHE_KEY_LOCATION);
      
      if (!cachedShort || !cachedLong || !cachedTimestamp || !cachedLocation) {
        return null;
      }
      
      const timestamp = parseInt(cachedTimestamp, 10);
      const age = Date.now() - timestamp;
      
      // Check if cache is expired
      if (age > CACHE_EXPIRY_MS) {
        return null;
      }
      
      const location = JSON.parse(cachedLocation);
      
      // Note: Location comparison will be done in fetchData where currentLoc is available
      
      return {
        shortData: JSON.parse(cachedShort),
        longData: JSON.parse(cachedLong),
        timestamp,
        age,
        location
      };
    } catch (e) {
      console.warn('Failed to load weather cache:', e);
      return null;
    }
  };
  
  const fetchData = async () => {
    if (!currentLoc) return; // Nicht fetchen wenn kein Ort da ist

    // Try to load from cache first
    const cached = loadWeatherCache();
    // Validate cache is for current location
    if (cached && cached.location.lat === currentLoc.lat && cached.location.lon === currentLoc.lon) {
      setShortTermData(cached.shortData);
      setLongTermData(cached.longData);
      setLastUpdated(new Date(cached.timestamp));
      setIsUsingCache(true);
      setLoading(false);
      // Continue fetching in background to update cache
    } else {
      setIsUsingCache(false);
      setLoading(true);
    }
    
    setError(null);
    setDwdWarnings([]);
    try {
      const { lat, lon } = currentLoc;
      
      const modelsShort = "icon_seamless,gfs_seamless,gem_seamless";
      const urlShort = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,snowfall,weathercode,windspeed_10m,winddirection_10m,windgusts_10m,is_day,apparent_temperature,relative_humidity_2m,dewpoint_2m,uv_index,precipitation_probability,cloud_cover,pressure_msl,visibility&models=${modelsShort}&minutely_15=precipitation&timezone=auto&forecast_days=2`;
      
      const modelsLong = "icon_seamless,gfs_seamless,arome_seamless,gem_seamless"; 
      const urlLong = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,precipitation_probability_max&models=${modelsLong}&timezone=auto&forecast_days=14`;
      // Separate API call for sunrise/sunset without models parameter (astronomical data is location-based, not model-dependent)
      const urlSunriseSunset = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto&forecast_days=1`;
      const urlDwd = `https://api.brightsky.dev/alerts?lat=${lat}&lon=${lon}`;
      const urlAirQuality = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5&timezone=auto`;

      const [resShort, resLong, resSunriseSunset, resDwd, resAirQuality] = await Promise.all([
        fetch(urlShort), 
        fetch(urlLong), 
        fetch(urlSunriseSunset).catch(() => ({ ok: false })),
        fetch(urlDwd).catch(() => ({ ok: false })),
        fetch(urlAirQuality).catch(() => ({ ok: false }))
      ]);
      
      if (!resShort.ok) {
          const errText = await resShort.text();
          throw new Error(`Fehler (Short): ${errText}`);
      }
      if (!resLong.ok) {
          const errText = await resLong.text();
          throw new Error(`Fehler (Long): ${errText}`);
      }
      
      const shortData = await resShort.json();
      const longData = await resLong.json();
      
      setShortTermData(shortData);
      setLongTermData(longData);
      
      // Save to cache
      saveWeatherCache(shortData, longData, currentLoc);
      setIsUsingCache(false);
      
      // Set sunrise/sunset from separate API call
      if (resSunriseSunset.ok) {
        const sunData = await resSunriseSunset.json();
        if (sunData.daily?.sunrise?.[0] && sunData.daily?.sunset?.[0]) {
          setSunriseSunset({ sunrise: sunData.daily.sunrise[0], sunset: sunData.daily.sunset[0] });
        }
      }
      
      if (resDwd.ok) {
         const dwdJson = await resDwd.json();
         setDwdWarnings(dwdJson.alerts || []);
      }
      
      if (resAirQuality.ok) {
        const aqJson = await resAirQuality.json();
        setAirQualityData(aqJson.current);
      }

      setLastUpdated(new Date());
      setModelRuns({ icon: getModelRunTime(3, 2.5), gfs: getModelRunTime(6, 4), arome: getModelRunTime(3, 2) });

    } catch (err) { 
        console.error("API Error:", err);
        // If we have cached data and fetch failed, don't show error
        if (!cached) {
          setError(err.message);
        } else {
          // Maintain cached state on fetch failure
          setIsUsingCache(true);
        }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [currentLoc]);

  // --- TRAVEL SEARCH LOGIC ---
  const handleTravelSearch = async (overrideQuery = null, overrideData = null) => {
    const q = overrideQuery || travelQuery;
    if (!q && !overrideData) return;
    
    setTravelLoading(true);
    setTravelResult(null);
    setTripReport(null); // Reset Report
    
    try {
        let loc;
        // 1. Geocoding (if needed)
        if (overrideData) {
            loc = overrideData;
        } else {
            // FIX: .trim() auch hier hinzugefügt
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=1&language=de&format=json`);
            const geoData = await geoRes.json();
            
            if (!geoData.results || geoData.results.length === 0) {
                alert("Ort nicht gefunden.");
                setTravelLoading(false);
                return;
            }
            loc = geoData.results[0];
        }
        
        // 2. Weather Fetch (Seamless for best results) - 14 Days to cover future
        const lat = loc.latitude || loc.lat;
        const lon = loc.longitude || loc.lon;
        // Fetch comparing data to calculate reliability
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode,precipitation_probability,windspeed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max,precipitation_sum,windgusts_10m_max&models=icon_seamless,gfs_seamless&timezone=auto&forecast_days=16`;
        
        const wRes = await fetch(url);
        if(!wRes.ok) throw new Error("Wetterdaten konnten nicht geladen werden.");
        const wData = await wRes.json();
        
        if(!wData || !wData.hourly || !wData.hourly.time) throw new Error("Keine Vorhersage verfügbar.");

        // 3. Process Data
        // CRITICAL FIX: Ensure dates are handled as simple ISO strings for comparison to avoid timezone issues
        const startDateStr = overrideData ? overrideData.startDate : travelStartDate;
        const endDateStr = (overrideData ? overrideData.endDate : travelEndDate) || startDateStr;
        
        if (!startDateStr) {
             alert(t('startDate') + " ?");
             setTravelLoading(false);
             return;
        }

        const startDate = new Date(startDateStr); // Keep Date object for display formatting
        const endDate = new Date(endDateStr);
        
        // Determine Mode: Single Day or Multi Day
        const isMultiDay = startDateStr !== endDateStr;
        
        let result = {
            location: loc,
            mode: isMultiDay ? 'multi' : 'single',
            startDate,
            endDate,
            items: [], // for multi day
            summary: {}, // for single day
            reliability: 0
        };

        // HELPER: Safely get value from potentially model-suffixed response
        const getSafeValue = (sourceObj, index, baseKey) => {
            if (!sourceObj) return null;
            // 1. Try base key directly (e.g. temperature_2m)
            if (sourceObj[baseKey] && sourceObj[baseKey][index] !== undefined) return sourceObj[baseKey][index];
            
            // 2. Try common model suffixes
            const models = ['icon_seamless', 'gfs_seamless', 'gem_seamless', 'arome_seamless'];
            for (const m of models) {
                const key = `${baseKey}_${m}`;
                if (sourceObj[key] && sourceObj[key][index] !== undefined) return sourceObj[key][index];
            }
            return null;
        };

        // Check if date is > 16 days in future
        const now = new Date();
        const diffDays = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
        if (diffDays > 16) {
             // Zu weit in der Zukunft
             setTravelResult({...result, reliability: 0});
             setTripReport(generateAIReport('trip', {...result, reliability: 0}, lang));
             setTravelLoading(false);
             return;
        }

        if (isMultiDay) {
            // MULTI DAY LOGIC
            const daily = wData.daily;
            const dailyItems = [];
            let totalRel = 0;
            let count = 0;

            for(let i=0; i<daily.time.length; i++) {
                const dayDateStr = daily.time[i]; // "YYYY-MM-DD"
                
                // Compare strings directly: "2023-10-01" >= "2023-10-01"
                if (dayDateStr >= startDateStr && dayDateStr <= endDateStr) {
                    
                    const maxT = getSafeValue(daily, i, 'temperature_2m_max') ?? 0;
                    const minT = getSafeValue(daily, i, 'temperature_2m_min') ?? 0;
                    const code = getSafeValue(daily, i, 'weathercode') ?? 0;
                    const prob = getSafeValue(daily, i, 'precipitation_probability_max') ?? 0;
                    const sum = getSafeValue(daily, i, 'precipitation_sum') ?? 0;
                    const gust = getSafeValue(daily, i, 'windgusts_10m_max') ?? 0;

                    dailyItems.push({
                        date: new Date(dayDateStr),
                        max: maxT,
                        min: minT,
                        code: code,
                        precipProb: prob,
                        precipSum: sum,
                        wind: gust
                    });
                    
                    const d = new Date(dayDateStr).getTime();
                    const daysInFuture = (d - new Date().getTime()) / (1000 * 60 * 60 * 24);
                    const rel = Math.max(10, 100 - (daysInFuture * 5));
                    totalRel += rel;
                    count++;
                }
            }
            result.items = dailyItems;
            result.reliability = count > 0 ? Math.round(totalRel / count) : 50;

        } else {
            // SINGLE DAY LOGIC
            const startTimeStr = overrideData ? overrideData.startTime : travelStartTime;
            const endTimeStr = overrideData ? overrideData.endTime : travelEndTime;
            
            const useTimeWindow = startTimeStr || endTimeStr;
            let startH = 0; 
            let endH = 23;

            if (useTimeWindow) {
                if (startTimeStr) startH = parseInt(startTimeStr.split(':')[0]);
                if (endTimeStr) endH = parseInt(endTimeStr.split(':')[0]);
            }

            // Filter hourly data for that day and time window
            const hourly = wData.hourly;
            let temps = [];
            let precips = [];
            let winds = [];
            let codes = [];
            let probs = [];
            
            // Use the date string for matching
            const targetDateStr = startDateStr; 

            for(let i=0; i<hourly.time.length; i++) {
                // hourly.time is usually ISO string "YYYY-MM-DDTHH:mm"
                const tStr = hourly.time[i];
                if (tStr.startsWith(targetDateStr)) {
                    // Extract hour from ISO string "2023-10-27T14:00" -> 14
                    const h = parseInt(tStr.split('T')[1].split(':')[0]);
                    
                    if (h >= startH && h <= endH) {
                        const temp = getSafeValue(hourly, i, 'temperature_2m');
                        const precip = getSafeValue(hourly, i, 'precipitation');
                        const wind = getSafeValue(hourly, i, 'windspeed_10m');
                        const code = getSafeValue(hourly, i, 'weathercode');
                        const prob = getSafeValue(hourly, i, 'precipitation_probability');

                        if (temp !== null) temps.push(temp);
                        if (precip !== null) precips.push(precip);
                        if (wind !== null) winds.push(wind);
                        if (code !== null) codes.push(code);
                        if (prob !== null) probs.push(prob);
                    }
                }
            }

            if (temps.length > 0) {
                result.summary = {
                    avgTemp: temps.reduce((a,b)=>a+b,0)/temps.length,
                    maxTemp: Math.max(...temps),
                    minTemp: Math.min(...temps),
                    totalPrecip: precips.reduce((a,b)=>a+b,0),
                    maxWind: Math.max(...winds),
                    avgProb: Math.round(probs.reduce((a,b)=>a+b,0)/probs.length),
                    code: codes[Math.floor(codes.length/2)], // approximate
                    isTimeWindow: !!useTimeWindow,
                    startH, endH
                };
                
                // Reliability
                const daysInFuture = (startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                result.reliability = Math.round(Math.max(10, 100 - (daysInFuture * 5)));
            } else {
                result.reliability = 0; 
                // Initialize empty summary to prevent crash
                result.summary = { maxTemp: 0, minTemp: 0, totalPrecip: 0, avgProb: 0, maxWind: 0, code: 0 };
            }
        }

        setTravelResult(result);
        
        // Generate AI Report for the trip if valid - NOW WITH LANG SUPPORT
        setTripReport(generateAIReport('trip', result, lang));

    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
    } finally {
        setTravelLoading(false);
    }
  };

  const handleSaveTrip = () => {
      if (!travelResult) return;
      const newTrip = {
          id: crypto.randomUUID(),
          name: travelResult.location.name || travelQuery,
          lat: travelResult.location.latitude || travelResult.location.lat,
          lon: travelResult.location.longitude || travelResult.location.lon,
          startDate: travelStartDate,
          endDate: travelEndDate,
          startTime: travelStartTime,
          endTime: travelEndTime
      };
      setSavedTrips([...savedTrips, newTrip]);
      alert(t('tripSaved'));
  };

  const handleDeleteTrip = (id) => {
      setSavedTrips(savedTrips.filter(t => t.id !== id));
  };

  const loadTrip = (trip) => {
      setTravelQuery(trip.name);
      setTravelStartDate(trip.startDate);
      setTravelEndDate(trip.endDate || "");
      setTravelStartTime(trip.startTime || "");
      setTravelEndTime(trip.endTime || "");
      // Trigger search
      handleTravelSearch(trip.name, trip);
  };

  // --- PREVIEW COMPONENT FOR TRIP LIST ---
  const TripWeatherPreview = ({ trip }) => {
      const [weather, setWeather] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
          const fetchPreview = async () => {
              try {
                  const url = `https://api.open-meteo.com/v1/forecast?latitude=${trip.lat}&longitude=${trip.lon}&daily=weathercode,temperature_2m_max&models=icon_seamless&timezone=auto&start_date=${trip.startDate}&end_date=${trip.startDate}`;
                  const res = await fetch(url);
                  const data = await res.json();
                  if (data.daily && data.daily.time.length > 0) {
                      setWeather({
                          code: data.daily.weathercode[0],
                          max: data.daily.temperature_2m_max[0]
                      });
                  }
              } catch (e) {
                  // silent fail or retry
              } finally {
                  setLoading(false);
              }
          };
          fetchPreview();
      }, [trip]);

      if (loading) return <div className="w-8 h-8 rounded-full bg-m3-surface-container animate-pulse"></div>;
      if (!weather) return <div className="text-[10px] text-m3-on-surface-variant">--</div>;

      const Icon = getWeatherConfig(weather.code, 1, lang).icon;
      return (
          <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-lg">
              <Icon size={16} className="text-blue-600"/>
              <span className="font-bold text-slate-700 text-xs">{formatTemp(weather.max)}{getTempUnitSymbol()}</span>
          </div>
      );
  };


  // --- PROCESSING LOGIC --- 
  const processedShort = useMemo(() => {
    if (!shortTermData?.hourly) return [];
    const h = shortTermData.hourly;
    const now = new Date();
    const res = [];
    const isDayArray = h.is_day_icon_d2 || h.is_day || h.is_day_gfs_seamless;

    for (let i = 0; i < h.time.length; i++) {
      // WICHTIG: parseLocalTime verwenden
      const t = parseLocalTime(h.time[i]);
      
      const nextT = i < h.time.length - 1 ? parseLocalTime(h.time[i+1]) : null;
      if (t < now && nextT && nextT > now) {
         // Das ist das aktuelle Intervall, behalten
      } else if (t < now) {
         continue; 
      }

      // FIX: Verwendung der globalen Seamless-Keys
      const getVal = (key) => h[key]?.[i] ?? h[`${key}_icon_seamless`]?.[i] ?? h[`${key}_gfs_seamless`]?.[i] ?? 0;
      
      // Neue Modelle auslesen (wenn vorhanden)
      const temp_icon = h.temperature_2m_icon_seamless?.[i] ?? null;
      const temp_gfs = h.temperature_2m_gfs_seamless?.[i] ?? null;
      // Optional: Weitere Modelle, falls vorhanden, aber Fokus auf Global
      const temp_arome = h.temperature_2m_arome_seamless?.[i] ?? null; 
      const temp_gem = h.temperature_2m_gem_seamless?.[i] ?? null;
      
      // Mittelwert jetzt aus verfügbaren Modellen
      const t_vals = [temp_icon, temp_gfs, temp_gem].filter(v => v !== null && v !== undefined);
      const temp = t_vals.length > 0 ? t_vals.reduce((a,b)=>a+b,0) / t_vals.length : 0;
      
      // Auch bei Regen/Schnee/Wind alle Modelle einbeziehen
      const getAvg = (key) => {
         const v1 = h[`${key}_icon_seamless`]?.[i];
         const v2 = h[`${key}_gfs_seamless`]?.[i];
         const v3 = h[`${key}_gem_seamless`]?.[i];
         const vals = [v1, v2, v3].filter(v => v !== undefined && v !== null);
         return vals.length > 0 ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
      };

      const getMax = (key) => {
         const v1 = h[`${key}_icon_seamless`]?.[i];
         const v2 = h[`${key}_gfs_seamless`]?.[i];
         const v3 = h[`${key}_gem_seamless`]?.[i];
         const vals = [v1, v2, v3].filter(v => v !== undefined && v !== null);
         return vals.length > 0 ? Math.max(...vals) : 0;
      };

      // Zuverlässigkeit
      const t_spread = t_vals.length > 1 ? Math.max(...t_vals) - Math.min(...t_vals) : 0;
      const reliability = Math.round(Math.max(0, 100 - (t_spread * 15)));

      res.push({
        time: t,
        displayTime: t.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'}),
        temp: temp,
        temp_icon, temp_gfs, temp_arome, temp_gem,
        precip: getAvg('precipitation'),
        // FIX: Add precipProb field
        precipProb: getVal('precipitation_probability'),
        snow: getAvg('snowfall'),
        wind: Math.round(getAvg('windspeed_10m')),
        gust: Math.round(getMax('windgusts_10m')), // Böen immer Max Warnung
        dir: h.winddirection_10m_icon_seamless?.[i] || 0,
        code: h.weathercode_icon_seamless?.[i] || h.weathercode?.[i] || 0,
        isDay: isDayArray?.[i] ?? (t.getHours() >= 6 && t.getHours() <= 21 ? 1 : 0),
        appTemp: getVal('apparent_temperature'),
        humidity: getVal('relative_humidity_2m'),
        dewPoint: getVal('dewpoint_2m'),
        uvIndex: getVal('uv_index'),
        cloudCover: getAvg('cloud_cover'),
        pressure: getVal('pressure_msl'),
        visibility: getVal('visibility'),
        reliability: reliability
      });
    }
    return res.slice(0, 48);
  }, [shortTermData]);

  const processedLong = useMemo(() => {
    if (!longTermData?.daily) return [];
    const d = longTermData.daily;
    const locale = lang === 'en' ? 'en-US' : 'de-DE';

    return d.time.map((t, i) => {
      // WICHTIG: parseLocalTime verwenden
      const date = parseLocalTime(t);
      const maxIcon = d.temperature_2m_max_icon_seamless?.[i] ?? 0;
      const maxGfs = d.temperature_2m_max_gfs_seamless?.[i] ?? 0;
      const maxArome = d.temperature_2m_max_arome_seamless?.[i] ?? null;
      const maxGem = d.temperature_2m_max_gem_seamless?.[i] ?? null;
      
      // Mittelwert robuster
      const maxVals = [maxIcon, maxGfs, maxGem].filter(v => v !== null && v !== undefined);
      
      return {
        date,
        dayName: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
        dayNameFull: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date),
        dateShort: formatDateShort(date, lang),
        max: maxVals.length > 0 ? maxVals.reduce((a,b)=>a+b,0)/maxVals.length : maxIcon,
        min: ((d.temperature_2m_min_icon_seamless?.[i]??0) + (d.temperature_2m_min_gfs_seamless?.[i]??0)) / 2,
        max_icon: maxIcon, max_gfs: maxGfs, max_arome: maxArome, max_gem: maxGem,
        // Auch hier GEM mit einbeziehen
        rain: Math.max(d.precipitation_sum_icon_seamless?.[i]||0, d.precipitation_sum_gfs_seamless?.[i]||0, d.precipitation_sum_gem_seamless?.[i]||0).toFixed(1),
        snow: Math.max(d.snowfall_sum_icon_seamless?.[i]||0, d.snowfall_sum_gfs_seamless?.[i]||0, d.snowfall_sum_gem_seamless?.[i]||0).toFixed(1),
        wind: Math.round(Math.max(d.windspeed_10m_max_icon_seamless?.[i]||0, d.windspeed_10m_max_gfs_seamless?.[i]||0, d.windspeed_10m_max_gem_seamless?.[i]||0)),
        gust: Math.round(Math.max(d.windgusts_10m_max_icon_seamless?.[i]||0, d.windgusts_10m_max_gfs_seamless?.[i]||0, d.windgusts_10m_max_gem_seamless?.[i]||0)),
        dir: d.winddirection_10m_dominant_icon_seamless?.[i] || 0,
        code: d.weathercode_icon_seamless?.[i] || 0,
        reliability: Math.round(Math.max(10, 100 - (Math.abs(maxIcon - maxGfs) * 15) - (i * 2))),
        prob: Math.round(((d.precipitation_probability_max_icon_seamless?.[i]||0) + (d.precipitation_probability_max_gfs_seamless?.[i]||0))/2)
      };
    });
  }, [longTermData, lang]); // Add lang to deps to refresh names
  
  // LIVE oder DEMO Daten?
  const liveCurrent = processedShort.length > 0 ? processedShort[0] : { temp: 0, snow: 0, precip: 0, wind: 0, gust: 0, dir: 0, code: 0, isDay: 1, appTemp: 0, humidity: 0, dewPoint: 0, uvIndex: 0, cloudCover: 0, pressure: null, visibility: null };
  const current = liveCurrent;

  // --- NEUE LOGIK: Echter Tag/Nacht Status für das UI ---
  // Wir berechnen dies direkt in der App Komponente, damit Hintergrund & Karten einheitlich sind.
  const getIsRealNight = () => {
      // 1. Check manuelle Einstellung
      if (settings.theme === 'dark') return true;
      if (settings.theme === 'light') return false;

      // 2. Fallback auf Auto (Zeitbasiert)
      // Wenn keine Sonnenaufgangsdaten da sind, Fallback auf API 'isDay'
      if (!sunriseSunset.sunrise || !sunriseSunset.sunset) return current.isDay === 0;
      
      // Hilfsfunktion zur Dezimalzeit-Berechnung (kopiert aus WeatherLandscape Logik)
      const getDec = (d) => {
          if (!d) return 0;
          const dateObj = typeof d === 'string' ? parseLocalTime(d) : d;
          // Sekunden hinzufügen für präzisere Synchronisation mit WeatherLandscape
          return dateObj.getHours() + dateObj.getMinutes() / 60 + dateObj.getSeconds() / 3600;
      };
      
      // WICHTIG: Nutze locationTime statt now!
      const nowDec = getDec(locationTime);
      const sunrDec = getDec(sunriseSunset.sunrise);
      const sunsDec = getDec(sunriseSunset.sunset);
      
      // Tag ist, wenn aktuelle Zeit zwischen Auf- und Untergang liegt
      // ÄNDERUNG: < sunsDec (statt <=), damit bei Sonnenuntergang sofort Nacht ist
      const isDayTime = nowDec >= sunrDec && nowDec < sunsDec;
      return !isDayTime;
  };
  
  // WICHTIG: Nutze jetzt 'isRealNight' statt 'current.isDay === 0' für alle UI-Entscheidungen
  const isRealNight = getIsRealNight();

  const dailyRainSum = processedLong.length > 0 ? processedLong[0].rain : "0.0";
  const dailySnowSum = processedLong.length > 0 ? processedLong[0].snow : "0.0";
  
  // Calculate 24-hour precipitation total (same as in modal)
  const next24HoursPrecip = useMemo(() => {
    if (!processedShort || processedShort.length === 0) {
      return { rain: 0, snow: 0, total: 0 };
    }
    // Get up to 24 hours of data (may be less if data is limited)
    const next24Hours = processedShort.slice(0, 24);
    let totalRain = 0;
    let totalSnow = 0;
    for (let i = 0; i < next24Hours.length; i++) {
      totalRain += (next24Hours[i].precip || 0);
      totalSnow += (next24Hours[i].snow || 0);
    }
    return {
      rain: totalRain,
      snow: totalSnow,
      total: totalRain + totalSnow
    };
  }, [processedShort]);
  
  // Snow should be treated like rain - only show if weather code explicitly indicates snow, not based on temperature
  const isSnowing = current.code && SNOW_WEATHER_CODES.includes(current.code);
  
  // Configuration based on actual status - Material 3 Theme
  const weatherConf = getWeatherConfig(current.code || 0, isRealNight ? 0 : 1, lang);
  const bgGradient = isRealNight ? 'from-m3-dark-surface to-m3-dark-surface' : 'from-m3-surface to-m3-surface-container';
  const textColor = isRealNight ? 'text-m3-dark-on-surface' : 'text-m3-on-surface';
  const cardBg = isRealNight ? 'bg-m3-dark-surface-container/90 border-m3-outline-variant/70 text-m3-dark-on-surface' : 'bg-m3-surface-container/80 border-m3-outline-variant/40 text-m3-on-surface';
  const tileBg = isRealNight ? 'bg-m3-dark-surface-container-high border-m3-outline-variant/50 text-m3-dark-on-surface' : 'bg-m3-surface-container-high border-m3-outline-variant';
  const windColorClass = getWindColorClass(current.wind || 0, isRealNight);

  // Create a 3-day forecast: rest of today, tomorrow, and day after tomorrow
  const threeDayForecast = useMemo(() => {
    if (!processedShort.length || !processedLong.length) return [];
    
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const remainingHoursToday = processedShort.filter(hour => hour.time <= todayEnd);
    
    const result = [];
    
    // 1. Rest of today (aggregated from hourly data)
    if (remainingHoursToday.length > 0) {
      const temps = remainingHoursToday.map(h => h.temp);
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);
      const avgReliability = Math.round(remainingHoursToday.reduce((sum, h) => sum + h.reliability, 0) / remainingHoursToday.length);
      
      // Find the most common weather code
      const weatherCodes = remainingHoursToday.map(h => h.code);
      const codeFreq = {};
      weatherCodes.forEach(code => { codeFreq[code] = (codeFreq[code] || 0) + 1; });
      const mostCommonCode = parseInt(Object.keys(codeFreq).reduce((a, b) => codeFreq[a] > codeFreq[b] ? a : b, 0));
      
      // Aggregate precipitation
      const totalRain = remainingHoursToday.reduce((sum, h) => sum + parseFloat(h.precip || 0), 0).toFixed(1);
      const totalSnow = remainingHoursToday.reduce((sum, h) => sum + parseFloat(h.snow || 0), 0).toFixed(1);
      const maxWind = Math.max(...remainingHoursToday.map(h => h.wind || 0));
      const maxGust = Math.max(...remainingHoursToday.map(h => h.gust || 0));
      const avgDir = remainingHoursToday[Math.floor(remainingHoursToday.length / 2)]?.dir || 0;
      const maxPrecipProb = Math.max(...remainingHoursToday.map(h => h.precipProb || 0));
      
      result.push({
        date: now,
        dayName: t('restOfDay'),
        dayNameFull: t('restOfDay'),
        dateShort: t('today'),
        max: maxTemp,
        min: minTemp,
        rain: totalRain,
        snow: totalSnow,
        wind: Math.round(maxWind),
        gust: Math.round(maxGust),
        dir: avgDir,
        code: mostCommonCode,
        reliability: avgReliability,
        prob: Math.round(maxPrecipProb)
      });
    }
    
    // 2. Tomorrow (from processedLong[1])
    if (processedLong.length > 1) {
      result.push({
        ...processedLong[1],
        dateShort: t('tomorrow')
      });
    }
    
    // 3. Day after tomorrow (from processedLong[2])
    if (processedLong.length > 2) {
      result.push(processedLong[2]);
    }
    
    return result;
  }, [processedShort, processedLong, lang, t]);

  const dailyReport = useMemo(() => generateAIReport('daily', processedShort, lang, threeDayForecast), [processedShort, lang, threeDayForecast]);
  const modelReport = useMemo(() => generateAIReport(chartView === 'hourly' ? 'model-hourly' : 'model-daily', chartView === 'hourly' ? processedShort : processedLong, lang), [chartView, processedShort, processedLong, lang]);
  const longtermReport = useMemo(() => generateAIReport('longterm', processedLong, lang), [processedLong, lang]);

  // --- WIDGET VIEWS ---
  if (viewMode === 'animation') {
    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-m3-dark-surface text-m3-dark-on-surface">{t('loading')}</div>;
    return (
      <div className={`h-screen w-screen overflow-hidden relative bg-gradient-to-br ${bgGradient}`}>
        <style>{styles}</style>
        <div className="absolute top-12 left-4 z-50">
            <a href="/" className="bg-black/20 p-2 rounded-full text-white backdrop-blur-md block"><ArrowLeft size={24}/></a>
        </div>
        <div className="h-full w-full">
            {/* WICHTIG: hier locationTime übergeben! */}
            <WeatherLandscape 
              code={current.code} 
              isDay={isRealNight ? 0 : 1} 
              date={locationTime} 
              temp={current.temp} 
              sunrise={sunriseSunset.sunrise} 
              sunset={sunriseSunset.sunset} 
              windSpeed={current.wind} 
              lang={lang}
              demoWeather={demoWeather}
              demoSeason={demoSeason}
              demoEvent={demoEvent}
              demoTime={demoTime}
              demoWindSpeed={demoWindSpeed}
            />
        </div>
        
        {/* Demo Control Panel */}
        <div className="absolute top-20 right-4 z-50">
          <button 
            onClick={() => setShowDemoPanel(!showDemoPanel)}
            className="bg-black/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/40 transition-colors"
            title="Demo Controls"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6M1 12h6m6 0h6"/>
            </svg>
          </button>
        </div>

        {showDemoPanel && (
          <div className="absolute top-20 right-4 mt-12 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white text-sm z-50 min-w-[250px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Demo Mode</h3>
              <button 
                onClick={() => {
                  setDemoWeather(null);
                  setDemoSeason(null);
                  setDemoEvent(null);
                  setDemoTime(null);
                  setDemoWindSpeed(null);
                }}
                className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
              >
                Reset
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs opacity-80 mb-1">Wetter / Weather</label>
                <select 
                  value={demoWeather || ''} 
                  onChange={(e) => setDemoWeather(e.target.value || null)}
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
                >
                  <option value="">Auto</option>
                  <optgroup label="Bewölkung / Clouds">
                    <option value="clear">☀️ Sonnenschein / Sunshine</option>
                    <option value="slightly_cloudy">🌤️ Leicht bewölkt / Slightly Cloudy</option>
                    <option value="cloudy">⛅ Bewölkt / Cloudy</option>
                    <option value="overcast">☁️ Stark bewölkt / Overcast</option>
                  </optgroup>
                  <optgroup label="Regen / Rain">
                    <option value="drizzle">🌦️ Nieselregen / Drizzle</option>
                    <option value="light_rain">🌧️ Leichter Regen / Light Rain</option>
                    <option value="medium_rain">🌧️ Mittlerer Regen / Medium Rain</option>
                    <option value="heavy_rain">🌧️ Starker Regen / Heavy Rain</option>
                    <option value="thunderstorm">⛈️ Gewitter / Thunderstorm</option>
                    <option value="storm">🌩️ Sturm / Storm</option>
                  </optgroup>
                  <optgroup label="Schnee / Snow">
                    <option value="light_snow">🌨️ Leichter Schnee / Light Snow</option>
                    <option value="medium_snow">❄️ Mittlerer Schnee / Medium Snow</option>
                    <option value="heavy_snow">❄️ Starker Schnee / Heavy Snow</option>
                    <option value="sleet">🌨️ Glätte / Sleet</option>
                  </optgroup>
                  <optgroup label="Andere / Other">
                    <option value="fog">🌫️ Nebel / Fog</option>
                    <option value="hail">🌨️ Hagel / Hail</option>
                    <option value="heat">🔥 Hitze / Heat (35°C)</option>
                    <option value="freeze">🥶 Kälte / Cold (-10°C)</option>
                    <option value="tropical_night">🌡️ Tropische Nacht / Tropical Night</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs opacity-80 mb-1">Wind</label>
                <select 
                  value={demoWindSpeed !== null ? demoWindSpeed : ''} 
                  onChange={(e) => setDemoWindSpeed(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
                >
                  <option value="">Auto</option>
                  <option value="5">💨 Leicht / Light (5 km/h)</option>
                  <option value="20">💨 Mäßig / Moderate (20 km/h)</option>
                  <option value="35">💨 Starker Wind / Strong Wind (35 km/h)</option>
                  <option value="60">🌪️ Stürmisch / Stormy (60 km/h)</option>
                  <option value="100">🌪️ Orkan / Hurricane (100 km/h)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs opacity-80 mb-1">Uhrzeit / Time</label>
                <select 
                  value={demoTime || ''} 
                  onChange={(e) => setDemoTime(e.target.value || null)}
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
                >
                  <option value="">Auto (Echtzeit)</option>
                  <option value="06:00">🌅 Sonnenaufgang / Sunrise (06:00)</option>
                  <option value="08:00">🌄 Morgen / Morning (08:00)</option>
                  <option value="12:00">☀️ Mittag / Noon (12:00)</option>
                  <option value="16:00">🌤️ Nachmittag / Afternoon (16:00)</option>
                  <option value="18:00">🌆 Abend / Evening (18:00)</option>
                  <option value="20:00">🌇 Sonnenuntergang / Sunset (20:00)</option>
                  <option value="22:00">🌙 Nacht / Night (22:00)</option>
                  <option value="00:00">🌃 Mitternacht / Midnight (00:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs opacity-80 mb-1">Jahreszeit / Season</label>
                <select 
                  value={demoSeason || ''} 
                  onChange={(e) => setDemoSeason(e.target.value || null)}
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
                >
                  <option value="">Auto</option>
                  <option value="spring">🌸 Frühling / Spring</option>
                  <option value="summer">☀️ Sommer / Summer</option>
                  <option value="autumn">🍂 Herbst / Autumn</option>
                  <option value="winter">❄️ Winter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs opacity-80 mb-1">Ereignis / Event</label>
                <select 
                  value={demoEvent || ''} 
                  onChange={(e) => setDemoEvent(e.target.value || null)}
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
                >
                  <option value="">Keines / None</option>
                  <option value="christmas">🎄 Weihnachten / Christmas</option>
                  <option value="easter">🐰 Ostern / Easter</option>
                  <option value="halloween">🎃 Halloween</option>
                  <option value="newyear">🎆 Silvester / New Year</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-8 left-0 right-0 text-center text-white pointer-events-none" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'}}>
            <div className="text-4xl font-bold">{formatTemp(current.temp)}{getTempUnitSymbol()}</div>
            <div className="text-sm opacity-70 mb-1">{t('dewPoint')}: {formatTemp(current.dewPoint)}{getTempUnitSymbol()}</div>
            <div className="text-xl mb-2">{weatherConf.text}</div>
            
            {/* NEU: Sonnenaufgang und Untergang */}
            <div className="flex justify-center gap-6 text-sm font-medium">
                <div className="flex items-center gap-1"><Sunrise size={16}/> {formatTime(sunriseSunset.sunrise)}</div>
                <div className="flex items-center gap-1"><Sunset size={16}/> {formatTime(sunriseSunset.sunset)}</div>
            </div>
            
            {/* GPS Availability Indicator */}
            <div className="mt-2 flex justify-center">
              <div className={`px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                gpsAvailable 
                  ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                  : 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
              }`}>
                {gpsAvailable ? `✓ ${t('gpsAvailable')}` : `⚠ ${t('gpsNotAvailable')}`}
              </div>
            </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'report') {
     if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-m3-surface">{t('loading')}</div>;
     return (
        <div className="min-h-screen bg-m3-surface px-4 pb-4 pt-14">
            <div className="mb-4">
                <a href="/" className="bg-white p-2 rounded-full text-slate-700 shadow-sm inline-block"><ArrowLeft size={24}/></a>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">{t('dailyReport')}</h2>
             <AIReportBox report={dailyReport} dwdWarnings={dwdWarnings} lang={lang} tempFunc={formatTemp} formatWind={formatWind} getWindUnitLabel={getWindUnitLabel} formatPrecip={formatPrecip} getPrecipUnitLabel={getPrecipUnitLabel} getTempUnitSymbol={getTempUnitSymbol} />
            <div className="mt-8">
                 <h2 className="text-2xl font-bold mb-4 text-slate-800">{t('trend')}</h2>
                 <AIReportBox report={longtermReport} dwdWarnings={[]} lang={lang} tempFunc={formatTemp} formatWind={formatWind} getWindUnitLabel={getWindUnitLabel} formatPrecip={formatPrecip} getPrecipUnitLabel={getPrecipUnitLabel} getTempUnitSymbol={getTempUnitSymbol} />
            </div>
        </div>
     );
  }

  if (viewMode === 'precip') {
    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50">{t('loading')}</div>;
    return (
       <div className="min-h-screen bg-m3-surface p-4 flex flex-col justify-center">
           <div className="absolute top-12 left-4">
               <a href="/" className="bg-white p-2 rounded-full text-slate-700 shadow-sm inline-block"><ArrowLeft size={24}/></a>
           </div>
           <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">{t('precipRadar')}</h2>
            <PrecipitationTile data={processedShort} lang={lang} formatPrecip={formatPrecip} getPrecipUnitLabel={getPrecipUnitLabel} />
       </div>
    );
 }

  // --- STANDARD APP ---

  // SHOW TUTORIAL FIRST (only on very first launch)
  if (showTutorial) {
      return (
          <div className="min-h-screen bg-m3-surface font-sans">
              <TutorialModal 
                  onComplete={(homeLocationFromTutorial) => {
                      setTutorialCompleted();
                      setShowTutorial(false);
                      // If home location was set in tutorial, save it
                      if (homeLocationFromTutorial) {
                          setHomeLoc(homeLocationFromTutorial);
                          setCurrentLoc(homeLocationFromTutorial);
                      } else if (!homeLoc) {
                          // If no home location, show home setup next
                          setShowHomeSetup(true);
                      }
                  }}
                  onSkip={() => {
                      setTutorialCompleted();
                      setShowTutorial(false);
                      // If no home location, show home setup next
                      if (!homeLoc) {
                          setShowHomeSetup(true);
                      }
                  }}
                  settings={settings}
                  setSettings={setSettings}
                  lang={lang}
              />
          </div>
      );
  }

  // SHOW SETUP MODAL AFTER TUTORIAL OR WHEN NO HOME (with optional cancel button)
  if (showHomeSetup || !homeLoc) {
      return (
          <div className="min-h-screen bg-m3-surface font-sans relative">
              {/* Cancel Button nur wenn homeLoc bereits existiert (also nicht beim allerersten Start) */}
              {homeLoc && (
                  <button 
                    onClick={() => setShowHomeSetup(false)}
                    className="absolute top-6 right-6 text-m3-on-surface/50 hover:text-m3-on-surface z-[110]"
                  >
                    <X size={32} />
                  </button>
              )}
              <HomeSetupModal 
                  onSave={(loc) => {
                      setHomeLoc(loc);
                      setCurrentLoc(loc);
                      setShowHomeSetup(false);
                  }}
                  lang={lang}
              />
          </div>
      );
  }

  // Erst laden, wenn Home gesetzt ist
  if (loading || !currentLoc) return <div className="min-h-screen bg-m3-surface flex items-center justify-center"><div className="w-12 h-12 border-4 border-m3-primary border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (error) return <div className="min-h-screen flex items-center justify-center p-8 bg-m3-error-container text-m3-on-error-container font-bold">{error} <button onClick={() => setCurrentLoc(homeLoc)} className="ml-4 underline">Reset</button></div>;

  return (
    <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${bgGradient} font-sans pb-20 overflow-hidden relative`}>
      <style>{styles}</style>
      
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} currentTemp={current.temp} lang={lang} />}
      {showPrecipModal && (
        <PrecipitationDetailsModal 
          isOpen={showPrecipModal}
          onClose={() => setShowPrecipModal(false)}
          hourlyData={processedShort}
          lang={lang}
          formatPrecip={formatPrecip}
          getPrecipUnitLabel={getPrecipUnitLabel}
        />
      )}
      {showSettingsModal && (
          <SettingsModal 
             isOpen={showSettingsModal}
             onClose={() => setShowSettingsModal(false)}
             settings={settings}
             onSave={setSettings}
             onChangeHome={() => setShowHomeSetup(true)} // NEU: Trigger für Setup Modal
          />
      )}
      {showLocationModal && (
          <LocationModal 
            isOpen={showLocationModal} 
            onClose={() => setShowLocationModal(false)}
            savedLocations={locations}
            onSelectLocation={(loc) => { 
              setCurrentLoc(loc); 
              setGpsAvailable(loc.type === 'gps'); // Update GPS availability based on location type
              setShowLocationModal(false); 
            }}
            onAddCurrentLocation={handleAddLocation}
            onDeleteLocation={handleDeleteLocation}
            currentLoc={currentLoc}
            onRenameLocation={handleRenameLocation}
            onRenameHome={handleRenameHome}
            homeLoc={homeLoc}
            lang={lang}
          />
      )}

      <header className="pt-6 px-4 pb-4 z-10 relative">
        {/* Modern Material 3 Top App Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <h1 className={`text-m3-headline-medium font-bold ${isRealNight ? 'text-m3-dark-on-surface' : 'text-m3-on-surface'} mb-1`}>
                {currentLoc.name}
                {currentLoc.type === 'gps' && <span className="text-m3-primary ml-2">📍</span>}
              </h1>
              <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-m3-body-small ${isRealNight ? 'text-m3-dark-on-surface-variant' : 'text-m3-on-surface-variant'}`}>
                <div className="flex items-center gap-1">
                  <Clock size={12} /><span>{t('updated')}: {lastUpdated ? lastUpdated.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'}) : '--:--'} {t('oclock')}{getCacheAgeText()}</span>
                </div>
                {(currentLoc.region || currentLoc.country) && (
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>
                      {currentLoc.region}
                      {currentLoc.region && currentLoc.country ? ', ' : ''}
                      {currentLoc.country}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={fetchData} 
                aria-label={t('refresh') || "Refresh weather data"}
                className={`p-3 rounded-m3-full ${isRealNight ? 'bg-m3-dark-surface-container-high hover:bg-m3-dark-surface-container-highest text-m3-dark-on-surface' : 'bg-m3-surface-container-high hover:bg-m3-surface-container-highest text-m3-on-surface'} transition-all shadow-m3-1 hover:shadow-m3-2`}
              >
                <RefreshCw size={20} />
              </button>
              <button 
                onClick={() => setShowFeedback(true)} 
                aria-label={t('feedback') || "Send feedback"}
                className="p-3 rounded-m3-full bg-m3-secondary-container hover:bg-m3-secondary text-m3-on-secondary-container hover:text-m3-on-secondary transition-all shadow-m3-1 hover:shadow-m3-2"
              >
                <MessageSquarePlus size={20} />
              </button>
              <button 
                onClick={() => setShowSettingsModal(true)} 
                aria-label={t('settings') || "Settings"}
                className="p-3 rounded-m3-full bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary transition-all shadow-m3-2 hover:shadow-m3-3"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Location Chips */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button onClick={handleSetHome} className={`px-4 py-2 rounded-m3-full flex items-center gap-2 text-m3-label-large font-medium transition-all whitespace-nowrap ${currentLoc.id === homeLoc.id ? 'bg-m3-primary-container text-m3-on-primary-container shadow-m3-1' : (isRealNight ? 'bg-m3-dark-surface-container hover:bg-m3-dark-surface-container-high text-m3-dark-on-surface' : 'bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface')}`}>
              <Home size={16} /> {t('home')}
            </button>
            <button onClick={handleSetCurrent} className={`px-4 py-2 rounded-m3-full flex items-center gap-2 text-m3-label-large font-medium transition-all whitespace-nowrap ${currentLoc.type === 'gps' ? 'bg-m3-tertiary-container text-m3-on-tertiary-container shadow-m3-1' : (isRealNight ? 'bg-m3-dark-surface-container hover:bg-m3-dark-surface-container-high text-m3-dark-on-surface' : 'bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface')}`}>
              <Crosshair size={16} /> {t('gps')}
            </button>
            <button onClick={() => setShowLocationModal(true)} className={`px-4 py-2 rounded-m3-full flex items-center gap-2 text-m3-label-large font-medium transition-all whitespace-nowrap ${showLocationModal ? 'bg-m3-secondary-container text-m3-on-secondary-container shadow-m3-1' : (isRealNight ? 'bg-m3-dark-surface-container hover:bg-m3-dark-surface-container-high text-m3-dark-on-surface' : 'bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface')}`}>
              <MapIcon size={16} /> {t('places')}
            </button>
          </div>

          {/* iOS Install Tip */}
          {showIosInstall && (
            <div className="bg-m3-surface-container p-4 rounded-m3-2xl shadow-m3-3 text-m3-on-surface max-w-sm mb-4 relative animate-m3-slide-up">
              <button onClick={() => setShowIosInstall(false)} className="absolute top-2 right-2 text-m3-on-surface-variant hover:text-m3-on-surface"><X size={18}/></button>
              <div className="font-bold text-m3-title-medium mb-2 flex items-center gap-2"><Share size={18} /> {t('installTitle')}</div>
              <p className="text-m3-body-small text-m3-on-surface-variant">{t('installDesc')}</p>
            </div>
          )}

          {/* Install FAB */}
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick} 
              aria-label={t('installTitle') || "Install application"}
              className="fixed bottom-20 right-4 z-50 p-4 rounded-m3-2xl bg-m3-primary text-m3-on-primary shadow-m3-4 hover:shadow-m3-5 transition-all animate-m3-scale-in"
            >
              <Download size={24} />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-4 z-10 relative space-y-4">
        {/* Modern Weather Card with better elevation */}
        <div className={`${isRealNight ? 'bg-m3-dark-surface-container/90' : 'bg-m3-surface-container'} rounded-m3-3xl p-6 shadow-m3-4 relative overflow-hidden min-h-[280px] border border-m3-outline-variant`}>
          {/* Weather background animation */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-100">
            <WeatherLandscape code={current.code} isDay={isRealNight ? 0 : 1} date={locationTime} temp={current.temp} sunrise={sunriseSunset.sunrise} sunset={sunriseSunset.sunset} windSpeed={current.wind} cloudCover={current.cloudCover} precipitation={current.precip} snowfall={current.snow} lang={lang} />
          </div>
          
          <div className="relative z-10">
            {/* Main Temperature Display */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div className="p-4 pr-6">
                  <span className="text-m3-display-large font-light text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">{formatTemp(current.temp)}{getTempUnitSymbol()}</span>
                  <div className="flex items-center gap-2 mt-2 text-m3-body-large text-white/95 drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]">
                    <Thermometer size={20} className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
                    <span>{t('feelsLike')} {formatTemp(current.appTemp)}{getTempUnitSymbol()}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-m3-title-small text-white/90 drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]">
                    <span>H: {formatTemp(processedLong[0]?.max)}{getTempUnitSymbol()}</span>
                    <span>•</span>
                    <span>T: {formatTemp(processedLong[0]?.min)}{getTempUnitSymbol()}</span>
                  </div>
                  <div className="mt-3 text-m3-title-large text-white font-medium drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]">{weatherConf.text}</div>
                  
                  {/* Sunrise and Sunset Times */}
                  <div className="flex items-center gap-4 mt-3 text-m3-body-medium text-white/90 drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]">
                    <div className="flex items-center gap-1.5">
                      <Sunrise size={18} className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
                      <span>{formatTime(sunriseSunset.sunrise)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sunset size={18} className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
                      <span>{formatTime(sunriseSunset.sunset)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Weather Icon */}
                <div className="text-6xl opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                  {React.createElement(weatherConf.icon, { size: 64 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Details Grid - Moved below animation card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`${tileBg} rounded-m3-xl p-3 shadow-m3-1`}>
            <div className={`flex items-center gap-2 ${isRealNight ? 'text-m3-dark-on-surface-variant' : 'text-m3-on-surface-variant'} text-m3-label-small mb-1`}>
              <Sun size={14} /> {t('uv')}
            </div>
            <div className={`text-m3-title-large font-bold ${getUvColorClass(current.uvIndex, isRealNight)}`}>{current.uvIndex}</div>
          </div>
          
          <div className={`${tileBg} rounded-m3-xl p-3 shadow-m3-1`}>
            <div className={`flex items-center gap-2 ${isRealNight ? 'text-m3-dark-on-surface-variant' : 'text-m3-on-surface-variant'} text-m3-label-small mb-1`}>
              <Waves size={14} /> {t('humidity')}
            </div>
            <div className={`text-m3-title-large font-bold ${isRealNight ? 'text-m3-dark-on-surface' : 'text-m3-on-surface'}`}>{current.humidity}%</div>
          </div>
          
          <div className={`${tileBg} rounded-m3-xl p-3 shadow-m3-1`}>
            <div className={`flex items-center gap-2 ${isRealNight ? 'text-m3-dark-on-surface-variant' : 'text-m3-on-surface-variant'} text-m3-label-small mb-1`}>
              <Navigation size={14} style={{ transform: `rotate(${current.dir}deg)` }} /> {t('wind')}
            </div>
            <div className={`text-m3-title-large font-bold ${windColorClass}`}>
              {formatWind(current.wind)} <span className="text-m3-body-small">{getWindUnitLabel()}</span>
            </div>
            {current.gust > current.wind && (
              <div className={`text-xs font-medium ${getWindColorClass(current.gust, isRealNight)} mt-1`}>
                {t('gusts')} {formatWind(current.gust)} {getWindUnitLabel()}
              </div>
            )}
          </div>
          
          <div className={`${tileBg} rounded-m3-xl p-3 shadow-m3-1`}>
            <div className={`flex items-center gap-2 ${isRealNight ? 'text-m3-dark-on-surface-variant' : 'text-m3-on-surface-variant'} text-m3-label-small mb-1`}>
              <Thermometer size={14} /> {t('dewPoint')}
            </div>
            <div className={`text-m3-title-large font-bold ${isRealNight ? 'text-m3-dark-on-surface' : 'text-m3-on-surface'}`}>{formatTemp(current.dewPoint)}{getTempUnitSymbol()}</div>
          </div>
        </div>
        
        {/* Additional Weather Details Grid - Second row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {current.pressure !== null && current.pressure !== undefined && (
            <div className={`${tileBg} rounded-m3-xl p-3 shadow-m3-1`}>
              <div className={`flex items-center gap-2 ${isRealNight ? 'text-m3-dark-on-surface-variant' : 'text-m3-on-surface-variant'} text-m3-label-small mb-1`}>
                <Gauge size={14} /> {t('pressure')}
              </div>
              <div className={`text-m3-title-large font-bold ${isRealNight ? 'text-m3-dark-on-surface' : 'text-m3-on-surface'}`}>
                {Math.round(current.pressure)} <span className="text-m3-body-small">hPa</span>
              </div>
            </div>
          )}
          
          {current.visibility !== null && current.visibility !== undefined && current.visibility > 0 && (
            <div className={`${tileBg} rounded-m3-xl p-3 shadow-m3-1`}>
              <div className={`flex items-center gap-2 ${isRealNight ? 'text-m3-dark-on-surface-variant' : 'text-m3-on-surface-variant'} text-m3-label-small mb-1`}>
                <Eye size={14} /> {t('visibility')}
              </div>
              <div className={`text-m3-title-large font-bold ${isRealNight ? 'text-m3-dark-on-surface' : 'text-m3-on-surface'}`}>
                {settings.units === 'imperial' 
                  ? `${(current.visibility / 1609.34).toFixed(1)} mi` 
                  : `${(current.visibility / 1000).toFixed(1)} km`}
              </div>
            </div>
          )}
          
          {airQualityData && airQualityData.european_aqi !== undefined && (
            <div className={`${tileBg} rounded-m3-xl p-3 shadow-m3-1`}>
              <div className={`flex items-center gap-2 ${isRealNight ? 'text-m3-dark-on-surface-variant' : 'text-m3-on-surface-variant'} text-m3-label-small mb-1`}>
                <Activity size={14} /> {t('airQuality')}
              </div>
              <div className={`text-m3-title-large font-bold ${getAQIColor(airQualityData.european_aqi, isRealNight)}`}>
                {Math.round(airQualityData.european_aqi)}
              </div>
              <div className={`text-xs font-medium ${getAQIColor(airQualityData.european_aqi, isRealNight)} mt-1`}>
                {getAQILabel(airQualityData.european_aqi)}
              </div>
            </div>
          )}
          
          {(next24HoursPrecip.rain > 0 || next24HoursPrecip.snow > 0) && (
            <div 
              onClick={() => setShowPrecipModal(true)}
              className="bg-m3-tertiary-container rounded-m3-xl p-3 border border-m3-tertiary shadow-m3-1 cursor-pointer hover:bg-m3-tertiary-container/80 transition-all active:scale-95"
            >
              <div className="flex items-center gap-2 text-m3-on-tertiary-container text-m3-label-small mb-1">
                {next24HoursPrecip.snow > 0.1 ? <Snowflake size={14}/> : <CloudRain size={14}/>} {t('precip24h')}
              </div>
              <div className="text-m3-title-large font-bold text-m3-on-tertiary-container">
                {formatPrecip(next24HoursPrecip.total)} {getPrecipUnitLabel()}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Tab Navigation */}
        <div className={`${isRealNight ? 'bg-m3-dark-surface-container' : 'bg-m3-surface-container'} rounded-m3-3xl p-2 shadow-m3-2 border border-m3-outline-variant`}>
          <div className="grid grid-cols-5 gap-1">
            {[{id:'overview', label:t('overview'), icon: List}, {id:'longterm', label:t('longterm'), icon: CalendarDays}, {id:'radar', label:t('radar'), icon: MapIcon}, {id:'chart', label:t('compare'), icon: BarChart2}, {id:'travel', label:t('travel'), icon: Plane}].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-m3-2xl text-m3-label-medium font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-m3-primary text-m3-on-primary shadow-m3-2' 
                    : (isRealNight ? 'text-m3-dark-on-surface-variant hover:bg-m3-dark-surface-container-high hover:text-m3-dark-on-surface' : 'text-m3-on-surface-variant hover:bg-m3-surface-container-high hover:text-m3-on-surface')
                }`}
              >
                <tab.icon size={20} className="mb-1" />
                <span className="text-[10px] sm:text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Card with modern elevation */}
        <div className={`${isRealNight ? 'bg-m3-dark-surface-container/90' : 'bg-m3-surface-container'} rounded-m3-3xl p-6 shadow-m3-3 border border-m3-outline-variant min-h-[450px]`}>
          
          {activeTab === 'overview' && (
            <div className="space-y-4">
               <AIReportBox report={dailyReport} dwdWarnings={dwdWarnings} lang={lang} tempFunc={formatTemp} formatWind={formatWind} getWindUnitLabel={getWindUnitLabel} formatPrecip={formatPrecip} getPrecipUnitLabel={getPrecipUnitLabel} getTempUnitSymbol={getTempUnitSymbol} />
               <HourlyTemperatureTiles data={processedShort} lang={lang} formatTemp={formatTemp} getTempUnitSymbol={getTempUnitSymbol} />
               <PrecipitationTile data={processedShort} minutelyData={shortTermData?.minutely_15} lang={lang} formatPrecip={formatPrecip} getPrecipUnitLabel={getPrecipUnitLabel} />
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="h-full flex flex-col">
               {/* AIReportBox removed per user request - detailed details not needed in compare view */}
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-bold uppercase opacity-70">{t('modelCheck')}</h3>
                 <div className="flex bg-black/10 rounded-lg p-1">
                    <button onClick={() => setChartView('hourly')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${chartView==='hourly' ? 'bg-white text-black shadow-sm' : 'opacity-60'}`}>48h</button>
                    <button onClick={() => setChartView('daily')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${chartView==='daily' ? 'bg-white text-black shadow-sm' : 'opacity-60'}`}>6 Tage</button>
                 </div>
               </div>
               <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      {chartView === 'hourly' ? (
                        <LineChart data={processedShort} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                          <XAxis dataKey="displayTime" tick={{fontSize:11, fill:'currentColor', opacity:0.7}} axisLine={false} tickLine={false} interval={4} angle={0} />
                          <YAxis unit="°" tick={{fontSize:12, fill:'currentColor', opacity:0.7}} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', color:'#000'}} formatter={(value) => formatTemp(value)} />
                          <Line type="monotone" dataKey="temp_icon" stroke="#93c5fd" strokeWidth={2} dot={false} name="ICON" />
                          <Line type="monotone" dataKey="temp_gfs" stroke="#d8b4fe" strokeWidth={2} dot={false} name="GFS" />
                          <Line type="monotone" dataKey="temp_arome" stroke="#86efac" strokeWidth={2} dot={false} name="AROME" />
                          {/* KNMI ist besonders wichtig, daher in markantem Orange */}
                          <Line type="monotone" dataKey="temp_knmi" stroke="#fb923c" strokeWidth={2} dot={false} name="KNMI (NL)" />
                          <Line type="monotone" dataKey="temp" stroke="#2563eb" strokeWidth={4} dot={{r:0}} name="Mittel (5)" />
                        </LineChart>
                      ) : (
                        <LineChart data={processedLong.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                          <XAxis dataKey="dateShort" tick={{fontSize:12, fill:'currentColor', opacity:0.7}} axisLine={false} tickLine={false} interval={0} />
                          <YAxis unit="°" tick={{fontSize:12, fill:'currentColor', opacity:0.7}} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', color:'#000'}} formatter={(value) => formatTemp(value)} />
                          <Line type="monotone" dataKey="max_icon" stroke="#93c5fd" strokeWidth={3} dot={{r:3}} name="ICON Max" />
                          <Line type="monotone" dataKey="max_gfs" stroke="#d8b4fe" strokeWidth={3} dot={{r:3}} name="GFS Max" />
                          <Line type="monotone" dataKey="max_gem" stroke="#fca5a5" strokeWidth={3} dot={{r:3}} name="GEM Max" />
                          <Line type="monotone" dataKey="max_arome" stroke="#86efac" strokeWidth={3} dot={{r:3}} name="AROME Max" connectNulls={false} />
                        </LineChart>
                      )}
                  </ResponsiveContainer>
               </div>
               <div className="flex justify-center gap-4 mt-6 text-xs font-medium opacity-80 flex-wrap">
                  {chartView === 'hourly' ? (
                    <>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-300"></div> ICON</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-300"></div> GFS</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-300"></div> AROME</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> KNMI</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Ø</span>
                    </>
                  ) : (
                    <>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-300"></div> ICON</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-300"></div> GFS</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-300"></div> GEM</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-300"></div> AROME</span>
                    </>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'longterm' && (
             <div className="space-y-4">
               <AIReportBox report={longtermReport} dwdWarnings={dwdWarnings} lang={lang} tempFunc={formatTemp} formatWind={formatWind} getWindUnitLabel={getWindUnitLabel} formatPrecip={formatPrecip} getPrecipUnitLabel={getPrecipUnitLabel} getTempUnitSymbol={getTempUnitSymbol} />
               <h3 className="text-sm font-bold uppercase tracking-wide opacity-90 ml-2">{t('longtermList')}</h3>
               <div className="overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide"> 
                  <div className="flex gap-3 w-max">
                    {processedLong.map((day, i) => {
                      const DayIcon = getWeatherConfig(day.code, 1, lang).icon;
                      const confColor = getConfidenceColor(day.reliability);
                      const isDaySnow = SNOW_WEATHER_CODES.includes(day.code);
                      let probColor = "text-slate-400 opacity-50"; 
                      if (day.prob >= 50) probColor = "text-blue-600 font-bold"; else if (day.prob >= 20) probColor = "text-blue-400 font-medium";

                      return (
                        <div key={i} className="flex flex-col items-center bg-m3-surface-container/80 backdrop-blur-sm border border-m3-outline-variant/30 rounded-m3-xl p-3 min-w-[160px] w-[160px] shadow-m3-1 hover:shadow-m3-2 transition-all relative group">
                          {/* Day & Date */}
                          <div className="text-base font-bold mb-0.5 text-m3-on-surface">{day.dayName}</div>
                          <div className="text-xs mb-2 font-medium text-m3-on-surface-variant">{day.dateShort}</div>
                          
                          {/* Icon */}
                          <DayIcon size={48} className="mb-2 text-m3-on-surface" />
                          
                          {/* Temp Range */}
                          <div className="flex items-center gap-2 mb-2 w-full justify-center">
                            <span className="text-2xl font-bold text-blue-400">{formatTemp(day.min)}{getTempUnitSymbol()}</span>
                            <div className="h-1 w-6 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-blue-400 to-red-400 opacity-60" />
                            </div>
                            <span className="text-2xl font-bold text-red-400">{formatTemp(day.max)}{getTempUnitSymbol()}</span>
                         </div>
                          
                           <div className="mb-1 min-h-[16px] flex flex-col items-center justify-center w-full gap-0.5">
                              {parseFloat(day.rain) > 0.1 && parseFloat(day.snow) > 0.1 ? (
                                // Mixed precipitation - show both
                                <>
                                  <span className="text-blue-400 font-bold text-xs flex items-center gap-1"><CloudRain size={10}/> {formatPrecip(day.rain)}{getPrecipUnitLabel()}</span>
                                  <span className="text-cyan-400 font-bold text-xs flex items-center gap-1"><Snowflake size={10}/> {formatPrecip(day.snow)}{getPrecipUnitLabel()}</span>
                                </>
                              ) : isDaySnow ? (
                                parseFloat(day.snow) > 0 || parseFloat(day.rain) > 0.1 ? (
                                  <span className="text-cyan-400 font-bold text-xs flex items-center gap-1"><Snowflake size={12}/> {formatPrecip(parseFloat(day.snow) > 0 ? parseFloat(day.snow) : (parseFloat(day.rain) / 10))}{getPrecipUnitLabel()}</span>
                                ) : ( <span className="opacity-20 text-xs">-</span> )
                              ) : parseFloat(day.rain) > 0.1 ? (
                                <span className="text-blue-400 font-bold text-xs flex items-center gap-1"><Droplets size={12}/> {formatPrecip(day.rain)}{getPrecipUnitLabel()}</span>
                              ) : ( <span className="opacity-20 text-xs">-</span> )}
                           </div>
                           <div className={`text-xs mb-2 ${probColor} h-3`}>{day.prob > 0 ? `${day.prob}% ${t('probability')}` : ''}</div>
                           
                           {/* Wind */}
                           <div className="flex flex-col items-center gap-0.5 mb-2 w-full">
                               <div className="flex items-center justify-center gap-1 w-full">
                                  <Navigation size={12} style={{ transform: `rotate(${day.dir}deg)` }} />
                                  <span className={`text-sm font-bold ${getWindColorClass(day.wind, isRealNight)}`}>{formatWind(day.wind)} {getWindUnitLabel()}</span>
                               </div>
                               <span className={`text-xs font-medium ${getWindColorClass(day.gust, isRealNight)}`}>{t('gusts')} {formatWind(day.gust)} {getWindUnitLabel()}</span>
                           </div>

                           {/* Reliability Indicator */}
                           <div className="mt-1 text-xs flex items-center gap-1 border border-m3-outline-variant/30 bg-m3-surface-container-highest/50 px-2 py-0.5 rounded-full">
                              <ShieldCheck size={10} className={confColor} />
                              <span className={confColor}>{day.reliability}% {t('safe')}</span>
                           </div>
                           
                        </div>
                      );
                    })}
                  </div>
               </div>
             </div>
          )}

          {activeTab === 'radar' && (
            <div className="h-full flex flex-col min-h-[450px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase opacity-70">{t('precipRadar')}</h3>
                  {/* GPS Availability Indicator for Radar */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    gpsAvailable 
                      ? 'bg-green-500/20 text-green-700 border border-green-400/40' 
                      : 'bg-yellow-500/20 text-yellow-700 border border-yellow-400/40'
                  }`}>
                    {gpsAvailable ? `✓ ${t('gpsAvailable')}` : `⚠ ${t('gpsNotAvailable')}`}
                  </div>
                </div>
                {/* 
                  Radar Integration: This tab displays real-time weather radar data from Windy.com,
                  which includes ECMWF model data and actual radar precipitation measurements.
                  This provides users with visual confirmation of current precipitation patterns
                  and helps verify the forecast accuracy. The radar data supplements the numerical
                  weather models (ICON, GFS, AROME, GEM) used for precipitation forecasts throughout the app.
                  
                  Note: The 0.1mm minimum threshold for rain/snow display (implemented in PrecipitationTile)
                  helps filter out trace amounts that may not be meteorologically significant,
                  improving forecast reliability and preventing false rain indicators.
                */}
                <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-inner bg-slate-200 relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://embed.windy.com/embed2.html?lat=${currentLoc.lat}&lon=${currentLoc.lon}&detailLat=${currentLoc.lat}&detailLon=${currentLoc.lon}&width=650&height=450&zoom=8&level=surface&overlay=radar&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`} 
                    frameBorder="0"
                    className="absolute inset-0 w-full h-full"
                    title="Windy Radar"
                  ></iframe>
                </div>
                <div className="text-[10px] text-center opacity-50 mt-2">{t('radarCredit')}</div>
            </div>
          )}

          {activeTab === 'travel' && (
            <div className="space-y-6">
                <div className="bg-white/50 rounded-2xl p-4 border border-white/40">
                   <h3 className="text-sm font-bold uppercase opacity-70 mb-4 flex items-center gap-2"><Plane size={16}/> {t('travelPlanner')}</h3>
                   
                   <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{t('whereTo')}</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-400" size={16}/>
                            <input 
                              type="text" 
                              value={travelQuery}
                              onChange={(e) => setTravelQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleTravelSearch()}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/50 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-bold text-slate-700"
                              placeholder={lang === 'en' ? "City, Island..." : "Stadt, Insel, Ort..."}
                            />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{t('startDate')}</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 text-slate-400" size={16}/>
                              <input 
                                type="date" 
                                value={travelStartDate} 
                                onChange={(e) => setTravelStartDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/50 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-bold text-slate-700"
                              />
                            </div>
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{t('endDate')}</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 text-slate-400" size={16}/>
                              <input 
                                type="date" 
                                value={travelEndDate} 
                                onChange={(e) => setTravelEndDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/50 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-bold text-slate-700"
                              />
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{t('startTime')} <span className="opacity-50 font-normal">(Optional)</span></label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 text-slate-400" size={16}/>
                              <input 
                                type="time" 
                                value={travelStartTime} 
                                onChange={(e) => setTravelStartTime(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/50 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-bold text-slate-700"
                              />
                            </div>
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{t('endTime')} <span className="opacity-50 font-normal">(Optional)</span></label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 text-slate-400" size={16}/>
                              <input 
                                type="time" 
                                value={travelEndTime} 
                                onChange={(e) => setTravelEndTime(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/50 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-bold text-slate-700"
                              />
                            </div>
                         </div>
                      </div>

                      <button 
                         onClick={() => handleTravelSearch()} 
                         disabled={travelLoading}
                         className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-95 flex items-center justify-center gap-2"
                      >
                         {travelLoading ? <RefreshCw className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>}
                         {t('checkWeather')}
                      </button>
                   </div>
                </div>

                {/* Result Area */}
                {travelResult && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <AIReportBox report={tripReport} dwdWarnings={[]} lang={lang} tempFunc={formatTemp} formatWind={formatWind} getWindUnitLabel={getWindUnitLabel} formatPrecip={formatPrecip} getPrecipUnitLabel={getPrecipUnitLabel} getTempUnitSymbol={getTempUnitSymbol} />
                       
                       <button 
                          onClick={handleSaveTrip}
                          className="w-full mt-2 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                       >
                          <Save size={18}/> {t('saveTrip')}
                       </button>
                    </div>
                )}

                {/* Saved Trips */}
                {savedTrips.length > 0 && (
                   <div>
                     <h3 className="text-sm font-bold uppercase opacity-70 mb-3 ml-2 mt-6">{t('myTrips')}</h3>
                     <div className="space-y-2">
                        {savedTrips.map(trip => (
                           <div key={trip.id} className="bg-white/40 border border-white/40 p-3 rounded-xl flex items-center justify-between">
                              <button onClick={() => loadTrip(trip)} className="text-left flex-1">
                                 <div className="font-bold text-slate-800">{trip.name}</div>
                                 <div className="text-xs text-slate-500">{formatDateShort(new Date(trip.startDate), lang)} - {formatDateShort(new Date(trip.endDate || trip.startDate), lang)}</div>
                              </button>
                              <div className="flex items-center gap-3">
                                 <TripWeatherPreview trip={trip} />
                                 <button onClick={() => handleDeleteTrip(trip.id)} className="p-2 text-slate-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                              </div>
                           </div>
                        ))}
                     </div>
                   </div>
                )}
            </div>
          )}

          {activeTab !== 'radar' && activeTab !== 'travel' && (
            <div className="mt-8 text-xs text-center opacity-60 px-6 font-medium space-y-2">
               <p className="flex items-center justify-center gap-2 mb-2"><Database size={14} /> {t('source')}</p>
               <div className="flex flex-wrap justify-center gap-4">
                 <span className="bg-blue-500/10 px-2 py-1 rounded text-blue-500 border border-blue-500/20">ICON-D2: {modelRuns.icon || '--:--'}</span>
                 <span className="bg-purple-500/10 px-2 py-1 rounded text-purple-500 border border-purple-500/20">GFS: {modelRuns.gfs || '--:--'}</span>
                 <span className="bg-green-500/10 px-2 py-1 rounded text-green-500 border border-green-500/20">AROME: {modelRuns.arome || '--:--'}</span>
               </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, RefreshCw, Info, CalendarDays, TrendingUp, Droplets, Navigation, Wind, Sun, Cloud, CloudRain, Snowflake, CloudLightning, Clock, Crosshair, Home, Download, Moon, Star, Umbrella, ShieldCheck, AlertTriangle, BarChart2, List, Database, Map as MapIcon, Sparkles, Thermometer, Waves, ChevronDown, ChevronUp, Save, CloudFog, Siren, X, ExternalLink, User, Share, Palette, Zap, ArrowRight, Gauge, Timer, MessageSquarePlus, CheckCircle2, CloudDrizzle, CloudSnow, CloudHail, ArrowLeft, Trash2, Plus, Plane, Calendar, Search, Edit2, Check, Settings, Globe, Languages, Sunrise, Sunset } from 'lucide-react';

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
    units: "Einheit",
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
    humidity: "Feuchte",
    dewPoint: "Taupkt.",
    uv: "UV",
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
    currentLocation: "Aktueller Standort",
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
    radarCredit: "Radarbild bereitgestellt von Windy.com", // ÄNDERUNG: Updated Credit
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
    sunday: "Sonntag"
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
    humidity: "Humidity",
    dewPoint: "Dew Pt.",
    uv: "UV",
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
    currentLocation: "Current Location",
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
    radarCredit: "Radar image provided by Windy.com", // ÄNDERUNG: Updated Credit
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
    sunday: "Sunday"
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
        return saved ? JSON.parse(saved) : { language: 'de', unit: 'celsius', theme: 'auto' };
    } catch (e) { return { language: 'de', unit: 'celsius', theme: 'auto' }; }
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
`;

// --- 2. HILFSFUNKTIONEN ---

const formatDateShort = (date, lang = 'de') => {
  if (!date) return "";
  const locale = lang === 'en' ? 'en-US' : 'de-DE';
  try { return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(date); } catch (e) { return ""; }
};

const getWindColorClass = (speed) => {
  if (speed >= 60) return "text-red-600 font-extrabold";
  if (speed >= 40) return "text-orange-500 font-bold";
  if (speed >= 20) return "text-blue-500 font-bold";
  return "text-slate-600 font-medium";
};

const getUvColorClass = (uv) => {
  if (uv >= 11) return "text-purple-600";
  if (uv >= 8) return "text-red-600";
  if (uv >= 6) return "text-orange-500";
  if (uv >= 3) return "text-yellow-600";
  return "text-green-600";
};

const getUvBadgeClass = (uv) => {
  if (uv >= 11) return "bg-purple-100 text-purple-800 border-purple-300";
  if (uv >= 8) return "bg-red-100 text-red-800 border-red-300";
  if (uv >= 6) return "bg-orange-100 text-orange-800 border-orange-300";
  if (uv >= 3) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  return "bg-green-100 text-green-800 border-green-300";
};

const getConfidenceColor = (percent) => {
  if (percent >= 80) return "text-green-600";
  if (percent >= 50) return "text-yellow-600";
  return "text-red-600";
};

const getDwdColorClass = (severity) => {
  const sev = severity ? severity.toLowerCase() : 'minor';
  if (sev === 'extreme') return "bg-purple-100 border-purple-600 text-purple-900";
  if (sev === 'severe') return "bg-red-100 border-red-600 text-red-900";
  if (sev === 'moderate') return "bg-orange-100 border-orange-500 text-orange-900";
  return "bg-yellow-100 border-yellow-500 text-yellow-900";
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
const generateAIReport = (type, data, lang = 'de') => {
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
             : `Erwarten Sie maximal ${Math.round(daySummary.maxTemp)}° und mindestens ${Math.round(daySummary.minTemp)}°.`;
          
          let condText = "";
          const precip = daySummary.totalPrecip || 0;
          if (precip < 0.2) condText = lang === 'en' ? "It will likely stay dry." : "Es bleibt voraussichtlich trocken. Gute Bedingungen!";
          else if (precip > 5) condText = lang === 'en' ? `Expect rain (${precip.toFixed(1)}mm). Bring an umbrella!` : `Planen Sie Regen ein (${precip.toFixed(1)}mm). Schirm nicht vergessen!`;
          else condText = lang === 'en' ? "Scattered showers possible." : "Vereinzelte Schauer sind möglich.";

          if (daySummary.maxWind > 45) warning = lang === 'en' ? "Windy" : "Windig";
          if (daySummary.maxWind > 65) warning = lang === 'en' ? "Stormy" : "Stürmisch";

          summary = `📅 ${lang === 'en' ? 'Trip on' : 'Ausflug am'} ${dateStr}:\n${tempText} ${condText}`;
          details = lang === 'en' 
             ? `Rain probability approx. ${daySummary.avgProb || 0}%. Wind gusts up to ${Math.round(daySummary.maxWind)} km/h.`
             : `Für Ihren Ausflug nach ${location.name} berechnen die Modelle eine Regenwahrscheinlichkeit von ca. ${daySummary.avgProb || 0}%. Der Wind weht mit Spitzen bis zu ${Math.round(daySummary.maxWind)} km/h.`;
          
          if (daySummary.isTimeWindow) {
              details += lang === 'en' ? `\n\nForecast precision for time window (${daySummary.startH}-${daySummary.endH}h).` : `\n\nFür den gewählten Zeitraum (${daySummary.startH}-${daySummary.endH} Uhr) wurde die Vorhersage präzisiert.`;
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
          summary = `🧳 ${lang === 'en' ? 'Trip' : 'Urlaub'} (${startStr} - ${endStr}):\n${availText}\n${lang === 'en' ? 'Avg' : 'Im Schnitt'} ${avgMax}°. `;
          
          if (rainDays === 0) summary += lang === 'en' ? "Looks like a dry period." : "Es sieht nach einer trockenen Periode aus.";
          else if (rainDays >= daysCount/2) summary += lang === 'en' ? "Unsettled weather expected." : "Eher unbeständiges Wetter erwartet.";
          else summary += lang === 'en' ? "Mix of sun and clouds." : "Ein Mix aus Sonne und Wolken.";

          let detailList = items.map(d => `- ${d.date.toLocaleDateString(locale,{weekday:'short'})}: ${Math.round(d.max)}°, ${d.precipSum > 0.5 ? d.precipSum.toFixed(1)+'mm' : (lang === 'en' ? 'Dry' : 'Trocken')}`).join('\n');
          details = `${lang === 'en' ? 'Weather trend for' : 'Wettertrend für'} ${location.name}:\n${detailList}\n\n${lang === 'en' ? 'Total precip approx.' : 'Gesamtniederschlag ca.'} ${totalRain.toFixed(1)}mm.`;
      }
  }

  if (type === 'daily') {
    title = t.dailyReport;
    const now = new Date();
    const currentHour = now.getHours();
    
    const current = data[0];
    let intro = `${t.now} (${current.displayTime} ${t.oclock}): ${Math.round(current.temp)}°`;
    if (Math.abs(current.appTemp - current.temp) > 2) intro += `, ${t.feelsLike} ${Math.round(current.appTemp)}°.`;
    
    let parts = [intro];
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
        let todayText = `📅 ${t.today}: `;
        const maxToday = Math.max(...todayData.map(d => d.temp));
        const rainSumToday = todayData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        const maxWind = Math.max(...todayData.map(d => d.gust));
        
        if (currentHour < 11) {
            todayText += lang === 'en' 
                ? `Temps rising up to ${Math.round(maxToday)}°. `
                : `Die Temperaturen klettern bis auf ${Math.round(maxToday)}°. `;
            
            if (rainSumToday < 0.2) todayText += lang === 'en' ? "Mostly dry day expected. " : "Ein weitgehend trockener Tag erwartet Sie. ";
            else todayText += lang === 'en' ? `Expect approx. ${rainSumToday.toFixed(1)}mm of rain. ` : `Insgesamt werden ca. ${rainSumToday.toFixed(1)}mm Niederschlag erwartet. `;
            
            if (maxWind > 45) todayText += lang === 'en' ? ` Wind gusts up to ${Math.round(maxWind)} km/h.` : ` Der Wind frischt auf mit Böen bis ${Math.round(maxWind)} km/h.`;
        } else if (currentHour < 17) {
            todayText = `📅 ${t.restOfDay}: `;
            if (rainSumToday > 0.5) todayText += lang === 'en' ? `Unsettled with rain (${rainSumToday.toFixed(1)}mm). ` : `Es bleibt unbeständig mit weiteren Regenfällen (${rainSumToday.toFixed(1)}mm). `;
            else todayText += lang === 'en' ? "Afternoon mostly dry and calm. " : "Der Nachmittag verläuft meist trocken und ruhig. ";
             todayText += lang === 'en' ? `Values up to ${Math.round(maxToday)}°.` : `Werte bis ${Math.round(maxToday)}°.`;
        } else {
            todayText = `📅 ${t.evening}: `;
            if (rainSumToday > 0.1) todayText += lang === 'en' ? "Some drizzle possible. " : "Es kann noch etwas tröpfeln. ";
            else todayText += lang === 'en' ? "Calm evening ahead. " : "Der Tag klingt ruhig aus. ";
        }
        parts.push(todayText);
    }
    if (nightData.length > 0) {
        const minNight = Math.min(...nightData.map(d => d.temp));
        let nightText = `🌙 ${t.night} `;
        if (minNight < 1) nightText += lang === 'en' ? `it gets frosty (${Math.round(minNight)}°). Watch for ice!` : `wird es frostig (${Math.round(minNight)}°). Achtung Glättegefahr!`;
        else if (minNight < 4) nightText += lang === 'en' ? `cooling to fresh ${Math.round(minNight)}° (ground frost possible).` : `kühlt es auf frische ${Math.round(minNight)}° ab (Bodenfrost möglich).`;
        else nightText += lang === 'en' ? `lows around ${Math.round(minNight)}°.` : `sinken die Werte auf ${Math.round(minNight)}°.`;
        parts.push(nightText);
    }
    if (tomorrowDayData.length > 0) {
        const tMax = Math.max(...tomorrowDayData.map(d => d.temp));
        const tMin = Math.min(...tomorrowDayData.map(d => d.temp)); 
        const tRain = tomorrowDayData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        const tGust = Math.max(...tomorrowDayData.map(d => d.gust));
        
        let tomorrowText = `🌅 ${t.outlook} ${t.tomorrow} (${tomorrowDate.toLocaleDateString(locale, {weekday:'long'})}):\n`;
        tomorrowText += lang === 'en'
            ? `Expect temperatures between ${Math.round(tMin)}° in the morning and ${Math.round(tMax)}° in the afternoon. `
            : `Erwarten Sie Temperaturen zwischen ${Math.round(tMin)}° am Morgen und bis zu ${Math.round(tMax)}° am Nachmittag. `;
        
        if (tRain > 2.0) tomorrowText += lang === 'en' ? `Rainy day (${tRain.toFixed(1)}mm), bring an umbrella.` : `Ein regnerischer Tag (${tRain.toFixed(1)}mm), vergessen Sie den Schirm nicht.`;
        else if (tRain > 0.1) tomorrowText += lang === 'en' ? "Isolated showers possible, mostly dry." : "Vereinzelt sind kurze Schauer möglich, meist bleibt es aber trocken.";
        else tomorrowText += lang === 'en' ? "It will be a nice, sunny day." : "Es wird ein schöner, sonniger Tag.";
        
        if (tGust > 50) { 
            tomorrowText += lang === 'en' ? ` Windy with gusts up to ${tGust} km/h.` : ` Es wird windig mit Böen bis ${tGust} km/h.`; 
            warning = lang === 'en' ? "WINDY (Tomorrow)" : "WINDIG (Morgen)"; 
        }
        parts.push(tomorrowText);
    }
    summary = parts.join("\n\n");
    confidence = 90; 
    const maxGustNow = Math.max(...(todayData.map(d=>d.gust)||[]), 0);
    if (maxGustNow > 60) warning = lang === 'en' ? "GALE GUSTS (Today)" : "STURMBÖEN (Heute)";
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
        const twRain = thisWeek.reduce((a,b)=>a+parseFloat(b.rain),0);
        const twRainDays = thisWeek.filter(d=>parseFloat(d.rain)>1.0).length;
        const twSunDays = thisWeek.filter(d=>d.code<=2).length;
        
        let twText = `📅 ${t.restOfWeek}:\n`;
        // Handle edge case if "tomorrow" is Sunday or Monday already
        if (thisWeek.length === 1 && thisWeek[0].date.getDay() === 0) twText = `📅 ${t.tomorrow} (${t.sunday}):\n`;

        twText += lang === 'en' 
            ? `Temperatures between ${Math.round(twMin)}° and ${Math.round(twMax)}°. `
            : `Temperaturen zwischen ${Math.round(twMin)}° und ${Math.round(twMax)}°. `;
        
        if (twRain > 2) {
             twText += lang === 'en' ? `Unsettled with approx. ${twRain.toFixed(1)}mm rain` : `Es wird eher unbeständig mit ca. ${twRain.toFixed(1)}mm Niederschlag`;
             if (twRainDays > 0) twText += lang === 'en' ? ` on ${twRainDays} days.` : ` an ${twRainDays} Tagen.`;
             else twText += ".";
        } else {
             if (twSunDays >= thisWeek.length / 2) twText += lang === 'en' ? "Mostly friendly and dry." : "Vorwiegend freundlich und trocken.";
             else twText += lang === 'en' ? "Cloudy but mostly dry." : "Meist bewölkt, aber weitgehend trocken.";
        }
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
        const nwRainDays = nextWeek.filter(d=>parseFloat(d.rain)>1.0).length;
        const nwRel = Math.round(nextWeek.reduce((a,b)=>a+b.reliability,0) / nextWeek.length);
        
        // Trend-Ermittlung (Anfang vs Ende der Woche)
        const startTemp = nextWeek[0].max;
        const endTemp = nextWeek[nextWeek.length-1].max;
        let trendTextDe = "die Temperaturen bleiben stabil";
        let trendTextEn = "temperatures remain stable";
        
        if (endTemp > startTemp + 2) {
            trendTextDe = "zum Wochenende hin wird es wärmer";
            trendTextEn = "getting warmer towards the weekend";
        } else if (endTemp < startTemp - 2) {
            trendTextDe = "im Wochenverlauf kühlt es ab";
            trendTextEn = "cooling down throughout the week";
        }

        let nwText = `🔮 ${t.nextWeek} (${t.ab} ${t.monday}, ${nextWeek[0].date.toLocaleDateString(locale, {day:'2-digit', month:'2-digit'})}.):\n`;
        
        // Temperatur Text
        nwText += lang === 'en' 
            ? `Expect daily highs averaging ${nwAvgMax}° (${trendTextEn}). `
            : `Im Schnitt liegen die Höchstwerte bei ${nwAvgMax}° (${trendTextDe}). `;
        
        // Niederschlags Text
        if (nwRain > 10 || nwRainDays >= 4) {
             nwText += lang === 'en' 
                ? `Unsettled weather expected with rain on approx. ${nwRainDays} days (Total: ${nwRain.toFixed(0)}mm).`
                : `Es deutet sich eine unbeständige Phase an: Rechnen Sie an ca. ${nwRainDays} Tagen mit Regen (Gesamt: ${nwRain.toFixed(0)}mm).`;
        } else if (nwRain > 1) {
             nwText += lang === 'en'
                ? `Mix of sun and clouds, mostly dry (only ${nwRainDays} rain days).`
                : `Ein Mix aus Sonne und Wolken, meist bleibt es trocken (nur ${nwRainDays} Regentage).`;
        } else {
             nwText += lang === 'en'
                ? `High pressure influence likely: Mostly sunny and dry.`
                : `Hochdruckeinfluss ist wahrscheinlich: Überwiegend freundlich und trocken.`;
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
     details = null;
  }

  if (type === 'model-daily') {
    title = lang === 'en' ? "Model Compare (Longterm)" : "Modell-Vergleich (Langzeit)";
    const slicedData = data.slice(0, 6); 
    const diff = slicedData.reduce((acc, d) => acc + (d.max_gfs - d.max_icon), 0);
    if (Math.abs(diff) < 5) summary = lang === 'en' ? "Longterm models are mostly synchronized." : "Die Langzeitmodelle sind weitgehend synchron.";
    else if (diff > 0) summary = lang === 'en' ? "GFS (US) predicts warmer than ICON (EU)." : "GFS (US) rechnet wärmer als ICON (EU).";
    else summary = lang === 'en' ? "ICON (EU) sees the week warmer than GFS." : "ICON (EU) sieht die Woche wärmer als GFS.";
    details = null;
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
             <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                 <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                     <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                         <Settings size={24} className="text-blue-600"/> {t.settings}
                     </h2>
                     <button onClick={onClose}><X className="text-slate-400"/></button>
                 </div>

                 {/* CHANGE HOME LOCATION (NEU) */}
                 <div className="mb-6">
                     <label className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <MapIcon size={16}/> {t.homeLoc}
                     </label>
                     <button 
                         onClick={() => { onClose(); onChangeHome(); }}
                         className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition duration-m3-medium ease-m3-standard flex items-center justify-center gap-2"
                     >
                         <Edit2 size={16}/> {t.changeHome}
                     </button>
                 </div>

                 {/* LANGUAGE */}
                 <div className="mb-6">
                     <label className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Globe size={16}/> {t.language}
                     </label>
                     <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'de'})}
                             className={`flex-1 py-2 rounded-lg text-sm font-bold transition duration-m3-short ease-m3-standard ${localSettings.language === 'de' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                         >
                             Deutsch
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, language: 'en'})}
                             className={`flex-1 py-2 rounded-lg text-sm font-bold transition duration-m3-short ease-m3-standard ${localSettings.language === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                         >
                             English
                         </button>
                     </div>
                 </div>

                 {/* THEME (NEU) */}
                 <div className="mb-6">
                     <label className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Palette size={16}/> {t.theme}
                     </label>
                     <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
                         <button 
                             onClick={() => setLocalSettings({...localSettings, theme: 'auto'})}
                             className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition duration-m3-short ease-m3-standard ${localSettings.theme === 'auto' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                         >
                             {t.themeAuto}
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, theme: 'light'})}
                             className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition duration-m3-short ease-m3-standard ${localSettings.theme === 'light' ? 'bg-white shadow-sm text-amber-500' : 'text-slate-500 hover:text-slate-700'}`}
                         >
                             {t.themeLight}
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, theme: 'dark'})}
                             className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition duration-m3-short ease-m3-standard ${localSettings.theme === 'dark' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                         >
                             {t.themeDark}
                         </button>
                     </div>
                 </div>

                 {/* UNITS */}
                 <div className="mb-8">
                     <label className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Thermometer size={16}/> {t.units}
                     </label>
                     <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
                         <button 
                             onClick={() => setLocalSettings({...localSettings, unit: 'celsius'})}
                             className={`flex-1 py-2 rounded-lg text-sm font-bold transition duration-m3-short ease-m3-standard ${localSettings.unit === 'celsius' ? 'bg-white shadow-sm text-red-500' : 'text-slate-500 hover:text-slate-700'}`}
                         >
                             °C (Celsius)
                         </button>
                         <button 
                             onClick={() => setLocalSettings({...localSettings, unit: 'fahrenheit'})}
                             className={`flex-1 py-2 rounded-lg text-sm font-bold transition duration-m3-short ease-m3-standard ${localSettings.unit === 'fahrenheit' ? 'bg-white shadow-sm text-red-500' : 'text-slate-500 hover:text-slate-700'}`}
                         >
                             °F (Fahrenheit)
                         </button>
                     </div>
                 </div>

                 <button 
                    onClick={() => { onSave(localSettings); onClose(); }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-medium shadow-level2 shadow-blue-500/30 transition duration-m3-short ease-m3-standard active:scale-95"
                 >
                     {t.save}
                 </button>
             </div>
        </div>
    );
};

const WeatherLandscape = ({ code, isDay, date, temp, sunrise, sunset, windSpeed, lang='de' }) => {
  // Move helper to top of component to use it for initial variables
  const getDecimalHour = (dateInput) => {
    if (!dateInput) return 0;
    // Wenn es ein ISO-String ist, parsen
    const d = typeof dateInput === 'string' ? parseLocalTime(dateInput) : new Date(dateInput);
    // ÄNDERUNG: Sekunden hinzufügen für smoothere Bewegung
    return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  };
    
  const d = date ? new Date(date) : new Date();
  const currentHour = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  
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
  
  // --- WETTERZUSTÄNDE ---
  const isClear = code === 0 || code === 1;
  const isPartlyCloudy = code === 2;
  const isOvercast = code === 3 || code === 45 || code === 48; 
  // Nieselregen: Codes 51, 53, 55
  const isDrizzle = [51, 53, 55].includes(code);
  const isLightRain = [61, 80].includes(code);
  const isHeavyRain = [63, 65, 81, 82].includes(code) || (code >= 95);
  const isRain = isLightRain || isHeavyRain;
  const isLightSnow = [71, 77, 85].includes(code);
  const isHeavySnow = [73, 75, 86].includes(code);
  const isSnow = isLightSnow || isHeavySnow;
  const isSleet = [56, 57, 66, 67].includes(code);
  const isStorm = [95, 96, 99].includes(code);
  const isFog = [45, 48].includes(code);
  const isExtremeHeat = temp >= 30;
  const isDeepFreeze = temp <= -5;
  const isFreezing = temp <= 0;
  const isWindy = windSpeed >= 30;
  const isStormyWind = windSpeed >= 60;

  
  let celestialX = -50;
  let celestialY = 200; 
  let celestialType = 'none';
  let isDawn = false;
  let isDusk = false;

  // ÄNDERUNG: <= sunsetHour für die exakte Minute
  if (currentHour >= sunriseHour && currentHour <= sunsetHour) {
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
  const treeLeaf = (isSnow || isDeepFreeze) ? "#f8fafc" : (isNight ? "#15803d" : "#16a34a"); // Nachts satteres Grün für Kontrast
  
  const houseWall = isNight ? "#78350f" : "#b45309"; 
  const houseRoof = (isSnow || isDeepFreeze) ? "#f1f5f9" : (isNight ? "#451a03" : "#7c2d12");
  const windowColor = isNight ? "#fbbf24" : "#94a3b8";
  const windowStroke = isNight ? "#b45309" : "#475569";

  let treeAnim = "anim-tree-gentle";
  if (isStormyWind) treeAnim = "anim-tree-storm";
  else if (isWindy) treeAnim = "anim-tree-windy";

  const rainRotation = isStormyWind ? "rotate(20deg)" : "rotate(0deg)";

  return (
    <svg viewBox="0 0 360 160" className="w-full h-full overflow-hidden" preserveAspectRatio="xMidYMax slice">
      <defs>
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
      
      {isNight && isClear && (
         <g>
            <circle cx="50" cy="30" r="1" fill="white" className="animate-twinkle-1" style={{animationDelay: '0s'}} />
            <circle cx="300" cy="40" r="1.5" fill="white" className="animate-twinkle-2" style={{animationDelay: '1s'}} />
            <circle cx="200" cy="20" r="1" fill="white" className="animate-twinkle-3" style={{animationDelay: '2s'}} />
            <circle cx="100" cy="50" r="1" fill="white" className="animate-twinkle-2" style={{animationDelay: '1.5s'}} />
            <circle cx="350" cy="25" r="1" fill="white" className="animate-twinkle-1" style={{animationDelay: '0.5s'}} />
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
      <g transform="translate(190, 120)">
          <rect x="25" y="-10" width="6" height="15" fill="#57534e" />
          <rect x="5" y="10" width="40" height="30" fill={houseWall} />
          <path d="M-2 10 L25 -15 L52 10 Z" fill={houseRoof} filter={isSnow ? "brightness(1.1)" : "none"} />
          <rect x="12" y="18" width="10" height="10" fill={windowColor} stroke={windowStroke} strokeWidth="1"/>
          <line x1="17" y1="18" x2="17" y2="28" stroke={windowStroke} strokeWidth="1" />
          <line x1="12" y1="23" x2="22" y2="23" stroke={windowStroke} strokeWidth="1" />
          <rect x="30" y="22" width="10" height="18" fill="#3f2e22" />
          {isNight && <circle cx="17" cy="23" r="8" fill="#fbbf24" opacity="0.6" filter="blur(4px)" />}
      </g>

      {/* --- BÄUME --- */}
      
      {/* Baum Links - Rand */}
      <g transform="translate(40, 120)">
        <g className={treeAnim}>
            <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
            <path d="M10 0 L20 15 H0 Z" fill={treeLeaf} />
            <path d="M10 -10 L18 5 H2 Z" fill={treeLeaf} />
        </g>
      </g>

      {/* Baum Links - Neben Haus */}
      <g transform="translate(155, 120) scale(0.9)">
        <g className={treeAnim} style={{animationDelay: '0.2s'}}>
            <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
            <path d="M10 0 L20 15 H0 Z" fill={treeLeaf} />
            <path d="M10 -10 L18 5 H2 Z" fill={treeLeaf} />
        </g>
      </g>
      
      {/* Baumgruppe Rechts */}
      <g transform="translate(280, 135) scale(0.9)">
        <g className={treeAnim} style={{animationDelay: '0.5s'}}>
            <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
            <path d="M10 0 L20 15 H0 Z" fill={treeLeaf} />
            <path d="M10 -10 L18 5 H2 Z" fill={treeLeaf} />
        </g>
      </g>
      
      {/* Baum Rechts - Rand */}
      <g transform="translate(320, 134) scale(0.8)">
        <g className={treeAnim} style={{animationDelay: '0.7s'}}>
            <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
            <path d="M10 0 L20 15 H0 Z" fill={treeLeaf} />
            <path d="M10 -10 L18 5 H2 Z" fill={treeLeaf} />
        </g>
      </g>

      {(isPartlyCloudy) && (
        <g className="anim-clouds">
           <path d="M240 40 Q 255 25 270 40 T 300 40 T 320 50 H 240 Z" fill="white" fillOpacity="0.8" transform="translate(20,10)" />
           <path d="M140 30 Q 155 15 170 30 T 200 30 T 220 40 H 140 Z" fill="white" fillOpacity="0.6" transform="translate(-10,5)" />
        </g>
      )}

      {(isOvercast || isRain || isSnow || isStorm || isSleet || isDrizzle) && (
        <g className="anim-clouds">
           <path d="M40 50 Q 55 35 70 50 T 100 50 T 120 60 H 40 Z" fill={isStorm ? "#475569" : "white"} fillOpacity={isOvercast ? 0.9 : 0.7} transform="translate(0,0)" />
           <path d="M240 40 Q 255 25 270 40 T 300 40 T 320 50 H 240 Z" fill={isStorm ? "#334155" : "white"} fillOpacity={isOvercast ? 0.9 : 0.7} transform="translate(20,10)" />
           <path d="M140 30 Q 155 15 170 30 T 200 30 T 220 40 H 140 Z" fill={isStorm ? "#475569" : "white"} fillOpacity={isOvercast ? 0.9 : 0.7} transform="translate(-10,5)" />
           
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
            {[...Array(isHeavyRain ? 60 : 30)].map((_, i) => (
               <rect key={i} x={Math.random() * 400 - 20} y="40" width={isHeavyRain ? 2 : 1.5} height={isHeavyRain ? 15 : 12} 
                     className={isHeavyRain ? "animate-rain-storm" : `animate-rain-${i%3 === 0 ? '1' : i%3 === 1 ? '2' : '3'}`} 
                     style={{animationDelay: `${Math.random()}s`}} />
            ))}
         </g>
      )}

      {(isSnow || isSleet) && (
         <g fill="white" opacity="0.9" transform={rainRotation}>
            {[...Array(isHeavySnow ? 80 : 40)].map((_, i) => {
               const startX = Math.random() * 400 - 20;
               const delay = Math.random() * 5;
               const size = Math.random() * 2 + 1;
               const isSlow = i % 2 === 0;
               return (
                  <circle 
                    key={i} 
                    cx={startX} 
                    cy="-10" 
                    r={size} 
                    className={isHeavySnow || isStormyWind ? "animate-snow-fast" : "animate-snow-slow"} 
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

    </svg>
  );
};

// --- NEU: PRECIPITATION TILE (Wann, Wie lang, Wie viel) ---
const PrecipitationTile = ({ data, minutelyData, lang='de' }) => {
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
    const isRainingNow = (current.precip > 0.0 || current.snow > 0.0) && current.code >= 50 || (current.precipProb && current.precipProb > 30);
    
    let result = { 
       type: 'none', // none, rain_now, rain_later, snow_now, snow_later
       startTime: null,
       endTime: null,
       amount: 0,
       duration: 0,
       isSnow: false,
       maxIntensity: 0,
       minutelyStart: null
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
            // Check next 2 hours (8 * 15min slots)
            for(let i=startIndex; i < Math.min(startIndex + 8, mTime.length); i++) {
                if (mPrecip[i] > 0.0) {
                     result.minutelyStart = new Date(mTime[i]);
                     break; 
                }
            }
        }
    }

    let foundStart = false;
    
    // Loop um Start und Ende zu finden (Hourly Data)
    for (let i = 0; i < futureData.length; i++) {
       const d = futureData[i];
       const hasPrecip = (d.precip > 0.0 || d.snow > 0.0) && d.code >= 50 || (d.precipProb !== undefined && d.precipProb > 50);
       
       if (hasPrecip) {
           if (!foundStart) {
               foundStart = true;
               result.startTime = result.minutelyStart || d.time; // Use minutely if available
               result.isSnow = d.snow > 0.0 && d.temp < 2; // Typerkennung beim Start
           }
           const hourlyAmount = d.precip > 0 ? d.precip : d.snow;
           result.amount += hourlyAmount; 
           result.maxIntensity = Math.max(result.maxIntensity, hourlyAmount);
           result.duration++;
       } else {
           if (foundStart) {
               // Regen hat aufgehört
               result.endTime = d.time; 
               break; 
           }
       }
    }
    
    if (!foundStart && isRainingNow) {
        // Es regnet jetzt, hört aber in <1h auf
        const hourlyAmount = current.precip || current.snow;
        result.type = (current.snow > 0 && current.temp < 2) ? 'snow_now' : 'rain_now';
        result.duration = 1; 
        result.amount = hourlyAmount;
        result.maxIntensity = hourlyAmount;
        result.startTime = current.time;
    } else if (foundStart) {
        // Determine type based on startTime closeness
        const startDiff = result.startTime - now;
        const isNow = startDiff <= 0; // Or very close
        
        if (isNow) {
            result.type = result.isSnow ? 'snow_now' : 'rain_now';
        } else {
            result.type = result.isSnow ? 'snow_later' : 'rain_later';
        }
    }
    
    return result;
  }, [data, minutelyData]);

  if (!analysis) return null;

  const { type, startTime, duration, amount, isSnow, maxIntensity, minutelyStart } = analysis;
  const isRain = type.includes('rain');
  const isNow = type.includes('now');
  
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
  const locale = lang === 'en' ? 'en-US' : 'de-DE';

  if (type === 'none') {
      headline = lang === 'en' ? "Currently no rain expected" : "Aktuell kein Regen zu erwarten";
  } else if (isNow) {
      headline = t.rainNow;
      timeDisplay = t.now;
  } else if (minutelyStart) {
      // Precise start time
      const diffMins = Math.round((minutelyStart - now) / 60000);
      if (diffMins <= 0) {
           headline = lang === 'en' ? "Rain starting now" : "Regen beginnt jetzt";
           timeDisplay = t.now;
      } else {
           headline = lang === 'en' ? `Rain in ${diffMins} min` : `Regen in ${diffMins} min`;
           timeDisplay = minutelyStart.toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'});
      }
  } else if (isSoon) {
      headline = t.rainSoon;
      timeDisplay = startTime ? startTime.toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'}) : "Gleich";
  } else {
      headline = t.nextRain;
      timeDisplay = startTime ? (isTomorrow ? (dayPrefix + " ") : "") + startTime.toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'}) : '--:--';
  }

  // If type is 'none', we just show the "No rain" box
  if (type === 'none') {
      return (
        <div className="bg-emerald-50/80 border border-emerald-100 rounded-3xl p-4 flex items-center justify-between shadow-level2 mb-4">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600"><Sun size={28} /></div>
                <div>
                    <div className="font-bold text-slate-700 text-lg">{headline}</div>
                    <div className="text-base text-slate-500 font-medium">{t.noRainExp}</div>
                </div>
            </div>
        </div>
      );
  }

  const Icon = isSnow ? Snowflake : CloudRain;
  const colorClass = isSnow ? "text-cyan-600 bg-cyan-100 border-cyan-200" : "text-blue-600 bg-blue-100 border-blue-200";
  const bgClass = isSnow ? "bg-cyan-50/80" : "bg-blue-50/80";

  // Intensitäts-Logik
  const getIntensityInfo = (rate) => {
      // Basic translation mapping for intensity
      if (rate < 0.5) return { label: lang === 'en' ? 'Light' : 'Leicht', percent: 25, color: isSnow ? 'bg-cyan-300' : 'bg-blue-300' };
      if (rate < 1.0) return { label: lang === 'en' ? 'Moderate' : 'Mäßig', percent: 50, color: isSnow ? 'bg-cyan-400' : 'bg-blue-400' };
      if (rate < 4.0) return { label: lang === 'en' ? 'Heavy' : 'Stark', percent: 75, color: isSnow ? 'bg-cyan-500' : 'bg-blue-600' };
      return { label: lang === 'en' ? 'Very Heavy' : 'Sehr Stark', percent: 100, color: isSnow ? 'bg-cyan-700' : 'bg-blue-800' };
  };

  const intensity = getIntensityInfo(maxIntensity);

  return (
    <div className={`${bgClass} border ${isSnow ? 'border-cyan-100' : 'border-blue-100'} rounded-3xl p-4 shadow-level2 mb-4 relative overflow-hidden`}>
        <div className="flex justify-between items-center z-10 relative">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${colorClass} bg-opacity-30`}>
                    <Icon size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <div className="font-bold text-slate-700 text-lg uppercase tracking-wide opacity-80 mb-0.5">
                        {headline}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Time Display Logic */}
                        {!isNow && isLaterThan2h && !minutelyStart && <span className="text-base font-bold text-slate-600">{t.ab}</span>}
                        <span className="text-4xl font-black text-slate-800 tracking-tight leading-none">
                            {timeDisplay}
                        </span>
                        {!isNow && !isSoon && !minutelyStart && <span className="text-sm font-bold text-slate-500 uppercase">{t.oclock}</span>}
                        
                        {/* Ping Animation if Raining Now or very soon */}
                        {(isNow || (minutelyStart && (minutelyStart - now) < 300000)) && (
                            <span className="flex h-4 w-4 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                            </span>
                        )}
                    </div>
                    <div className="text-sm font-bold uppercase text-slate-500 tracking-wide mt-1">
                        {isSnow ? t.snow : t.rain} • {intensity.label}
                    </div>
                </div>
            </div>

            <div className="text-right">
                <div className="text-xl font-bold text-slate-700 leading-tight">{amount.toFixed(1)}<span className="text-sm text-slate-500 font-normal ml-0.5">mm</span></div>
                <div className="text-lg font-medium text-slate-500 leading-tight">{duration} <span className="text-sm">Std</span></div>
            </div>
        </div>

        <div className="mt-4 h-3 w-full bg-white/40 rounded-full overflow-hidden relative">
            <div 
                className={`h-full ${intensity.color} rounded-full transition-all duration-m3-medium ease-m3-standard`} 
                style={{ width: `${intensity.percent}%` }}
            ></div>
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
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition duration-m3-short ease-m3-standard"><X size={20} className="text-slate-400" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {/* Temperatur Slider */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-4">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Temperatur</label>
                            <div className="text-display-large font-black text-slate-800">{displayTemp}°</div>
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
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-m3-short ease-m3-standard ${selectedCondition === c.id ? `ring-2 ring-offset-1 ring-blue-500 ${c.color}` : 'border-slate-100 hover:bg-slate-50'}`}
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
                        className="w-full py-4 rounded-medium font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition duration-m3-short ease-m3-standard disabled:opacity-50 disabled:cursor-not-allowed shadow-level2 shadow-blue-500/20"
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
    <div className={`rounded-xl border-l-4 shadow-sm relative overflow-hidden transition-all duration-m3-medium ease-m3-standard ${colorClass} mb-3`}>
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

const AIReportBox = ({ report, dwdWarnings, lang='de', tempFunc }) => {
  const [expanded, setExpanded] = useState(false);
  if (!report) return null;
  const { title, summary, details, warning: localWarning, confidence, structuredDetails } = report;
  
  const hasDwd = dwdWarnings && dwdWarnings.length > 0;
  const t = TRANSLATIONS[lang] || TRANSLATIONS['de'];
  
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
      <div className="mb-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden transition-all duration-m3-medium ease-m3-standard">
        
        {/* HEADER BEREICH */}
        <div className="p-4 relative z-10">
            {/* DWD Warnings */}
            {hasDwd && (
              <div className="mb-3">
                <button onClick={() => setExpanded(!expanded)} className={`w-full p-3 rounded-lg border-l-4 shadow-sm flex items-center justify-between gap-3 text-left transition duration-m3-short ease-m3-standard hover:brightness-95 ${bannerClass}`}>
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
                    className="mt-3 text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors duration-m3-short ease-m3-standard"
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
                                           <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/60 hover:bg-white/80 transition duration-m3-short ease-m3-standard border border-white/40 shadow-sm text-sm">
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
                                                    <span className="font-bold text-slate-800 text-base">{tempFunc(item.max)}°</span>
                                                    <span className="text-slate-400 text-xs font-medium">/ {tempFunc(item.min)}°</span>
                                               </div>

                                               {/* Rain/Wind */}
                                               <div className="text-right min-w-[80px] flex flex-col items-end gap-0.5">
                                                   {item.rain > 0.1 ? (
                                                       <div className="flex items-center justify-end gap-1 text-blue-600 font-bold text-xs bg-blue-50 px-1.5 py-0.5 rounded-md w-max">
                                                           <Droplets size={10}/> {item.rain.toFixed(1)}mm
                                                       </div>
                                                   ) : <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5">{t.noRain}</span>}
                                                   
                                                   {item.wind > 20 && (
                                                       <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${getWindColorClass(item.wind)}`}>
                                                           <Wind size={10}/> {item.wind} km/h
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
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition duration-m3-short ease-m3-standard"><X size={20} className="text-slate-400" /></button>
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
                                className="absolute right-2 top-2 p-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-m3-short ease-m3-standard"
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
                                        className="w-full text-left p-3 hover:bg-blue-50 border-b border-slate-50 last:border-0 flex justify-between items-center transition duration-m3-short ease-m3-standard group"
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

    const handleUseGPS = () => {
        if (!navigator.geolocation) return alert("Kein GPS verfügbar");
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
             const lat = pos.coords.latitude;
             const lon = pos.coords.longitude;
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
            } finally {
                setGpsLoading(false);
            }
        }, () => {
            alert("Standortzugriff verweigert.");
            setGpsLoading(false);
        });
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


// --- 4. MAIN APP COMPONENT ---

export default function WeatherApp() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState(() => getSavedLocations());
  const [homeLoc, setHomeLoc] = useState(() => getSavedHomeLocation());
  // Startet als null, bis Home gesetzt ist
  const [currentLoc, setCurrentLoc] = useState(homeLoc); 
  const [showHomeSetup, setShowHomeSetup] = useState(false);
  const [settings, setSettings] = useState(() => getSavedSettings()); // NEU

  const [shortTermData, setShortTermData] = useState(null);
  const [longTermData, setLongTermData] = useState(null);
  const [dwdWarnings, setDwdWarnings] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartView, setChartView] = useState('hourly');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [radarTimestamp, setRadarTimestamp] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAllHours, setShowAllHours] = useState(false); 
  const [sunriseSunset, setSunriseSunset] = useState({ sunrise: null, sunset: null });
  const [modelRuns, setModelRuns] = useState({ icon: '', gfs: '', arome: '' });
  const [showIosInstall, setShowIosInstall] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // NEU
  const [viewMode, setViewMode] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('home');

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

  // Set active main tab based on current location
  useEffect(() => {
    if (currentLoc) {
      if (currentLoc.id === homeLoc?.id) {
        setActiveMainTab('home');
      } else if (currentLoc.type === 'gps') {
        setActiveMainTab('gps');
      } else {
        setActiveMainTab('places');
      }
    }
  }, [currentLoc, homeLoc]);

  // --- Helpers for Display ---
  const t = (key) => TRANSLATIONS[settings.language]?.[key] || TRANSLATIONS['de'][key] || key;
  const lang = settings.language;
  
  const formatTemp = useCallback((val) => {
      if (val === null || val === undefined) return "--";
      if (settings.unit === 'fahrenheit') {
          return Math.round(val * 9/5 + 32);
      }
      return Math.round(val);
  }, [settings.unit]);

  const formatTime = (dateStr) => {
      if (!dateStr) return "--:--";
      const d = new Date(dateStr);
      return d.toLocaleTimeString(lang === 'en' ? 'en-US' : 'de-DE', {hour: '2-digit', minute:'2-digit'});
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
    // Wenn kein Home Location existiert (erster Start), zeige Setup
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

        if (!navigator.geolocation) {
             setCurrentLoc(homeLoc);
             return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                
                // Check distance to Home
                const dist = getDistanceFromLatLonInKm(lat, lon, homeLoc.lat, homeLoc.lon);
                if (dist < 2.0) { // If closer than 2km to home
                    setCurrentLoc(homeLoc);
                } else {
                    // Fetch City Name
                    try {
                        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=de&format=json`);
                        const data = await res.json();
                        const city = data.results?.[0]?.name || t('myLocation');
                        setCurrentLoc({ name: city, lat, lon, type: 'gps' });
                    } catch (e) {
                        setCurrentLoc({ name: t('currentrrentLocation'), lat, lon, type: 'gps' });
                    }
                }
            },
            (err) => {
                console.warn("GPS Access denied or failed", err);
                setCurrentLoc(homeLoc); // Fallback to Home
            }
        );
    };

    initLocation();
  }, [homeLoc]); // Re-run init if homeLoc changes (e.g. after setup)

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

  const handleSetHome = () => setCurrentLoc(homeLoc);
  
  const handleSetCurrent = () => {
    setLoading(true);
    setError(null); // Reset Error vor neuem Versuch
    console.log("Starte GPS-Suche..."); 
    
    if (!navigator.geolocation) { 
        setError("GPS wird von diesem Browser/Gerät nicht unterstützt."); 
        setLoading(false); 
        return; 
    }
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          
          console.log(`GPS Position erfolgreich: ${lat}, ${lon} (Genauigkeit: ${pos.coords.accuracy}m)`);

          // 1. Prüfen: Sind wir zu Hause? (Distanz < 2km)
          if (homeLoc) {
              const dist = getDistanceFromLatLonInKm(lat, lon, homeLoc.lat, homeLoc.lon);
              if (dist < 2.0) { 
                  setCurrentLoc(homeLoc);
                  if (currentLoc && currentLoc.id === homeLoc.id) fetchData();
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
      },
      (err) => { 
          console.error("GPS Fehler:", err);
          let msg = "Standort konnte nicht ermittelt werden.";
          
          // Detaillierte Fehleranalyse für den User
          switch(err.code) {
              case err.PERMISSION_DENIED:
                  msg = "Standortzugriff verweigert. Bitte erlauben Sie den Zugriff in den Browser- oder App-Einstellungen.";
                  break;
              case err.POSITION_UNAVAILABLE:
                  msg = "Standortinformationen sind zurzeit nicht verfügbar (kein GPS-Signal).";
                  break;
              case err.TIMEOUT:
                  msg = "Zeitüberschreitung bei der Standortsuche. Bitte versuchen Sie es erneut.";
                  break;
              default:
                  msg = `Unbekannter GPS Fehler: ${err.message}`;
          }
          
          setError(msg); 
          setLoading(false); 
      },
      { timeout: 15000, enableHighAccuracy: true } // Timeout auf 15s erhöht
    );
  };
  
  const fetchData = async () => {
    if (!currentLoc) return; // Nicht fetchen wenn kein Ort da ist

    setLoading(true);
    setError(null);
    setDwdWarnings([]);
    try {
      const { lat, lon } = currentLoc;
      
      const modelsShort = "icon_seamless,gfs_seamless,gem_seamless";
      const urlShort = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,snowfall,weathercode,windspeed_10m,winddirection_10m,windgusts_10m,is_day,apparent_temperature,relative_humidity_2m,dewpoint_2m,uv_index,precipitation_probability&models=${modelsShort}&minutely_15=precipitation&timezone=auto&forecast_days=2`;
      
      const modelsLong = "icon_seamless,gfs_seamless,arome_seamless,gem_seamless"; 
      const urlLong = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,precipitation_probability_max,sunrise,sunset&models=${modelsLong}&timezone=auto&forecast_days=14`;
      const urlDwd = `https://api.brightsky.dev/alerts?lat=${lat}&lon=${lon}`;

      const [resShort, resLong, resDwd] = await Promise.all([fetch(urlShort), fetch(urlLong), fetch(urlDwd).catch(() => ({ ok: false }))]);
      
      if (!resShort.ok) {
          const errText = await resShort.text();
          throw new Error(`Fehler (Short): ${errText}`);
      }
      if (!resLong.ok) {
          const errText = await resLong.text();
          throw new Error(`Fehler (Long): ${errText}`);
      }
      
      setShortTermData(await resShort.json());
      const longData = await resLong.json();
      setLongTermData(longData);
      
      if (resDwd.ok) {
         const dwdJson = await resDwd.json();
         setDwdWarnings(dwdJson.alerts || []);
      }

      setLastUpdated(new Date());
      setModelRuns({ icon: getModelRunTime(3, 2.5), gfs: getModelRunTime(6, 4), arome: getModelRunTime(3, 2) });
      if (longData.daily?.sunrise?.[0]) setSunriseSunset({ sunrise: longData.daily.sunrise[0], sunset: longData.daily.sunset[0] });

    } catch (err) { 
        console.error("API Error:", err);
        setError(err.message); 
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [currentLoc]);

  // Fetch latest radar timestamp from Bright Sky
  useEffect(() => {
    const fetchRadarTimestamp = async () => {
      try {
        const res = await fetch('https://api.brightsky.dev/radar/sources');
        const data = await res.json();
        if (data.sources && data.sources.length > 0) {
          setRadarTimestamp(data.sources[data.sources.length - 1]); // Latest
        }
      } catch (err) {
        console.error('Failed to fetch radar timestamp:', err);
      }
    };
    fetchRadarTimestamp();
  }, []);

  // Fix Leaflet default marker icon
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

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

      if (loading) return <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse"></div>;
      if (!weather) return <div className="text-[10px] text-slate-400">--</div>;

      const Icon = getWeatherConfig(weather.code, 1, lang).icon;
      return (
          <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-lg">
              <Icon size={16} className="text-blue-600"/>
              <span className="font-bold text-slate-700 text-xs">{formatTemp(weather.max)}°</span>
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
        snow: getMax('snowfall'),
        wind: Math.round(getAvg('windspeed_10m')),
        gust: Math.round(getMax('windgusts_10m')), // Böen immer Max Warnung
        dir: h.winddirection_10m_icon_seamless?.[i] || 0,
        code: h.weathercode_icon_seamless?.[i] || h.weathercode?.[i] || 0,
        isDay: isDayArray?.[i] ?? (t.getHours() >= 6 && t.getHours() <= 21 ? 1 : 0),
        appTemp: getVal('apparent_temperature'),
        humidity: getVal('relative_humidity_2m'),
        dewPoint: getVal('dewpoint_2m'),
        uvIndex: getVal('uv_index'),
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
  const liveCurrent = processedShort.length > 0 ? processedShort[0] : { temp: 0, snow: "0.0", precip: "0.0", wind: 0, gust: 0, dir: 0, code: 0, isDay: 1, appTemp: 0, humidity: 0, dewPoint: 0, uvIndex: 0 };
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
          return dateObj.getHours() + dateObj.getMinutes() / 60;
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
  const isSnowing = parseFloat(current.snow) > 0;
  
  // Konfiguration basierend auf echtem Status
  const weatherConf = getWeatherConfig(current.code || 0, isRealNight ? 0 : 1, lang);
  const bgGradient = isRealNight ? 'from-slate-900 to-slate-800' : 'from-blue-500 to-sky-400';
  const textColor = 'text-white';
  const cardBg = isRealNight ? 'bg-slate-800/60 border-slate-700/50 text-white' : 'bg-white/80 border-white/40 text-slate-900';
  const windColorClass = getWindColorClass(current.wind || 0);

  const dailyReport = useMemo(() => generateAIReport('daily', processedShort, lang), [processedShort, lang]);
  const modelReport = useMemo(() => generateAIReport(chartView === 'hourly' ? 'model-hourly' : 'model-daily', chartView === 'hourly' ? processedShort : processedLong, lang), [chartView, processedShort, processedLong, lang]);
  const longtermReport = useMemo(() => generateAIReport('longterm', processedLong, lang), [processedLong, lang]);

  const displayedHours = processedShort.slice(0, 24);

  // --- WIDGET VIEWS ---
  if (viewMode === 'animation') {
    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">{t('loading')}</div>;
    return (
      <div className={`h-screen w-screen overflow-hidden relative bg-gradient-to-br ${bgGradient}`}>
        <style>{styles}</style>
        <div className="absolute top-12 left-4 z-50">
            <a href="/" className="bg-black/20 p-2 rounded-full text-white backdrop-blur-md block"><ArrowLeft size={24}/></a>
        </div>
        <div className="h-full w-full">
            {/* WICHTIG: hier locationTime übergeben! */}
            <WeatherLandscape code={current.code} isDay={isRealNight ? 0 : 1} date={locationTime} temp={current.temp} sunrise={sunriseSunset.sunrise} sunset={sunriseSunset.sunset} windSpeed={current.wind} lang={lang} />
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center text-white drop-shadow-md pointer-events-none">
            <div className="text-6xl font-bold">{formatTemp(current.temp)}°</div>
            <div className="text-xl opacity-90 mb-2">{weatherConf.text}</div>
            
            {/* NEU: Sonnenaufgang und Untergang */}
            <div className="flex justify-center gap-6 text-sm font-medium opacity-80">
                <div className="flex items-center gap-1"><Sunrise size={16}/> {formatTime(sunriseSunset.sunrise)}</div>
                <div className="flex items-center gap-1"><Sunset size={16}/> {formatTime(sunriseSunset.sunset)}</div>
            </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'report') {
     if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50">{t('loading')}</div>;
     return (
        <div className="min-h-screen bg-slate-100 px-4 pb-4 pt-14">
            <div className="mb-4">
                <a href="/" className="bg-white p-2 rounded-full text-slate-700 shadow-sm inline-block"><ArrowLeft size={24}/></a>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">{t('dailyReport')}</h2>
            <AIReportBox report={dailyReport} dwdWarnings={dwdWarnings} lang={lang} tempFunc={formatTemp} />
            <div className="mt-8">
                 <h2 className="text-2xl font-bold mb-4 text-slate-800">{t('trend')}</h2>
                 <AIReportBox report={longtermReport} dwdWarnings={[]} lang={lang} tempFunc={formatTemp} />
            </div>
        </div>
     );
  }

  if (viewMode === 'precip') {
    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50">{t('loading')}</div>;
    return (
       <div className="min-h-screen bg-slate-100 p-4 flex flex-col justify-center">
           <div className="absolute top-12 left-4">
               <a href="/" className="bg-white p-2 rounded-full text-slate-700 shadow-sm inline-block"><ArrowLeft size={24}/></a>
           </div>
           <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">{t('precipRadar')}</h2>
           <PrecipitationTile data={processedShort} lang={lang} />
       </div>
    );
 }

  // --- STANDARD APP ---

  // SHOW SETUP MODAL FIRST
  if (showHomeSetup && !homeLoc) {
      return (
          <div className="min-h-screen bg-slate-900 font-sans">
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
  if (loading || !currentLoc) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (error) return <div className="min-h-screen flex items-center justify-center p-8 bg-red-50 text-red-900 font-bold">{error} <button onClick={() => setCurrentLoc(homeLoc)} className="ml-4 underline">Reset</button></div>;

  // SHOW SETUP MODAL FIRST OR ON CHANGE
  if (showHomeSetup || !homeLoc) {
      return (
          <div className="min-h-screen bg-slate-900 font-sans relative">
              {/* Cancel Button nur wenn homeLoc bereits existiert (also nicht beim allerersten Start) */}
              {homeLoc && (
                  <button 
                    onClick={() => setShowHomeSetup(false)}
                    className="absolute top-6 right-6 text-white/50 hover:text-white z-[110]"
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

  return (
    <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${bgGradient} font-sans pb-20 overflow-hidden relative`}>
      <style>{styles}</style>
      
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} currentTemp={current.temp} lang={lang} />}
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
            onSelectLocation={(loc) => { setCurrentLoc(loc); setShowLocationModal(false); }}
            onAddCurrentLocation={handleAddLocation}
            onDeleteLocation={handleDeleteLocation}
            currentLoc={currentLoc}
            onRenameLocation={handleRenameLocation}
            onRenameHome={handleRenameHome}
            homeLoc={homeLoc}
            lang={lang}
          />
      )}

      <header className="pt-14 px-5 flex justify-between items-start z-10 relative">
        <div className={textColor}>
          <div className="flex gap-2 mb-2">
             <button onClick={handleSetHome} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${activeMainTab === 'home' ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><Home size={14} /> {t('home')}</button>
             <button onClick={handleSetCurrent} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${activeMainTab === 'gps' ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><Crosshair size={14} /> {t('gps')}</button>
             <button onClick={() => setShowLocationModal(true)} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${activeMainTab === 'places' ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><MapIcon size={14} /> {t('places')}</button>
          </div>
          <h1 className="text-headline-large font-light mt-2 tracking-tight">{currentLoc.name}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 opacity-80 text-xs font-medium">
              <div className="flex items-center gap-1">
                <Clock size={12} /><span>{t('updated')}: {lastUpdated ? lastUpdated.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'}) : '--:--'} {t('oclock')}</span>
              </div>
              
              {/* NEU: Region & Land statt Koordinaten (falls vorhanden) */}
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
        <div className="flex flex-col gap-2 items-end">
           {deferredPrompt && (<button onClick={handleInstallClick} className="p-3 rounded-full backdrop-blur-md bg-blue-600 text-white animate-pulse shadow-lg"><Download size={20} /></button>)}
           
           {/* iOS Install Tip */}
           {showIosInstall && (
             <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl text-black max-w-[200px] text-xs relative animate-in fade-in slide-in-from-top-4 duration-500">
                <button onClick={() => setShowIosInstall(false)} className="absolute top-1 right-1 opacity-50"><X size={14}/></button>
                <div className="font-bold mb-1 flex items-center gap-1"><Share size={12} /> {t('installTitle')}</div>
                <p>{t('installDesc')}</p>
                <div className="w-3 h-3 bg-white/90 absolute -bottom-1.5 left-1/2 -translate-x-1/2 rotate-45"></div>
             </div>
           )}

           <div className="flex gap-2">
               {/* SETTINGS BUTTON */}
               <button onClick={() => setShowSettingsModal(true)} className={`p-3 rounded-full backdrop-blur-md transition shadow-md ${textColor} bg-white/20 hover:bg-white/30`}>
                   <Settings size={20} />
               </button>

               {/* FEEDBACK BUTTON */}
               <button onClick={() => setShowFeedback(true)} className={`p-3 rounded-full backdrop-blur-md transition shadow-md ${textColor} bg-white/20 hover:bg-white/30`}>
                   <MessageSquarePlus size={20} />
               </button>

               <button onClick={fetchData} className={`p-3 rounded-full backdrop-blur-md bg-white/20 transition shadow-md ${textColor}`}><RefreshCw size={20} /></button>
           </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 z-10 relative space-y-6">
        <div className={`rounded-3xl p-6 ${cardBg} shadow-lg relative overflow-hidden min-h-[240px] flex items-center`}>
          {/* WICHTIG: locationTime auch hier übergeben */}
          <div className="absolute inset-0 z-0 pointer-events-none"><WeatherLandscape code={current.code} isDay={isRealNight ? 0 : 1} date={locationTime} temp={current.temp} sunrise={sunriseSunset.sunrise} sunset={sunriseSunset.sunset} windSpeed={current.wind} lang={lang} /></div>
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex flex-col">
               <span className="text-7xl font-bold tracking-tighter leading-none drop-shadow-lg text-white">{formatTemp(current.temp)}°</span>
               <div className="flex items-center gap-1.5 mt-2 opacity-90 font-medium text-sm text-white drop-shadow-md"><Thermometer size={16} /><span>{t('feelsLike')} {formatTemp(current.appTemp)}°</span></div>
               <div className="flex items-center gap-2 mt-1 opacity-80 font-medium text-sm text-white drop-shadow-md"><span>H: {formatTemp(processedLong[0]?.max)}°</span><span>T: {formatTemp(processedLong[0]?.min)}°</span></div>
               <div className="mt-1 text-lg font-medium tracking-wide text-white drop-shadow-md">{weatherConf.text}</div>
            </div>
            <div className="flex flex-col gap-2 items-end text-right pl-3 border-l border-white/20 ml-2 backdrop-blur-sm bg-black/5 rounded-xl p-2">
               <div className="flex flex-col items-end"><div className={`flex items-center gap-1 opacity-90 text-sm font-bold ${getUvColorClass(current.uvIndex)} drop-shadow-sm`}><Sun size={14} /> <span>{current.uvIndex}</span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">{t('uv')}</span></div>
               <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end"><div className="flex items-center gap-1 opacity-90 text-sm font-bold text-white drop-shadow-sm"><Waves size={14} /> <span>{current.humidity}%</span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">{t('humidity')}</span></div>
                  <div className="flex flex-col items-end"><div className="flex items-center gap-1 opacity-90 text-sm font-bold text-white drop-shadow-sm"><Thermometer size={14} /> <span>{formatTemp(current.dewPoint)}°</span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">{t('dewPoint')}</span></div>
               </div>
               <div className="flex flex-col items-end mt-1"><div className={`flex items-center gap-1.5 text-sm font-bold ${windColorClass} drop-shadow-sm`}><Navigation size={14} style={{ transform: `rotate(${current.dir}deg)` }}/><span>{current.wind} <span className="text-xs font-normal opacity-80">({current.gust})</span></span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">{t('wind')} ({t('gusts')}) km/h</span></div>
               {(parseFloat(dailyRainSum) > 0 || parseFloat(dailySnowSum) > 0) && (<div className="flex flex-col items-end mt-1"><div className="flex items-center gap-1.5 opacity-90 text-sm font-bold text-blue-300 drop-shadow-sm">{isSnowing ? <Snowflake size={14}/> : <CloudRain size={14}/>}<span>{isSnowing ? dailySnowSum : dailyRainSum} {isSnowing ? 'cm' : 'mm'}</span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">{t('precip')} (24h)</span></div>)}
            </div>
          </div>
        </div>

        <div className={`p-1.5 rounded-full backdrop-blur-md flex shadow-md border border-white/20 ${cardBg}`}>
           {[{id:'overview', label:t('overview'), icon: List}, {id:'longterm', label:t('longterm'), icon: CalendarDays}, {id:'radar', label:t('radar'), icon: MapIcon}, {id:'chart', label:t('compare'), icon: BarChart2}, {id:'travel', label:t('travel'), icon: Plane}].map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white/90 text-slate-900 shadow-md' : 'hover:bg-white/10 opacity-70'}`}><tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span></button>
           ))}
        </div>

        <div className={`backdrop-blur-md rounded-[32px] p-5 shadow-2xl ${cardBg} min-h-[450px]`}>
          
          {activeTab === 'overview' && (
            <div className="space-y-4">
               <AIReportBox report={dailyReport} dwdWarnings={dwdWarnings} lang={lang} tempFunc={formatTemp} />
               <PrecipitationTile data={processedShort} minutelyData={shortTermData?.minutely_15} lang={lang} />
               <h3 className="text-sm font-bold uppercase tracking-wide opacity-70 ml-2">Stündlicher Verlauf (24h)</h3>
               <div className="overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide"> 
                  <div className="flex gap-3 w-max">
                    {displayedHours.map((row, i) => {
                      const conf = getWeatherConfig(row.code, row.isDay, lang);
                      const HourIcon = conf.icon;
                      return (
                        <div key={i} className="flex flex-col items-center bg-white/5 border border-white/10 rounded-3xl p-3 min-w-[130px] w-[130px] hover:bg-white/10 transition relative group">
                          <div className="text-lg font-bold opacity-90 mb-2">{row.displayTime}</div>
                          <HourIcon size={40} className="opacity-90 mb-2" />
                          <div className="text-4xl font-bold mb-1 tracking-tighter">{formatTemp(row.temp)}°</div>
                          <div className="text-sm opacity-60 text-center leading-tight h-8 flex items-center justify-center line-clamp-2 w-full mb-2">{conf.text}</div>
                           <div className="mb-2 h-4">
                             {parseFloat(row.snow) > 0 && row.temp < 2 && row.code >= 50 ? (
                               <span className="text-cyan-400 font-bold text-xs flex items-center gap-1"><Snowflake size={10}/> {row.snow.toFixed(1)}</span>
                             ) : parseFloat(row.precip) > 0 && row.code >= 50 ? (
                               <span className="text-blue-400 font-bold text-xs flex items-center gap-1"><Droplets size={10}/> {row.precip.toFixed(1)}</span>
                             ) : ( <span className="opacity-20 text-xs">-</span> )}
                           </div>
                           <div className="flex flex-col items-center gap-0.5 mb-2">
                              <div className="flex items-center gap-1 opacity-80">
                                 <Navigation size={10} style={{ transform: `rotate(${row.dir}deg)` }} />
                                 <span className={`text-xs font-bold ${getWindColorClass(row.wind)}`}>{row.wind}</span>
                              </div>
                              <span className={`text-[9px] opacity-60 ${getWindColorClass(row.gust)}`}>{t('gusts')} {row.gust}</span>
                           </div>
                           {row.uvIndex >= 1 && (<div className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getUvBadgeClass(row.uvIndex)}`}>UV {(row.uvIndex).toFixed(0)}</div>)}
                           <div className="mt-2 text-[10px] flex items-center gap-1 opacity-70">
                              <ShieldCheck size={10} className={getConfidenceColor(row.reliability)} />
                              <span className={`${getConfidenceColor(row.reliability)} font-medium`}>{row.reliability}% {t('safe')}</span>
                           </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="h-full flex flex-col">
               <AIReportBox report={modelReport} dwdWarnings={dwdWarnings} lang={lang} tempFunc={formatTemp} />
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
                          <XAxis dataKey="displayTime" tick={{fontSize:12, fill:'currentColor', opacity:0.7}} axisLine={false} tickLine={false} interval={3} />
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
               <AIReportBox report={longtermReport} dwdWarnings={dwdWarnings} lang={lang} tempFunc={formatTemp} />
               <h3 className="text-sm font-bold uppercase tracking-wide opacity-70 ml-2">{t('longtermList')}</h3>
               <div className="overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide"> 
                  <div className="flex gap-3 w-max">
                    {processedLong.map((day, i) => {
                      const DayIcon = getWeatherConfig(day.code, 1, lang).icon;
                      const confColor = getConfidenceColor(day.reliability);
                      const isDaySnow = parseFloat(day.snow) > 0;
                      let probColor = "text-slate-400 opacity-50"; 
                      if (day.prob >= 50) probColor = "text-blue-600 font-bold"; else if (day.prob >= 20) probColor = "text-blue-400 font-medium";

                      return (
                        <div key={i} className="flex flex-col items-center bg-white/5 border border-white/10 rounded-3xl p-3 min-w-[160px] w-[160px] hover:bg-white/10 transition relative group">
                          {/* Day & Date */}
                          <div className="text-base font-bold opacity-90 mb-0.5">{day.dayName}</div>
                          <div className="text-xs opacity-60 mb-2">{day.dateShort}</div>
                          
                          {/* Icon */}
                          <DayIcon size={48} className="opacity-90 mb-2" />
                          
                          {/* Temp Range */}
                          <div className="flex items-center gap-2 mb-2 w-full justify-center">
                            <span className="text-2xl font-bold text-blue-400">{formatTemp(day.min)}°</span>
                            <div className="h-1 w-6 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-blue-400 to-red-400 opacity-60" />
                            </div>
                            <span className="text-2xl font-bold text-red-400">{formatTemp(day.max)}°</span>
                         </div>
                          
                          {/* Precip */}
                           <div className="mb-1 h-4 flex items-center justify-center w-full">
                             {isDaySnow ? <span className="text-cyan-400 font-bold text-xs flex items-center gap-1"><Snowflake size={12}/> {day.snow}cm</span> : parseFloat(day.rain) > 0.1 ? <span className="text-blue-400 font-bold text-xs flex items-center gap-1"><Droplets size={12}/> {day.rain}mm</span> : <span className="opacity-20 text-xs">-</span>}
                           </div>
                           <div className={`text-[10px] mb-2 ${probColor} h-3`}>{day.prob > 0 ? `${day.prob}% ${t('probability')}` : ''}</div>
                           
                           {/* Wind */}
                           <div className="flex flex-col items-center gap-0.5 mb-2 w-full">
                              <div className="flex items-center justify-center gap-1 opacity-80 w-full">
                                 <Navigation size={12} style={{ transform: `rotate(${day.dir}deg)` }} />
                                 <span className={`text-sm font-bold ${getWindColorClass(day.wind)}`}>{day.wind}</span>
                              </div>
                              <span className={`text-[9px] opacity-60 ${getWindColorClass(day.gust)}`}>{t('gusts')} {day.gust}</span>
                           </div>

                           {/* Reliability Indicator */}
                           <div className="mt-1 text-[10px] flex items-center gap-1 opacity-70 border border-white/10 px-2 py-0.5 rounded-full">
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
                <h3 className="text-sm font-bold uppercase opacity-70 mb-4">{t('precipRadar')}</h3>
                <div className="flex-1 w-full rounded-3xl overflow-hidden shadow-inner bg-slate-200 relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://embed.windy.com/embed2.html?lat=${currentLoc.lat}&lon=${currentLoc.lon}&detailLat=${currentLoc.lat}&detailLon=${currentLoc.lon}&width=650&height=450&zoom=8&level=surface&overlay=rain&product=ecmwf&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`} 
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
                <div className="bg-white/50 rounded-3xl p-4 border border-white/40">
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
                       <AIReportBox report={tripReport} dwdWarnings={[]} lang={lang} tempFunc={formatTemp} />
                       
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

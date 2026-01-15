import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, RefreshCw, Info, CalendarDays, TrendingUp, Droplets, Navigation, Wind, Sun, Cloud, CloudRain, Snowflake, CloudLightning, Clock, Crosshair, Home, Download, Moon, Star, Umbrella, ShieldCheck, AlertTriangle, BarChart2, List, Database, Map as MapIcon, Sparkles, Thermometer, Waves, ChevronDown, ChevronUp, Save, CloudFog, Siren, X, ExternalLink, User, Share, Palette, Zap, ArrowRight, Gauge, Timer, MessageSquarePlus, CheckCircle2, CloudDrizzle, CloudSnow, CloudHail, ArrowLeft, Trash2, Plus, Star as StarIcon } from 'lucide-react';

// --- 1. KONSTANTEN & CONFIG ---

const DEFAULT_LOC = { name: "Jülich Daubenrath", lat: 50.938, lon: 6.388, id: 'home_default', type: 'home' };

// Hilfsfunktion: Entfernung in km
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // Radius der Erde in km
  var dLat = deg2rad(lat2-lat1);  
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; 
  return d;
}

const deg2rad = (deg) => {
  return deg * (Math.PI/180)
}

const getSavedLocations = () => {
    try {
        const saved = localStorage.getItem('weather_locations');
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
};

const getHomeLocation = () => {
    try {
        const saved = localStorage.getItem('weather_home_loc');
        return saved ? JSON.parse(saved) : DEFAULT_LOC;
    } catch (e) { return DEFAULT_LOC; }
};

// Hilfsfunktion: Datum strikt als lokale Zeit parsen
const parseLocalTime = (isoString) => {
  if (!isoString) return new Date();
  if (isoString.length === 10) {
    const [y, m, d] = isoString.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  const [datePart, timePart] = isoString.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hr, min] = timePart.split(':').map(Number);
  return new Date(y, m - 1, d, hr, min);
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

const formatDateShort = (date) => {
  if (!date) return "";
  try { return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(date); } catch (e) { return ""; }
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

const getWeatherConfig = (code, isDay = 1) => {
  const isNight = isDay === 0;
  if (code === 0) return isNight ? { text: 'Klar', icon: Moon } : { text: 'Sonnig', icon: Sun };
  if (code === 1) return isNight ? { text: 'Leicht bewölkt', icon: Moon } : { text: 'Heiter', icon: Sun };
  if (code === 2) return { text: 'Wolkig', icon: Cloud };
  if (code === 3) return { text: 'Bedeckt', icon: Cloud };
  if ([45, 48].includes(code)) return { text: 'Nebel', icon: CloudFog };
  if ([51, 53, 55].includes(code)) return { text: 'Sprühregen', icon: CloudRain };
  if ([61, 63].includes(code)) return { text: 'Regen', icon: CloudRain };
  if ([80, 81].includes(code)) return { text: 'Regenschauer', icon: CloudRain };
  if ([65, 82].includes(code)) return { text: 'Starkregen', icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: 'Schnee', icon: Snowflake };
  if ([56, 57, 66, 67].includes(code)) return { text: 'Schneeregen/Eis', icon: Snowflake };
  if ([95, 96, 99].includes(code)) return { text: 'Gewitter', icon: CloudLightning };
  return { text: 'Unbekannt', icon: Info };
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

// --- 3. KI LOGIK (REVISED - MIT STRUKTURIERTEN DATEN) ---
const generateAIReport = (type, data) => {
  if (!data || data.length === 0) return { title: "Lade...", summary: "Warte auf Daten...", details: null, warning: null, confidence: null };
  
  let title = "";
  let summary = "";
  let details = null; // Standardmäßig null für "nicht ausklappbar"
  let warning = null;
  let confidence = null;

  if (type === 'daily') {
    title = "Tages-Briefing";
    const now = new Date();
    const currentHour = now.getHours();
    
    // Basisdaten
    const current = data[0];
    let intro = `Aktuell (${current.displayTime} Uhr): ${Math.round(current.temp)}°C`;
    if (Math.abs(current.appTemp - current.temp) > 2) intro += `, gefühlt ${Math.round(current.appTemp)}°C.`;
    
    let parts = [intro];

    // 1. PHASE: Rest von Heute (Filtert alles Vergangene raus)
    const todayData = data.filter(d => 
        d.time.getDate() === now.getDate() && d.time.getHours() > currentHour
    );

    // 2. PHASE: Kommende Nacht (ca. 22:00 heute bis 06:00 morgen)
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    
    const nightData = data.filter(d => {
        const h = d.time.getHours();
        const isTonightLate = d.time.getDate() === now.getDate() && h >= 22;
        const isTomorrowEarly = d.time.getDate() === tomorrowDate.getDate() && h < 6;
        return isTonightLate || isTomorrowEarly;
    });

    // 3. PHASE: Morgen (06:00 bis 22:00 Uhr) - KONSTANT
    const tomorrowDayData = data.filter(d => 
        d.time.getDate() === tomorrowDate.getDate() && d.time.getHours() >= 6 && d.time.getHours() <= 22
    );

    // TEIL A: HEUTE
    if (todayData.length > 0) {
        let todayText = "📅 Heute: ";
        const maxToday = Math.max(...todayData.map(d => d.temp));
        const rainSumToday = todayData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        const maxWind = Math.max(...todayData.map(d => d.gust));
        
        // Finde Beginn des Regens
        const rainHours = todayData.filter(d => d.precip > 0.1 && d.precipProb > 30);
        const firstRain = rainHours.length > 0 ? rainHours[0] : null;

        if (currentHour < 11) {
            // MORGENS: Sehr ausführlich
            todayText += `Die Temperaturen klettern bis auf ${Math.round(maxToday)}°C. `;
            
            if (rainSumToday < 0.2) {
                todayText += "Ein weitgehend trockener Tag erwartet Sie. ";
                const sunHours = todayData.filter(d => d.code <= 2).length;
                if (sunHours > 5) todayText += "Nutzen Sie die sonnigen Abschnitte!";
                else todayText += "Die Wolken haben oft die Oberhand.";
            } else {
                todayText += `Insgesamt werden ca. ${rainSumToday.toFixed(1)}mm Niederschlag erwartet. `;
                if (firstRain) {
                    const rTime = firstRain.time.getHours();
                    if (rTime <= currentHour + 1) todayText += "Es regnet bereits oder fängt gleich an. ";
                    else todayText += `Trocken bis ca. ${rTime} Uhr, dann steigt das Regenrisiko deutlich. `;
                } else {
                     todayText += "Gelegentliche Schauer sind über den Tag verteilt möglich. ";
                }
            }
            
            if (maxWind > 45) todayText += ` Der Wind frischt auf mit Böen bis ${Math.round(maxWind)} km/h.`;

        } else if (currentHour < 17) {
            // MITTAGS: Update
            todayText = "📅 Rest des Tages: ";
            if (rainSumToday > 0.5) todayText += `Es bleibt unbeständig mit weiteren Regenfällen (${rainSumToday.toFixed(1)}mm). `;
            else todayText += "Der Nachmittag verläuft meist trocken und ruhig. ";
             todayText += `Werte bis ${Math.round(maxToday)}°C.`;

        } else {
            // ABENDS: Kurz
            todayText = "📅 Der Abend: ";
            if (rainSumToday > 0.1) todayText += "Es kann noch etwas tröpfeln. ";
            else todayText += "Der Tag klingt ruhig aus. ";
        }
        
        parts.push(todayText);
    }

    // TEIL B: DIE NACHT
    if (nightData.length > 0) {
        const minNight = Math.min(...nightData.map(d => d.temp));
        const rainNight = nightData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        let nightText = "🌙 In der Nacht ";
        
        if (minNight < 1) nightText += `wird es frostig (${Math.round(minNight)}°C). Achtung Glättegefahr!`;
        else if (minNight < 4) nightText += `kühlt es auf frische ${Math.round(minNight)}°C ab (Bodenfrost möglich).`;
        else nightText += `sinken die Werte auf ${Math.round(minNight)}°C.`;

        if (rainNight > 0.5) nightText += " Zeitweise fällt Regen.";
        else nightText += " Es bleibt weitgehend trocken.";
        
        parts.push(nightText);
    }

    // TEIL C: MORGEN
    if (tomorrowDayData.length > 0) {
        const tMax = Math.max(...tomorrowDayData.map(d => d.temp));
        const tMin = Math.min(...tomorrowDayData.map(d => d.temp)); 
        const tRain = tomorrowDayData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        const tGust = Math.max(...tomorrowDayData.map(d => d.gust));
        
        const tMorning = tomorrowDayData.filter(d => d.time.getHours() < 12);
        const tAfternoon = tomorrowDayData.filter(d => d.time.getHours() >= 12);
        
        const isRainyMorning = tMorning.some(d => d.precip > 0.1);
        const isRainyAfternoon = tAfternoon.some(d => d.precip > 0.1);

        let tomorrowText = `🌅 Ausblick auf Morgen (${tomorrowDate.toLocaleDateString('de-DE', {weekday:'long'})}):\n`;
        tomorrowText += `Erwarten Sie Temperaturen zwischen ${Math.round(tMin)}°C am Morgen und bis zu ${Math.round(tMax)}°C am Nachmittag. `;
        
        if (tRain > 2.0) {
             if (isRainyMorning && !isRainyAfternoon) tomorrowText += "Der Vormittag startet nass, später lockert es auf.";
             else if (!isRainyMorning && isRainyAfternoon) tomorrowText += "Starten Sie trocken, nachmittags zieht Regen auf.";
             else tomorrowText += `Ein regnerischer Tag (${tRain.toFixed(1)}mm), vergessen Sie den Schirm nicht.`;
        } else if (tRain > 0.1) {
            tomorrowText += "Vereinzelt sind kurze Schauer möglich, meist bleibt es aber trocken.";
        } else {
            const avgCode = tomorrowDayData.reduce((a,b)=>a+b.code,0) / tomorrowDayData.length;
            if (avgCode <= 2) tomorrowText += "Es wird ein schöner, sonniger Tag.";
            else tomorrowText += "Es bleibt meist wolkig oder bedeckt.";
        }

        if (tGust > 50) {
             tomorrowText += ` Es wird windig mit Böen bis ${tGust} km/h.`;
             warning = "WINDIG (Morgen)";
        }

        parts.push(tomorrowText);
    }

    summary = parts.join("\n\n");
    confidence = 90; 
    
    // Globale Warnungen
    const maxGustNow = Math.max(...(todayData.map(d=>d.gust)||[]), 0);
    if (maxGustNow > 60) warning = "STURMBÖEN (Heute)";
  }

  if (type === 'longterm') {
    title = "7-Tage-Wettertrend";
    const analysisData = data.slice(1);
    
    // Stats
    const maxTempDay = analysisData.reduce((p, c) => (p.max > c.max) ? p : c);
    const minTempDay = analysisData.reduce((p, c) => (p.max < c.max) ? p : c);
    const absoluteMin = Math.min(...analysisData.map(d => d.min)); 
    
    const rainyDays = analysisData.filter(d => parseFloat(d.rain) > 1.0);
    const sunDays = analysisData.filter(d => parseFloat(d.rain) < 0.2 && d.code <= 2);
    const windyDays = analysisData.filter(d => d.gust > 45);
    const totalRain = analysisData.reduce((acc, d) => acc + parseFloat(d.rain), 0);
    
    const avgRel = Math.round(analysisData.reduce((a, b) => a + b.reliability, 0) / analysisData.length);
    confidence = avgRel;

    // --- SUMMARY (Mehr Details) ---
    const startTemp = analysisData[0].max;
    const endTemp = analysisData[analysisData.length-1].max;
    
    let trendText = "";
    if (endTemp > startTemp + 3) trendText = "Es wird spürbar wärmer.";
    else if (endTemp < startTemp - 3) trendText = "Es kühlt im Verlauf deutlich ab.";
    else trendText = "Das Temperaturniveau bleibt konstant.";
    
    let conditionText = "";
    if (rainyDays.length >= 4) conditionText = "Stellen Sie sich auf eine unbeständige, nasse Woche ein.";
    else if (sunDays.length >= 4) conditionText = "Hoher Luftdruck dominiert: Viel Sonnenschein erwartet.";
    else if (totalRain < 2) conditionText = "Es bleibt weitgehend trocken, aber oft bewölkt.";
    else conditionText = "Ein Mix aus Sonne und Wolken mit gelegentlichen Schauern.";

    summary = `${trendText} Die Höchstwerte liegen zwischen ${Math.round(minTempDay.max)}°C und ${Math.round(maxTempDay.max)}°C. ${conditionText}`;
    
    if (windyDays.length > 0) summary += " Zeitweise wird es windig.";

    // --- DETAILS (Sehr Ausführlich) ---
    let detailParts = [];
    
    // 1. Temperaturen Detail
    detailParts.push(`🌡️ Temperatur-Verlauf:\nDie Woche startet mit ${Math.round(startTemp)}°C. Der Höhepunkt wird voraussichtlich am ${maxTempDay.dayNameFull} mit bis zu ${Math.round(maxTempDay.max)}°C erreicht. In den Nächten kühlt es auf ${Math.round(absoluteMin)}°C bis ${Math.round(Math.max(...analysisData.map(d=>d.min)))}°C ab.`);
    
    // 2. Niederschlag & Wolken Detail
    let rainDetail = "";
    if (totalRain < 0.5) {
        rainDetail = "Es ist kaum mit Niederschlag zu rechnen. Gute Bedingungen für Outdoor-Aktivitäten.";
    } else if (rainyDays.length > 0) {
        const wettestDay = rainyDays.reduce((p,c) => parseFloat(p.rain) > parseFloat(c.rain) ? p : c);
        rainDetail = `Insgesamt fallen ca. ${totalRain.toFixed(1)}mm Regen. Der ${wettestDay.dayNameFull} sticht als nassester Tag heraus (${wettestDay.rain}mm).`;
        if (rainyDays.length > 3) rainDetail += " Rechnen Sie fast täglich mit Regenschirmen.";
    } else {
        rainDetail = "Es bleibt meist trocken, vereinzelte Tropfen sind aber nicht ausgeschlossen.";
    }
    detailParts.push(`☁️/☔ Himmel & Nässe:\n${rainDetail}`);

    // 3. Wind Detail
    if (windyDays.length > 0) {
        const stormDay = windyDays.reduce((p,c) => p.gust > c.gust ? p : c);
        detailParts.push(`💨 Wind:\nFrischer Wind an ${windyDays.length} Tagen. Vorsicht am ${stormDay.dayNameFull}: Hier sind Böen bis ${stormDay.gust} km/h möglich.`);
    }

    // 4. Wochenende
    const weekend = analysisData.filter(d => d.dayName === 'Sa.' || d.dayName === 'So.');
    if (weekend.length > 0) {
        const weTemp = Math.round(weekend.reduce((s, d) => s + d.max, 0) / weekend.length);
        const weRain = weekend.reduce((s, d) => s + parseFloat(d.rain), 0);
        detailParts.push(`🎉 Wochenend-Check:\n${weRain < 1 ? "Perfektes Ausflugswetter" : "Eher ungemütlich"} bei ca. ${weTemp}°C.`);
    }

    // 5. Reliability Context
    let relText = "";
    if (confidence >= 80) relText = "Die Modelle sind sich sehr einig. Dieser Trend ist sehr wahrscheinlich.";
    else if (confidence >= 50) relText = "Der grobe Trend stimmt, aber Details (wie genaue Regenzeitpunkte) können sich noch verschieben.";
    else relText = "Die Wetterlage ist instabil. Die Vorhersage kann sich noch deutlich ändern.";
    
    detailParts.push(`ℹ️ Prognose-Güte:\n${relText} (${confidence}%)`);

    details = detailParts.join("\n\n");
    
    const stormDay = analysisData.find(d => d.gust > 70);
    if (stormDay) warning = `STURM (${stormDay.dayNameFull})`;
  }
  
  if (type === 'model-hourly') {
     title = "Modell-Check (48h)";
     // Simple diff logic
     let totalDiff = 0;
     data.forEach(d => { if (d.temp_icon !== null && d.temp_gfs !== null) totalDiff += Math.abs(d.temp_icon - d.temp_gfs); });
     const avgDiff = totalDiff / data.length;
     
     if (avgDiff < 1.0) {
         summary = "✅ Hohe Einigkeit: Die Modelle rechnen fast identisch.";
         confidence = 95;
     } else if (avgDiff < 2.5) {
         summary = "⚠️ Leichte Unsicherheiten im Detail.";
         confidence = 70;
     } else {
         summary = "❌ Große Diskrepanz: Modelle rechnen verschieden.";
         confidence = 40;
         warning = "UNSICHER";
     }
     details = "Der Vergleich von ICON (DE), GFS (US) und AROME (FR) zeigt, wie sicher die Vorhersage ist. Bei großer Abweichung (❌) ist das Wetter schwer vorherzusagen.";
  }

  if (type === 'model-daily') {
    title = "Modell-Vergleich (Langzeit)";
    const slicedData = data.slice(0, 6); 
    const diff = slicedData.reduce((acc, d) => acc + (d.max_gfs - d.max_icon), 0);
    
    if (Math.abs(diff) < 5) summary = "Die Langzeitmodelle sind weitgehend synchron.";
    else if (diff > 0) summary = "GFS (US) rechnet wärmer als ICON (EU).";
    else summary = "ICON (EU) sieht die Woche wärmer als GFS.";
    
    details = "Vergleich der maximalen Tagestemperaturen zwischen dem amerikanischen GFS und dem deutschen ICON Modell über die nächsten 6 Tage.";
    confidence = 80;
  }

  return { title, summary, details, warning, confidence };
};

// --- 4. KOMPONENTEN ---

const WeatherLandscape = ({ code, isDay, date, temp, sunrise, sunset, windSpeed }) => {
  const isNight = isDay === 0;
  
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

  const d = date ? new Date(date) : new Date();
  const currentHour = d.getHours() + d.getMinutes() / 60;
  
  const getDecimalHour = (isoString) => {
      if (!isoString) return null;
      const t = parseLocalTime(isoString);
      return t.getHours() + t.getMinutes() / 60;
  };
  
  const sunriseHour = getDecimalHour(sunrise) ?? 6.5; 
  const sunsetHour = getDecimalHour(sunset) ?? 20.5;
  
  let celestialX = -50;
  let celestialY = 200; 
  let celestialType = 'none';
  let isDawn = false;
  let isDusk = false;

  if (currentHour >= sunriseHour && currentHour <= sunsetHour) {
     celestialType = 'sun';
     const dayLength = sunsetHour - sunriseHour;
     const dayProgress = (currentHour - sunriseHour) / dayLength; 
     celestialX = 40 + dayProgress * 280; 
     celestialY = 30 + 0.005 * Math.pow(celestialX - 180, 2);
     if (currentHour - sunriseHour < 1.0) isDawn = true;
     if (sunsetHour - currentHour < 1.0) isDusk = true;
  } else {
     celestialType = 'moon';
     let nightDuration = (24 - sunsetHour) + sunriseHour;
     let timeSinceSunset = currentHour - sunsetHour;
     if (timeSinceSunset < 0) timeSinceSunset += 24; 
     const nightProgress = timeSinceSunset / nightDuration;
     celestialX = 40 + nightProgress * 280;
     celestialY = 30 + 0.005 * Math.pow(celestialX - 180, 2);
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

      {celestialType === 'sun' && !isOvercast && (
        <g transform={`translate(${celestialX}, ${celestialY})`}>
          <circle r="14" fill="#fbbf24" className="animate-ray" />
          <g className="animate-spin-slow">
            {[...Array(8)].map((_, i) => (
              <line key={i} x1="0" y1="-20" x2="0" y2="-16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 45})`} />
            ))}
          </g>
        </g>
      )}

      {celestialType === 'moon' && !isOvercast && (
        <g transform={`translate(${celestialX}, ${celestialY})`}>
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
const PrecipitationTile = ({ data }) => {
  // Analyse der nächsten 24h
  const analysis = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Wir betrachten nur die Zukunft (ab jetzt)
    const now = new Date();
    const futureData = data.filter(d => d.time > now);
    
    if (futureData.length === 0) return null;
    
    // Ist es gerade nass? (in der aktuellen Stunde oder nächsten Stunde)
    const current = data[0]; 
    const isRainingNow = current.precip > 0.05 || current.snow > 0.05; // kleiner Threshold
    
    let result = { 
       type: 'none', // none, rain_now, rain_later, snow_now, snow_later
       startTime: null,
       endTime: null,
       amount: 0,
       duration: 0,
       isSnow: false,
       maxIntensity: 0
    };

    let foundStart = false;
    let precipStartIdx = -1;
    
    // Loop um Start und Ende zu finden
    for (let i = 0; i < futureData.length; i++) {
       const d = futureData[i];
       const hasPrecip = d.precip > 0.05 || d.snow > 0.05;
       
       if (hasPrecip) {
           if (!foundStart) {
               foundStart = true;
               precipStartIdx = i;
               result.startTime = d.time;
               result.isSnow = d.snow > 0.05; // Typerkennung beim Start
           }
           const hourlyAmount = d.precip > 0 ? d.precip : d.snow;
           result.amount += hourlyAmount; // Schnee in mm Wasseräquivalent meist ähnlich in API
           result.maxIntensity = Math.max(result.maxIntensity, hourlyAmount);
           result.duration++;
       } else {
           if (foundStart) {
               // Regen hat aufgehört
               result.endTime = d.time; // Endzeit ist Beginn der trockenen Stunde
               break; 
           }
       }
    }
    
    if (!foundStart && isRainingNow) {
        // Es regnet jetzt, hört aber in <1h auf (in den futureData nicht mehr drin)
        const hourlyAmount = current.precip || current.snow;
        result.type = current.snow > 0 ? 'snow_now' : 'rain_now';
        result.duration = 1; 
        result.amount = hourlyAmount;
        result.maxIntensity = hourlyAmount;
        result.startTime = current.time;
    } else if (foundStart) {
        if (precipStartIdx === 0 && isRainingNow) {
            result.type = result.isSnow ? 'snow_now' : 'rain_now';
        } else {
            result.type = result.isSnow ? 'snow_later' : 'rain_later';
        }
    }
    
    return result;
  }, [data]);

  if (!analysis) return null;

  const { type, startTime, duration, amount, isSnow, maxIntensity } = analysis;
  
  if (type === 'none') {
      return (
        <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between shadow-sm mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-full text-emerald-600"><Sun size={20} /></div>
                <div>
                    <div className="font-bold text-slate-700 text-sm">Kein Niederschlag</div>
                    <div className="text-xs text-slate-500 font-medium">In den nächsten 24h bleibt es trocken.</div>
                </div>
            </div>
        </div>
      );
  }

  const isRain = type.includes('rain');
  const isNow = type.includes('now');
  const Icon = isSnow ? Snowflake : CloudRain;
  const colorClass = isSnow ? "text-cyan-600 bg-cyan-100 border-cyan-200" : "text-blue-600 bg-blue-100 border-blue-200";
  const bgClass = isSnow ? "bg-cyan-50/80" : "bg-blue-50/80";

  // Intensitäts-Logik
  const getIntensityInfo = (rate) => {
      if (rate < 1.0) return { label: 'Leicht', percent: 33, color: isSnow ? 'bg-cyan-400' : 'bg-blue-400' };
      if (rate < 4.0) return { label: 'Mäßig', percent: 66, color: isSnow ? 'bg-cyan-500' : 'bg-blue-600' };
      return { label: 'Stark', percent: 100, color: isSnow ? 'bg-cyan-700' : 'bg-blue-800' };
  };

  const intensity = getIntensityInfo(maxIntensity);

  return (
    <div className={`${bgClass} border ${isSnow ? 'border-cyan-100' : 'border-blue-100'} rounded-2xl p-3 shadow-sm mb-3 relative overflow-hidden`}>
        <div className="flex justify-between items-center z-10 relative">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClass} bg-opacity-30`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-800 tracking-tight leading-none">
                            {isNow ? "Jetzt" : (startTime ? startTime.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'}) : '--:--')}
                        </span>
                        {!isNow && <span className="text-[10px] font-bold text-slate-500 uppercase">Uhr</span>}
                        {isNow && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
                    </div>
                    <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wide mt-0.5">
                        {isSnow ? "Schnee" : "Regen"} • {intensity.label}
                    </div>
                </div>
            </div>

            <div className="text-right">
                <div className="text-sm font-bold text-slate-700 leading-tight">{amount.toFixed(1)}<span className="text-[10px] text-slate-500 font-normal ml-0.5">mm</span></div>
                <div className="text-xs font-medium text-slate-500 leading-tight">{duration} <span className="text-[10px]">Std</span></div>
            </div>
        </div>

        <div className="mt-3 h-1.5 w-full bg-white/40 rounded-full overflow-hidden relative">
            <div 
                className={`h-full ${intensity.color} rounded-full transition-all duration-1000 ease-out`} 
                style={{ width: `${intensity.percent}%` }}
            ></div>
        </div>
    </div>
  );
};

// --- NEU: FEEDBACK MODAL (ERWEITERT) ---
const FeedbackModal = ({ onClose, currentTemp }) => {
    const [sent, setSent] = useState(false);
    const [tempAdjustment, setTempAdjustment] = useState(0); // Offset in Grad
    const [selectedCondition, setSelectedCondition] = useState(null);

    const conditions = [
        { id: 'sun', label: 'Sonnig', icon: Sun, color: 'text-amber-500 bg-amber-50 border-amber-200' },
        { id: 'cloudy', label: 'Bewölkt', icon: Cloud, color: 'text-slate-500 bg-slate-50 border-slate-200' },
        { id: 'overcast', label: 'Bedeckt', icon: Cloud, color: 'text-slate-700 bg-slate-100 border-slate-300' }, // Neu
        { id: 'fog', label: 'Nebel', icon: CloudFog, color: 'text-slate-400 bg-slate-50/50 border-slate-200' },
        { id: 'drizzle', label: 'Niesel', icon: CloudDrizzle, color: 'text-cyan-500 bg-cyan-50 border-cyan-200' },
        { id: 'rain', label: 'Regen', icon: CloudRain, color: 'text-blue-500 bg-blue-50 border-blue-200' },
        { id: 'storm', label: 'Gewitter', icon: CloudLightning, color: 'text-purple-600 bg-purple-50 border-purple-200' }, // Neu
        { id: 'snow', label: 'Schnee', icon: CloudSnow, color: 'text-sky-300 bg-sky-50 border-sky-100' }, // Neu
        { id: 'hail', label: 'Hagel', icon: CloudHail, color: 'text-teal-600 bg-teal-50 border-teal-200' }, // Neu
        { id: 'wind', label: 'Windig', icon: Wind, color: 'text-slate-600 bg-slate-100 border-slate-300' }, // Neu
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
                    <h3 className="text-xl font-black text-slate-800 mb-2">Danke!</h3>
                    <p className="text-slate-500">Dein Feedback hilft uns, die lokalen Daten zu vergleichen.</p>
                </div>
            </div>
        );
    }

    const displayTemp = Math.round(currentTemp + tempAdjustment);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquarePlus size={18} className="text-blue-500"/> Wetter melden</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} className="text-slate-400" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {/* Temperatur Slider */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-4">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Temperatur</label>
                            <div className="text-3xl font-black text-slate-800">{displayTemp}°C</div>
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
                            <span>Kälter (-10°)</span>
                            <span>Genau richtig</span>
                            <span>Wärmer (+10°)</span>
                        </div>
                    </div>

                    {/* Wetter Grid */}
                    <div className="mb-6">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 block">Aktuelles Wetter</label>
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
                        Feedback senden
                    </button>
                </div>
            </div>
        </div>
    );
};

const DwdAlertItem = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);
  const colorClass = getDwdColorClass(alert.severity);

  return (
    <div className={`rounded-xl border-l-4 shadow-sm relative overflow-hidden transition-all duration-300 ${colorClass} mb-3`}>
      <div className="p-4 flex items-start gap-3 relative z-10 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <Siren className="shrink-0 animate-pulse-red mt-1" size={24} />
        <div className="flex-1">
           <div className="flex justify-between items-start">
              <div>
                <div className="font-extrabold uppercase text-xs tracking-wider opacity-80 mb-0.5">Amtliche Warnung ({alert.severity})</div>
                <div className="font-bold text-lg leading-tight">{alert.headline_de || alert.event_de}</div>
              </div>
              <div className="opacity-60 ml-2 mt-1">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
           </div>
           {!expanded && <div className="text-xs font-medium opacity-70 mt-1">Klicken für Details...</div>}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pl-12 relative z-10 animate-in fade-in slide-in-from-top-2 duration-200">
           <p className="text-sm opacity-90 leading-relaxed whitespace-pre-line mb-3 border-t border-black/10 pt-2">{alert.description_de}</p>
           <div className="text-xs font-medium opacity-70 flex flex-col sm:flex-row sm:justify-between gap-1 bg-white/30 p-2 rounded">
              <span><strong>Von:</strong> {new Date(alert.effective).toLocaleString('de-DE')}</span>
              <span><strong>Bis:</strong> {new Date(alert.expires).toLocaleString('de-DE')}</span>
           </div>
           {alert.instruction_de && <div className="mt-2 text-xs opacity-80 italic"><span className="font-bold not-italic">Handlungsempfehlung:</span> {alert.instruction_de}</div>}
        </div>
      )}
    </div>
  );
};

const AIReportBox = ({ report, dwdWarnings }) => {
  const [expanded, setExpanded] = useState(false);
  if (!report) return null;
  const { title, summary, details, warning: localWarning, confidence } = report;
  
  const hasDwd = dwdWarnings && dwdWarnings.length > 0;
  
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
                       <div className="font-extrabold uppercase text-[10px] tracking-wider opacity-80">Amtliche Warnung</div>
                       <div className="font-bold leading-tight text-sm">{dwdWarnings.length} aktive Warnung(en)</div>
                     </div>
                  </div>
                  <div className="opacity-60">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
                </button>
                {expanded && (
                   <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {dwdWarnings.map((alert, i) => <DwdAlertItem key={i} alert={alert} />)}
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
                    {title || "Wetter-Bericht"}
                </div>
                {confidence !== null && (
                    <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${confidence > 70 ? 'bg-green-100 text-green-700 border-green-200' : confidence > 40 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {confidence}% Sicher
                    </div>
                )}
            </div>
            
            {/* Hinzugefügt: whitespace-pre-line für korrekte Zeilenumbrüche im Daily Report */}
            <p className="text-sm text-slate-800 leading-relaxed font-semibold relative z-10 whitespace-pre-line">{summary}</p>
            
            {/* Toggle Button */}
            {details && (
                <button 
                    onClick={() => setExpanded(!expanded)} 
                    className="mt-3 text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors"
                >
                    {expanded ? "Weniger anzeigen" : "Ausführliche Details"} {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>
            )}
        </div>

        {/* EXPANDABLE DETAILS */}
        {expanded && details && (
            <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="h-px w-full bg-indigo-200/50 mb-3"></div>
                <div className="text-sm text-slate-700 leading-relaxed space-y-2 whitespace-pre-line">
                    {details}
                </div>
            </div>
        )}
      </div>
    </>
  );
};

// --- LOCATION MODAL ---
const LocationModal = ({ isOpen, onClose, savedLocations, onSelectLocation, onAddCurrentLocation, onDeleteLocation, currentLoc }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><MapIcon size={18} className="text-blue-500"/> Gespeicherte Orte</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} className="text-slate-400" /></button>
                </div>
                
                <div className="p-4 overflow-y-auto">
                    {/* Add Current Location Button */}
                    <button 
                        onClick={onAddCurrentLocation}
                        className="w-full mb-4 p-3 rounded-xl border border-dashed border-blue-300 bg-blue-50 text-blue-600 font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition"
                    >
                        <Plus size={18} /> Aktuellen Ort hinzufügen
                    </button>

                    <div className="space-y-2">
                        {savedLocations.length === 0 ? (
                            <div className="text-center text-slate-400 py-8 text-sm">Keine Orte gespeichert.</div>
                        ) : (
                            savedLocations.map((loc, index) => (
                                <div key={index} className={`p-3 rounded-xl border flex items-center justify-between group transition ${currentLoc.name === loc.name ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                    <button 
                                        onClick={() => { onSelectLocation(loc); onClose(); }}
                                        className="flex items-center gap-3 flex-1 text-left"
                                    >
                                        <div className={`p-2 rounded-full ${loc.type === 'home' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                                            {loc.type === 'home' ? <Home size={16} /> : <MapPin size={16} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700 text-sm">{loc.name}</div>
                                            <div className="text-[10px] text-slate-400">Lat: {loc.lat.toFixed(2)}, Lon: {loc.lon.toFixed(2)}</div>
                                        </div>
                                    </button>
                                    
                                    <button 
                                        onClick={() => onDeleteLocation(index)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- 4. MAIN APP COMPONENT ---

export default function WeatherApp() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState(() => getSavedLocations());
  const [homeLoc, setHomeLoc] = useState(() => getHomeLocation());
  const [currentLoc, setCurrentLoc] = useState(homeLoc); // Initial Home or Default
  const [shortTermData, setShortTermData] = useState(null);
  const [longTermData, setLongTermData] = useState(null);
  const [dwdWarnings, setDwdWarnings] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartView, setChartView] = useState('hourly');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAllHours, setShowAllHours] = useState(false); 
  const [sunriseSunset, setSunriseSunset] = useState({ sunrise: null, sunset: null });
  const [modelRuns, setModelRuns] = useState({ icon: '', gfs: '', arome: '' });
  const [showIosInstall, setShowIosInstall] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [viewMode, setViewMode] = useState(null);

  // Initial Location Logic
  useEffect(() => {
    const initLocation = async () => {
        // Check URL parameters for widget mode
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        if (view) setViewMode(view);

        if (!navigator.geolocation) {
             // No GPS support, fallback to home
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
                        const city = data.results?.[0]?.name || "Mein Standort";
                        setCurrentLoc({ name: city, lat, lon, type: 'gps' });
                    } catch (e) {
                        setCurrentLoc({ name: "Mein Standort", lat, lon, type: 'gps' });
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
  }, []);

  // Update localStorage when locations change
  useEffect(() => {
      localStorage.setItem('weather_locations', JSON.stringify(locations));
  }, [locations]);

  // Update localStorage when home changes
  useEffect(() => {
    localStorage.setItem('weather_home_loc', JSON.stringify(homeLoc));
  }, [homeLoc]);


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
          setLocations([...locations, { ...currentLoc, type: 'saved' }]);
      }
      setShowLocationModal(false);
  };

  const handleDeleteLocation = (index) => {
      const newLocs = [...locations];
      newLocs.splice(index, 1);
      setLocations(newLocs);
  };

  const handleSetHome = () => setCurrentLoc(homeLoc);
  
  const handleSetCurrent = () => {
    setLoading(true);
    if (!navigator.geolocation) { setError("Kein GPS"); setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCurrentLoc({ name: "Mein Standort", lat: pos.coords.latitude, lon: pos.coords.longitude, type: 'gps' }),
      (err) => { setError("GPS verweigert"); setLoading(false); }
    );
  };
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setDwdWarnings([]);
    try {
      const { lat, lon } = currentLoc;
      const modelsShort = "icon_d2,gfs_seamless,arome_seamless,knmi_harmonie_arome_europe,gem_seamless";
      const urlShort = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,snowfall,weathercode,windspeed_10m,winddirection_10m,windgusts_10m,is_day,apparent_temperature,relative_humidity_2m,dewpoint_2m,uv_index,precipitation_probability&models=${modelsShort}&timezone=Europe%2FBerlin&forecast_days=2`;
      const modelsLong = "icon_seamless,gfs_seamless,arome_seamless,gem_seamless"; 
      const urlLong = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,precipitation_probability_max,sunrise,sunset&models=${modelsLong}&timezone=Europe%2FBerlin&forecast_days=8`;
      const urlDwd = `https://api.brightsky.dev/alerts?lat=${lat}&lon=${lon}`;

      const [resShort, resLong, resDwd] = await Promise.all([fetch(urlShort), fetch(urlLong), fetch(urlDwd).catch(() => ({ ok: false }))]);
      if (!resShort.ok || !resLong.ok) throw new Error("Fehler beim Datenabruf");
      
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

    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [currentLoc]);

  // --- PROCESSING LOGIC --- 
  const processedShort = useMemo(() => {
    if (!shortTermData?.hourly) return [];
    const h = shortTermData.hourly;
    const now = new Date(); 
    const res = [];
    const isDayArray = h.is_day_icon_d2 || h.is_day || h.is_day_gfs_seamless;

    for (let i = 0; i < h.time.length; i++) {
      const t = parseLocalTime(h.time[i]);
      const nextT = i < h.time.length - 1 ? parseLocalTime(h.time[i+1]) : null;
      if (t < now && nextT && nextT > now) {} else if (t < now) { continue; }

      const getVal = (key) => h[key]?.[i] ?? h[`${key}_icon_d2`]?.[i] ?? h[`${key}_gfs_seamless`]?.[i] ?? h[`${key}_arome_seamless`]?.[i] ?? 0;
      const temp_icon = h.temperature_2m_icon_d2?.[i] ?? null;
      const temp_gfs = h.temperature_2m_gfs_seamless?.[i] ?? null;
      const temp_arome = h.temperature_2m_arome_seamless?.[i] ?? null;
      const temp_knmi = h.temperature_2m_knmi_harmonie_arome_europe?.[i] ?? null;
      const temp_gem = h.temperature_2m_gem_seamless?.[i] ?? null;
      const t_vals = [temp_icon, temp_gfs, temp_arome, temp_knmi, temp_gem].filter(v => v !== null && v !== undefined);
      const temp = t_vals.length > 0 ? t_vals.reduce((a,b)=>a+b,0) / t_vals.length : 0;
      
      const getAvg = (key) => {
         const v1 = h[`${key}_icon_d2`]?.[i];
         const v2 = h[`${key}_gfs_seamless`]?.[i];
         const v3 = h[`${key}_arome_seamless`]?.[i];
         const v4 = h[`${key}_knmi_harmonie_arome_europe`]?.[i];
         const v5 = h[`${key}_gem_seamless`]?.[i];
         const vals = [v1, v2, v3, v4, v5].filter(v => v !== undefined && v !== null);
         return vals.length > 0 ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
      };

      const getMax = (key) => {
         const v1 = h[`${key}_icon_d2`]?.[i];
         const v2 = h[`${key}_gfs_seamless`]?.[i];
         const v3 = h[`${key}_arome_seamless`]?.[i];
         const v4 = h[`${key}_knmi_harmonie_arome_europe`]?.[i];
         const v5 = h[`${key}_gem_seamless`]?.[i];
         const vals = [v1, v2, v3, v4, v5].filter(v => v !== undefined && v !== null);
         return vals.length > 0 ? Math.max(...vals) : 0;
      };
      
      const getProb = () => {
         return h.precipitation_probability?.[i] ?? h.precipitation_probability_icon_d2?.[i] ?? 0;
      };

      const t_spread = t_vals.length > 1 ? Math.max(...t_vals) - Math.min(...t_vals) : 0;
      const reliability = Math.round(Math.max(0, 100 - (t_spread * 15)));

      res.push({
        time: t,
        displayTime: t.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'}),
        temp: temp,
        temp_icon, temp_gfs, temp_arome, temp_knmi, temp_gem,
        precip: getAvg('precipitation'),
        precipProb: getProb(), 
        snow: getMax('snowfall'), 
        wind: Math.round(getAvg('windspeed_10m')),
        gust: Math.round(getMax('windgusts_10m')), 
        dir: h.winddirection_10m_icon_d2?.[i] || 0,
        code: h.weathercode_icon_d2?.[i] || 0,
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
    return d.time.map((t, i) => {
      const date = parseLocalTime(t);
      const maxIcon = d.temperature_2m_max_icon_seamless?.[i] ?? 0;
      const maxGfs = d.temperature_2m_max_gfs_seamless?.[i] ?? 0;
      const maxArome = d.temperature_2m_max_arome_seamless?.[i] ?? null;
      const maxGem = d.temperature_2m_max_gem_seamless?.[i] ?? null;
      const maxVals = [maxIcon, maxGfs, maxGem].filter(v => v !== null && v !== undefined);
      
      return {
        date,
        dayName: new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(date),
        dayNameFull: new Intl.DateTimeFormat('de-DE', { weekday: 'long' }).format(date),
        dateShort: formatDateShort(date),
        max: maxVals.length > 0 ? maxVals.reduce((a,b)=>a+b,0)/maxVals.length : maxIcon,
        min: ((d.temperature_2m_min_icon_seamless?.[i]??0) + (d.temperature_2m_min_gfs_seamless?.[i]??0)) / 2,
        max_icon: maxIcon, max_gfs: maxGfs, max_arome: maxArome, max_gem: maxGem,
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
  }, [longTermData]);
  
  const liveCurrent = processedShort.length > 0 ? processedShort[0] : { temp: 0, snow: "0.0", precip: "0.0", wind: 0, gust: 0, dir: 0, code: 0, isDay: 1, appTemp: 0, humidity: 0, dewPoint: 0, uvIndex: 0 };
  const current = liveCurrent;

  const dailyRainSum = processedLong.length > 0 ? processedLong[0].rain : "0.0";
  const dailySnowSum = processedLong.length > 0 ? processedLong[0].snow : "0.0";
  const isSnowing = parseFloat(current.snow) > 0;
  const weatherConf = getWeatherConfig(current.code || 0, current.isDay);
  const isNight = current.isDay === 0;
  const bgGradient = isNight ? 'from-slate-900 to-slate-800' : 'from-blue-500 to-sky-400';
  const textColor = 'text-white';
  const cardBg = isNight ? 'bg-slate-800/60 border-slate-700/50 text-white' : 'bg-white/80 border-white/40 text-slate-900';
  const windColorClass = getWindColorClass(current.wind || 0);

  const dailyReport = useMemo(() => generateAIReport('daily', processedShort), [processedShort]);
  const modelReport = useMemo(() => generateAIReport(chartView === 'hourly' ? 'model-hourly' : 'model-daily', chartView === 'hourly' ? processedShort : processedLong), [chartView, processedShort, processedLong]);
  const longtermReport = useMemo(() => generateAIReport('longterm', processedLong, processedShort), [processedLong, processedShort]);

  const displayedHours = processedShort.slice(0, 24);

  // --- WIDGET VIEWS ---
  if (viewMode === 'animation') {
    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">Lade...</div>;
    return (
      <div className={`h-screen w-screen overflow-hidden relative bg-gradient-to-br ${bgGradient}`}>
        <style>{styles}</style>
        <div className="absolute top-4 left-4 z-50">
            <a href="/" className="bg-black/20 p-2 rounded-full text-white backdrop-blur-md block"><ArrowLeft size={24}/></a>
        </div>
        <div className="h-full w-full">
            <WeatherLandscape code={current.code} isDay={current.isDay} date={current.time} temp={current.temp} sunrise={sunriseSunset.sunrise} sunset={sunriseSunset.sunset} windSpeed={current.wind} />
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center text-white drop-shadow-md pointer-events-none">
            <div className="text-6xl font-bold">{Math.round(current.temp)}°</div>
            <div className="text-xl opacity-90">{weatherConf.text}</div>
        </div>
      </div>
    );
  }

  if (viewMode === 'report') {
     if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50">Lade...</div>;
     return (
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="mb-4">
                <a href="/" className="bg-white p-2 rounded-full text-slate-700 shadow-sm inline-block"><ArrowLeft size={24}/></a>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Tages-Bericht</h2>
            <AIReportBox report={dailyReport} dwdWarnings={dwdWarnings} />
            <div className="mt-8">
                 <h2 className="text-2xl font-bold mb-4 text-slate-800">7-Tage-Trend</h2>
                 <AIReportBox report={longtermReport} dwdWarnings={[]} />
            </div>
        </div>
     );
  }

  if (viewMode === 'precip') {
    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50">Lade...</div>;
    return (
       <div className="min-h-screen bg-slate-100 p-4 flex flex-col justify-center">
           <div className="absolute top-4 left-4">
               <a href="/" className="bg-white p-2 rounded-full text-slate-700 shadow-sm inline-block"><ArrowLeft size={24}/></a>
           </div>
           <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">Niederschlags-Radar</h2>
           <PrecipitationTile data={processedShort} />
       </div>
    );
 }

  // --- STANDARD APP ---

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center p-8 bg-red-50 text-red-900 font-bold">{error} <button onClick={() => setCurrentLoc(homeLoc)} className="ml-4 underline">Reset</button></div>;

  return (
    <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${bgGradient} font-sans pb-20 overflow-hidden relative`}>
      <style>{styles}</style>
      
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} currentTemp={current.temp} />}
      {showLocationModal && (
          <LocationModal 
            isOpen={showLocationModal} 
            onClose={() => setShowLocationModal(false)}
            savedLocations={locations}
            onSelectLocation={(loc) => { setCurrentLoc(loc); setShowLocationModal(false); }}
            onAddCurrentLocation={handleAddLocation}
            onDeleteLocation={handleDeleteLocation}
            currentLoc={currentLoc}
          />
      )}

      <header className="pt-8 px-5 flex justify-between items-start z-10 relative">
        <div className={textColor}>
          <div className="flex gap-2 mb-2">
             <button onClick={handleSetHome} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${currentLoc.id === homeLoc.id ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><Home size={14} /> Home</button>
             <button onClick={handleSetCurrent} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${currentLoc.type === 'gps' ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><Crosshair size={14} /> GPS</button>
             <button onClick={() => setShowLocationModal(true)} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${showLocationModal ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><MapIcon size={14} /> Orte</button>
          </div>
          <h1 className="text-3xl font-light mt-2 tracking-tight">{currentLoc.name}</h1>
          <div className="flex items-center gap-2 mt-1 opacity-80 text-xs font-medium"><Clock size={12} /><span>Stand: {lastUpdated ? lastUpdated.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'}) : '--:--'} Uhr</span></div>
        </div>
        <div className="flex flex-col gap-2 items-end">
           {deferredPrompt && (<button onClick={handleInstallClick} className="p-3 rounded-full backdrop-blur-md bg-blue-600 text-white animate-pulse shadow-lg"><Download size={20} /></button>)}
           
           {/* iOS Install Tip */}
           {showIosInstall && (
             <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl text-black max-w-[200px] text-xs relative animate-in fade-in slide-in-from-top-4 duration-500">
                <button onClick={() => setShowIosInstall(false)} className="absolute top-1 right-1 opacity-50"><X size={14}/></button>
                <div className="font-bold mb-1 flex items-center gap-1"><Share size={12} /> App installieren</div>
                <p>Tippen Sie unten auf <strong>"Teilen"</strong> und dann <strong>"Zum Home-Bildschirm"</strong>.</p>
                <div className="w-3 h-3 bg-white/90 absolute -bottom-1.5 left-1/2 -translate-x-1/2 rotate-45"></div>
             </div>
           )}

           <div className="flex gap-2">
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
          <div className="absolute inset-0 z-0 pointer-events-none"><WeatherLandscape code={current.code} isDay={current.isDay} date={current.time} temp={current.temp} sunrise={sunriseSunset.sunrise} sunset={sunriseSunset.sunset} windSpeed={current.wind} /></div>
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex flex-col">
               <span className="text-7xl font-bold tracking-tighter leading-none drop-shadow-lg text-white">{Math.round(current.temp)}°</span>
               <div className="flex items-center gap-1.5 mt-2 opacity-90 font-medium text-sm text-white drop-shadow-md"><Thermometer size={16} /><span>Gefühlt {Math.round(current.appTemp)}°</span></div>
               <div className="flex items-center gap-2 mt-1 opacity-80 font-medium text-sm text-white drop-shadow-md"><span>H: {Math.round(processedLong[0]?.max)}°</span><span>T: {Math.round(processedLong[0]?.min)}°</span></div>
               <div className="mt-1 text-lg font-medium tracking-wide text-white drop-shadow-md">{weatherConf.text}</div>
            </div>
            <div className="flex flex-col gap-2 items-end text-right pl-3 border-l border-white/20 ml-2 backdrop-blur-sm bg-black/5 rounded-xl p-2">
               <div className="flex flex-col items-end"><div className={`flex items-center gap-1 opacity-90 text-sm font-bold ${getUvColorClass(current.uvIndex)} drop-shadow-sm`}><Sun size={14} /> <span>{current.uvIndex}</span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">UV</span></div>
               <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end"><div className="flex items-center gap-1 opacity-90 text-sm font-bold text-white drop-shadow-sm"><Waves size={14} /> <span>{current.humidity}%</span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">Feuchte</span></div>
                  <div className="flex flex-col items-end"><div className="flex items-center gap-1 opacity-90 text-sm font-bold text-white drop-shadow-sm"><Thermometer size={14} /> <span>{current.dewPoint}°</span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">Taupkt.</span></div>
               </div>
               <div className="flex flex-col items-end mt-1"><div className={`flex items-center gap-1.5 text-sm font-bold ${windColorClass} drop-shadow-sm`}><Navigation size={14} style={{ transform: `rotate(${current.dir}deg)` }}/><span>{current.wind} <span className="text-xs font-normal opacity-80">({current.gust})</span></span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">Wind (Böen) km/h</span></div>
               {(parseFloat(dailyRainSum) > 0 || parseFloat(dailySnowSum) > 0) && (<div className="flex flex-col items-end mt-1"><div className="flex items-center gap-1.5 opacity-90 text-sm font-bold text-blue-300 drop-shadow-sm">{isSnowing ? <Snowflake size={14}/> : <CloudRain size={14}/>}<span>{isSnowing ? dailySnowSum : dailyRainSum} {isSnowing ? 'cm' : 'mm'}</span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">Niederschlag (24h)</span></div>)}
            </div>
          </div>
        </div>

        <div className={`p-1.5 rounded-full backdrop-blur-md flex shadow-md border border-white/20 ${cardBg}`}>
           {[{id:'overview', label:'Verlauf', icon: List}, {id:'longterm', label:'7 Tage', icon: CalendarDays}, {id:'radar', label:'Radar', icon: Map}, {id:'chart', label:'Vergleich', icon: BarChart2}].map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white/90 text-slate-900 shadow-md' : 'hover:bg-white/10 opacity-70'}`}><tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span></button>
           ))}
        </div>

        <div className={`backdrop-blur-md rounded-[32px] p-5 shadow-2xl ${cardBg} min-h-[450px]`}>
          
          {activeTab === 'overview' && (
            <div className="space-y-4">
               <AIReportBox report={dailyReport} dwdWarnings={dwdWarnings} />
               <PrecipitationTile data={processedShort} />
               <h3 className="text-sm font-bold uppercase tracking-wide opacity-70 ml-2">Stündlicher Verlauf (24h)</h3>
               
               {/* Horizontal Scroll Container */}
               <div className="overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide"> 
                  <div className="flex gap-3 w-max">
                    {displayedHours.map((row, i) => {
                      const conf = getWeatherConfig(row.code, row.isDay);
                      const HourIcon = conf.icon;
                      return (
                        <div key={i} className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-3 min-w-[110px] w-[110px] hover:bg-white/10 transition relative group">
                          {/* Time */}
                          <div className="text-sm font-bold opacity-90 mb-2">{row.displayTime}</div>
                          
                          {/* Icon */}
                          <HourIcon size={32} className="opacity-90 mb-2" />
                          
                          {/* Temp */}
                          <div className="text-2xl font-bold mb-1 tracking-tighter">{Math.round(row.temp)}°</div>
                          
                          {/* Desc */}
                          <div className="text-[10px] opacity-60 text-center leading-tight h-6 flex items-center justify-center line-clamp-2 w-full mb-2">
                            {conf.text}
                          </div>
                          
                          {/* Precip */}
                           <div className="mb-2 h-4">
                             {parseFloat(row.snow) > 0 ? (
                               <span className="text-cyan-400 font-bold text-xs flex items-center gap-1"><Snowflake size={10}/> {row.snow.toFixed(1)}</span>
                             ) : parseFloat(row.precip) > 0 ? (
                               <span className="text-blue-400 font-bold text-xs flex items-center gap-1"><Droplets size={10}/> {row.precip.toFixed(1)}</span>
                             ) : (
                               <span className="opacity-20 text-xs">-</span>
                             )}
                           </div>
                           
                           {/* Wind */}
                           <div className="flex flex-col items-center gap-0.5 mb-2">
                              <div className="flex items-center gap-1 opacity-80">
                                 <Navigation size={10} style={{ transform: `rotate(${row.dir}deg)` }} />
                                 <span className={`text-xs font-bold ${getWindColorClass(row.wind)}`}>{row.wind}</span>
                              </div>
                              <span className={`text-[9px] opacity-60 ${getWindColorClass(row.gust)}`}>Böen {row.gust}</span>
                           </div>

                           {/* UV */}
                           {row.uvIndex >= 1 && (
                             <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getUvBadgeClass(row.uvIndex)}`}>
                               UV {(row.uvIndex).toFixed(0)}
                             </div>
                           )}

                           {/* Reliability Indicator */}
                           <div className="mt-2 text-[9px] flex items-center gap-1 opacity-70">
                              <ShieldCheck size={9} className={getConfidenceColor(row.reliability)} />
                              <span className={getConfidenceColor(row.reliability)}>{row.reliability}% Sicher</span>
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
               <AIReportBox report={modelReport} dwdWarnings={dwdWarnings} />
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-bold uppercase opacity-70">Modell-Check</h3>
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
                          <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', color:'#000'}} />
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
                          <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', color:'#000'}} />
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
               <AIReportBox report={longtermReport} dwdWarnings={dwdWarnings} />
               <h3 className="text-sm font-bold uppercase opacity-70 ml-2">7-Tage Liste</h3>
               
               {/* Horizontal Scroll Container for 7-Day Forecast */}
               <div className="overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide"> 
                  <div className="flex gap-3 w-max">
                    {processedLong.map((day, i) => {
                      const DayIcon = getWeatherConfig(day.code, 1).icon;
                      const confColor = getConfidenceColor(day.reliability);
                      const isDaySnow = parseFloat(day.snow) > 0;
                      let probColor = "text-slate-400 opacity-50"; 
                      if (day.prob >= 50) probColor = "text-blue-600 font-bold"; else if (day.prob >= 20) probColor = "text-blue-400 font-medium";

                      return (
                        <div key={i} className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-3 min-w-[140px] w-[140px] hover:bg-white/10 transition relative group">
                          {/* Day & Date */}
                          <div className="text-sm font-bold opacity-90 mb-0.5">{day.dayName}</div>
                          <div className="text-[10px] opacity-60 mb-2">{day.dateShort}</div>
                          
                          {/* Icon */}
                          <DayIcon size={36} className="opacity-90 mb-2" />
                          
                          {/* Temp Range */}
                          <div className="flex items-center gap-2 mb-2 w-full justify-center">
                            <span className="text-lg font-bold text-blue-400">{Math.round(day.min)}°</span>
                            <div className="h-1 w-6 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-blue-400 to-red-400 opacity-60" />
                            </div>
                            <span className="text-lg font-bold text-red-400">{Math.round(day.max)}°</span>
                         </div>
                          
                          {/* Precip */}
                           <div className="mb-1 h-4 flex items-center justify-center w-full">
                             {isDaySnow ? <span className="text-cyan-400 font-bold text-xs flex items-center gap-1"><Snowflake size={10}/> {day.snow}cm</span> : parseFloat(day.rain) > 0.1 ? <span className="text-blue-400 font-bold text-xs flex items-center gap-1"><Droplets size={10}/> {day.rain}mm</span> : <span className="opacity-20 text-xs">-</span>}
                           </div>
                           <div className={`text-[9px] mb-2 ${probColor} h-3`}>{day.prob > 0 ? `${day.prob}% Wahrsch.` : ''}</div>
                           
                           {/* Wind */}
                           <div className="flex flex-col items-center gap-0.5 mb-2 w-full">
                              <div className="flex items-center justify-center gap-1 opacity-80 w-full">
                                 <Navigation size={10} style={{ transform: `rotate(${day.dir}deg)` }} />
                                 <span className={`text-xs font-bold ${getWindColorClass(day.wind)}`}>{day.wind}</span>
                              </div>
                              <span className={`text-[9px] opacity-60 ${getWindColorClass(day.gust)}`}>Böen {day.gust}</span>
                           </div>

                           {/* Reliability Indicator */}
                           <div className="mt-1 text-[9px] flex items-center gap-1 opacity-70 border border-white/10 px-2 py-0.5 rounded-full">
                              <ShieldCheck size={9} className={confColor} />
                              <span className={confColor}>{day.reliability}% Sicher</span>
                           </div>
                           
                        </div>
                      );
                    })}
                  </div>
               </div>
             </div>
          )}

          {activeTab === 'radar' && (
            <div className="h-full flex flex-col">
               <h3 className="text-sm font-bold uppercase opacity-70 mb-4 ml-2">Live-Radar (Windy)</h3>
               <div className="w-full aspect-square rounded-xl overflow-hidden shadow-inner border border-black/10 bg-gray-200 relative">
                  <iframe width="100%" height="100%" src={`https://embed.windy.com/embed2.html?lat=${currentLoc.lat}&lon=${currentLoc.lon}&detailLat=${currentLoc.lat}&detailLon=${currentLoc.lon}&width=450&height=450&zoom=9&level=surface&overlay=radar&product=radar&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`} frameBorder="0" title="Windy Radar" className="absolute inset-0"></iframe>
               </div>
               <div className="mt-4 text-xs text-center opacity-60">Radarbild bereitgestellt von Windy.com</div>
            </div>
          )}

          {activeTab !== 'radar' && (
            <div className="mt-8 text-xs text-center opacity-60 px-6 font-medium space-y-2">
               <p className="flex items-center justify-center gap-2 mb-2"><Database size={14} /> Datenbasis & Laufzeiten (Geschätzt)</p>
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

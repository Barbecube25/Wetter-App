import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  MapPin, RefreshCw, Info, CalendarDays, TrendingUp, Droplets, Navigation, Wind, Sun, Cloud, 
  CloudRain, Snowflake, CloudLightning, Clock, Crosshair, Home, Download, Moon, Star, Umbrella, 
  ShieldCheck, AlertTriangle, BarChart2, List, Database, Map as MapIcon, Sparkles, Thermometer, 
  Waves, ChevronDown, ChevronUp, Save, CloudFog, Siren, X, ExternalLink, User, Share, Palette, 
  Zap, ArrowRight, Gauge, Timer, MessageSquarePlus, CheckCircle2, CloudDrizzle, CloudSnow, 
  CloudHail, ArrowLeft, Trash2, Plus, Plane, Calendar, Search, Check, Briefcase
} from 'lucide-react';

// --- 1. KONSTANTEN & CONFIG ---

const DEFAULT_LOC = { name: "Jülich Daubenrath", lat: 50.938, lon: 6.388, id: 'home_default', type: 'home' };

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
  :root {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;
  }
  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
  }

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
  
  /* Scrollbar hide utility */
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
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

// --- 3. KI LOGIK ---
const generateAIReport = (type, data) => {
  if (!data || data.length === 0) return { title: "Lade...", summary: "Warte auf Daten...", details: null, warning: null, confidence: null };
  
  let title = "";
  let summary = "";
  let details = null; 
  let warning = null;
  let confidence = null;

  if (type === 'daily') {
    title = "Tages-Briefing";
    const now = new Date();
    const currentHour = now.getHours();
    
    const current = data[0];
    let intro = `Aktuell (${current.displayTime} Uhr): ${Math.round(current.temp)}°C`;
    if (Math.abs(current.appTemp - current.temp) > 2) intro += `, gefühlt ${Math.round(current.appTemp)}°C.`;
    
    let parts = [intro];

    const todayData = data.filter(d => 
        d.time.getDate() === now.getDate() && d.time.getHours() > currentHour
    );

    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const nightData = data.filter(d => {
        const h = d.time.getHours();
        const isTonightLate = d.time.getDate() === now.getDate() && h >= 22;
        const isTomorrowEarly = d.time.getDate() === tomorrowDate.getDate() && h < 6;
        return isTonightLate || isTomorrowEarly;
    });

    const tomorrowDayData = data.filter(d => 
        d.time.getDate() === tomorrowDate.getDate() && d.time.getHours() >= 6 && d.time.getHours() <= 22
    );

    if (todayData.length > 0) {
        let todayText = "📅 Heute: ";
        const maxToday = Math.max(...todayData.map(d => d.temp));
        const rainSumToday = todayData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        const maxWind = Math.max(...todayData.map(d => d.gust));
        
        const rainHours = todayData.filter(d => d.precip > 0.1 && d.precipProb > 30);
        const firstRain = rainHours.length > 0 ? rainHours[0] : null;

        if (currentHour < 11) {
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
            todayText = "📅 Rest des Tages: ";
            if (rainSumToday > 0.5) todayText += `Es bleibt unbeständig mit weiteren Regenfällen (${rainSumToday.toFixed(1)}mm). `;
            else todayText += "Der Nachmittag verläuft meist trocken und ruhig. ";
             todayText += `Werte bis ${Math.round(maxToday)}°C.`;
        } else {
            todayText = "📅 Der Abend: ";
            if (rainSumToday > 0.1) todayText += "Es kann noch etwas tröpfeln. ";
            else todayText += "Der Tag klingt ruhig aus. ";
        }
        parts.push(todayText);
    }

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

    if (tomorrowDayData.length > 0) {
        const tMax = Math.max(...tomorrowDayData.map(d => d.temp));
        const tMin = Math.min(...tomorrowDayData.map(d => d.temp)); 
        const tRain = tomorrowDayData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        const tGust = Math.max(...tomorrowDayData.map(d => d.gust));
        
        const isRainyMorning = tomorrowDayData.some(d => d.precip > 0.1 && d.precipProb > 30 && d.time.getHours() < 12);
        const isRainyAfternoon = tomorrowDayData.some(d => d.precip > 0.1 && d.precipProb > 30 && d.time.getHours() >= 12);

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
    
    const maxGustNow = Math.max(...(todayData.map(d=>d.gust)||[]), 0);
    if (maxGustNow > 60) warning = "STURMBÖEN (Heute)";
  }

  if (type === 'longterm') {
    title = "7-Tage-Wettertrend";
    const analysisData = data.slice(1);
    
    const maxTempDay = analysisData.reduce((p, c) => (p.max > c.max) ? p : c);
    const minTempDay = analysisData.reduce((p, c) => (p.max < c.max) ? p : c);
    const absoluteMin = Math.min(...analysisData.map(d => d.min)); 
    
    const rainyDays = analysisData.filter(d => parseFloat(d.rain) > 1.0);
    const sunDays = analysisData.filter(d => parseFloat(d.rain) < 0.2 && d.code <= 2);
    const windyDays = analysisData.filter(d => d.gust > 45);
    const totalRain = analysisData.reduce((acc, d) => acc + parseFloat(d.rain), 0);
    
    const avgRel = Math.round(analysisData.reduce((a, b) => a + b.reliability, 0) / analysisData.length);
    confidence = avgRel;

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

    let detailParts = [];
    
    detailParts.push(`🌡️ Temperatur-Verlauf:\nDie Woche startet mit ${Math.round(startTemp)}°C. Der Höhepunkt wird voraussichtlich am ${maxTempDay.dayNameFull} mit bis zu ${Math.round(maxTempDay.max)}°C erreicht. In den Nächten kühlt es auf ${Math.round(absoluteMin)}°C bis ${Math.round(Math.max(...analysisData.map(d=>d.min)))}°C ab.`);
    
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

    if (windyDays.length > 0) {
        const stormDay = windyDays.reduce((p,c) => p.gust > c.gust ? p : c);
        detailParts.push(`💨 Wind:\nFrischer Wind an ${windyDays.length} Tagen. Vorsicht am ${stormDay.dayNameFull}: Hier sind Böen bis ${stormDay.gust} km/h möglich.`);
    }

    const weekend = analysisData.filter(d => d.dayName === 'Sa.' || d.dayName === 'So.');
    if (weekend.length > 0) {
        const weTemp = Math.round(weekend.reduce((s, d) => s + d.max, 0) / weekend.length);
        const weRain = weekend.reduce((s, d) => s + parseFloat(d.rain), 0);
        detailParts.push(`🎉 Wochenend-Check:\n${weRain < 1 ? "Perfektes Ausflugswetter" : "Eher ungemütlich"} bei ca. ${weTemp}°C.`);
    }

    if (confidence < 60) {
        detailParts.push(`⚠️ Unsicherheit:\nDie Wettermodelle sind sich noch uneinig. Die Prognose kann sich noch ändern (nur ${confidence}% sicher).`);
    } else {
        detailParts.push(`✅ Sicherheit:\nDie Prognose ist mit ${confidence}% relativ sicher.`);
    }

    details = detailParts.join("\n\n");
    
    const stormDay = analysisData.find(d => d.gust > 70);
    if (stormDay) warning = `STURM (${stormDay.dayNameFull})`;
  }
  
  if (type === 'model-hourly') {
     title = "Modell-Check (48h)";
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
                      {dwdWarnings.map((alert, i) => (
                        <div key={i} className={`rounded-xl border-l-4 shadow-sm relative overflow-hidden transition-all duration-300 ${getDwdColorClass(alert.severity)} mb-3`}>
                          <div className="p-4 flex items-start gap-3 relative z-10">
                            <Siren className="shrink-0 animate-pulse-red mt-1" size={24} />
                            <div className="flex-1">
                              <div className="font-extrabold uppercase text-xs tracking-wider opacity-80 mb-0.5">Amtliche Warnung ({alert.severity})</div>
                              <div className="font-bold text-lg leading-tight">{alert.headline_de || alert.event_de}</div>
                               <p className="text-sm opacity-90 leading-relaxed whitespace-pre-line mt-2 border-t border-black/10 pt-2">{alert.description_de}</p>
                               <div className="text-xs font-medium opacity-70 flex flex-col sm:flex-row sm:justify-between gap-1 bg-white/30 p-2 rounded mt-2">
                                  <span><strong>Von:</strong> {new Date(alert.effective).toLocaleString('de-DE')}</span>
                                  <span><strong>Bis:</strong> {new Date(alert.expires).toLocaleString('de-DE')}</span>
                               </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
            
            <p className="text-lg text-slate-800 leading-relaxed font-semibold relative z-10 whitespace-pre-line">{summary}</p>
            
            {/* Toggle Button */}
            {details && (
                <button 
                    onClick={() => setExpanded(!expanded)} 
                    className="mt-3 text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors"
                >
                    {expanded ? "Weniger anzeigen" : "Ausführliche Details"} {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>
            )}
        </div>

        {/* EXPANDABLE DETAILS */}
        {expanded && details && (
            <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="h-px w-full bg-indigo-200/50 mb-3"></div>
                <div className="text-base text-slate-700 leading-relaxed space-y-2 whitespace-pre-line">
                    {details}
                </div>
            </div>
        )}
      </div>
    </>
  );
};

const ConfidenceGauge = ({ percentage, label }) => {
    let color = "text-red-500";
    let text = "Unsicher";
    
    if (percentage >= 80) {
        color = "text-green-500";
        text = "Sehr Sicher";
    } else if (percentage >= 50) {
        color = "text-yellow-500";
        text = "Mittel";
    }
    
    return (
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/40 border border-white/40 backdrop-blur-sm">
             <div className="relative w-16 h-16 flex items-center justify-center">
                 <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                     <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                     <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${percentage}, 100`} className={color} />
                 </svg>
                 <span className={`absolute text-sm font-bold ${color}`}>{percentage}%</span>
             </div>
             <div className="text-xs font-bold text-slate-600 uppercase mt-1">{label || text}</div>
        </div>
    );
};

const AddTripModal = ({ isOpen, onClose, onAdd }) => {
    const [step, setStep] = useState('location'); // location, dates
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [selectedLoc, setSelectedLoc] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('23:59');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!search) return;
        setLoading(true);
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search)}&count=5&language=de&format=json`);
            const data = await res.json();
            setResults(data.results || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!selectedLoc || !startDate || !endDate) return;
        onAdd({
            id: crypto.randomUUID(),
            location: selectedLoc,
            startDate,
            endDate,
            startTime,
            endTime
        });
        onClose();
        // Reset
        setStep('location');
        setSearch('');
        setSelectedLoc(null);
        setStartDate('');
        setEndDate('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Plane size={20} className="text-blue-500"/> Reise planen</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} className="text-slate-400" /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {step === 'location' ? (
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-500 uppercase">Wohin soll es gehen?</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Stadt suchen..." 
                                    className="flex-1 p-3 bg-slate-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button onClick={handleSearch} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">{loading ? <RefreshCw className="animate-spin"/> : <Search />}</button>
                            </div>
                            <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
                                {results.map((loc) => (
                                    <button 
                                        key={loc.id} 
                                        onClick={() => { setSelectedLoc({ name: loc.name, lat: loc.latitude, lon: loc.longitude, country: loc.country }); setStep('dates'); }}
                                        className="w-full p-3 text-left bg-white border border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-3"
                                    >
                                        <MapPin size={18} className="text-slate-400" />
                                        <div>
                                            <div className="font-bold text-slate-700">{loc.name}</div>
                                            <div className="text-xs text-slate-500">{loc.admin1}, {loc.country}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-3 rounded-xl flex items-center justify-between border border-blue-100">
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-blue-500" />
                                    <span className="font-bold text-blue-900">{selectedLoc.name}</span>
                                </div>
                                <button onClick={() => setStep('location')} className="text-xs font-bold text-blue-500 hover:underline">Ändern</button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Startdatum</label>
                                    <input type="date" className="w-full p-3 bg-slate-100 rounded-xl font-bold text-slate-700" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Enddatum</label>
                                    <input type="date" className="w-full p-3 bg-slate-100 rounded-xl font-bold text-slate-700" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                            </div>
                            
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Startzeit (Optional)</label>
                                    <input type="time" className="w-full p-3 bg-slate-100 rounded-xl font-bold text-slate-700" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endzeit (Optional)</label>
                                    <input type="time" className="w-full p-3 bg-slate-100 rounded-xl font-bold text-slate-700" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                                </div>
                            </div>

                            <button 
                                onClick={handleSave} 
                                disabled={!startDate || !endDate}
                                className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Reise speichern
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TripCard = ({ trip, onDelete, onClick, isActive }) => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const now = new Date();
    const isPast = end < now;
    
    return (
        <div 
            onClick={onClick}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${isActive ? 'bg-blue-50 border-blue-400 shadow-md ring-1 ring-blue-300' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'}`}
        >
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                className="absolute top-3 right-3 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition z-10"
            >
                <Trash2 size={16} />
            </button>
            
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-full ${isPast ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                    <Briefcase size={20} />
                </div>
                <div>
                    <div className="font-bold text-slate-800 text-lg leading-tight">{trip.location.name}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{trip.location.country}</div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                <Calendar size={14} className="text-slate-400" />
                <span className="font-semibold">{start.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit'})} - {end.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'2-digit'})}</span>
            </div>
            {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rotate-45"></div>}
        </div>
    );
};

// --- 5. MAIN APP COMPONENT ---

export default function WeatherApp() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState(() => getSavedLocations());
  const [trips, setTrips] = useState(() => getSavedTrips());
  const [homeLoc, setHomeLoc] = useState(() => getSavedHomeLocation());
  const [currentLoc, setCurrentLoc] = useState(homeLoc); 
  const [shortTermData, setShortTermData] = useState(null);
  const [longTermData, setLongTermData] = useState(null);
  const [dwdWarnings, setDwdWarnings] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartView, setChartView] = useState('hourly');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [sunriseSunset, setSunriseSunset] = useState({ sunrise: null, sunset: null });
  const [modelRuns, setModelRuns] = useState({ icon: '', gfs: '', arome: '' });
  const [showIosInstall, setShowIosInstall] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [viewMode, setViewMode] = useState(null);
  const [activeTripId, setActiveTripId] = useState(null);

  // Initial Location
  useEffect(() => {
    const initLocation = async () => {
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
                const dist = getDistanceFromLatLonInKm(lat, lon, homeLoc.lat, homeLoc.lon);
                if (dist < 2.0) { 
                    setCurrentLoc(homeLoc);
                } else {
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
                setCurrentLoc(homeLoc); 
            }
        );
    };

    initLocation();
  }, []);

  useEffect(() => { localStorage.setItem('weather_locations', JSON.stringify(locations)); }, [locations]);
  useEffect(() => { localStorage.setItem('weather_home_loc', JSON.stringify(homeLoc)); }, [homeLoc]);
  useEffect(() => { localStorage.setItem('weather_trips', JSON.stringify(trips)); }, [trips]);

  useEffect(() => {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIos && !isStandalone) setShowIosInstall(true);
  }, []);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
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

  const handleAddTrip = (trip) => {
      setTrips([...trips, trip]);
  };
  
  const handleDeleteTrip = (id) => {
      setTrips(trips.filter(t => t.id !== id));
      if (activeTripId === id) setActiveTripId(null);
  };

  const handleTripClick = (trip) => {
      setActiveTripId(trip.id);
      setCurrentLoc({ ...trip.location, id: 'trip_'+trip.id, type: 'trip' });
      setActiveTab('trip_analysis'); 
  };

  const handleSetHome = () => {
      setCurrentLoc(homeLoc);
      setActiveTripId(null);
  };
  
  const handleSetCurrent = () => {
    setLoading(true);
    setActiveTripId(null);
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
      // Updated to 16 days for better trip planning
      const modelsLong = "icon_seamless,gfs_seamless,arome_seamless,gem_seamless"; 
      const urlLong = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,precipitation_probability_max,sunrise,sunset&models=${modelsLong}&timezone=Europe%2FBerlin&forecast_days=16`;
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
      if (t < now && nextT && nextT > now) { } else if (t < now) { continue; }

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

      const t_spread = t_vals.length > 1 ? Math.max(...t_vals) - Math.min(...t_vals) : 0;
      const reliability = Math.round(Math.max(0, 100 - (t_spread * 15)));

      res.push({
        time: t,
        displayTime: t.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'}),
        temp: temp,
        temp_icon, temp_gfs, temp_arome, temp_knmi, temp_gem,
        precip: getAvg('precipitation'),
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
  
  // Trip Analysis Logic
  const tripAnalysis = useMemo(() => {
      if (!activeTripId) return null;
      const trip = trips.find(t => t.id === activeTripId);
      if (!trip || !processedLong.length) return null;
      
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      
      // Filter forecast for trip duration
      const relevantDays = processedLong.filter(d => {
          const dTime = new Date(d.date);
          return dTime >= start && dTime <= end;
      });
      
      if (relevantDays.length === 0) return { status: 'no_data', trip };

      const avgMax = relevantDays.reduce((a,b) => a + b.max, 0) / relevantDays.length;
      const totalRain = relevantDays.reduce((a,b) => a + parseFloat(b.rain), 0);
      const maxRainProb = Math.max(...relevantDays.map(d => d.prob));
      const avgReliability = relevantDays.reduce((a,b) => a + b.reliability, 0) / relevantDays.length;
      const badWeatherDays = relevantDays.filter(d => d.code > 45 || d.prob > 60).length;
      const sunDays = relevantDays.filter(d => d.code <= 2 && d.prob < 20).length;
      
      let verdict = "Wechselhaft";
      if (sunDays / relevantDays.length > 0.6) verdict = "Überwiegend Sonnig";
      if (badWeatherDays / relevantDays.length > 0.5) verdict = "Regnerisch / Unbeständig";
      if (avgMax > 28) verdict = "Heißes Wetter";
      if (avgMax < 5) verdict = "Kalt / Winterlich";

      return {
          status: 'ok',
          trip,
          days: relevantDays,
          avgMax,
          totalRain,
          maxRainProb,
          avgReliability,
          verdict
      };
  }, [activeTripId, trips, processedLong]);

  const liveCurrent = processedShort.length > 0 ? processedShort[0] : { temp: 0, snow: "0.0", precip: "0.0", wind: 0, gust: 0, dir: 0, code: 0, isDay: 1, appTemp: 0, humidity: 0, dewPoint: 0, uvIndex: 0 };
  const current = liveCurrent;
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

  if (loading && !processedShort.length) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${bgGradient} font-sans pb-24 overflow-hidden relative`}>
      <style>{styles}</style>
      
      {showFeedback && <div onClick={() => setShowFeedback(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"><div className="bg-white p-6 rounded-2xl max-w-sm m-4 text-center"><h3 className="text-xl font-bold mb-2 text-slate-800">Feedback Senden</h3><p className="text-slate-500 mb-4">Hilf uns, die App zu verbessern!</p><button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold" onClick={() => setShowFeedback(false)}>Alles Klar</button></div></div>}
      
      {showLocationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><MapIcon size={18} className="text-blue-500"/> Gespeicherte Orte</h3>
                    <button onClick={() => setShowLocationModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="p-4 overflow-y-auto">
                    <button onClick={handleAddLocation} className="w-full mb-4 p-3 rounded-xl border border-dashed border-blue-300 bg-blue-50 text-blue-600 font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition"><Plus size={18} /> Aktuellen Ort hinzufügen</button>
                    <div className="space-y-2">
                        {locations.map((loc, index) => (
                                <div key={index} className={`p-3 rounded-xl border flex items-center justify-between group transition ${currentLoc.name === loc.name ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                    <button onClick={() => { setCurrentLoc(loc); setShowLocationModal(false); }} className="flex items-center gap-3 flex-1 text-left">
                                        <div className={`p-2 rounded-full ${loc.type === 'home' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>{loc.type === 'home' ? <Home size={16} /> : <MapPin size={16} />}</div>
                                        <div><div className="font-bold text-slate-700 text-sm">{loc.name}</div><div className="text-[10px] text-slate-400">Lat: {loc.lat.toFixed(2)}, Lon: {loc.lon.toFixed(2)}</div></div>
                                    </button>
                                    <button onClick={() => handleDeleteLocation(index)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"><Trash2 size={16} /></button>
                                </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      <AddTripModal 
        isOpen={showTripModal} 
        onClose={() => setShowTripModal(false)} 
        onAdd={handleAddTrip} 
      />

      <header className="pt-8 px-5 flex justify-between items-start z-10 relative">
        <div className={textColor}>
          <div className="flex gap-2 mb-2">
             <button onClick={handleSetHome} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${currentLoc.id === homeLoc.id ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><Home size={14} /> Home</button>
             <button onClick={handleSetCurrent} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${currentLoc.type === 'gps' ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><Crosshair size={14} /> GPS</button>
          </div>
          <h1 className="text-3xl font-light mt-2 tracking-tight">{currentLoc.name}</h1>
          <div className="flex items-center gap-2 mt-1 opacity-80 text-xs font-medium"><Clock size={12} /><span>Stand: {lastUpdated ? lastUpdated.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'}) : '--:--'} Uhr</span></div>
        </div>
        <div className="flex flex-col gap-2 items-end">
           <div className="flex gap-2">
               <button onClick={() => setShowLocationModal(true)} className={`p-3 rounded-full backdrop-blur-md transition shadow-md ${textColor} bg-white/20 hover:bg-white/30`}><MapIcon size={20} /></button>
               <button onClick={fetchData} className={`p-3 rounded-full backdrop-blur-md bg-white/20 transition shadow-md ${textColor}`}><RefreshCw size={20} /></button>
           </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 z-10 relative space-y-6">
        
        {/* HEADER CARD - Zeigt immer aktuelles Wetter der gewählten Location */}
        <div className={`rounded-3xl p-6 ${cardBg} shadow-lg relative overflow-hidden min-h-[220px] flex items-center`}>
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40"><WeatherLandscape code={current.code} isDay={current.isDay} date={current.time} temp={current.temp} sunrise={sunriseSunset.sunrise} sunset={sunriseSunset.sunset} windSpeed={current.wind} /></div>
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex flex-col">
               <span className="text-7xl font-bold tracking-tighter leading-none drop-shadow-lg text-white">{Math.round(current.temp)}°</span>
               <div className="flex items-center gap-1.5 mt-2 opacity-90 font-medium text-sm text-white drop-shadow-md"><Thermometer size={16} /><span>Gefühlt {Math.round(current.appTemp)}°</span></div>
               <div className="mt-1 text-lg font-medium tracking-wide text-white drop-shadow-md">{weatherConf.text}</div>
            </div>
            <div className="flex flex-col gap-2 items-end text-right pl-3 border-l border-white/20 ml-2 backdrop-blur-sm bg-black/5 rounded-xl p-2">
               <div className="flex flex-col items-end mt-1"><div className={`flex items-center gap-1.5 text-sm font-bold ${windColorClass} drop-shadow-sm`}><Navigation size={14} style={{ transform: `rotate(${current.dir}deg)` }}/><span>{current.wind} <span className="text-xs font-normal opacity-80">({current.gust})</span></span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">Wind km/h</span></div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className={`p-1.5 rounded-full backdrop-blur-md flex shadow-md border border-white/20 ${cardBg}`}>
           {[{id:'overview', label:'Verlauf', icon: List}, {id:'longterm', label:'7 Tage', icon: CalendarDays}, {id:'trips', label:'Reise', icon: Plane}, {id:'chart', label:'Vergleich', icon: BarChart2}].map(tab => (
             <button key={tab.id} onClick={() => { setActiveTab(tab.id); if(tab.id !== 'trips' && activeTripId) setActiveTripId(null); }} className={`flex-1 py-3 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white/90 text-slate-900 shadow-md' : 'hover:bg-white/10 opacity-70'}`}><tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span></button>
           ))}
        </div>

        <div className={`backdrop-blur-md rounded-[32px] p-5 shadow-2xl ${cardBg} min-h-[450px]`}>
          
          {activeTab === 'overview' && (
            <div className="space-y-4">
               {!activeTripId && <AIReportBox report={dailyReport} dwdWarnings={dwdWarnings} />}
               {activeTripId && tripAnalysis && tripAnalysis.status === 'ok' && (
                   <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-slate-800">
                       <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-2"><Briefcase size={18}/> Reise-Analyse: {tripAnalysis.trip.location.name}</h3>
                       <div className="text-sm mb-4">Prognose für {new Date(tripAnalysis.trip.startDate).toLocaleDateString()} - {new Date(tripAnalysis.trip.endDate).toLocaleDateString()}</div>
                       
                       <div className="grid grid-cols-2 gap-4 mb-4">
                           <ConfidenceGauge percentage={Math.round(tripAnalysis.avgReliability)} label="Vorhersage-Güte" />
                           <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/60 border border-white/60">
                               <div className="text-3xl font-black text-slate-800 mb-1">{Math.round(tripAnalysis.avgMax)}°</div>
                               <div className="text-xs font-bold text-slate-500 uppercase">Ø Max Temp</div>
                           </div>
                       </div>
                       
                       <div className="space-y-2">
                           <div className="flex justify-between text-sm font-medium border-b border-indigo-100 pb-2">
                               <span>Wetter-Charakter</span>
                               <span className="font-bold text-indigo-700">{tripAnalysis.verdict}</span>
                           </div>
                           <div className="flex justify-between text-sm font-medium border-b border-indigo-100 pb-2">
                               <span>Regen-Risiko (Max)</span>
                               <span className={`${tripAnalysis.maxRainProb > 50 ? 'text-red-500' : 'text-green-600'} font-bold`}>{tripAnalysis.maxRainProb}%</span>
                           </div>
                       </div>
                   </div>
               )}

               <h3 className="text-sm font-bold uppercase tracking-wide opacity-70 ml-2">Stündlicher Verlauf (24h)</h3>
               <div className="overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide"> 
                  <div className="flex gap-3 w-max">
                    {displayedHours.map((row, i) => {
                      const conf = getWeatherConfig(row.code, row.isDay);
                      const HourIcon = conf.icon;
                      return (
                        <div key={i} className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-3 min-w-[100px] w-[100px] hover:bg-white/10 transition">
                          <div className="text-base font-bold opacity-90 mb-2">{row.displayTime}</div>
                          <HourIcon size={32} className="opacity-90 mb-2" />
                          <div className="text-2xl font-bold mb-1 tracking-tighter">{Math.round(row.temp)}°</div>
                          <div className="mb-2 h-4">
                             {parseFloat(row.precip) > 0 ? <span className="text-blue-400 font-bold text-xs flex items-center gap-1"><Droplets size={10}/> {row.precip.toFixed(1)}</span> : <span className="opacity-20 text-xs">-</span>}
                           </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'trips' && (
             <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Plane className="text-blue-500"/> Meine Reisen</h3>
                    <button onClick={() => setShowTripModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition flex items-center gap-2"><Plus size={16}/> Hinzufügen</button>
                </div>
                
                {trips.length === 0 ? (
                    <div className="text-center py-12 bg-white/30 rounded-3xl border border-white/40">
                        <div className="w-16 h-16 bg-blue-100 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4"><Plane size={32}/></div>
                        <h4 className="font-bold text-slate-700 text-lg mb-1">Keine Reisen geplant</h4>
                        <p className="text-slate-500 text-sm max-w-[200px] mx-auto">Fügen Sie einen Ausflug oder Urlaub hinzu, um das Wetter zu prüfen.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {trips.map(trip => (
                            <TripCard 
                                key={trip.id} 
                                trip={trip} 
                                isActive={activeTripId === trip.id}
                                onClick={() => handleTripClick(trip)}
                                onDelete={() => handleDeleteTrip(trip.id)}
                            />
                        ))}
                    </div>
                )}
                
                {activeTripId && tripAnalysis && (
                    <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-white shadow-lg">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Sparkles className="text-amber-500"/> Prognose-Übersicht</h4>
                            {tripAnalysis.status === 'ok' ? (
                                <div className="space-y-4">
                                     <div className="flex items-center gap-4">
                                         <div className="flex-1 text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                                             <div className="text-2xl font-black text-blue-600">{tripAnalysis.totalRain.toFixed(1)}<span className="text-sm font-normal text-blue-400">mm</span></div>
                                             <div className="text-[10px] font-bold uppercase text-blue-400">Gesamt-Regen</div>
                                         </div>
                                         <div className="flex-1 text-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                                             <div className="text-2xl font-black text-amber-600">{Math.round(tripAnalysis.avgMax)}°</div>
                                             <div className="text-[10px] font-bold uppercase text-amber-400">Ø Temp</div>
                                         </div>
                                     </div>
                                     
                                     <div>
                                         <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                                             <span>Unsicher</span>
                                             <span>Sicher</span>
                                         </div>
                                         <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                             <div className={`h-full ${tripAnalysis.avgReliability > 70 ? 'bg-green-500' : tripAnalysis.avgReliability > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${tripAnalysis.avgReliability}%`}}></div>
                                         </div>
                                         <p className="text-xs text-center mt-2 text-slate-500 italic">
                                             Die Prognose ist zu {Math.round(tripAnalysis.avgReliability)}% sicher. {tripAnalysis.avgReliability < 50 && "Da der Termin noch weit entfernt ist, können sich Details ändern."}
                                         </p>
                                     </div>
                                     
                                     <button onClick={() => setActiveTab('longterm')} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition">Details im Kalender ansehen</button>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-500">
                                    <p>Daten für diesen Zeitraum noch nicht verfügbar oder Zeitraum liegt in der Vergangenheit.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
             </div>
          )}

          {activeTab === 'chart' && (
            <div className="h-full flex flex-col">
               <AIReportBox report={modelReport} dwdWarnings={dwdWarnings} />
               <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedShort} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                          <XAxis dataKey="displayTime" tick={{fontSize:12, fill:'currentColor', opacity:0.7}} axisLine={false} tickLine={false} interval={3} />
                          <YAxis unit="°" tick={{fontSize:12, fill:'currentColor', opacity:0.7}} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', color:'#000'}} formatter={(value) => Math.round(value)} />
                          <Line type="monotone" dataKey="temp_icon" stroke="#93c5fd" strokeWidth={2} dot={false} name="ICON" />
                          <Line type="monotone" dataKey="temp_gfs" stroke="#d8b4fe" strokeWidth={2} dot={false} name="GFS" />
                          <Line type="monotone" dataKey="temp" stroke="#2563eb" strokeWidth={4} dot={{r:0}} name="Mittel" />
                        </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
          )}

          {activeTab === 'longterm' && (
             <div className="space-y-4">
               {!activeTripId && <AIReportBox report={longtermReport} dwdWarnings={dwdWarnings} />}
               <h3 className="text-sm font-bold uppercase tracking-wide opacity-70 ml-2">16-Tage Trend</h3>
               <div className="overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide"> 
                  <div className="flex gap-3 w-max">
                    {processedLong.map((day, i) => {
                      const DayIcon = getWeatherConfig(day.code, 1).icon;
                      const confColor = getConfidenceColor(day.reliability);
                      const isTripDay = activeTripId && tripAnalysis && tripAnalysis.days.some(d => d.dateShort === day.dateShort);
                      
                      return (
                        <div key={i} className={`flex flex-col items-center border rounded-2xl p-3 min-w-[140px] w-[140px] transition relative group ${isTripDay ? 'bg-blue-500/20 border-blue-400 ring-1 ring-blue-300' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                          {isTripDay && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full"></div>}
                          <div className="text-base font-bold opacity-90 mb-0.5">{day.dayName}</div>
                          <div className="text-xs opacity-60 mb-2">{day.dateShort}</div>
                          <DayIcon size={40} className="opacity-90 mb-2" />
                          <div className="flex items-center gap-2 mb-2 w-full justify-center">
                            <span className="text-xl font-bold text-blue-400">{Math.round(day.min)}°</span>
                            <div className="h-1 w-4 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-400 to-red-400 opacity-60" /></div>
                            <span className="text-xl font-bold text-red-400">{Math.round(day.max)}°</span>
                         </div>
                           <div className="mb-1 h-4 flex items-center justify-center w-full">
                             {parseFloat(day.rain) > 0.1 ? <span className="text-blue-400 font-bold text-xs flex items-center gap-1"><Droplets size={12}/> {day.rain}mm</span> : <span className="opacity-20 text-xs">-</span>}
                           </div>
                           <div className="mt-1 text-[10px] flex items-center gap-1 opacity-70 border border-white/10 px-2 py-0.5 rounded-full">
                              <ShieldCheck size={10} className={confColor} />
                              <span className={confColor}>{day.reliability}%</span>
                           </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}

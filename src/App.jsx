import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, RefreshCw, Info, CalendarDays, TrendingUp, Droplets, Navigation, Wind, Sun, Cloud, CloudRain, Snowflake, CloudLightning, Clock, Crosshair, Home, Download, Moon, Star, Umbrella, ShieldCheck, AlertTriangle, BarChart2, List, Database, Map, Sparkles, Thermometer, Waves, ChevronDown, ChevronUp, Save, CloudFog, Siren, X, ExternalLink, User, Share } from 'lucide-react';

// --- 1. KONSTANTEN & CONFIG ---

const DEFAULT_LOC = { name: "Jülich Daubenrath", lat: 50.938, lon: 6.388, isHome: true };

const getSavedHomeLocation = () => {
  try {
    const saved = localStorage.getItem('weather_home_loc');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error("Fehler beim Laden des Home-Standorts", e);
    return null;
  }
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
  @keyframes rain-drop { 0% { transform: translateY(-20px) scaleY(1); opacity: 0; } 20% { opacity: 0.8; } 100% { transform: translateY(180px) scaleY(1.2); opacity: 0; } }
  
  @keyframes snow-fall-slow { 
    0% { transform: translateY(-20px) translateX(-5px); opacity: 0; } 
    10% { opacity: 0.9; } 
    50% { transform: translateY(80px) translateX(5px); }
    100% { transform: translateY(180px) translateX(-10px); opacity: 0; } 
  }
  
  @keyframes snow-fall-fast { 
    0% { transform: translateY(-20px) translateX(0px); opacity: 0; } 
    10% { opacity: 0.8; } 
    100% { transform: translateY(180px) translateX(10px); opacity: 0; } 
  }

  @keyframes fog-flow { 
    0% { transform: translateX(-5%); opacity: 0.3; } 
    50% { opacity: 0.6; transform: translateX(5%); } 
    100% { transform: translateX(-5%); opacity: 0.3; } 
  }

  @keyframes ray-pulse { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
  @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
  @keyframes pulse-red { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
  @keyframes lightning-flash { 0%, 90%, 100% { opacity: 0; } 92%, 96% { opacity: 1; } }
  @keyframes sunrise-glow { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .anim-clouds { animation: float-clouds 20s ease-in-out infinite; }
  .animate-spin-slow { animation: spin-slow 12s linear infinite; }
  
  .animate-rain-1 { animation: rain-drop 0.8s infinite linear; animation-delay: 0.1s; }
  .animate-rain-2 { animation: rain-drop 0.9s infinite linear; animation-delay: 0.3s; }
  .animate-rain-3 { animation: rain-drop 0.7s infinite linear; animation-delay: 0.5s; }
  
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
  if (percent >= 80) return "bg-green-100 text-green-800 border-green-200";
  if (percent >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
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

// --- 3. KI LOGIK (OPTIMIERT FÜR REST-TAG & MORGEN) ---
const generateAIReport = (type, data) => {
  if (!data || data.length === 0) return { text: "Warte auf Daten...", warning: null };
  let warning = null;
  let text = "";

  if (type === 'daily') {
    const now = new Date();
    const currentHour = now.getHours();

    // 1. PHASE: Rest von Heute (Filtert alles Vergangene raus)
    const todayData = data.filter(d => 
        d.time.getDate() === now.getDate() && d.time.getHours() > currentHour
    );

    // 2. PHASE: Kommende Nacht (ca. 22:00 heute bis 06:00 morgen)
    // Wir nehmen einfach die Datenpunkte, die in diesem Zeitraum liegen
    // Dafür brauchen wir morgen früh
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

    // -- GENERIERUNG BERICHT --

    // Intro: Aktuelle Lage
    const current = data[0]; // Das ist immer der aktuelle Zeitpunkt (oder sehr nah dran)
    let intro = `Aktuell (${current.displayTime} Uhr): ${Math.round(current.temp)}°C`;
    if (Math.abs(current.appTemp - current.temp) > 2) intro += `, gefühlt ${Math.round(current.appTemp)}°C.`;
    
    let parts = [intro];

    // TEIL A: HEUTE (Nur wenn noch relevante Stunden übrig sind)
    if (todayData.length > 0) {
        let todayText = "";
        const maxToday = Math.max(...todayData.map(d => d.temp));
        const rainSumToday = todayData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        const codesToday = todayData.map(d => d.code);
        const isRainy = codesToday.some(c => c >= 51);
        const isSunny = codesToday.every(c => c <= 2);

        if (currentHour < 11) {
            todayText = "Heute: ";
            if (isRainy) todayText += `Regenschirm einpacken! Es kommen ca. ${rainSumToday.toFixed(1)}mm Niederschlag zusammen. `;
            else if (isSunny) todayText += "Ein freundlicher Tag steht bevor, genießen Sie die Sonne. ";
            else todayText += "Es bleibt meist bedeckt, aber weitgehend trocken. ";
            todayText += `Höchstwerte bis ${Math.round(maxToday)}°C.`;
        } else if (currentHour < 17) {
            todayText = "Im weiteren Tagesverlauf: ";
            if (isRainy) todayText += "Es bleibt unbeständig mit weiteren Schauern. ";
            else if (isSunny) todayText += "Der Nachmittag bleibt sonnig und schön. ";
            else todayText += "Keine großen Wetteränderungen bis zum Abend. ";
        } else if (currentHour < 21) {
            todayText = "Der Abend: ";
            if (isRainy) todayText += "Es kann noch etwas tröpfeln. ";
            else todayText += "Der Tag klingt ruhig aus. ";
        }
        
        if (todayText) parts.push(todayText);
    }

    // TEIL B: DIE NACHT (Kurz & Knapp)
    if (nightData.length > 0) {
        const minNight = Math.min(...nightData.map(d => d.temp));
        const rainNight = nightData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        let nightText = "In der Nacht ";
        
        if (minNight < 1) nightText += `wird es frostig bei bis zu ${Math.round(minNight)}°C. Achtung Glättegefahr!`;
        else if (minNight < 5) nightText += `frischt es auf ${Math.round(minNight)}°C auf.`;
        else nightText += `kühlt es auf milde ${Math.round(minNight)}°C ab.`;

        if (rainNight > 0.5) nightText += " Zeitweise fällt Regen.";
        else nightText += " Es bleibt trocken.";
        
        parts.push(nightText);
    }

    // TEIL C: MORGEN (Ausführlich & Konstant)
    if (tomorrowDayData.length > 0) {
        const tMax = Math.max(...tomorrowDayData.map(d => d.temp));
        const tMin = Math.min(...tomorrowDayData.map(d => d.temp)); // Tagsüber Min
        const tRain = tomorrowDayData.reduce((acc, c) => acc + parseFloat(c.precip), 0);
        const tWind = Math.max(...tomorrowDayData.map(d => d.wind));
        const tGust = Math.max(...tomorrowDayData.map(d => d.gust));
        
        // Vormittag vs Nachmittag Check für Tomorrow
        const tMorning = tomorrowDayData.filter(d => d.time.getHours() < 12);
        const tAfternoon = tomorrowDayData.filter(d => d.time.getHours() >= 12);
        
        const isRainyMorning = tMorning.some(d => d.precip > 0.1);
        const isRainyAfternoon = tAfternoon.some(d => d.precip > 0.1);

        let tomorrowText = `\n📅 Ausblick auf Morgen (${tomorrowDate.toLocaleDateString('de-DE', {weekday:'long'})}):\n`;
        tomorrowText += `Erwarten Sie Temperaturen zwischen ${Math.round(tMin)}°C am Morgen und bis zu ${Math.round(tMax)}°C am Nachmittag. `;
        
        if (tRain > 2.0) {
             if (isRainyMorning && !isRainyAfternoon) tomorrowText += "Der Vormittag startet nass, später lockert es auf.";
             else if (!isRainyMorning && isRainyAfternoon) tomorrowText += "Starten Sie trocken in den Tag, nachmittags zieht Regen auf.";
             else tomorrowText += `Ein regnerischer Tag (${tRain.toFixed(1)}mm), vergessen Sie den Schirm nicht.`;
        } else if (tRain > 0.1) {
            tomorrowText += "Vereinzelt sind kurze Schauer möglich, meist bleibt es aber trocken.";
        } else {
            // Check Cloud cover rough estimate by code
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
    
    // Globale Warnungen überschreiben alles
    const maxGustNow = Math.max(...(todayData.map(d=>d.gust)||[]), 0);
    if (maxGustNow > 60) warning = "STURMBÖEN (Heute)";

    text = parts.join("\n\n");
  }
  
  if (type === 'model-hourly') {
     // Analyse der nächsten 48h
     let totalDiff = 0;
     let driftHour = null;
     
     data.forEach(d => {
       if (d.temp_icon !== null && d.temp_gfs !== null) {
         // Wir vergleichen hier weiter ICON und GFS als Basis, da sie die Extreme darstellen
         const diff = Math.abs(d.temp_icon - d.temp_gfs);
         totalDiff += diff;
         if (diff > 3.0 && !driftHour) driftHour = d.displayTime;
       }
     });
     const avgDiff = totalDiff / data.length;

     text = `Analyse der nächsten 48 Stunden (5-Modelle-Check):\n`;
     if (avgDiff < 1.0) {
         text += "✅ Hohe Einigkeit: Alle 5 Wettermodelle (ICON, GFS, AROME, KNMI, GEM) rechnen fast identisch. Die Vorhersage ist sehr sicher.";
     } else if (avgDiff < 2.5) {
         text += "⚠️ Leichte Unsicherheiten: Die Modelle folgen dem gleichen Trend, sind sich aber bei der genauen Temperaturhöhe oder dem Timing noch nicht ganz einig.";
     } else {
         text += "❌ Große Diskrepanz: Die Wettercomputer berechnen unterschiedliche Szenarien. ";
         if (driftHour) {
            const driftH = parseInt(driftHour.split(':')[0], 10);
            const currentH = new Date().getHours();
            if (Math.abs(driftH - currentH) <= 1) {
                text += "Die Modelle sind sich bereits ab sofort uneinig. ";
            } else {
                text += `Besonders ab ${driftHour} Uhr gehen die Prognosen auseinander. `;
            }
         }
         text += "Dies deutet auf eine komplexe Wetterlage hin. Achten Sie auf das Mittel.";
         warning = "UNSICHERE PROGNOSE";
     }
  }

  if (type === 'model-daily') {
    // Reduziert auf 6 Tage
    const slicedData = data.slice(0, 6); 
    const totalDiff = slicedData.reduce((acc, d) => acc + Math.abs(d.max_icon - d.max_gfs), 0) / slicedData.length;
    const gfsTotal = slicedData.reduce((acc, d) => acc + d.max_gfs, 0);
    const iconTotal = slicedData.reduce((acc, d) => acc + d.max_icon, 0);
    
    const diff = gfsTotal - iconTotal;
    
    text = "Modellvergleich (Kommende 6 Tage):\n";
    if (Math.abs(diff) < 2) {
        text += "Die Langzeitmodelle (inkl. GEM Kanada) sind weitgehend synchron.";
    } else if (diff > 0) {
        text += "Das US-Modell (GFS) rechnet wärmer als das europäische ICON. Das kanadische GEM liegt oft dazwischen.";
    } else {
        text += "Das europäische ICON-Modell sieht die Woche wärmer, während US-Modell (GFS) und GEM eher kühler rechnen.";
    }
    
    const rainDayDiff = slicedData.find(d => {
        return Math.abs(d.max_icon - d.max_gfs) > 5;
    });

    if (rainDayDiff) {
        text += `\nBesonders am ${rainDayDiff.dayName} herrscht große Uneinigkeit (>5°C Differenz).`;
    }
  }

  if (type === 'longterm') {
    // 7 Tage Analyse (ohne Heute)
    const analysisData = data.slice(1);
    if (analysisData.length < 2) return { text: "Lade Trend...", warning: null };
    
    // Statistiken
    const maxTempDay = analysisData.reduce((p, c) => (p.max > c.max) ? p : c);
    const minTempDay = analysisData.reduce((p, c) => (p.max < c.max) ? p : c);
    const rainyDays = analysisData.filter(d => parseFloat(d.rain) > 1.0);
    const sunDays = analysisData.filter(d => parseFloat(d.rain) < 0.2 && d.code <= 2);
    
    // Berechne durchschnittliche Sicherheit und Minimum
    const avgReliability = Math.round(analysisData.reduce((a, b) => a + b.reliability, 0) / analysisData.length);
    const minRel = Math.min(...analysisData.map(d => d.reliability));

    let story = "";

    // 1. Trendlinie
    const startTemp = analysisData[0].max;
    const endTemp = analysisData[analysisData.length-1].max;
    if (endTemp > startTemp + 4) story = "Der Trend zeigt steil nach oben: Es wird spürbar wärmer in der Woche. ";
    else if (endTemp < startTemp - 4) story = "Stellen Sie sich auf Abkühlung ein: Die Temperaturen gehen im Wochenverlauf deutlich zurück. ";
    else story = "Die Temperaturen pendeln sich auf dem aktuellen Niveau ein. ";

    // 2. Highlights & Lowlights
    if (sunDays.length >= 3) story += `Freuen Sie sich auf schöne Tage, besonders am ${sunDays[0].dayName} wird es freundlich. `;
    else if (sunDays.length === 0 && rainyDays.length > 4) story += "Es bleibt leider eine graue, nasse Woche fast ohne Sonnenschein. ";
    
    // 3. Wochenende Check
    const weekend = analysisData.filter(d => d.dayName === 'Sa.' || d.dayName === 'So.');
    if (weekend.length > 0) {
        const weRain = weekend.reduce((s, d) => s + parseFloat(d.rain), 0);
        const weTemp = Math.round(weekend.reduce((s, d) => s + d.max, 0) / weekend.length);
        if (weRain < 1 && weTemp > 20) story += `\nAusblick aufs Wochenende: Perfektes Ausflugswetter bei ca. ${weTemp}°C!`;
        else if (weRain > 5) story += `\nDas Wochenende fällt voraussichtlich ins Wasser (ca. ${Math.round(weRain)}mm Regen).`;
        else story += `\nDas Wochenende wird durchwachsen bei ${weTemp}°C.`;
    }

    // 4. Prognosesicherheit im Text
    let safetyText = `\n\nTrend-Check: Die Vorhersage ist im Schnitt zu ${avgReliability}% sicher. `;
    if (minRel < 50) {
        const shakyDay = analysisData.find(d => d.reliability === minRel);
        safetyText += `Besonders ab ${shakyDay.dayName} wird die Lage unsicher (nur ${minRel}% Sicherheit).`;
    } else if (avgReliability > 80) {
        safetyText += "Die Wettermodelle sind sich ungewöhnlich einig, der Trend steht fest.";
    } else {
        safetyText += "Es gibt leichte Unsicherheiten im Detailverlauf.";
    }

    text = `${story}\n\nDer wärmste Tag wird der ${maxTempDay.dayName} (${Math.round(maxTempDay.max)}°C), am kühlsten bleibt es am ${minTempDay.dayName}.${safetyText}`;
    
    const stormDay = analysisData.find(d => d.gust > 70);
    if (stormDay) warning = `STURM AM ${stormDay.dayName.toUpperCase()}`;
  }
  return { text, warning };
};

// --- 4. KOMPONENTEN ---

const WeatherLandscape = ({ code, isDay, date, temp, sunrise, sunset }) => {
  const isNight = isDay === 0;
  const isSnow = [71, 73, 75, 77, 85, 86].includes(code);
  const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
  const isStorm = [95, 96, 99].includes(code);
  const isFog = [45, 48].includes(code);
  const isCloudy = [2, 3, 45, 48].includes(code) || isRain || isSnow || isFog;
  const isOvercast = [3, 45, 48].includes(code) || (isRain && code > 60) || isSnow || isFog; 
  
  const d = date ? new Date(date) : new Date();
  const currentHour = d.getHours() + d.getMinutes() / 60;
  
  const getDecimalHour = (isoString) => {
      if (!isoString) return null;
      // Auch hier sicher parsen
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
  
  const groundColor = isSnow ? "#e2e8f0" : (isNight ? "#1e293b" : "#4ade80"); 
  const mountainColor = isSnow ? "#f1f5f9" : (isNight ? "#334155" : "#64748b"); 
  const treeTrunk = isNight ? "#3f2e22" : "#78350f";
  const treeLeaf = isSnow ? "#f8fafc" : (isNight ? "#14532d" : "#16a34a");
  
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
           <stop offset="20%" stopColor="white" stopOpacity="0.4" />
           <stop offset="80%" stopColor="white" stopOpacity="0.4" />
           <stop offset="100%" stopColor="white" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {isDawn && <rect x="-100" y="0" width="600" height="160" fill="url(#dawnGradient)" opacity="0.3" className="anim-glow" />}
      {isDusk && <rect x="-100" y="0" width="600" height="160" fill="url(#duskGradient)" opacity="0.3" className="anim-glow" />}

      {celestialType === 'sun' && (
        <g transform={`translate(${celestialX}, ${celestialY})`}>
          <circle r="14" fill="#fbbf24" className="animate-ray" />
          <g className="animate-spin-slow">
            {[...Array(8)].map((_, i) => (
              <line key={i} x1="0" y1="-20" x2="0" y2="-16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 45})`} />
            ))}
          </g>
        </g>
      )}

      {celestialType === 'moon' && (
        <g transform={`translate(${celestialX}, ${celestialY})`}>
           <circle r="12" fill="white" opacity="0.9" />
           {moonPhase !== 4 && <circle r="12" fill="black" opacity="0.5" transform={`translate(${moonPhase < 4 ? -6 : 6}, 0)`} />}
        </g>
      )}
      
      {isNight && !isOvercast && (
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
      {isSnow && <path d="M120 40 L150 70 L90 70 Z" fill="white" />} 
      {isSnow && <path d="M320 70 L340 90 L300 90 Z" fill="white" />}

      <path d="M-50 140 Q 180 120 460 140 V 170 H -50 Z" fill={groundColor} />

      <g transform="translate(40, 130)">
         <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
         <path d="M10 0 L20 15 H0 Z" fill={treeLeaf} />
         <path d="M10 -10 L18 5 H2 Z" fill={treeLeaf} />
      </g>
      <g transform="translate(280, 125) scale(0.9)">
         <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
         <path d="M10 0 L20 15 H0 Z" fill={treeLeaf} />
         <path d="M10 -10 L18 5 H2 Z" fill={treeLeaf} />
      </g>
       <g transform="translate(240, 135) scale(0.7)">
         <rect x="8" y="10" width="4" height="10" fill={treeTrunk} />
         <path d="M10 0 L20 15 H0 Z" fill={treeLeaf} />
      </g>

      {(isCloudy || isOvercast) && (
        <g className="anim-clouds">
           <path d="M40 50 Q 55 35 70 50 T 100 50 T 120 60 H 40 Z" fill="white" fillOpacity={isOvercast ? 0.7 : 0.5} transform="translate(0,0)" />
           <path d="M240 40 Q 255 25 270 40 T 300 40 T 320 50 H 240 Z" fill="white" fillOpacity={isOvercast ? 0.7 : 0.5} transform="translate(20,10)" />
           <path d="M140 30 Q 155 15 170 30 T 200 30 T 220 40 H 140 Z" fill="white" fillOpacity={isOvercast ? 0.7 : 0.5} transform="translate(-10,5)" />
           {isOvercast && <rect x="-50" y="0" width="460" height="160" fill="black" opacity="0.15" />}
        </g>
      )}

      {isFog && (
         <g>
            <rect x="-50" y="80" width="500" height="40" fill="url(#fogGradient)" className="anim-fog-1" opacity="0.5" />
            <rect x="-50" y="100" width="500" height="50" fill="url(#fogGradient)" className="anim-fog-2" opacity="0.4" />
         </g>
      )}

      {isRain && (
         <g fill="#93c5fd" opacity="0.7">
            {[...Array(30)].map((_, i) => (
               <rect key={i} x={Math.random() * 360} y="40" width="1.5" height="12" className={`animate-rain-${i%3 === 0 ? '1' : i%3 === 1 ? '2' : '3'}`} style={{animationDelay: `${Math.random()}s`}} />
            ))}
         </g>
      )}

      {isSnow && (
         <g fill="white" opacity="0.9">
            {[...Array(50)].map((_, i) => {
               const startX = Math.random() * 360;
               const delay = Math.random() * 5;
               const size = Math.random() * 2 + 1;
               const isSlow = i % 2 === 0;
               return (
                  <circle 
                    key={i} 
                    cx={startX} 
                    cy="-10" 
                    r={size} 
                    className={isSlow ? "animate-snow-slow" : "animate-snow-fast"} 
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
         <path d="M160 30 L140 60 L155 60 L135 130" stroke="#fef08a" strokeWidth="2" fill="none" className="anim-lightning" />
      )}

    </svg>
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
  const { text, warning: localWarning } = report;
  
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
      <div className="mb-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-4 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
        
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

        {!hasDwd && localWarning && (
          <div className="mb-3 p-3 bg-red-100 border-l-4 border-red-500 text-red-900 rounded-r shadow-sm flex items-start gap-3 animate-pulse-red relative z-10">
            <AlertTriangle className="shrink-0 text-red-600 mt-0.5" size={20} />
            <div>
              <div className="font-extrabold uppercase text-xs tracking-wider mb-0.5">Wettertrend Warnung</div>
              <div className="font-bold leading-tight text-sm">{localWarning}</div>
            </div>
          </div>
        )}
        
        <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10 whitespace-pre-line">{text}</p>
      </div>
    </>
  );
};

// --- 4. MAIN APP COMPONENT ---

export default function WeatherApp() {
  const [loading, setLoading] = useState(true);
  const [homeLoc, setHomeLoc] = useState(() => {
    const saved = getSavedHomeLocation();
    return saved ? saved : DEFAULT_LOC;
  });
  const [currentLoc, setCurrentLoc] = useState(homeLoc);
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

  // NEU: iOS Erkennung
  useEffect(() => {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // Zeige Hinweis nur, wenn noch nicht installiert (standalone check)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIos && !isStandalone) {
      setShowIosInstall(true);
    }
  }, []);

  // NEU: Service Worker Registrierung mit Log
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
           console.log('SW registriert:', reg);
           reg.update(); // Erzwinge Update Check
        })
        .catch(err => console.error('SW Fehler:', err));
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('weather_home_loc');
    if (!saved && navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
           (pos) => setCurrentLoc({ name: "Mein Standort", lat: pos.coords.latitude, lon: pos.coords.longitude, isHome: false }),
           (err) => console.warn("Auto-GPS nicht möglich", err)
         );
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

  const handleSetHome = () => setCurrentLoc(homeLoc);
  const handleSaveAsHome = () => {
    const newHome = { ...currentLoc, isHome: true, name: currentLoc.name === 'Mein Standort' ? 'Mein Zuhause' : currentLoc.name };
    setHomeLoc(newHome);
    setCurrentLoc(newHome);
    localStorage.setItem('weather_home_loc', JSON.stringify(newHome));
    alert("Neuer Heimatort erfolgreich gespeichert!");
  };

  const handleSetCurrent = () => {
    setLoading(true);
    if (!navigator.geolocation) { setError("Kein GPS"); setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCurrentLoc({ name: "Mein Standort", lat: pos.coords.latitude, lon: pos.coords.longitude, isHome: false }),
      (err) => { setError("GPS verweigert"); setLoading(false); }
    );
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setDwdWarnings([]);
    try {
      const { lat, lon } = currentLoc;
      // HINZUFÜGEN von KNMI (Niederlande, super für NRW) und GEM (Kanada, globaler Check)
      const modelsShort = "icon_d2,gfs_seamless,arome_seamless,knmi_harmonie_arome_europe,gem_seamless";
      const urlShort = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,snowfall,weathercode,windspeed_10m,winddirection_10m,windgusts_10m,is_day,apparent_temperature,relative_humidity_2m,dewpoint_2m,uv_index&models=${modelsShort}&timezone=Europe%2FBerlin&forecast_days=2`;
      const modelsLong = "icon_seamless,gfs_seamless,arome_seamless,gem_seamless"; // KNMI oft nur 48h
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
    const now = new Date(); // Browser-Zeit für Vergleich (Vergangenheit ausblenden)
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

      const getVal = (key) => h[key]?.[i] ?? h[`${key}_icon_d2`]?.[i] ?? h[`${key}_gfs_seamless`]?.[i] ?? h[`${key}_arome_seamless`]?.[i] ?? 0;
      
      // Neue Modelle auslesen (wenn vorhanden)
      const temp_icon = h.temperature_2m_icon_d2?.[i] ?? null;
      const temp_gfs = h.temperature_2m_gfs_seamless?.[i] ?? null;
      const temp_arome = h.temperature_2m_arome_seamless?.[i] ?? null;
      const temp_knmi = h.temperature_2m_knmi_harmonie_arome_europe?.[i] ?? null;
      const temp_gem = h.temperature_2m_gem_seamless?.[i] ?? null;
      
      // Mittelwert jetzt aus 5 Modellen (wo verfügbar)
      const t_vals = [temp_icon, temp_gfs, temp_arome, temp_knmi, temp_gem].filter(v => v !== null && v !== undefined);
      const temp = t_vals.length > 0 ? t_vals.reduce((a,b)=>a+b,0) / t_vals.length : 0;
      
      // Auch bei Regen/Schnee/Wind alle Modelle einbeziehen
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

      res.push({
        time: t,
        displayTime: t.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'}),
        temp: temp,
        temp_icon, temp_gfs, temp_arome, temp_knmi, temp_gem,
        precip: getAvg('precipitation'),
        snow: getMax('snowfall'), // Schnee lieber Max nehmen zur Sicherheit
        wind: Math.round(getAvg('windspeed_10m')),
        gust: Math.round(getMax('windgusts_10m')), // Böen immer Max Warnung
        dir: h.winddirection_10m_icon_d2?.[i] || 0,
        code: h.weathercode_icon_d2?.[i] || 0,
        isDay: isDayArray?.[i] ?? (t.getHours() >= 6 && t.getHours() <= 21 ? 1 : 0),
        appTemp: getVal('apparent_temperature'),
        humidity: getVal('relative_humidity_2m'),
        dewPoint: getVal('dewpoint_2m'),
        uvIndex: getVal('uv_index')
      });
    }
    return res.slice(0, 48);
  }, [shortTermData]);

  const processedLong = useMemo(() => {
    if (!longTermData?.daily) return [];
    const d = longTermData.daily;
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
        dayName: new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(date),
        dateShort: formatDateShort(date),
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
  }, [longTermData]);

  const current = processedShort.length > 0 ? processedShort[0] : { temp: 0, snow: "0.0", precip: "0.0", wind: 0, gust: 0, dir: 0, code: 0, isDay: 1, appTemp: 0, humidity: 0, dewPoint: 0, uvIndex: 0 };
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

  const displayedHours = showAllHours ? processedShort.slice(0, 24) : processedShort.slice(0, 12);

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center p-8 bg-red-50 text-red-900 font-bold">{error} <button onClick={() => setCurrentLoc(homeLoc)} className="ml-4 underline">Reset</button></div>;

  return (
    <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${bgGradient} font-sans pb-20 overflow-hidden relative`}>
      <style>{styles}</style>
      
      <header className="pt-8 px-5 flex justify-between items-start z-10 relative">
        <div className={textColor}>
          <div className="flex gap-2 mb-2">
             <button onClick={handleSetHome} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${currentLoc.isHome ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><Home size={14} /> Home</button>
             <button onClick={handleSetCurrent} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${!currentLoc.isHome ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><Crosshair size={14} /> GPS</button>
             {!currentLoc.isHome && (<button onClick={handleSaveAsHome} className="px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition bg-green-500/80 text-white hover:bg-green-600 shadow-md"><Save size={14} /> Speichern</button>)}
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

           <button onClick={fetchData} className={`p-3 rounded-full backdrop-blur-md bg-white/20 transition shadow-md ${textColor}`}><RefreshCw size={20} /></button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 z-10 relative space-y-6">
        <div className={`rounded-3xl p-6 ${cardBg} shadow-lg relative overflow-hidden min-h-[240px] flex items-center`}>
          <div className="absolute inset-0 z-0 pointer-events-none"><WeatherLandscape code={current.code} isDay={current.isDay} date={current.time} temp={current.temp} sunrise={sunriseSunset.sunrise} sunset={sunriseSunset.sunset} /></div>
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex flex-col">
               <span className="text-7xl font-bold tracking-tighter leading-none drop-shadow-lg text-white">{Math.round(current.temp)}°</span>
               <div className="flex items-center gap-1.5 mt-2 opacity-90 font-medium text-sm text-white drop-shadow-md"><Thermometer size={16} /><span>Gefühlt {current.appTemp}°</span></div>
               <div className="flex items-center gap-2 mt-1 opacity-80 font-medium text-sm text-white drop-shadow-md"><span>H: {processedLong[0]?.max.toFixed(0)}°</span><span>T: {processedLong[0]?.min.toFixed(0)}°</span></div>
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
               <h3 className="text-sm font-bold uppercase tracking-wide opacity-70 ml-2">Stündlicher Verlauf</h3>
               <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {displayedHours.map((row, i) => {
                      const conf = getWeatherConfig(row.code, row.isDay);
                      const HourIcon = conf.icon;
                      return (
                        <tr key={i} className="border-b border-white/10 last:border-0 hover:bg-white/10 transition">
                          <td className="py-4 pl-2 font-medium opacity-90 whitespace-nowrap w-20 text-lg">{row.displayTime}</td>
                          <td className="py-4 px-2">
                             <div className="flex items-center gap-4">
                                <HourIcon size={24} className="opacity-80" />
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold leading-none">{row.temp.toFixed(1)}°</span>
                                    <span className="text-xs opacity-60 font-medium truncate w-20">{conf.text}</span>
                                </div>
                             </div>
                             {row.uvIndex >= 0 && <div className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${getUvBadgeClass(row.uvIndex)}`}><Sun size={8} /> UV {(row.uvIndex || 0).toFixed(0)}</div>}
                          </td>
                          <td className="py-4 px-2 text-right w-24">
                             {parseFloat(row.snow) > 0 ? <span className="text-cyan-500 font-bold whitespace-nowrap flex justify-end items-center gap-1"><Snowflake size={12}/>{row.snow.toFixed(1)}cm</span> : parseFloat(row.precip) > 0 ? <span className="text-blue-500 font-bold whitespace-nowrap flex justify-end items-center gap-1"><Droplets size={12}/>{row.precip.toFixed(1)}mm</span> : <span className="opacity-20 text-sm">-</span>}
                          </td>
                          <td className="py-4 pr-2 text-right">
                             <div className="flex flex-col items-end leading-tight">
                                <span className={`text-sm font-bold ${getWindColorClass(row.wind)}`}>{row.wind} km/h</span>
                                <span className={`text-xs opacity-80 ${getWindColorClass(row.gust)}`}>Böen {row.gust}</span>
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
               </div>
               <button onClick={() => setShowAllHours(!showAllHours)} className="w-full py-3 mt-2 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-sm font-bold uppercase tracking-wide opacity-80">{showAllHours ? <><span className="mr-1">Weniger</span> <ChevronUp size={16}/></> : <><span className="mr-1">Mehr</span> <ChevronDown size={16}/></>}</button>
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
               {processedLong.map((day, i) => {
                 const isDaySnow = parseFloat(day.snow) > 0;
                 const DayIcon = getWeatherConfig(day.code, 1).icon;
                 const confColor = getConfidenceColor(day.reliability);
                 let probColor = "text-slate-400 opacity-50"; 
                 if (day.prob >= 50) probColor = "text-blue-600 font-bold"; else if (day.prob >= 20) probColor = "text-blue-400 font-medium";

                 return (
                   <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center py-4 border-b border-white/10 last:border-0 hover:bg-white/5 transition px-2">
                      <div className="flex flex-col items-center w-14">
                         <div className="font-bold text-lg leading-none mb-1">{day.dayName}</div>
                         <div className="text-xs opacity-60 mb-2">{day.dateShort}</div>
                         <DayIcon size={28} className="opacity-90" />
                      </div>
                      <div className="flex flex-col justify-center h-full px-2">
                         <div className="flex items-center gap-2 mb-2 w-full">
                            <span className="text-lg font-bold w-8 text-right text-blue-500">{Math.round(day.min)}°</span>
                            <div className="h-2 flex-1 bg-black/10 rounded-full overflow-hidden relative">
                               <div className="absolute inset-y-0 bg-gradient-to-r from-blue-300 to-amber-300 opacity-90 w-full" />
                            </div>
                            <span className="text-lg font-bold w-8 text-red-500">{Math.round(day.max)}°</span>
                         </div>
                         <div className={`self-start px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${confColor}`}>
                             {day.reliability >= 80 ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
                             {day.reliability}% Sicher
                          </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 w-24">
                         <div className="flex items-center gap-1.5 opacity-90">
                            <div className="flex flex-col items-end leading-none">
                               <span className={`text-sm font-bold ${getWindColorClass(day.wind)}`}>{day.wind}</span>
                               <span className={`text-[10px] opacity-70 ${getWindColorClass(day.gust)}`}>({day.gust})</span>
                            </div>
                            <Navigation size={12} style={{ transform: `rotate(${day.dir}deg)` }} />
                         </div>
                         <div className="flex flex-col items-end leading-none">
                            {isDaySnow ? <span className="text-cyan-500 font-bold text-xs flex items-center gap-1"><Snowflake size={10}/> {day.snow}cm</span> : parseFloat(day.rain) > 0.1 ? <span className="text-blue-500 font-bold text-xs flex items-center gap-1"><Droplets size={10}/> {day.rain}mm</span> : <span className="text-xs opacity-20">-</span>}
                            <span className={`text-[10px] mt-1 ${probColor}`}>{day.prob > 0 ? `${day.prob}% Wahrsch.` : ''}</span>
                         </div>
                      </div>
                   </div>
                 );
               })}
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

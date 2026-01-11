import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, RefreshCw, Info, CalendarDays, TrendingUp, Droplets, Navigation, Wind, Sun, Cloud, CloudRain, Snowflake, CloudLightning, Clock, Crosshair, Home, Download, Moon, Star, Umbrella, ShieldCheck, AlertTriangle, BarChart2, List, Database, Map, Sparkles, Thermometer, Waves, ChevronDown, ChevronUp, Save, CloudFog, Siren, X, ExternalLink } from 'lucide-react';

// --- 1. KONSTANTEN & CONFIG (GANZ OBEN DEFINIERT) ---

// Standard-Standort (Fallback), falls nichts gespeichert ist UND GPS fehlschlägt
const DEFAULT_LOC = { name: "Jülich Daubenrath", lat: 50.938, lon: 6.388, isHome: true };

// Hilfsfunktion zum Laden des gespeicherten Ortes
const getSavedHomeLocation = () => {
  try {
    const saved = localStorage.getItem('weather_home_loc');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error("Fehler beim Laden des Home-Standorts", e);
    return null;
  }
};

const styles = `
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
  @keyframes float-side { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(10px); } }
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

// --- 2. HILFSFUNKTIONEN (VOR DER KOMPONENTE) ---

const formatDateShort = (date) => {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(date);
  } catch (e) {
    return "";
  }
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

// DWD Warnfarben Mapping
const getDwdColorClass = (severity) => {
  const sev = severity ? severity.toLowerCase() : 'minor';
  if (sev === 'extreme') return "bg-purple-100 border-purple-600 text-purple-900"; // Warnstufe 4
  if (sev === 'severe') return "bg-red-100 border-red-600 text-red-900"; // Warnstufe 3
  if (sev === 'moderate') return "bg-orange-100 border-orange-500 text-orange-900"; // Warnstufe 2
  return "bg-yellow-100 border-yellow-500 text-yellow-900"; // Warnstufe 1 (Minor)
};

const getModelRunTime = (intervalHours, processingDelayHours) => {
  const now = new Date();
  const currentUtcHour = now.getUTCHours();
  let effectiveHour = currentUtcHour - processingDelayHours;
  if (effectiveHour < 0) effectiveHour += 24;
  const runHourUtc = Math.floor(effectiveHour / intervalHours) * intervalHours;
  const runDate = new Date();
  if (currentUtcHour - processingDelayHours < 0) {
      runDate.setDate(runDate.getDate() - 1);
  }
  runDate.setUTCHours(runHourUtc, 0, 0, 0);
  return runDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + " Lauf";
};

const getWeatherConfig = (code, isDay = 1) => {
  const isNight = isDay === 0;
  if (code === 0) return isNight ? { text: 'Klar', icon: Moon } : { text: 'Klar', icon: Sun };
  if (code === 1) return isNight ? { text: 'Leicht bewölkt', icon: Moon } : { text: 'Leicht bewölkt', icon: Sun };
  if (code === 2) return { text: 'Bewölkt', icon: Cloud };
  if (code === 3) return { text: 'Bedeckt', icon: Cloud };
  if ([45, 48].includes(code)) return { text: 'Nebel', icon: CloudFog };
  if ([51, 53, 55].includes(code)) return { text: 'Niesel', icon: CloudRain };
  if ([61, 63].includes(code)) return { text: 'Regen', icon: CloudRain };
  if ([80, 81].includes(code)) return { text: 'Schauer', icon: CloudRain };
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

// --- 3. KI LOGIK ---
const generateAIReport = (type, data, hourlyData = null) => {
  if (!data || data.length === 0) return { text: "Analysiere Wetterdaten...", warning: null };
  let warning = null;
  let text = "";

  // Hilfsfunktion zur Bestimmung der Tageszeit-Bezeichnung
  const getTimeOfDayName = (date) => {
     const h = date.getHours();
     if (h >= 5 && h < 9) return "am Morgen";
     if (h >= 9 && h < 12) return "am Vormittag";
     if (h >= 12 && h < 14) return "am Mittag";
     if (h >= 14 && h < 18) return "am Nachmittag";
     if (h >= 18 && h < 22) return "am Abend";
     return "in der Nacht";
  };

  if (type === 'daily') {
    let rainStart = null;
    let rainStop = null;
    let windyTime = null;
    let maxGust = 0;
    let rainSum = 0;
    let snowSum = 0;
    let maxTemp = -100;
    let minTemp = 100;
    let maxUV = 0;
    
    let precipPhase1 = 0; // 0-6h
    let precipPhase2 = 0; // 6-12h
    let precipPhase3 = 0; // 12-24h
    let cloudsPhase1 = 0;
    let cloudsPhase2 = 0;

    data.forEach((d, i) => {
      const p = parseFloat(d.precip || 0);
      const s = parseFloat(d.snow || 0);
      const w = parseFloat(d.gust || 0);
      const uv = parseFloat(d.uvIndex || 0);
      const code = d.code || 0;
      
      if ((p > 0.1 || s > 0.1) && !rainStart) rainStart = d.displayTime;
      if (w > 45 && !windyTime) windyTime = d.displayTime;
      if (w > maxGust) maxGust = w;
      if (uv > maxUV) maxUV = uv;
      
      rainSum += p;
      snowSum += s;
      if (d.temp > maxTemp) maxTemp = d.temp;
      if (d.temp < minTemp) minTemp = d.temp;

      if (i < 6) {
         precipPhase1 += p;
         if (code > 2) cloudsPhase1++;
      } else if (i < 12) {
         precipPhase2 += p;
         if (code > 2) cloudsPhase2++;
      } else {
         precipPhase3 += p;
      }
      
      if (i > 0 && precipPhase1 > 0 && p < 0.1 && !rainStop) {
          rainStop = d.displayTime;
      }
    });

    if (maxGust >= 90) warning = `ORKANARTIGE BÖEN: Spitzen bis ${Math.round(maxGust)} km/h möglich! Aufenthalt im Freien meiden.`;
    else if (maxGust >= 70) warning = `STURMWARNUNG: Schwere Sturmböen bis ${Math.round(maxGust)} km/h erwartet.`;
    else if (rainSum >= 30) warning = `STARKREGEN: Warnung vor Überflutungen (${rainSum.toFixed(0)} mm erwartet).`;
    else if (snowSum >= 5) warning = `SCHNEEFALL: Vorsicht Glätte! ${snowSum.toFixed(0)} cm Neuschnee.`;
    else if (maxUV >= 8) warning = `EXTREME UV-BELASTUNG (Index ${maxUV.toFixed(0)}): Mittagssonne meiden!`;
    else if (maxTemp >= 34) warning = `EXTREME HITZE: Belastung für den Kreislauf. Viel trinken!`;
    else if (minTemp < -8) warning = `STRENGER FROST: Temperaturen fallen unter -8°C.`;
    else if (rainSum > 0 && minTemp <= 0) warning = `GLATTEISGEFAHR: Gefrierender Regen möglich.`;

    let mainPart = `In den kommenden 24 Stunden liegen die Temperaturen zwischen ${Math.round(minTemp)}°C und ${Math.round(maxTemp)}°C. `;
    
    const timePhase2 = data[6] ? getTimeOfDayName(data[6].time) : "später";
    const timePhase3 = data[12] ? getTimeOfDayName(data[12].time) : "danach";

    if (precipPhase1 > 0.2) {
        mainPart += "Aktuell und in den nächsten Stunden ist mit Niederschlag zu rechnen. ";
        if (rainStop && parseFloat(rainStop.split(':')[0]) < (new Date().getHours() + 6)) {
            mainPart += `Gegen ${rainStop} Uhr sollte es abklingen. `;
        }
    } else {
        if (cloudsPhase1 <= 2) mainPart += "Der Zeitraum beginnt überwiegend freundlich und trocken. ";
        else mainPart += "Zunächst bleibt es bewölkt, aber meist trocken. ";
    }

    if (precipPhase2 > 0.5) {
        if (precipPhase1 < 0.2) mainPart += `${timePhase2.charAt(0).toUpperCase() + timePhase2.slice(1)} zieht Regen auf. `;
        else mainPart += `Auch ${timePhase2} bleibt es unbeständig. `;
    } else {
        if (precipPhase1 > 0.5) mainPart += `${timePhase2.charAt(0).toUpperCase() + timePhase2.slice(1)} beruhigt sich das Wetter und es wird trockener. `;
        else if (cloudsPhase2 <= 2 && cloudsPhase1 > 3) mainPart += `${timePhase2.charAt(0).toUpperCase() + timePhase2.slice(1)} lockert die Bewölkung auf. `;
    }

    if (precipPhase3 > 1.0) {
        mainPart += `${timePhase3.charAt(0).toUpperCase() + timePhase3.slice(1)} folgt weiterer Niederschlag (${precipPhase3.toFixed(1)} mm).`;
    } else {
         mainPart += `${timePhase3.charAt(0).toUpperCase() + timePhase3.slice(1)} bleibt es weitgehend trocken.`;
    }

    if (snowSum > 0) mainPart += ` Achtung: Zeitweise fällt Schnee (${snowSum.toFixed(0)}cm).`;
    if (windyTime && !warning) mainPart += ` Der Wind frischt ab ${windyTime} Uhr merklich auf.`;

    text = mainPart;
  }
  
  if (type === 'model-hourly') {
     let totalDiff = 0;
     let driftHour = null;
     data.forEach(d => {
       if (d.temp_icon !== null && d.temp_gfs !== null) {
         const diff = Math.abs(d.temp_icon - d.temp_gfs);
         totalDiff += diff;
         if (diff > 2.5 && !driftHour) driftHour = d.displayTime;
       }
     });
     const avgDiff = totalDiff / data.length;

     if (avgDiff < 1.5) text = "Hohe Übereinstimmung: Die Modelle (ICON, GFS, AROME) sind sich sehr einig. Die Prognose ist sicher.";
     else if (avgDiff < 3.0) text = `Gute Übereinstimmung, aber leichte Nuancen. Die Modelle weichen in den Spitzen um bis zu ${(avgDiff + 1).toFixed(1)}°C ab, folgen aber demselben Trend.`;
     else {
       text = `Signifikante Modellunterschiede! `;
       if (driftHour) text += `Ab ca. ${driftHour} Uhr sind sich die Wettercomputer uneinig. `;
       text += `Die Temperaturprognosen klaffen auseinander. Dies deutet auf eine komplexe Wetterlage hin.`;
       warning = "UNSICHERE LAGE";
     }
  }

  if (type === 'model-daily') {
    const totalDiff = data.reduce((acc, d) => acc + Math.abs(d.max_icon - d.max_gfs), 0) / data.length;
    const driftDay = data.find(d => Math.abs(d.max_icon - d.max_gfs) > 4);
    
    const gfsTotal = data.reduce((acc, d) => acc + d.max_gfs, 0);
    const iconTotal = data.reduce((acc, d) => acc + d.max_icon, 0);
    const warmerModel = gfsTotal > iconTotal ? "GFS (US-Modell)" : "ICON (EU-Modell)";
    const diffVal = Math.abs(gfsTotal - iconTotal) / data.length;

    text = `Die Modelle weichen im Schnitt um ${totalDiff.toFixed(1)}°C voneinander ab. `;
    
    if (driftDay) {
        text += `Bis zum ${driftDay.dateShort} (${driftDay.dayName}) rechnen die Modelle ähnlich. Danach driften sie massiv auseinander (>4°C Differenz). `;
    } else {
        text += `Über den gesamten 7-Tage-Verlauf bleiben die Modelle relativ synchron. `;
    }

    if (diffVal > 1.0) {
        text += `Systematischer Unterschied: Das ${warmerModel} rechnet diese Periode konsequent wärmer.`;
    }
  }

  if (type === 'longterm') {
    const analysisData = data.slice(1);

    if (analysisData.length < 2) return { text: "Daten werden geladen...", warning: null };
    
    const warmDay = analysisData.reduce((prev, current) => (prev.max > current.max) ? prev : current);
    const coldDay = analysisData.reduce((prev, current) => (prev.min < current.min) ? prev : current);
    
    const midPoint = Math.ceil(analysisData.length / 2);
    const firstHalf = analysisData.slice(0, midPoint);
    const secondHalf = analysisData.slice(midPoint);
    
    const avg1 = firstHalf.length > 0 ? firstHalf.reduce((sum, d) => sum + d.max, 0) / firstHalf.length : 0;
    const avg2 = secondHalf.length > 0 ? secondHalf.reduce((sum, d) => sum + d.max, 0) / secondHalf.length : 0;
    
    const rainDaysTotal = analysisData.filter(d => parseFloat(d.rain) > 0.5 || parseFloat(d.snow) > 0.1).length;
    const totalPrecip = analysisData.reduce((sum, d) => sum + parseFloat(d.rain) + parseFloat(d.snow), 0);

    let trendText = "";
    if (avg2 > avg1 + 2) trendText = "Stetiger Aufwärtstrend: Es wird kontinuierlich wärmer über die kommende Woche.";
    else if (avg2 < avg1 - 2) trendText = "Der Trend zeigt klar nach unten: Wir steuern auf kühlere Tage zu.";
    else trendText = `Das Temperaturniveau bleibt stabil bei durchschnittlich ${Math.round((avg1 + avg2)/2)}°C.`;

    let precipText = "";
    if (rainDaysTotal === 0) precipText = "Außergewöhnlich: Für die nächste Woche ist kein nennenswerter Niederschlag in Sicht.";
    else if (totalPrecip > 30) precipText = `Eine nasse Woche steht bevor: Mit insgesamt ca. ${Math.round(totalPrecip)} l/m² und ${rainDaysTotal} Regentagen wird es ungemütlich.`;
    else if (rainDaysTotal > 4) precipText = "Es bleibt unbeständig mit häufigen, aber meist leichten Schauern.";
    else precipText = `Gelegentlicher Niederschlag ist an etwa ${rainDaysTotal} Tagen möglich (Gesamtmenge ca. ${Math.round(totalPrecip)} l/m²).`;

    let extremeText = `Das Temperatur-Maximum wird am ${warmDay.dayName} (${warmDay.dateShort}) mit ${Math.round(warmDay.max)}°C erreicht. `;
    if (coldDay.min < 0) extremeText += `Vorsicht: In der Nacht auf ${coldDay.dayName} ist mit Frost zu rechnen (${Math.round(coldDay.min)}°C).`;
    else extremeText += `Die kühlste Nacht wird am ${coldDay.dayName} (${Math.round(coldDay.min)}°C) erwartet.`;

    const unsafeDayIndex = analysisData.findIndex(d => d.reliability < 50);
    let safetyText = "";
    if (unsafeDayIndex === -1) safetyText = "\n\nDie Prognosesicherheit für die Woche ist hoch.";
    else if (unsafeDayIndex > 3) safetyText = `\n\nBis Wochenmitte ist die Vorhersage sehr verlässlich. Ab ${analysisData[unsafeDayIndex].dayName} nehmen die Unsicherheiten zu.`;
    else if (unsafeDayIndex !== -1) safetyText = `\n\nDie Wetterlage ist aktuell dynamisch und ab ${analysisData[unsafeDayIndex].dayName} schwer vorherzusagen.`;

    text = `${trendText}\n${precipText}\n${extremeText}${safetyText}`;

    const stormDay = analysisData.find(d => d.gust > 75);
    const heavyRainDay = analysisData.find(d => parseFloat(d.rain) > 20);
    if (stormDay) warning = `STURM-TREND: Am ${stormDay.dayName} (${stormDay.dateShort}) drohen schwere Böen bis ${Math.round(stormDay.gust)} km/h!`;
    else if (heavyRainDay) warning = `STARKREGEN-TREND: Am ${heavyRainDay.dayName} sind große Regenmengen (${heavyRainDay.rain} mm) möglich.`;
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
      const t = new Date(isoString);
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

// Einzelne Warnung in der Liste (Ausklappbar)
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

// Modal für die Warnliste
const WarningModal = ({ warnings, onClose }) => {
  if (!warnings || warnings.length === 0) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div className="flex items-center gap-2">
             <div className="bg-red-100 p-2 rounded-full text-red-600"><Siren size={20} /></div>
             <h3 className="font-bold text-lg text-slate-800">Amtliche Warnungen</h3>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} className="text-slate-500" /></button>
        </div>
        <div className="p-4 overflow-y-auto space-y-3">
           {warnings.map((alert, i) => <DwdAlertItem key={i} alert={alert} />)}
        </div>
        <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 border-t border-slate-100">Quelle: Deutscher Wetterdienst (DWD) via Brightsky</div>
      </div>
    </div>
  );
};

// Modifizierte AIReportBox mit integriertem DWD Trigger
const AIReportBox = ({ report, dwdWarnings }) => {
  const [showModal, setShowModal] = useState(false);
  if (!report) return null;
  const { text, warning: localWarning } = report;
  
  const hasDwd = dwdWarnings && dwdWarnings.length > 0;
  
  // Bestimme höchste Warnstufe für Farbe
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
        
        {/* DWD Warnung Trigger */}
        {hasDwd && (
          <button onClick={() => setShowModal(true)} className={`w-full mb-3 p-3 rounded-lg border-l-4 shadow-sm flex items-center justify-between gap-3 text-left transition hover:brightness-95 ${bannerClass}`}>
            <div className="flex items-center gap-3">
               <div className="shrink-0">{icon}</div>
               <div>
                 <div className="font-extrabold uppercase text-[10px] tracking-wider opacity-80">Amtliche Warnung</div>
                 <div className="font-bold leading-tight text-sm">{dwdWarnings.length} aktive Warnung(en)</div>
               </div>
            </div>
            <ChevronDown size={16} className="opacity-60" />
          </button>
        )}

        {/* Lokale Warnung (Fallback wenn kein DWD) */}
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

      {showModal && <WarningModal warnings={dwdWarnings} onClose={() => setShowModal(false)} />}
    </>
  );
};

// --- 4. MAIN APP COMPONENT ---

export default function WeatherApp() {
  const [loading, setLoading] = useState(true);
  
  // State für den gespeicherten Home-Standort
  const [homeLoc, setHomeLoc] = useState(() => {
    const saved = getSavedHomeLocation();
    return saved ? saved : DEFAULT_LOC;
  });

  // currentLoc startet mit dem aktuellen Home
  const [currentLoc, setCurrentLoc] = useState(homeLoc);
  
  const [shortTermData, setShortTermData] = useState(null);
  const [longTermData, setLongTermData] = useState(null);
  const [dwdWarnings, setDwdWarnings] = useState([]); // NEUER STATE für DWD Warnungen
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartView, setChartView] = useState('hourly');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAllHours, setShowAllHours] = useState(false); 
  const [sunriseSunset, setSunriseSunset] = useState({ sunrise: null, sunset: null });
  const [modelRuns, setModelRuns] = useState({ icon: '', gfs: '', arome: '' });

  useEffect(() => {
    const saved = localStorage.getItem('weather_home_loc');
    if (!saved) {
       if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
           (pos) => {
             const gpsLoc = { name: "Mein Standort", lat: pos.coords.latitude, lon: pos.coords.longitude, isHome: false };
             setCurrentLoc(gpsLoc);
           },
           (err) => {
             console.warn("Auto-GPS nicht möglich, nutze Default", err);
           }
         );
       }
    }
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

  const handleSetHome = () => setCurrentLoc(homeLoc);
  
  const handleSaveAsHome = () => {
    const newHome = { 
        ...currentLoc, 
        isHome: true, 
        name: currentLoc.name === 'Mein Standort' ? 'Mein Zuhause' : currentLoc.name 
    };
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
    setDwdWarnings([]); // Reset old warnings
    try {
      const { lat, lon } = currentLoc;
      
      const modelsShort = "icon_d2,gfs_seamless,arome_seamless";
      const urlShort = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,snowfall,weathercode,windspeed_10m,winddirection_10m,windgusts_10m,is_day,apparent_temperature,relative_humidity_2m,dewpoint_2m,uv_index&models=${modelsShort}&timezone=Europe%2FBerlin&forecast_days=2`;
      const modelsLong = "icon_seamless,gfs_seamless,arome_seamless";
      const urlLong = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,precipitation_probability_max,sunrise,sunset&models=${modelsLong}&timezone=Europe%2FBerlin&forecast_days=8`;
      const urlDwd = `https://api.brightsky.dev/alerts?lat=${lat}&lon=${lon}`;

      // Parallel fetch für alle Daten inkl. DWD (Brightsky)
      const [resShort, resLong, resDwd] = await Promise.all([
          fetch(urlShort), 
          fetch(urlLong),
          fetch(urlDwd).catch(e => ({ ok: false })) // Catch error einzeln damit App nicht crasht
      ]);

      if (!resShort.ok || !resLong.ok) throw new Error("Fehler beim Datenabruf");
      
      setShortTermData(await resShort.json());
      const longData = await resLong.json();
      setLongTermData(longData);
      
      // Verarbeite DWD Warnungen wenn vorhanden
      if (resDwd.ok) {
         const dwdJson = await resDwd.json();
         setDwdWarnings(dwdJson.alerts || []);
      }

      setLastUpdated(new Date());
      setModelRuns({ icon: getModelRunTime(3, 2.5), gfs: getModelRunTime(6, 4), arome: getModelRunTime(3, 2) });
      
      if (longData.daily && longData.daily.sunrise && longData.daily.sunrise.length > 0) {
          setSunriseSunset({ sunrise: longData.daily.sunrise[0], sunset: longData.daily.sunset[0] });
      }

    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [currentLoc]);

  // --- DATA PROCESSING SHORT ---
  const processedShort = useMemo(() => {
    if (!shortTermData?.hourly) return [];
    const h = shortTermData.hourly;
    const now = new Date();
    const res = [];
    const isDayArray = h.is_day_icon_d2 || h.is_day || h.is_day_gfs_seamless;

    for (let i = 0; i < h.time.length; i++) {
      const t = new Date(h.time[i]);
      if (t < now && i < h.time.length - 1 && new Date(h.time[i+1]) > now) {} 
      else if (t < now) continue;

      const getVal = (key) => {
          if (h[key] && h[key][i] != null) return h[key][i];
          if (h[`${key}_icon_d2`] && h[`${key}_icon_d2`][i] != null) return h[`${key}_icon_d2`][i];
          if (h[`${key}_gfs_seamless`] && h[`${key}_gfs_seamless`][i] != null) return h[`${key}_gfs_seamless`][i];
          if (h[`${key}_arome_seamless`] && h[`${key}_arome_seamless`][i] != null) return h[`${key}_arome_seamless`][i];
          return 0;
      };

      const temp_icon = h.temperature_2m_icon_d2 ? h.temperature_2m_icon_d2[i] : null;
      const temp_gfs = h.temperature_2m_gfs_seamless ? h.temperature_2m_gfs_seamless[i] : null;
      const temp_arome = h.temperature_2m_arome_seamless ? h.temperature_2m_arome_seamless[i] : null;

      const t_vals = [temp_icon, temp_gfs, temp_arome].filter(v => v !== null);
      const temp = t_vals.length > 0 ? t_vals.reduce((a,b)=>a+b,0) / t_vals.length : 0;
      
      const s_vals = Math.max(h.snowfall_icon_d2?.[i]||0, h.snowfall_gfs_seamless?.[i]||0, h.snowfall_arome_seamless?.[i]||0);
      const p_vals = ( (h.precipitation_icon_d2?.[i]||0) + (h.precipitation_gfs_seamless?.[i]||0) + (h.precipitation_arome_seamless?.[i]||0) ) / 3;
      const w_avg = ( (h.windspeed_10m_icon_d2?.[i]||0) + (h.windspeed_10m_gfs_seamless?.[i]||0) + (h.windspeed_10m_arome_seamless?.[i]||0) ) / 3;
      const w_gust = Math.max(h.windgusts_10m_icon_d2?.[i]||0, h.windgusts_10m_gfs_seamless?.[i]||0, h.windgusts_10m_arome_seamless?.[i]||0);

      const appTemp = getVal('apparent_temperature');
      const hum = getVal('relative_humidity_2m');
      const dew = getVal('dewpoint_2m');
      const uv = getVal('uv_index'); 

      let isDayVal = 1;
      if (isDayArray && isDayArray[i] !== undefined) isDayVal = isDayArray[i];
      else isDayVal = (t.getHours() >= 6 && t.getHours() <= 21) ? 1 : 0;

      res.push({
        time: t,
        displayTime: t.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'}),
        temp: Math.round(temp * 10) / 10,
        temp_icon: temp_icon,
        temp_gfs: temp_gfs,
        temp_arome: temp_arome,
        precip: isNaN(p_vals) ? "0.0" : p_vals.toFixed(1),
        snow: isNaN(s_vals) ? "0.0" : s_vals.toFixed(1),
        wind: Math.round(w_avg),
        gust: Math.round(w_gust),
        dir: h.winddirection_10m_icon_d2?.[i] || 0,
        code: h.weathercode_icon_d2?.[i] || 0,
        isDay: isDayVal,
        appTemp: Math.round(appTemp),
        humidity: Math.round(hum),
        dewPoint: Math.round(dew),
        uvIndex: uv
      });
    }
    return res.slice(0, 24);
  }, [shortTermData]);

  // --- DATA PROCESSING LONG ---
  const processedLong = useMemo(() => {
    if (!longTermData?.daily) return [];
    const d = longTermData.daily;
    return d.time.map((t, i) => {
      const date = new Date(t);
      const maxIcon = d.temperature_2m_max_icon_seamless?.[i] ?? 0;
      const maxGfs = d.temperature_2m_max_gfs_seamless?.[i] ?? 0;
      const maxArome = d.temperature_2m_max_arome_seamless?.[i] ?? null;

      const max = (maxIcon + maxGfs) / 2;
      const min = ( (d.temperature_2m_min_icon_seamless?.[i]??0) + (d.temperature_2m_min_gfs_seamless?.[i]??0) ) / 2;
      const snow = Math.max(d.snowfall_sum_icon_seamless?.[i]||0, d.snowfall_sum_gfs_seamless?.[i]||0);
      const rain = Math.max(d.precipitation_sum_icon_seamless?.[i]||0, d.precipitation_sum_gfs_seamless?.[i]||0);
      const wind = Math.max(d.windspeed_10m_max_icon_seamless?.[i]||0, d.windspeed_10m_max_gfs_seamless?.[i]||0);
      const gust = Math.max(d.windgusts_10m_max_icon_seamless?.[i]||0, d.windgusts_10m_max_gfs_seamless?.[i]||0);
      
      const tempDiff = Math.abs(maxIcon - maxGfs);
      let confidence = 100 - (tempDiff * 15) - (i * 2);
      if (confidence < 10) confidence = 10;
      if (confidence > 100) confidence = 100;
      
      const probIcon = d.precipitation_probability_max_icon_seamless ? d.precipitation_probability_max_icon_seamless[i] : null;
      const probGfs = d.precipitation_probability_max_gfs_seamless ? d.precipitation_probability_max_gfs_seamless[i] : null;
      let prob = 0;
      if (probIcon !== null && probGfs !== null) prob = Math.round((probIcon + probGfs) / 2);
      else if (probIcon !== null) prob = probIcon;
      else if (probGfs !== null) prob = probGfs;

      return {
        date,
        dayName: new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(date),
        dateShort: formatDateShort(date),
        max: parseFloat(max.toFixed(1)),
        min: parseFloat(min.toFixed(1)),
        max_icon: maxIcon,
        max_gfs: maxGfs,
        max_arome: maxArome,
        rain: isNaN(rain) ? "0.0" : rain.toFixed(1),
        snow: isNaN(snow) ? "0.0" : snow.toFixed(1),
        wind: Math.round(wind),
        gust: Math.round(gust),
        dir: d.winddirection_10m_dominant_icon_seamless?.[i] || 0,
        code: d.weathercode_icon_seamless?.[i] || 0,
        reliability: Math.round(confidence),
        prob: prob
      };
    });
  }, [longTermData]);

  const current = processedShort.length > 0 ? processedShort[0] : { temp: 0, snow: "0.0", precip: "0.0", wind: 0, gust: 0, dir: 0, code: 0, isDay: 1, appTemp: 0, humidity: 0, dewPoint: 0, uvIndex: 0 };
  const todayForecast = processedLong.length > 0 ? processedLong[0] : { rain: "0.0", snow: "0.0", max: 0, min: 0 };
  const dailyRainSum = todayForecast.rain;
  const dailySnowSum = todayForecast.snow;
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

  const displayedHours = showAllHours ? processedShort : processedShort.slice(0, 12);

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
             {!currentLoc.isHome && (
                <button onClick={handleSaveAsHome} className="px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition bg-green-500/80 text-white hover:bg-green-600 shadow-md">
                   <Save size={14} /> Speichern
                </button>
             )}
          </div>
          <h1 className="text-3xl font-light mt-2 tracking-tight">{currentLoc.name}</h1>
          <div className="flex items-center gap-2 mt-1 opacity-80 text-xs font-medium"><Clock size={12} /><span>Stand: {lastUpdated ? lastUpdated.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'}) : '--:--'} Uhr</span></div>
        </div>
        <div className="flex flex-col gap-2">
           {deferredPrompt && (<button onClick={handleInstallClick} className="p-3 rounded-full backdrop-blur-md bg-blue-600 text-white animate-pulse"><Download size={20} /></button>)}
           <button onClick={fetchData} className={`p-3 rounded-full backdrop-blur-md bg-white/20 transition shadow-md ${textColor}`}><RefreshCw size={20} /></button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 z-10 relative space-y-6">
        
        <div className={`rounded-3xl p-6 ${cardBg} shadow-lg relative overflow-hidden min-h-[240px] flex items-center`}>
          <div className="absolute inset-0 z-0 pointer-events-none">
             <WeatherLandscape code={current.code} isDay={current.isDay} date={current.time} temp={current.temp} sunrise={sunriseSunset.sunrise} sunset={sunriseSunset.sunset} />
          </div>

          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex flex-col">
               <span className="text-7xl font-bold tracking-tighter leading-none drop-shadow-lg text-white">{Math.round(current.temp)}°</span>
               <div className="flex items-center gap-1.5 mt-2 opacity-90 font-medium text-sm text-white drop-shadow-md"><Thermometer size={16} /><span>Gefühlt {current.appTemp}°</span></div>
               <div className="flex items-center gap-2 mt-1 opacity-80 font-medium text-sm text-white drop-shadow-md"><span>H: {processedLong[0]?.max}°</span><span>T: {processedLong[0]?.min}°</span></div>
               <div className="mt-1 text-lg font-medium tracking-wide text-white drop-shadow-md">{weatherConf.text}</div>
            </div>
            
            <div className="flex flex-col gap-2 items-end text-right pl-3 border-l border-white/20 ml-2 backdrop-blur-sm bg-black/5 rounded-xl p-2">
               <div className="flex flex-col items-end">
                  <div className={`flex items-center gap-1 opacity-90 text-sm font-bold ${getUvColorClass(current.uvIndex)} drop-shadow-sm`}><Sun size={14} /> <span>{current.uvIndex}</span></div>
                  <span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">UV</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end"><div className="flex items-center gap-1 opacity-90 text-sm font-bold text-white drop-shadow-sm"><Waves size={14} /> <span>{current.humidity}%</span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">Feuchte</span></div>
                  <div className="flex flex-col items-end"><div className="flex items-center gap-1 opacity-90 text-sm font-bold text-white drop-shadow-sm"><Thermometer size={14} /> <span>{current.dewPoint}°</span></div><span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">Taupkt.</span></div>
               </div>
               <div className="flex flex-col items-end mt-1">
                  <div className={`flex items-center gap-1.5 text-sm font-bold ${windColorClass} drop-shadow-sm`}><Navigation size={14} style={{ transform: `rotate(${current.dir}deg)` }}/><span>{current.wind} <span className="text-xs font-normal opacity-80">({current.gust})</span></span></div>
                  <span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">Wind (Böen) km/h</span>
               </div>
               {(parseFloat(dailyRainSum) > 0 || parseFloat(dailySnowSum) > 0) && (
                 <div className="flex flex-col items-end mt-1">
                    <div className="flex items-center gap-1.5 opacity-90 text-sm font-bold text-blue-300 drop-shadow-sm">{isSnowing ? <Snowflake size={14}/> : <CloudRain size={14}/>}<span>{isSnowing ? dailySnowSum : dailyRainSum} {isSnowing ? 'cm' : 'mm'}</span></div>
                    <span className="text-[9px] opacity-80 uppercase font-bold text-white drop-shadow-sm">Niederschlag (24h)</span>
                 </div>
               )}
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
                                    <span className="text-xl font-bold leading-none">{row.temp}°</span>
                                    <span className="text-xs opacity-60 font-medium truncate w-20">{conf.text}</span>
                                </div>
                             </div>
                             {row.uvIndex >= 0 && <div className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${getUvBadgeClass(row.uvIndex)}`}><Sun size={8} /> UV {(row.uvIndex || 0).toFixed(0)}</div>}
                          </td>
                          <td className="py-4 px-2 text-right w-24">
                             {parseFloat(row.snow) > 0 ? (
                               <span className="text-cyan-500 font-bold whitespace-nowrap flex justify-end items-center gap-1"><Snowflake size={12}/>{row.snow}cm</span>
                             ) : parseFloat(row.precip) > 0 ? (
                               <span className="text-blue-500 font-bold whitespace-nowrap flex justify-end items-center gap-1"><Droplets size={12}/>{row.precip}mm</span>
                             ) : (<span className="opacity-20 text-sm">-</span>)}
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
                    <button onClick={() => setChartView('daily')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${chartView==='daily' ? 'bg-white text-black shadow-sm' : 'opacity-60'}`}>7 Tage</button>
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
                          <Line type="monotone" dataKey="temp" stroke="#2563eb" strokeWidth={4} dot={{r:0}} name="Mittel" />
                        </LineChart>
                      ) : (
                        <LineChart data={processedLong} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                          <XAxis dataKey="dateShort" tick={{fontSize:12, fill:'currentColor', opacity:0.7}} axisLine={false} tickLine={false} interval={0} />
                          <YAxis unit="°" tick={{fontSize:12, fill:'currentColor', opacity:0.7}} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', color:'#000'}} />
                          <Line type="monotone" dataKey="max_icon" stroke="#93c5fd" strokeWidth={3} dot={{r:3}} name="ICON Max" />
                          <Line type="monotone" dataKey="max_gfs" stroke="#d8b4fe" strokeWidth={3} dot={{r:3}} name="GFS Max" />
                          <Line type="monotone" dataKey="max_arome" stroke="#86efac" strokeWidth={3} dot={{r:3}} name="AROME Max" connectNulls={false} />
                        </LineChart>
                      )}
                  </ResponsiveContainer>
               </div>
               <div className="flex justify-center gap-4 mt-6 text-xs font-medium opacity-80 flex-wrap">
                  {chartView === 'hourly' ? (<><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-300"></div> ICON</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-300"></div> GFS</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-300"></div> AROME</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Ø</span></>) : (<><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-300"></div> ICON</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-300"></div> GFS</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-300"></div> AROME</span></>)}
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
                            {isDaySnow ? (
                               <span className="text-cyan-500 font-bold text-xs flex items-center gap-1"><Snowflake size={10}/> {day.snow}cm</span>
                            ) : parseFloat(day.rain) > 0.1 ? (
                               <span className="text-blue-500 font-bold text-xs flex items-center gap-1"><Droplets size={10}/> {day.rain}mm</span>
                            ) : (<span className="text-xs opacity-20">-</span>)}
                            <span className={`text-[10px] mt-1 ${probColor}`}>{day.prob > 0 ? `${day.prob}% Wahrsch.` : ''}</span>
                         </div>
                      </div>
                   </div>
                 );
               })}
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

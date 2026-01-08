import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MapPin, RefreshCw, Info, CalendarDays, TrendingUp, Droplets, Navigation, Wind, Sun, Cloud, CloudRain, Snowflake, CloudLightning, Clock, Crosshair, Home, Download, Moon, Star, Umbrella, ShieldCheck, AlertTriangle, BarChart2, List, Database, Map, AlertOctagon } from 'lucide-react';

// --- STYLE INJECTION ---
const styles = `
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
  @keyframes float-side { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(10px); } }
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes rain-drop { 0% { transform: translateY(-10px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(20px); opacity: 0; } }
  @keyframes snow-fall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(30px) rotate(180deg); opacity: 0; } }
  @keyframes ray-pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
  @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
  @keyframes pulse-red { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-side { animation: float-side 8s ease-in-out infinite; }
  .animate-spin-slow { animation: spin-slow 12s linear infinite; }
  .animate-rain-1 { animation: rain-drop 1s infinite linear; animation-delay: 0.1s; }
  .animate-rain-2 { animation: rain-drop 1s infinite linear; animation-delay: 0.3s; }
  .animate-rain-3 { animation: rain-drop 1s infinite linear; animation-delay: 0.5s; }
  .animate-snow-1 { animation: snow-fall 3s infinite linear; animation-delay: 0.2s; }
  .animate-snow-2 { animation: snow-fall 3s infinite linear; animation-delay: 1.5s; }
  .animate-snow-3 { animation: snow-fall 3s infinite linear; animation-delay: 0.8s; }
  .animate-ray { animation: ray-pulse 3s infinite ease-in-out; }
  .animate-twinkle-1 { animation: twinkle 3s infinite ease-in-out; animation-delay: 0.5s; }
  .animate-twinkle-2 { animation: twinkle 4s infinite ease-in-out; animation-delay: 1.5s; }
  .animate-twinkle-3 { animation: twinkle 5s infinite ease-in-out; animation-delay: 2.5s; }
  .animate-pulse-red { animation: pulse-red 2s infinite ease-in-out; }
`;

// --- CONFIG ---
const DAUBENRATH_LOC = { name: "Jülich Daubenrath", lat: 50.938, lon: 6.388, isHome: true };

// --- HELPERS ---
const getWindColorClass = (speed) => {
  if (speed >= 60) return "text-red-600 font-extrabold";
  if (speed >= 40) return "text-orange-500 font-bold";
  if (speed >= 20) return "text-blue-500 font-bold";
  return "text-slate-600 font-medium";
};

const getConfidenceColor = (percent) => {
  if (percent >= 80) return "bg-green-100 text-green-800 border-green-200";
  if (percent >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
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
  if ([45, 48].includes(code)) return { text: 'Nebel', icon: Cloud };
  if ([51, 53, 55].includes(code)) return { text: 'Niesel', icon: CloudRain };
  if ([61, 63].includes(code)) return { text: 'Regen', icon: CloudRain };
  if ([80, 81].includes(code)) return { text: 'Schauer', icon: CloudRain };
  if ([65, 82].includes(code)) return { text: 'Starkregen', icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: 'Schnee', icon: Snowflake };
  if ([95, 96, 99].includes(code)) return { text: 'Gewitter', icon: CloudLightning };
  return { text: 'Unbekannt', icon: Info };
};

// --- ADVANCED AI GENERATION LOGIC ---
const generateAIReport = (type, data) => {
  if (!data || data.length === 0) return { text: "Analysiere Wetterdaten...", warning: null };

  let warning = null;
  let text = "";

  // 1. DAILY REPORT
  if (type === 'daily') {
    const hour = new Date().getHours();
    const greeting = hour < 10 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
    
    let rainStart = null;
    let windyTime = null;
    let maxGust = 0;
    let rainSum = 0;
    let snowSum = 0;
    let maxTemp = -100;
    let minTemp = 100;
    
    data.forEach(d => {
      const p = parseFloat(d.precip || 0);
      const s = parseFloat(d.snow || 0);
      const w = parseFloat(d.gust || 0);
      
      if ((p > 0.1 || s > 0.1) && !rainStart) rainStart = d.displayTime;
      if (w > 45 && !windyTime) windyTime = d.displayTime;
      if (w > maxGust) maxGust = w;
      
      rainSum += p;
      snowSum += s;
      if (d.temp > maxTemp) maxTemp = d.temp;
      if (d.temp < minTemp) minTemp = d.temp;
    });

    if (maxGust >= 90) warning = `ORKANARTIGE BÖEN: Spitzen bis ${Math.round(maxGust)} km/h möglich!`;
    else if (maxGust >= 70) warning = `STURMWARNUNG: Schwere Sturmböen bis ${Math.round(maxGust)} km/h erwartet.`;
    else if (rainSum >= 30) warning = `STARKREGEN: Warnung vor Überflutungen (${rainSum.toFixed(0)} mm erwartet).`;
    else if (snowSum >= 5) warning = `SCHNEEFALL: Vorsicht Glätte! ${snowSum.toFixed(0)} cm Neuschnee.`;
    else if (maxTemp >= 34) warning = `EXTREME HITZE: Belastung für den Kreislauf. Viel trinken!`;
    else if (minTemp < -8) warning = `STRENGER FROST: Temperaturen fallen unter -8°C.`;
    else if (rainSum > 0 && minTemp <= 0) warning = `GLATTEISGEFAHR: Gefrierender Regen möglich.`;

    let mainPart = `Heute erreichen wir maximal ${Math.round(maxTemp)}°C. `;
    
    if (snowSum > 0.5) {
       mainPart += rainStart ? `Ab ${rainStart} Uhr ist mit Schneefall zu rechnen (${snowSum.toFixed(1)} cm). ` : `Es wird zeitweise schneien. `;
    } else if (rainSum > 0.5) {
       mainPart += rainStart ? `Ab ${rainStart} Uhr zieht Nässe auf (${rainSum.toFixed(1)} mm). ` : `Es bleibt nicht ganz trocken (${rainSum.toFixed(1)} mm). `;
    } else {
       mainPart += "Es bleibt voraussichtlich trocken. ";
    }

    if (windyTime && !warning) {
      mainPart += `Gegen ${windyTime} Uhr frischen die Böen auf (${Math.round(maxGust)} km/h).`;
    }

    text = `${greeting}! ${mainPart}`;
  }

  // 2. MODEL CHECK (HOURLY)
  if (type === 'model-hourly') {
    let totalDiff = 0;
    data.forEach(d => {
      if (d.temp_icon !== null && d.temp_gfs !== null) {
        totalDiff += Math.abs(d.temp_icon - d.temp_gfs);
      }
    });
    const avgDiff = totalDiff / data.length;

    if (avgDiff < 1.0) text = "Hohe Übereinstimmung: Die Modelle (ICON, GFS, AROME) sind sich sehr einig. Die Prognose ist sicher.";
    else if (avgDiff < 2.5) text = "Leichte Unsicherheiten: Die Modelle weichen stellenweise um 1-2 Grad ab.";
    else {
      text = "Modell-Chaos: GFS und ICON driften stark auseinander. Genaue Prognose schwierig.";
      warning = "UNSICHERE LAGE: Modelle widersprechen sich stark.";
    }
  }

  // 3. MODEL CHECK (DAILY / 14 DAYS) - JETZT AUSFÜHRLICH
  if (type === 'model-daily') {
    const totalDiff = data.reduce((acc, d) => acc + Math.abs(d.max_icon - d.max_gfs), 0) / data.length;
    
    // Finde den Tag an dem sie auseinander driften (Differenz > 3 Grad)
    const driftDay = data.find(d => Math.abs(d.max_icon - d.max_gfs) > 3);
    const driftDate = driftDay ? driftDay.dateShort : null;

    // Wer ist wärmer?
    const gfsTotal = data.reduce((acc, d) => acc + d.max_gfs, 0);
    const iconTotal = data.reduce((acc, d) => acc + d.max_icon, 0);
    const warmerModel = gfsTotal > iconTotal ? "GFS (US-Modell)" : "ICON (EU-Modell)";
    const diffVal = Math.abs(gfsTotal - iconTotal) / data.length;

    text = `Die Modelle weichen im Schnitt um ${totalDiff.toFixed(1)}°C voneinander ab. `;
    
    if (driftDate) {
        text += `Bis zum ${driftDate} herrscht relative Einigkeit, danach driften die Berechnungen spürbar auseinander. `;
    } else {
        text += `Der gesamte 14-Tage-Verlauf wird von beiden Modellen erstaunlich ähnlich eingeschätzt. `;
    }

    if (diffVal > 1.5) {
        text += `Insgesamt rechnet das ${warmerModel} für die kommenden zwei Wochen deutlich wärmer.`;
    } else {
        text += `Es gibt keinen klaren "kalten" oder "warmen" Ausreißer unter den Modellen.`;
    }
  }

  // 4. LONG TERM TREND - JETZT NOCH AUSFÜHRLICHER
  if (type === 'longterm') {
    const warmDay = data.reduce((prev, current) => (prev.max > current.max) ? prev : current);
    const coldDay = data.reduce((prev, current) => (prev.min < current.min) ? prev : current);
    
    // Wochen-Analyse
    const midPoint = Math.ceil(data.length / 2);
    const firstWeek = data.slice(0, midPoint);
    const secondWeek = data.slice(midPoint);
    
    const avgFirst = firstWeek.reduce((sum, d) => sum + d.max, 0) / firstWeek.length;
    const avgSecond = secondWeek.reduce((sum, d) => sum + d.max, 0) / secondWeek.length;
    
    const rainDaysTotal = data.filter(d => parseFloat(d.rain) > 0.5 || parseFloat(d.snow) > 0.1).length;
    const totalPrecip = data.reduce((sum, d) => sum + parseFloat(d.rain) + parseFloat(d.snow), 0);

    // Trend Text
    let trendText = "";
    if (avgSecond > avgFirst + 3) trendText = "Nach einem kühleren Start steigen die Temperaturen in der zweiten Woche deutlich an.";
    else if (avgSecond < avgFirst - 3) trendText = "Genießen Sie die aktuellen Temperaturen – zur zweiten Woche hin kühlt es spürbar ab.";
    else trendText = `Das Temperaturniveau bleibt stabil bei durchschnittlich ${Math.round((avgFirst + avgSecond)/2)}°C.`;

    // Precipitation Text
    let rainText = "";
    if (rainDaysTotal === 0) rainText = "Es wird eine sehr trockene Phase erwartet.";
    else if (rainDaysTotal <= 3) rainText = `Es bleibt überwiegend trocken, nur an wenigen Tagen (${rainDaysTotal}) ist mit etwas Niederschlag zu rechnen.`;
    else rainText = `Es wird wechselhaft: An ${rainDaysTotal} von ${data.length} Tagen ist Niederschlag möglich (Gesamtmenge ca. ${Math.round(totalPrecip)} l/m²).`;

    // Extremes
    let extremeText = `Der Höchstwert wird am ${warmDay.dayName} (${warmDay.dateShort}) mit ${Math.round(warmDay.max)}°C erreicht. `;
    if (coldDay.min < 0) extremeText += `Vorsicht: In der Nacht auf ${coldDay.dayName} droht Frost (${Math.round(coldDay.min)}°C).`;
    else extremeText += `Die kühlste Nacht erwartet uns am ${coldDay.dayName} mit ${Math.round(coldDay.min)}°C.`;

    text = `Analyse: ${trendText} ${rainText} ${extremeText}`;

    // Warnings
    const stormDay = data.find(d => d.gust > 75);
    const heavyRainDay = data.find(d => parseFloat(d.rain) > 20);
    if (stormDay) warning = `STURM-TREND: Am ${stormDay.dayName} drohen schwere Böen bis ${Math.round(stormDay.gust)} km/h!`;
    else if (heavyRainDay) warning = `STARKREGEN-TREND: Am ${heavyRainDay.dayName} sind große Regenmengen (${heavyRainDay.rain} mm) möglich.`;
  }

  return { text, warning };
};

// --- ANIMATION COMPONENT ---
const WeatherAnimation = ({ type, isDay, date }) => {
  const isNight = isDay === 0;
  const cloudColor = "white"; 
  const cloudOpacity = 0.9;
  
  const getMoonPhase = (d) => {
      const dateObj = new Date(d);
      const newMoon = new Date(2000, 0, 6, 18, 14).getTime();
      const phaseSeconds = 2551443; 
      let sec = (dateObj.getTime() - newMoon) / 1000;
      let currentSec = sec % phaseSeconds;
      if (currentSec < 0) currentSec += phaseSeconds;
      return Math.round((currentSec / phaseSeconds) * 8) % 8;
  };
  const phase = useMemo(() => date ? getMoonPhase(date) : 0, [date]);

  const getMoonPath = (p) => {
    switch(p) {
      case 0: return <circle cx="50" cy="40" r="16" fill="none" stroke="#fef08a" strokeWidth="1" opacity="0.3" />;
      case 1: return <path d="M50,24 A16,16 0 1,1 50,56 A12,16 0 0,0 50,24 Z" fill="#fef08a" />; 
      case 2: return <path d="M50,24 A16,16 0 0,1 50,56 L50,24 Z" fill="#fef08a" />; 
      case 3: return <path d="M50,24 A16,16 0 1,1 50,56 A12,16 0 0,1 50,24 Z" fill="#fef08a" />; 
      case 4: return <circle cx="50" cy="40" r="16" fill="#fef08a" />; 
      case 5: return <path d="M50,24 A16,16 0 1,0 50,56 A12,16 0 0,0 50,24 Z" fill="#fef08a" />; 
      case 6: return <path d="M50,24 A16,16 0 0,0 50,56 L50,24 Z" fill="#fef08a" />; 
      case 7: return <path d="M50,24 A16,16 0 1,0 50,56 A12,16 0 0,1 50,24 Z" fill="#fef08a" />; 
      default: return <circle cx="50" cy="40" r="16" fill="#fef08a" />;
    }
  };

  if (isNight && (type === 'sunny' || type === 'clear-night')) {
    return (
      <svg viewBox="0 0 100 100" className="w-40 h-40">
         <circle cx="20" cy="20" r="1.5" fill="white" className="animate-twinkle-1" />
         <circle cx="80" cy="30" r="1" fill="white" className="animate-twinkle-2" />
         <circle cx="50" cy="10" r="1.5" fill="white" className="animate-twinkle-3" />
         <g className="animate-float" filter="drop-shadow(0 0 12px rgba(254, 240, 138, 0.4))">
            {getMoonPath(phase)}
         </g>
      </svg>
    );
  }
  if (!isNight && type === 'sunny') {
    return (
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        <circle cx="50" cy="50" r="20" fill="#fbbf24" className="animate-ray" />
        <g className="animate-spin-slow origin-center">
          {[...Array(8)].map((_, i) => (
            <line key={i} x1="50" y1="20" x2="50" y2="10" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" transform={`rotate(${i * 45} 50 50)`} />
          ))}
        </g>
      </svg>
    );
  }
  return (
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        <path d="M25,60 Q35,45 50,55 T75,60 T90,65 T85,80 T25,80 Z" fill={cloudColor} fillOpacity={cloudOpacity} className="animate-float" />
        <path d="M10,70 Q20,55 35,65 T60,70 T75,75 T70,90 T10,90 Z" fill={cloudColor} fillOpacity="0.7" className="animate-float-side" style={{animationDelay: '1s'}} />
        {(type === 'rainy' || type === 'heavy-rain') && (
           <g fill="#93c5fd"><circle cx="35" cy="75" r="3" className="animate-rain-1" /><circle cx="65" cy="75" r="3" className="animate-rain-2" /></g>
        )}
      </svg>
  );
};

// --- AI REPORT BOX (OHNE HEADER) ---
const AIReportBox = ({ report }) => {
  const { text, warning } = report;
  if (!text && !warning) return null;

  return (
    <div className="mb-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-4 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
      
      {/* WARNUNG (Falls vorhanden) */}
      {warning && (
        <div className="mb-3 p-3 bg-red-100 border-l-4 border-red-500 text-red-900 rounded-r shadow-sm flex items-start gap-3 animate-pulse-red relative z-10">
          <AlertTriangle className="shrink-0 text-red-600 mt-0.5" size={20} />
          <div>
            <div className="font-extrabold uppercase text-xs tracking-wider mb-0.5">Wetterwarnung</div>
            <div className="font-bold leading-tight text-sm">{warning}</div>
          </div>
        </div>
      )}

      {/* NORMALER BERICHT */}
      <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10">
        {text}
      </p>
    </div>
  );
};

const formatDateShort = (date) => new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(date);

export default function WeatherApp() {
  const [loading, setLoading] = useState(true);
  const [currentLoc, setCurrentLoc] = useState(DAUBENRATH_LOC);
  const [shortTermData, setShortTermData] = useState(null);
  const [longTermData, setLongTermData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartView, setChartView] = useState('hourly');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const [modelRuns, setModelRuns] = useState({ icon: '', gfs: '', arome: '' });

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

  const handleSetHome = () => setCurrentLoc(DAUBENRATH_LOC);
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
    try {
      const { lat, lon } = currentLoc;
      const modelsShort = "icon_d2,gfs_seamless,arome_seamless";
      const urlShort = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,snowfall,weathercode,windspeed_10m,winddirection_10m,windgusts_10m,is_day&models=${modelsShort}&timezone=Europe%2FBerlin&forecast_days=2`;
      const modelsLong = "icon_seamless,gfs_seamless,arome_seamless";
      const urlLong = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,precipitation_probability_max&models=${modelsLong}&timezone=Europe%2FBerlin&forecast_days=14`;

      const [resShort, resLong] = await Promise.all([fetch(urlShort), fetch(urlLong)]);
      if (!resShort.ok || !resLong.ok) throw new Error("Fehler beim Datenabruf");
      setShortTermData(await resShort.json());
      setLongTermData(await resLong.json());
      setLastUpdated(new Date());
      
      setModelRuns({
          icon: getModelRunTime(3, 2.5), 
          gfs: getModelRunTime(6, 4),    
          arome: getModelRunTime(3, 2)   
      });

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

      const t_vals = [h.temperature_2m_icon_d2[i], h.temperature_2m_gfs_seamless[i], h.temperature_2m_arome_seamless[i]].filter(v => v !== null);
      const temp = t_vals.length > 0 ? t_vals.reduce((a,b)=>a+b,0) / t_vals.length : 0;
      
      const s_vals = Math.max(h.snowfall_icon_d2[i]||0, h.snowfall_gfs_seamless[i]||0, h.snowfall_arome_seamless[i]||0);
      const p_vals = ( (h.precipitation_icon_d2[i]||0) + (h.precipitation_gfs_seamless[i]||0) + (h.precipitation_arome_seamless[i]||0) ) / 3;
      const w_avg = ( (h.windspeed_10m_icon_d2[i]||0) + (h.windspeed_10m_gfs_seamless[i]||0) + (h.windspeed_10m_arome_seamless[i]||0) ) / 3;
      const w_gust = Math.max(h.windgusts_10m_icon_d2[i]||0, h.windgusts_10m_gfs_seamless[i]||0, h.windgusts_10m_arome_seamless[i]||0);

      let isDayVal = 1;
      if (isDayArray && isDayArray[i] !== undefined) isDayVal = isDayArray[i];
      else isDayVal = (t.getHours() >= 6 && t.getHours() <= 21) ? 1 : 0;

      res.push({
        time: t,
        displayTime: t.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'}),
        temp: Math.round(temp * 10) / 10,
        temp_icon: h.temperature_2m_icon_d2[i],
        temp_gfs: h.temperature_2m_gfs_seamless[i],
        temp_arome: h.temperature_2m_arome_seamless[i],
        precip: p_vals.toFixed(1),
        snow: s_vals.toFixed(1),
        wind: Math.round(w_avg),
        gust: Math.round(w_gust),
        dir: h.winddirection_10m_icon_d2[i],
        code: h.weathercode_icon_d2[i],
        isDay: isDayVal
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
      const maxIcon = d.temperature_2m_max_icon_seamless[i];
      const maxGfs = d.temperature_2m_max_gfs_seamless[i];
      const maxArome = d.temperature_2m_max_arome_seamless ? d.temperature_2m_max_arome_seamless[i] : null;

      const max = (maxIcon + maxGfs) / 2;
      const min = (d.temperature_2m_min_icon_seamless[i] + d.temperature_2m_min_gfs_seamless[i])/2;
      const snow = Math.max(d.snowfall_sum_icon_seamless[i]||0, d.snowfall_sum_gfs_seamless[i]||0);
      const rain = Math.max(d.precipitation_sum_icon_seamless[i]||0, d.precipitation_sum_gfs_seamless[i]||0);
      const wind = Math.max(d.windspeed_10m_max_icon_seamless[i]||0, d.windspeed_10m_max_gfs_seamless[i]||0);
      const gust = Math.max(d.windgusts_10m_max_icon_seamless[i]||0, d.windgusts_10m_max_gfs_seamless[i]||0);
      
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
        rain: rain.toFixed(1),
        snow: snow.toFixed(1),
        wind: Math.round(wind),
        gust: Math.round(gust),
        dir: d.winddirection_10m_dominant_icon_seamless[i],
        code: d.weathercode_icon_seamless[i],
        reliability: Math.round(confidence),
        prob: prob
      };
    });
  }, [longTermData]);

  const current = processedShort.length > 0 ? processedShort[0] : { temp: 0, snow: 0, precip: 0, wind: 0, gust: 0, dir: 0, code: 0, isDay: 1 };
  
  const todayForecast = processedLong.length > 0 ? processedLong[0] : { rain: "0.0", snow: "0.0", max: 0, min: 0 };
  const dailyRainSum = todayForecast.rain;
  const dailySnowSum = todayForecast.snow;
  const isSnowing = parseFloat(current.snow) > 0;
  
  const weatherConf = getWeatherConfig(current.code || 0, current.isDay);
  const isNight = current.isDay === 0;
  
  // --- STATISCHES HINTERGRUND-DESIGN ---
  const bgGradient = isNight ? 'from-slate-900 to-slate-800' : 'from-blue-500 to-sky-400';
  const textColor = 'text-white';
  const cardBg = isNight ? 'bg-slate-800/60 border-slate-700/50 text-white' : 'bg-white/80 border-white/40 text-slate-900';
  const windColorClass = getWindColorClass(current.wind || 0);

  // Generate Reports
  const dailyReport = useMemo(() => generateAIReport('daily', processedShort), [processedShort]);
  const modelReport = useMemo(() => generateAIReport(chartView === 'hourly' ? 'model-hourly' : 'model-daily', chartView === 'hourly' ? processedShort : processedLong), [chartView, processedShort, processedLong]);
  const longtermReport = useMemo(() => generateAIReport('longterm', processedLong), [processedLong]);

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center p-8 bg-red-50 text-red-900 font-bold">{error} <button onClick={() => setCurrentLoc(DAUBENRATH_LOC)} className="ml-4 underline">Reset</button></div>;

  return (
    <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${bgGradient} font-sans pb-20 overflow-hidden relative`}>
      <style>{styles}</style>
      
      {/* HEADER */}
      <header className="pt-8 px-5 flex justify-between items-start z-10 relative">
        <div className={textColor}>
          <div className="flex gap-2 mb-2">
             <button onClick={handleSetHome} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${currentLoc.isHome ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><Home size={14} /> Home</button>
             <button onClick={handleSetCurrent} className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/20 ${!currentLoc.isHome ? 'bg-white/30 ring-1 ring-white/40' : 'opacity-70'}`}><Crosshair size={14} /> GPS</button>
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
        
        {/* HERO */}
        <div className="relative h-64 flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 transform">
              <WeatherAnimation type={isSnowing ? 'snowy' : (isNight && (current.code <= 2) ? 'clear-night' : current.code >= 51 ? 'rainy' : (current.code > 2 ? 'cloudy' : 'sunny'))} isDay={current.isDay} date={current.time} />
            </div>
            <div className={`relative z-10 text-center mt-24 ${textColor}`}>
              <div className="text-9xl font-bold tracking-tighter drop-shadow-xl">{Math.round(current.temp)}°</div>
              <div className="flex gap-4 justify-center mt-2 text-lg font-medium opacity-90 items-center drop-shadow-md">
                 <span>H: {processedLong[0]?.max}°</span>
                 <span>T: {processedLong[0]?.min}°</span>
                 <span className="mx-1 opacity-50">|</span>
                 <span className="capitalize">{weatherConf.text}</span>
              </div>
            </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3">
            <div className={`backdrop-blur-md rounded-3xl p-4 flex flex-col items-center justify-center ${cardBg} shadow-lg`}>
                {isSnowing ? (
                   <>
                     <span className="text-2xl font-bold mb-1">{dailySnowSum}</span>
                     <span className="text-xs uppercase opacity-70 flex items-center gap-1 font-bold"><Info size={14}/> cm Schnee</span>
                   </>
                ) : (
                   <>
                     <span className="text-2xl font-bold mb-1">{dailyRainSum}</span>
                     <span className="text-xs uppercase opacity-70 flex items-center gap-1 font-bold"><Droplets size={14}/> mm (24h)</span>
                   </>
                )}
            </div>
            <div className={`backdrop-blur-md rounded-3xl p-4 flex flex-col items-center justify-center ${cardBg} shadow-lg`}>
                 <div className={`flex items-center gap-1 text-2xl mb-1 ${windColorClass}`}>
                    <Navigation size={18} style={{ transform: `rotate(${current.dir}deg)` }} className="opacity-80"/>
                    {current.wind}
                 </div>
                 <span className="text-xs uppercase opacity-70 flex items-center gap-1 font-bold">km/h Wind</span>
            </div>
            <div className={`backdrop-blur-md rounded-3xl p-4 flex flex-col items-center justify-center ${cardBg} shadow-lg`}>
                 <span className={`text-2xl mb-1 ${getWindColorClass(current.gust)}`}>{current.gust}</span>
                 <span className="text-xs uppercase opacity-70 flex items-center gap-1 font-bold">Böen Max</span>
            </div>
        </div>

        {/* NAVIGATION */}
        <div className={`p-1.5 rounded-full backdrop-blur-md flex shadow-md border border-white/20 ${cardBg}`}>
           {[
             {id:'overview', label:'Verlauf', icon: List}, 
             {id:'longterm', label:'14 Tage', icon: CalendarDays},
             {id:'radar', label:'Radar', icon: Map},
             {id:'chart', label:'Vergleich', icon: BarChart2}
            ].map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white/90 text-slate-900 shadow-md' : 'hover:bg-white/10 opacity-70'}`}>
               <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
             </button>
           ))}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className={`backdrop-blur-md rounded-[32px] p-5 shadow-2xl ${cardBg} min-h-[450px]`}>
          
          {/* 1. STÜNDLICHE LISTE */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
               {/* REPORT HIER EINGEBAUT */}
               <AIReportBox report={dailyReport} />
               
               <h3 className="text-sm font-bold uppercase tracking-wide opacity-70 ml-2">Vorhersage (24h)</h3>
               <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {processedShort.map((row, i) => {
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
                          </td>
                          <td className="py-4 px-2 text-right w-24">
                             {parseFloat(row.snow) > 0 ? (
                               <span className="text-cyan-500 font-bold whitespace-nowrap flex justify-end items-center gap-1"><Snowflake size={12}/>{row.snow}cm</span>
                             ) : parseFloat(row.precip) > 0 ? (
                               <span className="text-blue-500 font-bold whitespace-nowrap flex justify-end items-center gap-1"><Droplets size={12}/>{row.precip}mm</span>
                             ) : (
                               <span className="opacity-20 text-sm">-</span>
                             )}
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
            </div>
          )}

          {/* 2. CHART VERGLEICH */}
          {activeTab === 'chart' && (
            <div className="h-full flex flex-col">
               {/* REPORT HIER EINGEBAUT */}
               <AIReportBox report={modelReport} />

               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-bold uppercase opacity-70">Modell-Check</h3>
                 <div className="flex bg-black/10 rounded-lg p-1">
                    <button onClick={() => setChartView('hourly')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${chartView==='hourly' ? 'bg-white text-black shadow-sm' : 'opacity-60'}`}>48h</button>
                    <button onClick={() => setChartView('daily')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${chartView==='daily' ? 'bg-white text-black shadow-sm' : 'opacity-60'}`}>14 Tage</button>
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
                          <XAxis dataKey="dateShort" tick={{fontSize:12, fill:'currentColor', opacity:0.7}} axisLine={false} tickLine={false} interval={1} />
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
                  {chartView === 'hourly' ? (
                    <>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-300"></div> ICON</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-300"></div> GFS</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-300"></div> AROME</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Ø</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-300"></div> ICON</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-300"></div> GFS</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-300"></div> AROME</span>
                    </>
                  )}
               </div>
            </div>
          )}

          {/* 3. RADAR TAB (NEU) */}
          {activeTab === 'radar' && (
            <div className="h-full flex flex-col">
               <h3 className="text-sm font-bold uppercase opacity-70 mb-4 ml-2">Live-Radar (Windy)</h3>
               <div className="w-full aspect-square rounded-xl overflow-hidden shadow-inner border border-black/10 bg-gray-200 relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://embed.windy.com/embed2.html?lat=${currentLoc.lat}&lon=${currentLoc.lon}&detailLat=${currentLoc.lat}&detailLon=${currentLoc.lon}&width=450&height=450&zoom=9&level=surface&overlay=radar&product=radar&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`} 
                    frameBorder="0"
                    title="Windy Radar"
                    className="absolute inset-0"
                  ></iframe>
               </div>
               <div className="mt-4 text-xs text-center opacity-60">
                  Radarbild bereitgestellt von Windy.com
               </div>
            </div>
          )}

          {/* 4. 14 TAGE LISTE */}
          {activeTab === 'longterm' && (
             <div className="space-y-4">
               {/* REPORT HIER EINGEBAUT */}
               <AIReportBox report={longtermReport} />

               <h3 className="text-sm font-bold uppercase opacity-70 ml-2">14-Tage Liste</h3>
               {processedLong.map((day, i) => {
                 const isDaySnow = parseFloat(day.snow) > 0;
                 const DayIcon = getWeatherConfig(day.code, 1).icon;
                 const confColor = getConfidenceColor(day.reliability);
                 
                 let probColor = "text-slate-400 opacity-50"; 
                 if (day.prob >= 50) probColor = "text-blue-600 font-bold";
                 else if (day.prob >= 20) probColor = "text-blue-400 font-medium";

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
                            ) : (
                               <span className="text-xs opacity-20">-</span>
                            )}
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

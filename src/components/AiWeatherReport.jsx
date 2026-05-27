import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { generateWeatherReport } from '../services/geminiService';

const FALLBACK_TEXT = 'KI-Bericht derzeit nicht verfügbar';

const AiWeatherReport = ({ weatherData, location }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportText, setReportText] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const text = await generateWeatherReport(weatherData, location);
        if (!isCancelled) {
          setReportText(text);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err);
          setReportText('');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      isCancelled = true;
    };
  }, [weatherData, location]);

  return (
    <div className="rounded-m3-2xl border border-m3-outline-variant/30 bg-white/30 backdrop-blur-md p-4 shadow-m3-2">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-m3-primary" />
        <p className="text-sm font-bold text-m3-on-surface">KI-Wetterbericht</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-m3-on-surface-variant text-sm">
          <span className="h-4 w-4 rounded-full border-2 border-m3-primary/30 border-t-m3-primary animate-spin" />
          <span>Bericht wird erstellt...</span>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-m3-on-surface-variant">
          {error ? FALLBACK_TEXT : reportText || FALLBACK_TEXT}
        </p>
      )}
    </div>
  );
};

export default AiWeatherReport;

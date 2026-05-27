import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-1.5-flash';

const createPrompt = (weatherData, location) => {
  const safeLocation = location || 'deinem Standort';
  const temperature = Number.isFinite(weatherData?.temperature) ? weatherData.temperature : 'unbekannt';
  const condition = weatherData?.condition || 'unbekannt';
  const warningText = Array.isArray(weatherData?.warnings) && weatherData.warnings.length > 0
    ? weatherData.warnings.join(', ')
    : 'Keine besonderen Warnungen';

  return [
    'Du bist ein freundlicher Wetter-Assistent.',
    'Schreibe einen prägnanten Wetterbericht auf Deutsch mit maximal 2-3 Sätzen.',
    'Sei alltagsnah und hilfreich.',
    `Ort: ${safeLocation}`,
    `Temperatur: ${temperature}°C`,
    `Wetterzustand: ${condition}`,
    `Warnungen: ${warningText}`,
  ].join('\n');
};

export const generateWeatherReport = async (weatherData, location) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing Gemini API key. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = createPrompt(weatherData, location);
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.()?.trim();

  if (!text) {
    throw new Error('Failed to generate weather report: Gemini API returned an empty response. This may indicate an API issue or an invalid prompt.');
  }

  return text;
};

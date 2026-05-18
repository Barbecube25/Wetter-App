package com.barbecubewetterscoutai.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.text.format.DateFormat;
import android.view.View;
import android.widget.RemoteViews;

import androidx.core.app.ActivityCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import android.Manifest;
import android.content.pm.PackageManager;

public class WeatherHomeWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_WIDGET_REFRESH = "com.barbecubewetterscoutai.app.ACTION_WIDGET_REFRESH";
    private static final double DEFAULT_LAT = 50.7766;
    private static final double DEFAULT_LON = 6.0834;
    private static final int HTTP_TIMEOUT_MS = 12000;
    private static final String UNAVAILABLE = "--";
    private static final String WEATHER_API_URL_TEMPLATE =
        "https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current=temperature_2m,precipitation,rain,wind_speed_10m,weathercode&hourly=uv_index,precipitation_probability,cape,lifted_index&timezone=auto&forecast_days=1";
    private static final String AIR_QUALITY_API_URL_TEMPLATE =
        "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=%f&longitude=%f&current=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto";
    // WMO weather codes representing thunderstorm conditions.
    private static final int[] THUNDERSTORM_WMO_CODES = {17, 95, 96, 99};
    private static final double THUNDER_CAPE_MODERATE = 500;
    private static final double THUNDER_CAPE_HIGH = 1000;
    private static final double THUNDER_LIFTED_INDEX_MODERATE = -1;
    private static final double THUNDER_LIFTED_INDEX_HIGH = -4;
    private static final double THUNDER_PRECIP_PROB_MODERATE = 40;
    private static final double THUNDER_PRECIP_PROB_HIGH = 70;
    private static final double THUNDER_WIND_KMH_ELEVATED = 50;
    private static final double THUNDER_SCORE_LOW = 1.0;
    private static final double THUNDER_SCORE_MODERATE = 2.0;
    private static final double THUNDER_SCORE_HIGH = 3.5;
    private static final double POLLEN_THRESHOLD_MODERATE = 5;
    private static final double POLLEN_THRESHOLD_HIGH = 20;
    private static final double POLLEN_THRESHOLD_VERY_HIGH = 50;

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidgetAsync(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (intent != null && ACTION_WIDGET_REFRESH.equals(intent.getAction())) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName provider = new ComponentName(context, WeatherHomeWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(provider);
            for (int appWidgetId : appWidgetIds) {
                updateWidgetAsync(context, appWidgetManager, appWidgetId);
            }
        }
    }

    private void updateWidgetAsync(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews loadingViews = createBaseViews(context, appWidgetId);
        appWidgetManager.updateAppWidget(appWidgetId, loadingViews);

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> {
            try {
                RemoteViews views = createBaseViews(context, appWidgetId);
                WidgetData data = fetchWidgetData(context);
                applyWidgetData(context, views, data);
                appWidgetManager.updateAppWidget(appWidgetId, views);
            } finally {
                executor.shutdown();
            }
        });
    }

    private RemoteViews createBaseViews(Context context, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.weather_home_widget);

        views.setTextViewText(R.id.widget_temperature, context.getString(R.string.widget_temp_placeholder));
        views.setTextViewText(R.id.widget_metric_rain, context.getString(R.string.widget_metric_rain_placeholder));
        views.setTextViewText(R.id.widget_metric_uv, context.getString(R.string.widget_metric_uv_placeholder));
        views.setTextViewText(R.id.widget_metric_wind, context.getString(R.string.widget_metric_wind_placeholder));
        views.setTextViewText(R.id.widget_metric_pollen, context.getString(R.string.widget_metric_pollen_placeholder));
        views.setViewVisibility(R.id.widget_metric_thunder, View.GONE);
        views.setTextViewText(R.id.widget_updated_at, context.getString(R.string.widget_updated_placeholder));

        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (launchIntent == null) {
            launchIntent = new Intent(context, MainActivity.class);
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        }

        PendingIntent openAppIntent = PendingIntent.getActivity(
            context,
            appWidgetId,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, openAppIntent);

        Intent refreshIntent = new Intent(context, WeatherHomeWidgetProvider.class);
        refreshIntent.setAction(ACTION_WIDGET_REFRESH);
        PendingIntent refreshPendingIntent = PendingIntent.getBroadcast(
            context,
            appWidgetId,
            refreshIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_refresh_button, refreshPendingIntent);

        return views;
    }

    private void applyWidgetData(Context context, RemoteViews views, WidgetData data) {
        views.setTextViewText(R.id.widget_temperature, formatTemperature(data.temperatureC));
        views.setTextViewText(
            R.id.widget_metric_rain,
            context.getString(R.string.widget_metric_rain_format, formatMetricNumber(data.rainRate))
        );
        views.setTextViewText(
            R.id.widget_metric_uv,
            context.getString(R.string.widget_metric_uv_format, formatMetricNumber(data.uvIndex))
        );
        views.setTextViewText(
            R.id.widget_metric_wind,
            context.getString(R.string.widget_metric_wind_format, formatMetricNumber(data.windKmh))
        );

        if (data.thunderRiskLabel != null) {
            views.setViewVisibility(R.id.widget_metric_thunder, View.VISIBLE);
            views.setTextViewText(
                R.id.widget_metric_thunder,
                context.getString(R.string.widget_metric_thunder_format, data.thunderRiskLabel)
            );
        } else {
            views.setViewVisibility(R.id.widget_metric_thunder, View.GONE);
        }

        views.setTextViewText(
            R.id.widget_metric_pollen,
            context.getString(R.string.widget_metric_pollen_format, data.pollenLabel)
        );

        String formattedTime = DateFormat.getTimeFormat(context).format(new Date());
        views.setTextViewText(
            R.id.widget_updated_at,
            context.getString(R.string.widget_updated_format, formattedTime)
        );
    }

    private WidgetData fetchWidgetData(Context context) {
        WidgetData data = WidgetData.empty(context);
        Location location = getBestLastKnownLocation(context);
        double lat = location != null ? location.getLatitude() : DEFAULT_LAT;
        double lon = location != null ? location.getLongitude() : DEFAULT_LON;

        try {
            String weatherUrl = String.format(
                Locale.US,
                WEATHER_API_URL_TEMPLATE,
                lat,
                lon
            );
            String weatherResponse = httpGet(weatherUrl);
            JSONObject weatherJson = new JSONObject(weatherResponse);
            JSONObject current = weatherJson.optJSONObject("current");
            JSONObject hourly = weatherJson.optJSONObject("hourly");

            if (current != null) {
                data.temperatureC = readDouble(current, "temperature_2m");
                double rain = readDouble(current, "rain");
                if (Double.isNaN(rain)) {
                    rain = readDouble(current, "precipitation");
                }
                data.rainRate = rain;
                data.windKmh = readDouble(current, "wind_speed_10m");

                String currentTime = current.optString("time", null);
                int weatherCode = current.optInt("weathercode", -1);
                int hourlyIndex = findTimeIndex(hourly, currentTime);
                double uv = readHourlyValue(hourly, "uv_index", hourlyIndex);
                double precipProb = readHourlyValue(hourly, "precipitation_probability", hourlyIndex);
                double cape = readHourlyValue(hourly, "cape", hourlyIndex);
                double liftedIndex = readHourlyValue(hourly, "lifted_index", hourlyIndex);
                data.uvIndex = uv;
                data.thunderRiskLabel = classifyThunderRisk(context, weatherCode, cape, liftedIndex, precipProb, data.windKmh);
            }
        } catch (Exception ignored) {
            // Keep placeholder values for unavailable network data
        }

        try {
            String pollenUrl = String.format(
                Locale.US,
                AIR_QUALITY_API_URL_TEMPLATE,
                lat,
                lon
            );
            String pollenResponse = httpGet(pollenUrl);
            JSONObject pollenJson = new JSONObject(pollenResponse);
            JSONObject current = pollenJson.optJSONObject("current");
            if (current != null) {
                double maxPollen = maxOf(
                    readDouble(current, "alder_pollen"),
                    readDouble(current, "birch_pollen"),
                    readDouble(current, "grass_pollen"),
                    readDouble(current, "mugwort_pollen"),
                    readDouble(current, "olive_pollen"),
                    readDouble(current, "ragweed_pollen")
                );
                data.pollenLabel = classifyPollen(context, maxPollen);
            }
        } catch (Exception ignored) {
            // Keep fallback pollen value
        }

        return data;
    }

    private Location getBestLastKnownLocation(Context context) {
        boolean fineGranted = ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean coarseGranted = ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        if (!fineGranted && !coarseGranted) {
            return null;
        }

        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        if (locationManager == null) {
            return null;
        }

        List<String> providers = new ArrayList<>();
        providers.add(LocationManager.GPS_PROVIDER);
        providers.add(LocationManager.NETWORK_PROVIDER);
        providers.add(LocationManager.PASSIVE_PROVIDER);

        Location best = null;
        for (String provider : providers) {
            try {
                Location candidate = locationManager.getLastKnownLocation(provider);
                if (candidate == null) continue;
                if (best == null || candidate.getTime() > best.getTime()) {
                    best = candidate;
                }
            } catch (Exception ignored) {
                // Ignore provider errors and continue
            }
        }
        return best;
    }

    private String classifyThunderRisk(Context context, int weatherCode, double cape, double liftedIndex, double precipProb, double windKmh) {
        if (isThunderstormCode(weatherCode)) {
            return context.getString(R.string.widget_thunder_high);
        }

        double score = 0.0;
        if (!Double.isNaN(cape)) {
            if (cape >= THUNDER_CAPE_HIGH) score += 2.0;
            else if (cape >= THUNDER_CAPE_MODERATE) score += 1.0;
        }
        if (!Double.isNaN(liftedIndex)) {
            if (liftedIndex <= THUNDER_LIFTED_INDEX_HIGH) score += 2.0;
            else if (liftedIndex <= THUNDER_LIFTED_INDEX_MODERATE) score += 1.0;
        }
        if (!Double.isNaN(precipProb)) {
            if (precipProb >= THUNDER_PRECIP_PROB_HIGH) score += 1.0;
            else if (precipProb >= THUNDER_PRECIP_PROB_MODERATE) score += 0.5;
        }
        if (!Double.isNaN(windKmh) && windKmh >= THUNDER_WIND_KMH_ELEVATED) {
            score += 0.5;
        }

        if (score >= THUNDER_SCORE_HIGH) return context.getString(R.string.widget_thunder_high);
        if (score >= THUNDER_SCORE_MODERATE) return context.getString(R.string.widget_thunder_moderate);
        if (score >= THUNDER_SCORE_LOW) return context.getString(R.string.widget_thunder_low);
        return null;
    }

    private String classifyPollen(Context context, double maxPollen) {
        if (Double.isNaN(maxPollen) || maxPollen <= 0) {
            return context.getString(R.string.widget_metric_unavailable);
        }
        if (maxPollen >= POLLEN_THRESHOLD_VERY_HIGH) return context.getString(R.string.widget_pollen_very_high);
        if (maxPollen >= POLLEN_THRESHOLD_HIGH) return context.getString(R.string.widget_pollen_high);
        if (maxPollen >= POLLEN_THRESHOLD_MODERATE) return context.getString(R.string.widget_pollen_moderate);
        return context.getString(R.string.widget_pollen_low);
    }

    private boolean isThunderstormCode(int weatherCode) {
        for (int code : THUNDERSTORM_WMO_CODES) {
            if (code == weatherCode) return true;
        }
        return false;
    }

    private int findTimeIndex(JSONObject hourly, String currentTime) {
        if (hourly == null || currentTime == null || currentTime.isEmpty()) return -1;
        JSONArray times = hourly.optJSONArray("time");
        if (times == null) return -1;
        for (int i = 0; i < times.length(); i++) {
            if (currentTime.equals(times.optString(i))) return i;
        }
        return -1;
    }

    private double readHourlyValue(JSONObject hourly, String field, int index) {
        if (hourly == null) return Double.NaN;
        JSONArray values = hourly.optJSONArray(field);
        if (values == null) return Double.NaN;
        if (index < 0 || index >= values.length()) return Double.NaN;
        return values.optDouble(index, Double.NaN);
    }

    private double readDouble(JSONObject object, String key) {
        if (object == null || !object.has(key) || object.isNull(key)) return Double.NaN;
        return object.optDouble(key, Double.NaN);
    }

    private double maxOf(double... values) {
        double max = Double.NaN;
        for (double value : values) {
            if (Double.isNaN(value)) continue;
            if (Double.isNaN(max) || value > max) {
                max = value;
            }
        }
        return max;
    }

    private String formatTemperature(double temperatureC) {
        if (Double.isNaN(temperatureC)) return "--°";
        return Math.round(temperatureC) + "°";
    }

    private String formatMetricNumber(double value) {
        if (Double.isNaN(value)) return UNAVAILABLE;
        if (Math.abs(value - Math.rint(value)) < 0.05) {
            return String.format(Locale.GERMANY, "%.0f", value);
        }
        return String.format(Locale.GERMANY, "%.1f", value);
    }

    private String httpGet(String urlString) throws Exception {
        HttpURLConnection connection = null;
        BufferedReader reader = null;
        try {
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(HTTP_TIMEOUT_MS);
            connection.setReadTimeout(HTTP_TIMEOUT_MS);
            connection.connect();

            reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        } finally {
            if (reader != null) {
                try { reader.close(); } catch (Exception ignored) { }
            }
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static class WidgetData {
        double temperatureC;
        double rainRate;
        double uvIndex;
        double windKmh;
        String thunderRiskLabel;
        String pollenLabel;

        static WidgetData empty(Context context) {
            WidgetData data = new WidgetData();
            data.temperatureC = Double.NaN;
            data.rainRate = Double.NaN;
            data.uvIndex = Double.NaN;
            data.windKmh = Double.NaN;
            data.thunderRiskLabel = null;
            data.pollenLabel = context.getString(R.string.widget_metric_unavailable);
            return data;
        }
    }
}

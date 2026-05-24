package com.barbecubewetterscoutai.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;
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
    public static final String ACTION_WIDGET_SHOW_TODAY = "com.barbecubewetterscoutai.app.ACTION_WIDGET_SHOW_TODAY";
    public static final String ACTION_WIDGET_SHOW_TOMORROW = "com.barbecubewetterscoutai.app.ACTION_WIDGET_SHOW_TOMORROW";
    private static final String PREFS_NAME = "weather_widget_prefs";
    private static final String PREF_DAY_PREFIX = "widget_selected_day_";
    private static final String DAY_TODAY = "today";
    private static final String DAY_TOMORROW = "tomorrow";
    private static final double DEFAULT_LAT = 50.7766;
    private static final double DEFAULT_LON = 6.0834;
    private static final int HTTP_TIMEOUT_MS = 12000;
    private static final String UNAVAILABLE = "--";
    private static final String WEATHER_API_URL_TEMPLATE =
        "https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current=temperature_2m,apparent_temperature,precipitation,rain,wind_speed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,weathercode&hourly=uv_index,precipitation_probability,cape,lifted_index,wind_speed_10m&timezone=auto&forecast_days=2";
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
    private static final int ONE_ROW_WIDGET_HEIGHT_THRESHOLD_DP = 110;
    private static final int COMPACT_WIDGET_HEIGHT_THRESHOLD_DP = 165;
    private static final int COMPACT_WIDGET_WIDTH_THRESHOLD_DP = 210;

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidgetAsync(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (intent == null) return;
        String action = intent.getAction();
        if (ACTION_WIDGET_SHOW_TODAY.equals(action) || ACTION_WIDGET_SHOW_TOMORROW.equals(action)) {
            int appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
            if (appWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
                saveSelectedDay(context, appWidgetId, ACTION_WIDGET_SHOW_TOMORROW.equals(action) ? DAY_TOMORROW : DAY_TODAY);
                AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
                updateWidgetAsync(context, appWidgetManager, appWidgetId);
            }
            return;
        }
        if (ACTION_WIDGET_REFRESH.equals(action)) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName provider = new ComponentName(context, WeatherHomeWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(provider);
            for (int appWidgetId : appWidgetIds) {
                updateWidgetAsync(context, appWidgetManager, appWidgetId);
            }
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateWidgetAsync(context, appWidgetManager, appWidgetId);
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        super.onDeleted(context, appWidgetIds);
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        for (int appWidgetId : appWidgetIds) {
            editor.remove(PREF_DAY_PREFIX + appWidgetId);
        }
        editor.apply();
    }

    private void updateWidgetAsync(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Bundle widgetOptions = appWidgetManager.getAppWidgetOptions(appWidgetId);
        String selectedDay = getSelectedDay(context, appWidgetId);
        RemoteViews loadingViews = createBaseViews(context, appWidgetId, widgetOptions, selectedDay);
        appWidgetManager.updateAppWidget(appWidgetId, loadingViews);

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> {
            try {
                RemoteViews views = createBaseViews(context, appWidgetId, widgetOptions, selectedDay);
                WidgetData data = fetchWidgetData(context);
                applyWidgetData(context, views, data, selectedDay);
                appWidgetManager.updateAppWidget(appWidgetId, views);
            } finally {
                executor.shutdown();
            }
        });
    }

    private RemoteViews createBaseViews(Context context, int appWidgetId, Bundle widgetOptions, String selectedDay) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.weather_home_widget);

        views.setTextViewText(R.id.widget_temperature, context.getString(R.string.widget_temp_placeholder));
        views.setTextViewText(R.id.widget_weather_icon, context.getString(R.string.widget_weather_icon_placeholder));
        views.setTextViewText(R.id.widget_condition, context.getString(R.string.widget_condition_placeholder));
        views.setTextViewText(R.id.widget_temp_range, context.getString(R.string.widget_temp_range_placeholder));
        views.setTextViewText(R.id.widget_feels_like, context.getString(R.string.widget_feels_like_placeholder));
        views.setTextViewText(R.id.widget_metric_rain, context.getString(R.string.widget_metric_minmax_placeholder));
        views.setTextViewText(R.id.widget_metric_uv, context.getString(R.string.widget_metric_uv_placeholder));
        views.setTextViewText(R.id.widget_metric_wind, context.getString(R.string.widget_metric_wind_placeholder));
        views.setTextViewText(R.id.widget_metric_pollen, context.getString(R.string.widget_metric_pollen_placeholder));
        views.setViewVisibility(R.id.widget_metric_thunder, View.GONE);
        views.setTextViewText(
            R.id.widget_compact_metric_temperature,
            context.getString(
                R.string.widget_compact_metric_temperature_format,
                context.getString(R.string.widget_temp_placeholder),
                context.getString(R.string.widget_weather_icon_placeholder)
            )
        );
        views.setTextViewText(R.id.widget_compact_metric_uv, context.getString(R.string.widget_compact_metric_uv_placeholder));
        views.setTextViewText(R.id.widget_compact_metric_thunder, context.getString(R.string.widget_compact_metric_thunder_placeholder));
        views.setViewVisibility(R.id.widget_metrics_row_secondary, View.VISIBLE);
        views.setTextViewText(R.id.widget_updated_at, context.getString(R.string.widget_updated_placeholder));
        views.setTextViewText(R.id.widget_day_today, context.getString(R.string.widget_day_today));
        views.setTextViewText(R.id.widget_day_tomorrow, context.getString(R.string.widget_day_tomorrow));

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

        Intent todayIntent = new Intent(context, WeatherHomeWidgetProvider.class);
        todayIntent.setAction(ACTION_WIDGET_SHOW_TODAY);
        todayIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        PendingIntent todayPendingIntent = PendingIntent.getBroadcast(
            context,
            appWidgetId * 10 + 1,
            todayIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_day_today, todayPendingIntent);

        Intent tomorrowIntent = new Intent(context, WeatherHomeWidgetProvider.class);
        tomorrowIntent.setAction(ACTION_WIDGET_SHOW_TOMORROW);
        tomorrowIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        PendingIntent tomorrowPendingIntent = PendingIntent.getBroadcast(
            context,
            appWidgetId * 10 + 2,
            tomorrowIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_day_tomorrow, tomorrowPendingIntent);

        applyDayToggleStyle(views, DAY_TOMORROW.equals(selectedDay));
        applyResponsiveLayout(views, widgetOptions);
        return views;
    }

    private void applyWidgetData(Context context, RemoteViews views, WidgetData data, String selectedDay) {
        boolean showTomorrow = DAY_TOMORROW.equals(selectedDay);
        applyDayToggleStyle(views, showTomorrow);
        String conditionLabel;
        if (showTomorrow) {
            conditionLabel = (data.tomorrowWeatherLabel == null || UNAVAILABLE.equals(data.tomorrowWeatherLabel))
                ? context.getString(R.string.widget_condition_tomorrow_placeholder)
                : context.getString(R.string.widget_condition_tomorrow_format, data.tomorrowWeatherLabel);
        } else {
            conditionLabel = data.weatherLabel;
        }
        String feelsLikeLabel = showTomorrow
            ? context.getString(R.string.widget_forecast_label)
            : context.getString(R.string.widget_feels_like_format, formatTemperature(data.feelsLikeC));
        double displayTemperature = showTomorrow ? data.tomorrowMaxTemperatureC : data.temperatureC;
        int displayWeatherCode = showTomorrow ? data.tomorrowWeatherCode : data.weatherCode;
        double rangeMax = showTomorrow ? data.tomorrowMaxTemperatureC : data.maxTemperatureC;
        double rangeMin = showTomorrow ? data.tomorrowMinTemperatureC : data.minTemperatureC;
        double rainRate = showTomorrow ? data.tomorrowRainRate : data.rainRate;
        double uvIndex = showTomorrow ? data.tomorrowUvIndex : data.uvIndex;
        double windKmh = showTomorrow ? data.tomorrowWindKmh : data.windKmh;
        String thunderRisk = showTomorrow ? data.tomorrowThunderRiskLabel : data.thunderRiskLabel;
        String pollenLabel = showTomorrow
            ? context.getString(R.string.widget_metric_unavailable)
            : data.pollenLabel;

        views.setTextViewText(R.id.widget_temperature, formatTemperature(displayTemperature));
        views.setTextViewText(R.id.widget_weather_icon, mapWeatherCodeToSymbol(displayWeatherCode));
        views.setTextViewText(R.id.widget_condition, conditionLabel);
        views.setTextViewText(
            R.id.widget_temp_range,
            context.getString(
                R.string.widget_temp_range_format,
                formatTemperature(rangeMax),
                formatTemperature(rangeMin)
            )
        );
        views.setTextViewText(R.id.widget_feels_like, feelsLikeLabel);

        // Min/Max chip (repurposed widget_metric_rain view)
        views.setTextViewText(
            R.id.widget_metric_rain,
            context.getString(
                R.string.widget_metric_minmax_format,
                formatTemperature(rangeMin),
                formatTemperature(rangeMax)
            )
        );
        views.setInt(R.id.widget_metric_rain, "setBackgroundResource", R.drawable.weather_widget_chip_minmax);
        views.setInt(R.id.widget_metric_rain, "setTextColor", Color.parseColor("#1C1B1F"));

        // Wind chip (always blue-tinted)
        views.setTextViewText(
            R.id.widget_metric_wind,
            context.getString(R.string.widget_metric_wind_format, formatMetricNumber(windKmh))
        );
        views.setInt(R.id.widget_metric_wind, "setBackgroundResource", R.drawable.weather_widget_chip_wind);
        views.setInt(R.id.widget_metric_wind, "setTextColor", Color.parseColor("#1D4ED8"));

        // UV chip – color-coded by level
        views.setTextViewText(
            R.id.widget_metric_uv,
            context.getString(R.string.widget_metric_uv_format, formatMetricNumber(uvIndex))
        );
        applyUvChipStyle(views, uvIndex);

        // Thunder always hidden in full-size widget
        views.setViewVisibility(R.id.widget_metric_thunder, View.GONE);

        // Pollen chip – color-coded by level
        views.setTextViewText(
            R.id.widget_metric_pollen,
            context.getString(R.string.widget_metric_pollen_format, pollenLabel)
        );
        applyPollenChipStyle(context, views, pollenLabel);
        views.setTextViewText(
            R.id.widget_compact_metric_temperature,
            context.getString(
                R.string.widget_compact_metric_temperature_format,
                formatTemperature(displayTemperature),
                mapWeatherCodeToSymbol(displayWeatherCode)
            )
        );
        views.setTextViewText(
            R.id.widget_compact_metric_uv,
            context.getString(R.string.widget_compact_metric_uv_format, formatMetricNumber(uvIndex))
        );
        views.setTextViewText(
            R.id.widget_compact_metric_thunder,
            context.getString(
                R.string.widget_compact_metric_thunder_format,
                thunderRisk == null ? context.getString(R.string.widget_metric_unavailable) : thunderRisk
            )
        );

        String formattedTime = DateFormat.getTimeFormat(context).format(new Date());
        views.setTextViewText(
            R.id.widget_updated_at,
            context.getString(R.string.widget_updated_format, formattedTime)
        );
    }

    private void applyDayToggleStyle(RemoteViews views, boolean showTomorrow) {
        int activeBackground = R.drawable.weather_widget_toggle_active;
        int inactiveBackground = R.drawable.weather_widget_toggle_inactive;
        int activeTextColor = Color.WHITE;
        int inactiveTextColor = Color.parseColor("#757575");

        views.setInt(R.id.widget_day_today, "setBackgroundResource", showTomorrow ? inactiveBackground : activeBackground);
        views.setInt(R.id.widget_day_tomorrow, "setBackgroundResource", showTomorrow ? activeBackground : inactiveBackground);
        views.setInt(R.id.widget_day_today, "setTextColor", showTomorrow ? inactiveTextColor : activeTextColor);
        views.setInt(R.id.widget_day_tomorrow, "setTextColor", showTomorrow ? activeTextColor : inactiveTextColor);
    }

    private void applyUvChipStyle(RemoteViews views, double uvIndex) {
        int bgRes;
        int textColor;
        if (!Double.isNaN(uvIndex) && uvIndex >= 8) {
            bgRes = R.drawable.weather_widget_chip_uv_high;
            textColor = Color.parseColor("#991B1B");
        } else if (!Double.isNaN(uvIndex) && uvIndex >= 6) {
            bgRes = R.drawable.weather_widget_chip_uv_mid;
            textColor = Color.parseColor("#9A3412");
        } else {
            bgRes = R.drawable.weather_widget_chip_uv_low;
            textColor = Color.parseColor("#854D0E");
        }
        views.setInt(R.id.widget_metric_uv, "setBackgroundResource", bgRes);
        views.setInt(R.id.widget_metric_uv, "setTextColor", textColor);
    }

    private void applyPollenChipStyle(Context context, RemoteViews views, String pollenLabel) {
        int bgRes;
        int textColor;
        if (context.getString(R.string.widget_pollen_very_high).equals(pollenLabel)) {
            bgRes = R.drawable.weather_widget_chip_pollen_very_high;
            textColor = Color.parseColor("#991B1B");
        } else if (context.getString(R.string.widget_pollen_high).equals(pollenLabel)) {
            bgRes = R.drawable.weather_widget_chip_pollen_high;
            textColor = Color.parseColor("#9A3412");
        } else if (context.getString(R.string.widget_pollen_moderate).equals(pollenLabel)) {
            bgRes = R.drawable.weather_widget_chip_pollen_mid;
            textColor = Color.parseColor("#854D0E");
        } else {
            bgRes = R.drawable.weather_widget_chip_pollen_low;
            textColor = Color.parseColor("#166534");
        }
        views.setInt(R.id.widget_metric_pollen, "setBackgroundResource", bgRes);
        views.setInt(R.id.widget_metric_pollen, "setTextColor", textColor);
    }

    private void applyResponsiveLayout(RemoteViews views, Bundle widgetOptions) {
        if (widgetOptions == null) {
            views.setViewVisibility(R.id.widget_compact_row, View.GONE);
            views.setViewVisibility(R.id.widget_header_row, View.VISIBLE);
            views.setViewVisibility(R.id.widget_day_switcher, View.VISIBLE);
            views.setViewVisibility(R.id.widget_main_row, View.VISIBLE);
            views.setViewVisibility(R.id.widget_daily_overview, View.GONE);
            views.setViewVisibility(R.id.widget_metrics_panel, View.VISIBLE);
            views.setViewVisibility(R.id.widget_metrics_row_secondary, View.VISIBLE);
            views.setViewVisibility(R.id.widget_updated_at, View.VISIBLE);
            return;
        }

        int minWidthDp = widgetOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0);
        int minHeightDp = widgetOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0);
        boolean oneRowHeight = minHeightDp > 0 && minHeightDp <= ONE_ROW_WIDGET_HEIGHT_THRESHOLD_DP;
        boolean compactHeight = minHeightDp > 0 && minHeightDp < COMPACT_WIDGET_HEIGHT_THRESHOLD_DP;
        boolean compactWidth = minWidthDp > 0 && minWidthDp < COMPACT_WIDGET_WIDTH_THRESHOLD_DP;
        boolean veryCompact = compactHeight && compactWidth;

        if (oneRowHeight) {
            views.setViewVisibility(R.id.widget_compact_row, View.VISIBLE);
            views.setViewVisibility(R.id.widget_header_row, View.GONE);
            views.setViewVisibility(R.id.widget_day_switcher, View.GONE);
            views.setViewVisibility(R.id.widget_main_row, View.GONE);
            views.setViewVisibility(R.id.widget_daily_overview, View.GONE);
            views.setViewVisibility(R.id.widget_metrics_panel, View.GONE);
            views.setViewVisibility(R.id.widget_metrics_row_secondary, View.GONE);
            views.setViewVisibility(R.id.widget_updated_at, View.GONE);
            return;
        }

        views.setViewVisibility(R.id.widget_compact_row, View.GONE);
        views.setViewVisibility(R.id.widget_header_row, View.VISIBLE);
        views.setViewVisibility(R.id.widget_day_switcher, compactHeight ? View.GONE : View.VISIBLE);
        views.setViewVisibility(R.id.widget_main_row, View.VISIBLE);
        views.setViewVisibility(R.id.widget_daily_overview, View.GONE);
        views.setViewVisibility(R.id.widget_metrics_panel, veryCompact ? View.GONE : View.VISIBLE);
        views.setViewVisibility(R.id.widget_metrics_row_secondary, compactHeight ? View.GONE : View.VISIBLE);
        views.setViewVisibility(R.id.widget_updated_at, compactHeight ? View.GONE : View.VISIBLE);
    }

    private String getSelectedDay(Context context, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String value = prefs.getString(PREF_DAY_PREFIX + appWidgetId, DAY_TODAY);
        return DAY_TOMORROW.equals(value) ? DAY_TOMORROW : DAY_TODAY;
    }

    private void saveSelectedDay(Context context, int appWidgetId, String day) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(PREF_DAY_PREFIX + appWidgetId, day).apply();
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
            JSONObject daily = weatherJson.optJSONObject("daily");

            if (current != null) {
                data.temperatureC = readDouble(current, "temperature_2m");
                data.feelsLikeC = readDouble(current, "apparent_temperature");
                double rain = readDouble(current, "rain");
                if (Double.isNaN(rain)) {
                    rain = readDouble(current, "precipitation");
                }
                data.rainRate = rain;
                data.windKmh = readDouble(current, "wind_speed_10m");

                String currentTime = current.optString("time", null);
                int weatherCode = current.optInt("weathercode", -1);
                data.weatherCode = weatherCode;
                data.weatherLabel = mapWeatherCodeToLabel(context, weatherCode);
                int hourlyIndex = findTimeIndex(hourly, currentTime);
                double uv = readHourlyValue(hourly, "uv_index", hourlyIndex);
                double precipProb = readHourlyValue(hourly, "precipitation_probability", hourlyIndex);
                double cape = readHourlyValue(hourly, "cape", hourlyIndex);
                double liftedIndex = readHourlyValue(hourly, "lifted_index", hourlyIndex);
                data.uvIndex = uv;
                data.thunderRiskLabel = classifyThunderRisk(context, weatherCode, cape, liftedIndex, precipProb, data.windKmh);
            }
            if (daily != null) {
                data.maxTemperatureC = readDailyValue(daily, "temperature_2m_max");
                data.minTemperatureC = readDailyValue(daily, "temperature_2m_min");
                data.tomorrowMaxTemperatureC = readDailyValueAtIndex(daily, "temperature_2m_max", 1);
                data.tomorrowMinTemperatureC = readDailyValueAtIndex(daily, "temperature_2m_min", 1);
                data.tomorrowRainRate = readDailyValueAtIndex(daily, "precipitation_sum", 1);
                data.tomorrowUvIndex = readDailyValueAtIndex(daily, "uv_index_max", 1);
                data.tomorrowWindKmh = readDailyValueAtIndex(daily, "wind_speed_10m_max", 1);
                int tomorrowCode = readDailyIntAtIndex(daily, "weathercode", 1);
                data.tomorrowWeatherCode = tomorrowCode;
                data.tomorrowWeatherLabel = mapWeatherCodeToLabel(context, tomorrowCode);
                double tomorrowPrecipProb = readDailyValueAtIndex(daily, "precipitation_probability_max", 1);
                data.tomorrowThunderRiskLabel = classifyThunderRisk(context, tomorrowCode, Double.NaN, Double.NaN, tomorrowPrecipProb, data.tomorrowWindKmh);
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

    private double readDailyValue(JSONObject daily, String field) {
        return readDailyValueAtIndex(daily, field, 0);
    }

    private double readDailyValueAtIndex(JSONObject daily, String field, int index) {
        if (daily == null) return Double.NaN;
        JSONArray values = daily.optJSONArray(field);
        if (values == null || values.length() <= index || index < 0) return Double.NaN;
        return values.optDouble(index, Double.NaN);
    }

    private int readDailyIntAtIndex(JSONObject daily, String field, int index) {
        if (daily == null) return -1;
        JSONArray values = daily.optJSONArray(field);
        if (values == null || values.length() <= index || index < 0) return -1;
        return values.optInt(index, -1);
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

    private String mapWeatherCodeToLabel(Context context, int weatherCode) {
        switch (weatherCode) {
            case 0: return context.getString(R.string.widget_weather_clear);
            case 1:
            case 2: return context.getString(R.string.widget_weather_partly_cloudy);
            case 3: return context.getString(R.string.widget_weather_cloudy);
            case 45:
            case 48: return context.getString(R.string.widget_weather_fog);
            case 51:
            case 53:
            case 55:
            case 56:
            case 57: return context.getString(R.string.widget_weather_drizzle);
            case 61:
            case 63:
            case 65:
            case 80:
            case 81:
            case 82: return context.getString(R.string.widget_weather_rain);
            case 66:
            case 67: return context.getString(R.string.widget_weather_freezing_rain);
            case 71:
            case 73:
            case 75:
            case 77:
            case 85:
            case 86: return context.getString(R.string.widget_weather_snow);
            case 95:
            case 96:
            case 99: return context.getString(R.string.widget_weather_thunderstorm);
            default: return context.getString(R.string.widget_weather_unknown);
        }
    }

    private String mapWeatherCodeToSymbol(int weatherCode) {
        switch (weatherCode) {
            case 0: return "☀";
            case 1:
            case 2: return "⛅";
            case 3: return "☁";
            case 45:
            case 48: return "🌫";
            case 51:
            case 53:
            case 55:
            case 56:
            case 57: return "🌦";
            case 61:
            case 63:
            case 65:
            case 66:
            case 67:
            case 80:
            case 81:
            case 82: return "🌧";
            case 71:
            case 73:
            case 75:
            case 77:
            case 85:
            case 86: return "🌨";
            case 95:
            case 96:
            case 99: return "⛈";
            default: return "⛅";
        }
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
        double feelsLikeC;
        double maxTemperatureC;
        double minTemperatureC;
        double rainRate;
        double uvIndex;
        double windKmh;
        double tomorrowMaxTemperatureC;
        double tomorrowMinTemperatureC;
        double tomorrowRainRate;
        double tomorrowUvIndex;
        double tomorrowWindKmh;
        int weatherCode;
        int tomorrowWeatherCode;
        String weatherLabel;
        String tomorrowWeatherLabel;
        String thunderRiskLabel;
        String tomorrowThunderRiskLabel;
        String pollenLabel;

        static WidgetData empty(Context context) {
            WidgetData data = new WidgetData();
            data.temperatureC = Double.NaN;
            data.feelsLikeC = Double.NaN;
            data.maxTemperatureC = Double.NaN;
            data.minTemperatureC = Double.NaN;
            data.rainRate = Double.NaN;
            data.uvIndex = Double.NaN;
            data.windKmh = Double.NaN;
            data.tomorrowMaxTemperatureC = Double.NaN;
            data.tomorrowMinTemperatureC = Double.NaN;
            data.tomorrowRainRate = Double.NaN;
            data.tomorrowUvIndex = Double.NaN;
            data.tomorrowWindKmh = Double.NaN;
            data.weatherCode = -1;
            data.tomorrowWeatherCode = -1;
            data.weatherLabel = context.getString(R.string.widget_condition_placeholder);
            data.tomorrowWeatherLabel = UNAVAILABLE;
            data.thunderRiskLabel = null;
            data.tomorrowThunderRiskLabel = null;
            data.pollenLabel = context.getString(R.string.widget_metric_unavailable);
            return data;
        }
    }

}

package com.barbecubewetterscoutai.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.text.format.DateFormat;
import android.util.Log;
import android.util.SizeF;
import android.util.TypedValue;
import android.view.View;
import android.widget.RemoteViews;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import android.Manifest;
import android.content.pm.PackageManager;

public class WeatherHomeWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_WIDGET_REFRESH = "com.barbecubewetterscoutai.app.ACTION_WIDGET_REFRESH";
    public static final String ACTION_WIDGET_SHOW_TODAY = "com.barbecubewetterscoutai.app.ACTION_WIDGET_SHOW_TODAY";
    public static final String ACTION_WIDGET_SHOW_TOMORROW = "com.barbecubewetterscoutai.app.ACTION_WIDGET_SHOW_TOMORROW";
    private static final String PREFS_NAME = "weather_widget_prefs";
    private static final String PREF_DAY_PREFIX = "widget_selected_day_";
    private static final String PREF_CACHE_KEY = "widget_cached_data_v1";
    private static final String PREF_CACHE_SAVED_AT_KEY = "savedAtMs";
    private static final String DAY_TODAY = "today";
    private static final String DAY_TOMORROW = "tomorrow";
    private static final String TAG = "WeatherHomeWidget";
    private static final int HTTP_TIMEOUT_MS = 12000;
    private static final double MILLIS_PER_MINUTE = 60_000d;
    private static final String UNAVAILABLE = "--";
    private static final String WEATHER_API_URL_TEMPLATE =
        "https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current=temperature_2m,apparent_temperature,precipitation,rain,snowfall,wind_speed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,weathercode&hourly=temperature_2m,precipitation,snowfall,weathercode,uv_index,precipitation_probability,cape,lifted_index,wind_speed_10m&timezone=auto&forecast_days=2";
    private static final String AIR_QUALITY_API_URL_TEMPLATE =
        "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=%f&longitude=%f&current=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto";
    private static final String NOWCAST_API_URL_TEMPLATE =
        "https://api.open-meteo.com/v1/nowcast?latitude=%f&longitude=%f&minutely_15=precipitation&timezone=auto";
    private static final String BRIGHTSKY_RADAR_API_URL_TEMPLATE =
        "https://api.brightsky.dev/radar?lat=%f&lon=%f&distance=%d&format=plain";
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
    private static final double RAIN_TIMING_PRECIP_PROB_THRESHOLD = 40;
    private static final double RAIN_TIMING_RATE_THRESHOLD_MM_H = 0.1;
    private static final double LIGHT_PRECIP_THRESHOLD_MM = 0.1;
    private static final int NOWCAST_LOOKAHEAD_MINUTES = 120;
    private static final int MINUTELY_SLOT_DURATION_MINUTES = 15;
    private static final int RADAR_SLOT_DURATION_MINUTES = 5;
    private static final int RADAR_NOWCAST_DISTANCE_METERS = 6000;
    private static final int RADAR_CENTER_RADIUS_CELLS = 1;
    private static final int RADAR_CENTER_WEIGHT = 4;
    private static final int RADAR_ADJACENT_WEIGHT = 2;
    private static final int RADAR_DIAGONAL_WEIGHT = 1;
    private static final double RADAR_LOCAL_PEAK_BLEND = 0.7;
    private static final double POLLEN_THRESHOLD_MODERATE = 5;
    private static final double POLLEN_THRESHOLD_HIGH = 20;
    private static final double POLLEN_THRESHOLD_VERY_HIGH = 50;
    private static final int ONE_ROW_WIDGET_HEIGHT_THRESHOLD_DP = 110;
    private static final int COMPACT_WIDGET_HEIGHT_THRESHOLD_DP = 165;
    private static final int LARGE_WIDGET_HEIGHT_THRESHOLD_DP = 230;
    private static final int EXPANDED_WIDGET_HEIGHT_THRESHOLD_DP = 300;
    private static final int COMPACT_WIDGET_WIDTH_THRESHOLD_DP = 210;
    private static final float TEMPERATURE_SIZE_COMPACT_SP = 38f;
    private static final float TEMPERATURE_SIZE_DEFAULT_SP = 42f;
    private static final float TEMPERATURE_SIZE_LARGE_SP = 48f;
    private static final float TEMPERATURE_SIZE_EXPANDED_SP = 52f;
    private static final float TEMPERATURE_SIZE_NARROW_COMPACT_SP = 30f;
    private static final float TEMPERATURE_SIZE_NARROW_DEFAULT_SP = 34f;
    private static final float TEMPERATURE_SIZE_NARROW_LARGE_SP = 40f;
    private static final float TEMPERATURE_SIZE_NARROW_EXPANDED_SP = 44f;
    private static final float WEATHER_ICON_SIZE_DEFAULT_SP = 18f;
    private static final float WEATHER_ICON_SIZE_LARGE_SP = 20f;
    private static final float WEATHER_ICON_SIZE_NARROW_SP = 16f;
    private static final float CONDITION_SIZE_DEFAULT_SP = 13f;
    private static final float CONDITION_SIZE_LARGE_SP = 14f;
    private static final float CONDITION_SIZE_NARROW_SP = 12f;
    private static final float HEADER_SIZE_DEFAULT_SP = 11f;
    private static final float HEADER_SIZE_LARGE_SP = 12f;
    private static final float CHIP_SIZE_DEFAULT_SP = 12f;
    private static final float CHIP_SIZE_LARGE_SP = 13f;
    private static final float CHIP_SIZE_NARROW_SP = 11f;
    private static final float UPDATED_SIZE_DEFAULT_SP = 10f;
    private static final float UPDATED_SIZE_LARGE_SP = 11f;
    private static final float HOURLY_TIME_SIZE_DEFAULT_SP = 10f;
    private static final float HOURLY_TIME_SIZE_EXPANDED_SP = 11f;
    private static final float HOURLY_ICON_SIZE_DEFAULT_SP = 16f;
    private static final float HOURLY_ICON_SIZE_EXPANDED_SP = 18f;
    private static final float HOURLY_TEMP_SIZE_DEFAULT_SP = 12f;
    private static final float HOURLY_TEMP_SIZE_EXPANDED_SP = 13f;
    private static final float DETAIL_TEXT_SIZE_DEFAULT_SP = 11f;
    private static final float DETAIL_TEXT_SIZE_LARGE_SP = 12f;
    private static final float DETAIL_SECONDARY_SIZE_DEFAULT_SP = 10f;
    private static final float DETAIL_SECONDARY_SIZE_LARGE_SP = 11f;
    private static final int ROOT_PADDING_COMPACT_DP = 8;
    private static final int ROOT_PADDING_DEFAULT_DP = 10;
    private static final int ROOT_PADDING_LARGE_DP = 12;
    private static final int COMPACT_ROW_PADDING_HORIZONTAL_DP = 8;
    private static final int COMPACT_ROW_PADDING_HORIZONTAL_COMPACT_DP = 6;
    private static final int COMPACT_ROW_PADDING_VERTICAL_DP = 6;
    private static final int COMPACT_ROW_PADDING_VERTICAL_COMPACT_DP = 5;
    private static final float MAP_SIZE_COMPACT_WIDTH_DP = 170f;
    private static final float MAP_SIZE_COMPACT_HEIGHT_DP = 100f;
    private static final float MAP_SIZE_MEDIUM_WIDTH_DP = 220f;
    private static final float MAP_SIZE_MEDIUM_HEIGHT_DP = 180f;
    private static final float MAP_SIZE_LARGE_WIDTH_DP = 260f;
    private static final float MAP_SIZE_LARGE_HEIGHT_DP = 240f;
    private static final float MAP_SIZE_EXPANDED_WIDTH_DP = 300f;
    private static final float MAP_SIZE_EXPANDED_HEIGHT_DP = 320f;
    private static final ThreadLocal<SimpleDateFormat> ISO_HOUR_PARSER = ThreadLocal.withInitial(() -> {
        SimpleDateFormat parser = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm", Locale.US);
        parser.setLenient(false);
        return parser;
    });

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

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> {
            try {
                WidgetData data = fetchWidgetData(context);
                if (!hasRenderableData(data)) {
                    // Keep existing widget content when no fresh or cached weather data is available.
                    return;
                }
                RemoteViews views = createWidgetViews(context, appWidgetId, widgetOptions, selectedDay, data);
                appWidgetManager.updateAppWidget(appWidgetId, views);
            } finally {
                executor.shutdown();
            }
        });
    }

    private RemoteViews createWidgetViews(Context context, int appWidgetId, Bundle widgetOptions, String selectedDay, WidgetData data) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return createApi31SizeMappedViews(context, appWidgetId, selectedDay, data);
        }
        RemoteViews views = createBaseViews(context, appWidgetId, widgetOptions, selectedDay);
        if (data != null) {
            applyWidgetData(context, views, data, selectedDay);
        }
        return views;
    }

    private RemoteViews createApi31SizeMappedViews(Context context, int appWidgetId, String selectedDay, WidgetData data) {
        Map<SizeF, RemoteViews> viewMap = new LinkedHashMap<>();
        viewMap.put(
            new SizeF(MAP_SIZE_COMPACT_WIDTH_DP, MAP_SIZE_COMPACT_HEIGHT_DP),
            createBandView(context, appWidgetId, selectedDay, data, (int) MAP_SIZE_COMPACT_WIDTH_DP, (int) MAP_SIZE_COMPACT_HEIGHT_DP)
        );
        viewMap.put(
            new SizeF(MAP_SIZE_MEDIUM_WIDTH_DP, MAP_SIZE_MEDIUM_HEIGHT_DP),
            createBandView(context, appWidgetId, selectedDay, data, (int) MAP_SIZE_MEDIUM_WIDTH_DP, (int) MAP_SIZE_MEDIUM_HEIGHT_DP)
        );
        viewMap.put(
            new SizeF(MAP_SIZE_LARGE_WIDTH_DP, MAP_SIZE_LARGE_HEIGHT_DP),
            createBandView(context, appWidgetId, selectedDay, data, (int) MAP_SIZE_LARGE_WIDTH_DP, (int) MAP_SIZE_LARGE_HEIGHT_DP)
        );
        viewMap.put(
            new SizeF(MAP_SIZE_EXPANDED_WIDTH_DP, MAP_SIZE_EXPANDED_HEIGHT_DP),
            createBandView(context, appWidgetId, selectedDay, data, (int) MAP_SIZE_EXPANDED_WIDTH_DP, (int) MAP_SIZE_EXPANDED_HEIGHT_DP)
        );
        return new RemoteViews(viewMap);
    }

    private RemoteViews createBandView(Context context, int appWidgetId, String selectedDay, WidgetData data, int minWidthDp, int minHeightDp) {
        Bundle bandOptions = new Bundle();
        bandOptions.putInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, minWidthDp);
        bandOptions.putInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, minHeightDp);
        RemoteViews views = createBaseViews(context, appWidgetId, bandOptions, selectedDay);
        if (data != null) {
            applyWidgetData(context, views, data, selectedDay);
        }
        return views;
    }

    private RemoteViews createBaseViews(Context context, int appWidgetId, Bundle widgetOptions, String selectedDay) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.weather_home_widget);

        views.setTextViewText(R.id.widget_temperature, context.getString(R.string.widget_temp_placeholder));
        views.setTextViewText(R.id.widget_weather_icon, context.getString(R.string.widget_weather_icon_placeholder));
        views.setTextViewText(R.id.widget_condition, context.getString(R.string.widget_condition_placeholder));
        views.setTextViewText(R.id.widget_temp_range, context.getString(R.string.widget_temp_range_placeholder));
        views.setTextViewText(R.id.widget_feels_like, context.getString(R.string.widget_feels_like_placeholder));
        views.setTextViewText(R.id.widget_metric_minmax, context.getString(R.string.widget_metric_minmax_placeholder));
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
        views.setTextViewText(R.id.widget_detail_title, context.getString(R.string.widget_summary_title_today));
        views.setTextViewText(R.id.widget_detail_primary, context.getString(R.string.widget_summary_placeholder));
        views.setTextViewText(R.id.widget_detail_secondary, context.getString(R.string.widget_summary_placeholder));
        views.setTextViewText(R.id.widget_inline_summary_title, context.getString(R.string.widget_inline_rain_title));
        views.setTextViewText(R.id.widget_inline_summary_primary, context.getString(R.string.widget_inline_rain_timing_none));
        views.setTextViewText(R.id.widget_inline_summary_secondary, context.getString(R.string.widget_summary_placeholder));
        views.setViewVisibility(R.id.widget_inline_summary_secondary, View.GONE);
        views.setTextViewText(R.id.widget_updated_at, context.getString(R.string.widget_updated_placeholder));
        views.setTextViewText(R.id.widget_day_today, context.getString(R.string.widget_day_today));
        views.setTextViewText(R.id.widget_day_tomorrow, context.getString(R.string.widget_day_tomorrow));
        initHourlySlotPlaceholders(views);

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

        applyDayToggleStyle(context, views, DAY_TOMORROW.equals(selectedDay));
        applyResponsiveLayout(context, views, widgetOptions, DAY_TOMORROW.equals(selectedDay));
        return views;
    }

    private void applyWidgetData(Context context, RemoteViews views, WidgetData data, String selectedDay) {
        boolean showTomorrow = DAY_TOMORROW.equals(selectedDay);
        applyDayToggleStyle(context, views, showTomorrow);
        views.setTextViewText(R.id.widget_title, data.locationLabel);
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
        String unavailableLabel = context.getString(R.string.widget_metric_unavailable);
        String pollenLabel = showTomorrow
            ? unavailableLabel
            : data.pollenLabel;
        boolean hasWind = !Double.isNaN(windKmh);
        boolean hasUv = !Double.isNaN(uvIndex);
        boolean hasPollen = !showTomorrow && pollenLabel != null && !unavailableLabel.equals(pollenLabel);
        boolean hasThunder = thunderRisk != null
            && !thunderRisk.trim().isEmpty()
            && !unavailableLabel.equals(thunderRisk);

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

        // Min/Max chip
        views.setTextViewText(
            R.id.widget_metric_minmax,
            context.getString(
                R.string.widget_metric_minmax_format,
                formatTemperature(rangeMin),
                formatTemperature(rangeMax)
            )
        );
        views.setInt(R.id.widget_metric_minmax, "setBackgroundResource", R.drawable.weather_widget_chip_minmax);
        views.setInt(R.id.widget_metric_minmax, "setTextColor", ContextCompat.getColor(context, R.color.widget_text_primary));

        if (hasWind) {
            // Wind chip (always blue-tinted)
            views.setTextViewText(
                R.id.widget_metric_wind,
                context.getString(R.string.widget_metric_wind_format, formatMetricNumber(windKmh))
            );
            views.setInt(R.id.widget_metric_wind, "setBackgroundResource", R.drawable.weather_widget_chip_wind);
            views.setInt(R.id.widget_metric_wind, "setTextColor", ContextCompat.getColor(context, R.color.widget_text_accent));
            views.setViewVisibility(R.id.widget_metric_wind, View.VISIBLE);
        } else {
            views.setViewVisibility(R.id.widget_metric_wind, View.GONE);
        }

        if (hasUv) {
            // UV chip – color-coded by level
            views.setTextViewText(
                R.id.widget_metric_uv,
                context.getString(R.string.widget_metric_uv_format, formatMetricNumber(uvIndex))
            );
            applyUvChipStyle(context, views, uvIndex);
            views.setViewVisibility(R.id.widget_metric_uv, View.VISIBLE);
        } else {
            views.setViewVisibility(R.id.widget_metric_uv, View.GONE);
        }

        // Thunder always hidden in full-size widget
        views.setViewVisibility(R.id.widget_metric_thunder, View.GONE);

        if (hasPollen) {
            // Pollen chip – color-coded by level
            views.setTextViewText(
                R.id.widget_metric_pollen,
                context.getString(R.string.widget_metric_pollen_format, pollenLabel)
            );
            applyPollenChipStyle(context, views, pollenLabel);
            views.setViewVisibility(R.id.widget_metric_pollen, View.VISIBLE);
        } else {
            views.setViewVisibility(R.id.widget_metric_pollen, View.GONE);
        }
        if (!hasUv && !hasPollen) {
            views.setViewVisibility(R.id.widget_metrics_row_secondary, View.GONE);
        }
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
        views.setViewVisibility(R.id.widget_compact_metric_uv, hasUv ? View.VISIBLE : View.GONE);
        views.setTextViewText(
            R.id.widget_compact_metric_thunder,
            context.getString(
                R.string.widget_compact_metric_thunder_format,
                thunderRisk == null ? context.getString(R.string.widget_metric_unavailable) : thunderRisk
            )
        );
        views.setViewVisibility(R.id.widget_compact_metric_thunder, hasThunder ? View.VISIBLE : View.GONE);

        String formattedTime = DateFormat.getTimeFormat(context).format(new Date());
        views.setTextViewText(
            R.id.widget_updated_at,
            context.getString(R.string.widget_updated_format, formattedTime)
        );

        applyHourlySlots(views, data);
        applyInlineSummaryPanelText(context, views, data, showTomorrow);
        applySummaryPanelText(context, views, data, showTomorrow);
    }

    private void applyDayToggleStyle(Context context, RemoteViews views, boolean showTomorrow) {
        int activeBackground = R.drawable.weather_widget_toggle_active;
        int inactiveBackground = R.drawable.weather_widget_toggle_inactive;
        int activeTextColor = ContextCompat.getColor(context, R.color.widget_text_on_active);
        int inactiveTextColor = ContextCompat.getColor(context, R.color.widget_text_tertiary);

        views.setInt(R.id.widget_day_today, "setBackgroundResource", showTomorrow ? inactiveBackground : activeBackground);
        views.setInt(R.id.widget_day_tomorrow, "setBackgroundResource", showTomorrow ? activeBackground : inactiveBackground);
        views.setInt(R.id.widget_day_today, "setTextColor", showTomorrow ? inactiveTextColor : activeTextColor);
        views.setInt(R.id.widget_day_tomorrow, "setTextColor", showTomorrow ? activeTextColor : inactiveTextColor);
    }

    private void applyUvChipStyle(Context context, RemoteViews views, double uvIndex) {
        int bgRes;
        int textColor;
        if (!Double.isNaN(uvIndex) && uvIndex >= 8) {
            bgRes = R.drawable.weather_widget_chip_uv_high;
            textColor = ContextCompat.getColor(context, R.color.widget_text_uv_high);
        } else if (!Double.isNaN(uvIndex) && uvIndex >= 6) {
            bgRes = R.drawable.weather_widget_chip_uv_mid;
            textColor = ContextCompat.getColor(context, R.color.widget_text_uv_mid);
        } else {
            bgRes = R.drawable.weather_widget_chip_uv_low;
            textColor = ContextCompat.getColor(context, R.color.widget_text_uv_low);
        }
        views.setInt(R.id.widget_metric_uv, "setBackgroundResource", bgRes);
        views.setInt(R.id.widget_metric_uv, "setTextColor", textColor);
    }

    private void applyPollenChipStyle(Context context, RemoteViews views, String pollenLabel) {
        int bgRes;
        int textColor;
        if (context.getString(R.string.widget_pollen_very_high).equals(pollenLabel)) {
            bgRes = R.drawable.weather_widget_chip_pollen_very_high;
            textColor = ContextCompat.getColor(context, R.color.widget_text_pollen_very_high);
        } else if (context.getString(R.string.widget_pollen_high).equals(pollenLabel)) {
            bgRes = R.drawable.weather_widget_chip_pollen_high;
            textColor = ContextCompat.getColor(context, R.color.widget_text_pollen_high);
        } else if (context.getString(R.string.widget_pollen_moderate).equals(pollenLabel)) {
            bgRes = R.drawable.weather_widget_chip_pollen_mid;
            textColor = ContextCompat.getColor(context, R.color.widget_text_pollen_mid);
        } else {
            bgRes = R.drawable.weather_widget_chip_pollen_low;
            textColor = ContextCompat.getColor(context, R.color.widget_text_pollen_low);
        }
        views.setInt(R.id.widget_metric_pollen, "setBackgroundResource", bgRes);
        views.setInt(R.id.widget_metric_pollen, "setTextColor", textColor);
    }

    private void applyResponsiveLayout(Context context, RemoteViews views, Bundle widgetOptions, boolean showTomorrow) {
        if (widgetOptions == null) {
            views.setViewVisibility(R.id.widget_compact_row, View.GONE);
            views.setViewVisibility(R.id.widget_header_row, View.VISIBLE);
            views.setViewVisibility(R.id.widget_day_switcher, View.VISIBLE);
            views.setViewVisibility(R.id.widget_main_row, View.VISIBLE);
            views.setViewVisibility(R.id.widget_daily_overview, View.GONE);
            views.setViewVisibility(R.id.widget_inline_summary_panel, View.VISIBLE);
            views.setViewVisibility(R.id.widget_metrics_panel, View.VISIBLE);
            views.setViewVisibility(R.id.widget_metrics_row_secondary, View.VISIBLE);
            views.setViewVisibility(R.id.widget_hourly_panel, View.GONE);
            views.setViewVisibility(R.id.widget_hourly_row_secondary, View.GONE);
            views.setViewVisibility(R.id.widget_detail_panel, View.GONE);
            views.setViewVisibility(R.id.widget_updated_at, View.VISIBLE);
            applyResponsiveTypography(context, views, false, false, false, false);
            return;
        }

        int minWidthDp = widgetOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0);
        int minHeightDp = widgetOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0);
        boolean oneRowHeight = minHeightDp > 0 && minHeightDp <= ONE_ROW_WIDGET_HEIGHT_THRESHOLD_DP;
        boolean compactHeight = minHeightDp > 0 && minHeightDp < COMPACT_WIDGET_HEIGHT_THRESHOLD_DP;
        boolean largeHeight = minHeightDp >= LARGE_WIDGET_HEIGHT_THRESHOLD_DP;
        boolean expandedHeight = minHeightDp >= EXPANDED_WIDGET_HEIGHT_THRESHOLD_DP;
        boolean compactWidth = minWidthDp > 0 && minWidthDp < COMPACT_WIDGET_WIDTH_THRESHOLD_DP;
        boolean veryCompact = compactHeight && compactWidth;

        if (oneRowHeight) {
            views.setViewVisibility(R.id.widget_compact_row, View.VISIBLE);
            views.setViewVisibility(R.id.widget_header_row, View.GONE);
            views.setViewVisibility(R.id.widget_day_switcher, View.GONE);
            views.setViewVisibility(R.id.widget_main_row, View.GONE);
            views.setViewVisibility(R.id.widget_daily_overview, View.GONE);
            views.setViewVisibility(R.id.widget_inline_summary_panel, View.GONE);
            views.setViewVisibility(R.id.widget_metrics_panel, View.GONE);
            views.setViewVisibility(R.id.widget_metrics_row_secondary, View.GONE);
            views.setViewVisibility(R.id.widget_hourly_panel, View.GONE);
            views.setViewVisibility(R.id.widget_hourly_row_secondary, View.GONE);
            views.setViewVisibility(R.id.widget_detail_panel, View.GONE);
            views.setViewVisibility(R.id.widget_updated_at, View.GONE);
            return;
        }

        views.setViewVisibility(R.id.widget_compact_row, View.GONE);
        views.setViewVisibility(R.id.widget_header_row, View.VISIBLE);
        views.setViewVisibility(R.id.widget_day_switcher, compactHeight ? View.GONE : View.VISIBLE);
        views.setViewVisibility(R.id.widget_main_row, View.VISIBLE);
        views.setViewVisibility(R.id.widget_daily_overview, View.GONE);
        views.setViewVisibility(R.id.widget_inline_summary_panel, compactWidth ? View.GONE : View.VISIBLE);
        views.setViewVisibility(R.id.widget_metrics_panel, veryCompact ? View.GONE : View.VISIBLE);
        views.setViewVisibility(R.id.widget_metrics_row_secondary, compactHeight ? View.GONE : View.VISIBLE);
        boolean showHourly = largeHeight && !showTomorrow && !compactWidth;
        boolean showExpandedHourly = showHourly && expandedHeight;
        views.setViewVisibility(R.id.widget_hourly_panel, showHourly ? View.VISIBLE : View.GONE);
        views.setViewVisibility(R.id.widget_hourly_row_secondary, showExpandedHourly ? View.VISIBLE : View.GONE);
        views.setViewVisibility(R.id.widget_detail_panel, largeHeight ? View.VISIBLE : View.GONE);
        views.setViewVisibility(R.id.widget_updated_at, compactHeight ? View.GONE : View.VISIBLE);
        applyResponsiveTypography(context, views, compactHeight, largeHeight, expandedHeight, compactWidth);
    }

    private float resolveTemperatureSize(boolean compactWidth, boolean compactHeight, boolean largeHeight, boolean expandedHeight) {
        if (compactWidth) {
            if (expandedHeight) return TEMPERATURE_SIZE_NARROW_EXPANDED_SP;
            if (largeHeight)   return TEMPERATURE_SIZE_NARROW_LARGE_SP;
            if (compactHeight) return TEMPERATURE_SIZE_NARROW_COMPACT_SP;
            return TEMPERATURE_SIZE_NARROW_DEFAULT_SP;
        }
        if (expandedHeight) return TEMPERATURE_SIZE_EXPANDED_SP;
        if (largeHeight)    return TEMPERATURE_SIZE_LARGE_SP;
        if (compactHeight)  return TEMPERATURE_SIZE_COMPACT_SP;
        return TEMPERATURE_SIZE_DEFAULT_SP;
    }

    private void applyResponsiveTypography(Context context, RemoteViews views, boolean compactHeight, boolean largeHeight, boolean expandedHeight, boolean compactWidth) {
        float temperatureSize = resolveTemperatureSize(compactWidth, compactHeight, largeHeight, expandedHeight);
        // On narrow widgets condition text is kept smaller regardless of height to prevent overflow;
        // on wide widgets the larger large-height variant is used.
        float conditionSize = compactWidth ? CONDITION_SIZE_NARROW_SP : (largeHeight ? CONDITION_SIZE_LARGE_SP : CONDITION_SIZE_DEFAULT_SP);
        float chipSize = compactWidth ? CHIP_SIZE_NARROW_SP : (largeHeight ? CHIP_SIZE_LARGE_SP : CHIP_SIZE_DEFAULT_SP);
        float headerSize = largeHeight ? HEADER_SIZE_LARGE_SP : HEADER_SIZE_DEFAULT_SP;
        float weatherIconSize = compactWidth ? WEATHER_ICON_SIZE_NARROW_SP : (largeHeight ? WEATHER_ICON_SIZE_LARGE_SP : WEATHER_ICON_SIZE_DEFAULT_SP);
        float detailTextSize = largeHeight ? DETAIL_TEXT_SIZE_LARGE_SP : DETAIL_TEXT_SIZE_DEFAULT_SP;
        float detailSecondarySize = largeHeight ? DETAIL_SECONDARY_SIZE_LARGE_SP : DETAIL_SECONDARY_SIZE_DEFAULT_SP;
        float hourlyTimeSize = expandedHeight ? HOURLY_TIME_SIZE_EXPANDED_SP : HOURLY_TIME_SIZE_DEFAULT_SP;
        float hourlyIconSize = expandedHeight ? HOURLY_ICON_SIZE_EXPANDED_SP : HOURLY_ICON_SIZE_DEFAULT_SP;
        float hourlyTempSize = expandedHeight ? HOURLY_TEMP_SIZE_EXPANDED_SP : HOURLY_TEMP_SIZE_DEFAULT_SP;
        int rootPaddingPx = dpToPx(context, largeHeight ? ROOT_PADDING_LARGE_DP : (compactHeight ? ROOT_PADDING_COMPACT_DP : ROOT_PADDING_DEFAULT_DP));
        int compactRowHorizontalPx = dpToPx(context, compactHeight ? COMPACT_ROW_PADDING_HORIZONTAL_COMPACT_DP : COMPACT_ROW_PADDING_HORIZONTAL_DP);
        int compactRowVerticalPx = dpToPx(context, compactHeight ? COMPACT_ROW_PADDING_VERTICAL_COMPACT_DP : COMPACT_ROW_PADDING_VERTICAL_DP);

        views.setViewPadding(R.id.widget_root, rootPaddingPx, rootPaddingPx, rootPaddingPx, rootPaddingPx);
        views.setViewPadding(R.id.widget_compact_row, compactRowHorizontalPx, compactRowVerticalPx, compactRowHorizontalPx, compactRowVerticalPx);
        views.setTextViewTextSize(R.id.widget_temperature, TypedValue.COMPLEX_UNIT_SP, temperatureSize);
        views.setTextViewTextSize(R.id.widget_weather_icon, TypedValue.COMPLEX_UNIT_SP, weatherIconSize);
        views.setTextViewTextSize(R.id.widget_condition, TypedValue.COMPLEX_UNIT_SP, conditionSize);
        views.setTextViewTextSize(R.id.widget_title, TypedValue.COMPLEX_UNIT_SP, headerSize);
        views.setTextViewTextSize(R.id.widget_day_today, TypedValue.COMPLEX_UNIT_SP, headerSize);
        views.setTextViewTextSize(R.id.widget_day_tomorrow, TypedValue.COMPLEX_UNIT_SP, headerSize);
        views.setTextViewTextSize(R.id.widget_metric_minmax, TypedValue.COMPLEX_UNIT_SP, chipSize);
        views.setTextViewTextSize(R.id.widget_metric_wind, TypedValue.COMPLEX_UNIT_SP, chipSize);
        views.setTextViewTextSize(R.id.widget_metric_uv, TypedValue.COMPLEX_UNIT_SP, chipSize);
        views.setTextViewTextSize(R.id.widget_metric_pollen, TypedValue.COMPLEX_UNIT_SP, chipSize);
        views.setTextViewTextSize(R.id.widget_inline_summary_title, TypedValue.COMPLEX_UNIT_SP, headerSize);
        views.setTextViewTextSize(R.id.widget_inline_summary_primary, TypedValue.COMPLEX_UNIT_SP, detailTextSize);
        views.setTextViewTextSize(R.id.widget_inline_summary_secondary, TypedValue.COMPLEX_UNIT_SP, detailSecondarySize);
        views.setTextViewTextSize(R.id.widget_updated_at, TypedValue.COMPLEX_UNIT_SP, largeHeight ? UPDATED_SIZE_LARGE_SP : UPDATED_SIZE_DEFAULT_SP);
        views.setTextViewTextSize(R.id.widget_compact_metric_temperature, TypedValue.COMPLEX_UNIT_SP, compactHeight ? HEADER_SIZE_DEFAULT_SP : CHIP_SIZE_DEFAULT_SP);
        views.setTextViewTextSize(R.id.widget_compact_metric_uv, TypedValue.COMPLEX_UNIT_SP, compactHeight ? HEADER_SIZE_DEFAULT_SP : CHIP_SIZE_DEFAULT_SP);
        views.setTextViewTextSize(R.id.widget_compact_metric_thunder, TypedValue.COMPLEX_UNIT_SP, compactHeight ? HEADER_SIZE_DEFAULT_SP : CHIP_SIZE_DEFAULT_SP);
        views.setTextViewTextSize(R.id.widget_detail_title, TypedValue.COMPLEX_UNIT_SP, headerSize);
        views.setTextViewTextSize(R.id.widget_detail_primary, TypedValue.COMPLEX_UNIT_SP, detailTextSize);
        views.setTextViewTextSize(R.id.widget_detail_secondary, TypedValue.COMPLEX_UNIT_SP, detailSecondarySize);

        int[] timeIds = {R.id.widget_hourly_time_1, R.id.widget_hourly_time_2, R.id.widget_hourly_time_3, R.id.widget_hourly_time_4, R.id.widget_hourly_time_5, R.id.widget_hourly_time_6};
        int[] iconIds = {R.id.widget_hourly_icon_1, R.id.widget_hourly_icon_2, R.id.widget_hourly_icon_3, R.id.widget_hourly_icon_4, R.id.widget_hourly_icon_5, R.id.widget_hourly_icon_6};
        int[] tempIds = {R.id.widget_hourly_temp_1, R.id.widget_hourly_temp_2, R.id.widget_hourly_temp_3, R.id.widget_hourly_temp_4, R.id.widget_hourly_temp_5, R.id.widget_hourly_temp_6};
        int[] precipIds = {R.id.widget_hourly_precip_1, R.id.widget_hourly_precip_2, R.id.widget_hourly_precip_3, R.id.widget_hourly_precip_4, R.id.widget_hourly_precip_5, R.id.widget_hourly_precip_6};
        for (int i = 0; i < timeIds.length; i++) {
            views.setTextViewTextSize(timeIds[i], TypedValue.COMPLEX_UNIT_SP, hourlyTimeSize);
            views.setTextViewTextSize(iconIds[i], TypedValue.COMPLEX_UNIT_SP, hourlyIconSize);
            views.setTextViewTextSize(tempIds[i], TypedValue.COMPLEX_UNIT_SP, hourlyTempSize);
            views.setTextViewTextSize(precipIds[i], TypedValue.COMPLEX_UNIT_SP, hourlyTimeSize);
        }
    }

    private int dpToPx(Context context, int dp) {
        return Math.round(dp * context.getResources().getDisplayMetrics().density);
    }

    private void initHourlySlotPlaceholders(RemoteViews views) {
        int[] timeIds = {R.id.widget_hourly_time_1, R.id.widget_hourly_time_2, R.id.widget_hourly_time_3, R.id.widget_hourly_time_4, R.id.widget_hourly_time_5, R.id.widget_hourly_time_6};
        int[] iconIds = {R.id.widget_hourly_icon_1, R.id.widget_hourly_icon_2, R.id.widget_hourly_icon_3, R.id.widget_hourly_icon_4, R.id.widget_hourly_icon_5, R.id.widget_hourly_icon_6};
        int[] tempIds = {R.id.widget_hourly_temp_1, R.id.widget_hourly_temp_2, R.id.widget_hourly_temp_3, R.id.widget_hourly_temp_4, R.id.widget_hourly_temp_5, R.id.widget_hourly_temp_6};
        int[] precipIds = {R.id.widget_hourly_precip_1, R.id.widget_hourly_precip_2, R.id.widget_hourly_precip_3, R.id.widget_hourly_precip_4, R.id.widget_hourly_precip_5, R.id.widget_hourly_precip_6};
        for (int i = 0; i < timeIds.length; i++) {
            views.setTextViewText(timeIds[i], "--:--");
            views.setTextViewText(iconIds[i], "⛅");
            views.setTextViewText(tempIds[i], "--°");
            views.setTextViewText(precipIds[i], "--%");
        }
    }

    private void applyHourlySlots(RemoteViews views, WidgetData data) {
        int[] timeIds = {R.id.widget_hourly_time_1, R.id.widget_hourly_time_2, R.id.widget_hourly_time_3, R.id.widget_hourly_time_4, R.id.widget_hourly_time_5, R.id.widget_hourly_time_6};
        int[] iconIds = {R.id.widget_hourly_icon_1, R.id.widget_hourly_icon_2, R.id.widget_hourly_icon_3, R.id.widget_hourly_icon_4, R.id.widget_hourly_icon_5, R.id.widget_hourly_icon_6};
        int[] tempIds = {R.id.widget_hourly_temp_1, R.id.widget_hourly_temp_2, R.id.widget_hourly_temp_3, R.id.widget_hourly_temp_4, R.id.widget_hourly_temp_5, R.id.widget_hourly_temp_6};
        int[] precipIds = {R.id.widget_hourly_precip_1, R.id.widget_hourly_precip_2, R.id.widget_hourly_precip_3, R.id.widget_hourly_precip_4, R.id.widget_hourly_precip_5, R.id.widget_hourly_precip_6};
        for (int i = 0; i < timeIds.length; i++) {
            if (data.hourlyTimes[i] != null) {
                views.setTextViewText(timeIds[i], data.hourlyTimes[i]);
            }
            views.setTextViewText(iconIds[i], mapWeatherCodeToSymbol(data.hourlyCodes[i]));
            views.setTextViewText(tempIds[i], formatTemperature(data.hourlyTemps[i]));
            String precipText = Double.isNaN(data.hourlyPrecipProbs[i])
                ? "--%"
                : String.format(Locale.GERMANY, "%.0f%%", data.hourlyPrecipProbs[i]);
            views.setTextViewText(precipIds[i], precipText);
        }
    }

    private void fillHourlyForecast(WidgetData data, JSONObject hourly, int currentHourIndex) {
        if (hourly == null || currentHourIndex < 0) return;
        JSONArray times = hourly.optJSONArray("time");
        for (int i = 0; i < data.hourlyTemps.length; i++) {
            int idx = currentHourIndex + 1 + i;
            data.hourlyTemps[i] = readHourlyValue(hourly, "temperature_2m", idx);
            data.hourlyCodes[i] = readHourlyIntValue(hourly, "weathercode", idx);
            data.hourlyPrecipProbs[i] = readHourlyValue(hourly, "precipitation_probability", idx);
            if (times != null && idx < times.length()) {
                String raw = times.optString(idx, null);
                if (raw != null) {
                    int tPos = raw.lastIndexOf('T');
                    data.hourlyTimes[i] = (tPos >= 0 && tPos + 1 < raw.length()) ? raw.substring(tPos + 1) : null;
                }
            }
        }
    }

    private void applySummaryPanelText(Context context, RemoteViews views, WidgetData data, boolean showTomorrow) {
        if (showTomorrow) {
            views.setTextViewText(R.id.widget_detail_title, context.getString(R.string.widget_summary_title_tomorrow));
            views.setTextViewText(
                R.id.widget_detail_primary,
                context.getString(
                    R.string.widget_summary_tomorrow_primary_format,
                    safeText(data.tomorrowWeatherLabel),
                    formatTemperature(data.tomorrowMinTemperatureC),
                    formatTemperature(data.tomorrowMaxTemperatureC)
                )
            );
            views.setTextViewText(
                R.id.widget_detail_secondary,
                context.getString(
                    R.string.widget_summary_tomorrow_secondary_format,
                    formatMetricNumber(data.tomorrowRainRate),
                    formatMetricNumber(data.tomorrowWindKmh),
                    formatMetricNumber(data.tomorrowUvIndex)
                )
            );
            return;
        }

        String thunderRisk = data.thunderRiskLabel == null
            ? context.getString(R.string.widget_metric_unavailable)
            : data.thunderRiskLabel;
        views.setTextViewText(R.id.widget_detail_title, context.getString(R.string.widget_summary_title_today));
        views.setTextViewText(
            R.id.widget_detail_primary,
            context.getString(
                R.string.widget_summary_today_primary_format,
                safeText(data.weatherLabel),
                formatTemperature(data.feelsLikeC),
                safeText(data.pollenLabel)
            )
        );
        views.setTextViewText(
            R.id.widget_detail_secondary,
            context.getString(
                R.string.widget_summary_today_secondary_format,
                formatRainWindow(context, data),
                formatMetricNumber(data.rainRate),
                formatMetricNumber(data.windKmh),
                thunderRisk
            )
        );
    }

    private void applyInlineSummaryPanelText(Context context, RemoteViews views, WidgetData data, boolean showTomorrow) {
        if (showTomorrow) {
            views.setViewVisibility(R.id.widget_inline_summary_secondary, View.VISIBLE);
            views.setTextViewText(R.id.widget_inline_summary_title, context.getString(R.string.widget_summary_title_tomorrow));
            views.setTextViewText(
                R.id.widget_inline_summary_primary,
                context.getString(
                    R.string.widget_summary_tomorrow_primary_format,
                    safeText(data.tomorrowWeatherLabel),
                    formatTemperature(data.tomorrowMinTemperatureC),
                    formatTemperature(data.tomorrowMaxTemperatureC)
                )
            );
            views.setTextViewText(
                R.id.widget_inline_summary_secondary,
                context.getString(
                    R.string.widget_summary_tomorrow_secondary_format,
                    formatMetricNumber(data.tomorrowRainRate),
                    formatMetricNumber(data.tomorrowWindKmh),
                    formatMetricNumber(data.tomorrowUvIndex)
                )
            );
            return;
        }

        views.setViewVisibility(R.id.widget_inline_summary_secondary, View.GONE);
        views.setTextViewText(R.id.widget_inline_summary_title, context.getString(R.string.widget_inline_rain_title));
        views.setTextViewText(R.id.widget_inline_summary_primary, formatRainTimingMinutes(context, data));
        views.setTextViewText(R.id.widget_inline_summary_secondary, context.getString(R.string.widget_summary_placeholder));
    }

    private String formatRainTimingMinutes(Context context, WidgetData data) {
        if (data == null) {
            return context.getString(R.string.widget_inline_rain_timing_none);
        }
        Integer startMinutes = data.rainStartMinutes;
        Integer endMinutes = data.rainEndMinutes;
        // Only treat as "raining now" when the measured rain rate is actually above the threshold.
        // A startMinutes of 0 can occur because a past hourly slot was clamped, so it must not
        // be used to trigger the "Es regnet jetzt" message when the rain rate is 0.
        boolean rainingNow = !Double.isNaN(data.rainRate) && data.rainRate > RAIN_TIMING_RATE_THRESHOLD_MM_H;

        if (rainingNow && endMinutes != null && endMinutes > 0) {
            return context.getString(
                R.string.widget_inline_rain_timing_end_format,
                formatMinuteLead(context, endMinutes)
            );
        }
        if (rainingNow) {
            return context.getString(R.string.widget_inline_rain_timing_now_only);
        }
        if (startMinutes != null && endMinutes != null) {
            return context.getString(
                R.string.widget_inline_rain_timing_start_end_format,
                formatMinuteLead(context, startMinutes),
                formatMinuteLead(context, endMinutes)
            );
        }
        if (startMinutes != null) {
            return context.getString(
                R.string.widget_inline_rain_timing_start_only_format,
                formatMinuteLead(context, startMinutes)
            );
        }
        return context.getString(R.string.widget_inline_rain_timing_none);
    }

    private String formatMinuteLead(Context context, int minutes) {
        int safeMinutes = Math.max(0, minutes);
        if (safeMinutes == 0) {
            return context.getString(R.string.widget_inline_rain_timing_now);
        }
        int hours = safeMinutes / 60;
        int remainingMinutes = safeMinutes % 60;
        if (hours > 0 && remainingMinutes > 0) {
            return context.getString(R.string.widget_inline_hours_minutes_format, hours, remainingMinutes);
        }
        if (hours > 0) {
            if (hours == 1) {
                return context.getString(R.string.widget_inline_hours_format_singular, hours);
            }
            return context.getString(R.string.widget_inline_hours_format_plural, hours);
        }
        if (safeMinutes == 1) {
            return context.getString(R.string.widget_inline_minutes_format_singular, safeMinutes);
        }
        return context.getString(R.string.widget_inline_minutes_format_plural, safeMinutes);
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
        WidgetData cachedData = loadCachedWidgetData(context);
        Location location = getBestLastKnownLocation(context);
        if (location == null) {
            if (cachedData != null && hasRenderableData(cachedData)) {
                return cachedData;
            }
            WidgetData data = WidgetData.empty(context);
            data.locationLabel = context.getString(R.string.widget_location_current);
            return data;
        }

        WidgetData data = cachedData != null ? cachedData : WidgetData.empty(context);
        double lat = location.getLatitude();
        double lon = location.getLongitude();
        data.locationLabel = resolveLocationLabel(context, lat, lon);
        boolean weatherPayloadReceived = false;

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
            RainNowcastData rainNowcast = fetchRainNowcast(lat, lon);
            weatherPayloadReceived = current != null || daily != null;

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
                fillHourlyForecast(data, hourly, hourlyIndex);
                updateRainTiming(data, hourly, hourlyIndex, rainNowcast);
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

        if (weatherPayloadReceived && hasRenderableData(data)) {
            saveCachedWidgetData(context, data);
        }

        return data;
    }

    private boolean hasRenderableData(WidgetData data) {
        if (data == null) return false;
        if (!Double.isNaN(data.temperatureC)) return true;
        if (!Double.isNaN(data.maxTemperatureC) || !Double.isNaN(data.minTemperatureC)) return true;
        if (data.weatherCode >= 0 || data.tomorrowWeatherCode >= 0) return true;
        return false;
    }

    private WidgetData loadCachedWidgetData(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(PREF_CACHE_KEY, null);
        if (raw == null || raw.trim().isEmpty()) {
            return null;
        }
        try {
            JSONObject json = new JSONObject(raw);
            WidgetData data = WidgetData.empty(context);
            data.temperatureC = readCachedDouble(json, "temperatureC");
            data.feelsLikeC = readCachedDouble(json, "feelsLikeC");
            data.maxTemperatureC = readCachedDouble(json, "maxTemperatureC");
            data.minTemperatureC = readCachedDouble(json, "minTemperatureC");
            data.rainRate = readCachedDouble(json, "rainRate");
            data.uvIndex = readCachedDouble(json, "uvIndex");
            data.windKmh = readCachedDouble(json, "windKmh");
            data.tomorrowMaxTemperatureC = readCachedDouble(json, "tomorrowMaxTemperatureC");
            data.tomorrowMinTemperatureC = readCachedDouble(json, "tomorrowMinTemperatureC");
            data.tomorrowRainRate = readCachedDouble(json, "tomorrowRainRate");
            data.tomorrowUvIndex = readCachedDouble(json, "tomorrowUvIndex");
            data.tomorrowWindKmh = readCachedDouble(json, "tomorrowWindKmh");
            data.weatherCode = readCachedInt(json, "weatherCode", -1);
            data.tomorrowWeatherCode = readCachedInt(json, "tomorrowWeatherCode", -1);
            data.weatherLabel = readCachedString(json, "weatherLabel", data.weatherLabel);
            data.tomorrowWeatherLabel = readCachedString(json, "tomorrowWeatherLabel", data.tomorrowWeatherLabel);
            data.thunderRiskLabel = readCachedNullableString(json, "thunderRiskLabel");
            data.tomorrowThunderRiskLabel = readCachedNullableString(json, "tomorrowThunderRiskLabel");
            data.rainStartLabel = readCachedNullableString(json, "rainStartLabel");
            data.rainEndLabel = readCachedNullableString(json, "rainEndLabel");
            data.rainStartMinutes = readCachedNullableInt(json, "rainStartMinutes");
            data.rainEndMinutes = readCachedNullableInt(json, "rainEndMinutes");
            long cacheSavedAtMs = readCachedLong(json, PREF_CACHE_SAVED_AT_KEY, -1L);
            applyCachedRainTimingAge(data, cacheSavedAtMs);
            data.pollenLabel = readCachedString(json, "pollenLabel", data.pollenLabel);
            data.locationLabel = readCachedString(json, "locationLabel", data.locationLabel);

            JSONArray hourlyTemps = json.optJSONArray("hourlyTemps");
            JSONArray hourlyCodes = json.optJSONArray("hourlyCodes");
            JSONArray hourlyPrecipProbs = json.optJSONArray("hourlyPrecipProbs");
            JSONArray hourlyTimes = json.optJSONArray("hourlyTimes");
            for (int i = 0; i < data.hourlyTemps.length; i++) {
                if (hourlyTemps != null && i < hourlyTemps.length() && !hourlyTemps.isNull(i)) {
                    data.hourlyTemps[i] = hourlyTemps.optDouble(i, Double.NaN);
                }
                if (hourlyCodes != null && i < hourlyCodes.length() && !hourlyCodes.isNull(i)) {
                    data.hourlyCodes[i] = hourlyCodes.optInt(i, -1);
                }
                if (hourlyPrecipProbs != null && i < hourlyPrecipProbs.length() && !hourlyPrecipProbs.isNull(i)) {
                    data.hourlyPrecipProbs[i] = hourlyPrecipProbs.optDouble(i, Double.NaN);
                }
                if (hourlyTimes != null && i < hourlyTimes.length() && !hourlyTimes.isNull(i)) {
                    data.hourlyTimes[i] = hourlyTimes.optString(i, null);
                }
            }

            return hasRenderableData(data) ? data : null;
        } catch (JSONException e) {
            Log.w(TAG, "Failed to load cached widget data.", e);
            return null;
        }
    }

    private void saveCachedWidgetData(Context context, WidgetData data) {
        try {
            JSONObject json = new JSONObject();
            putCachedDouble(json, "temperatureC", data.temperatureC);
            putCachedDouble(json, "feelsLikeC", data.feelsLikeC);
            putCachedDouble(json, "maxTemperatureC", data.maxTemperatureC);
            putCachedDouble(json, "minTemperatureC", data.minTemperatureC);
            putCachedDouble(json, "rainRate", data.rainRate);
            putCachedDouble(json, "uvIndex", data.uvIndex);
            putCachedDouble(json, "windKmh", data.windKmh);
            putCachedDouble(json, "tomorrowMaxTemperatureC", data.tomorrowMaxTemperatureC);
            putCachedDouble(json, "tomorrowMinTemperatureC", data.tomorrowMinTemperatureC);
            putCachedDouble(json, "tomorrowRainRate", data.tomorrowRainRate);
            putCachedDouble(json, "tomorrowUvIndex", data.tomorrowUvIndex);
            putCachedDouble(json, "tomorrowWindKmh", data.tomorrowWindKmh);
            json.put("weatherCode", data.weatherCode);
            json.put("tomorrowWeatherCode", data.tomorrowWeatherCode);
            json.put("weatherLabel", data.weatherLabel);
            json.put("tomorrowWeatherLabel", data.tomorrowWeatherLabel);
            json.put("thunderRiskLabel", data.thunderRiskLabel == null ? JSONObject.NULL : data.thunderRiskLabel);
            json.put("tomorrowThunderRiskLabel", data.tomorrowThunderRiskLabel == null ? JSONObject.NULL : data.tomorrowThunderRiskLabel);
            json.put("rainStartLabel", data.rainStartLabel == null ? JSONObject.NULL : data.rainStartLabel);
            json.put("rainEndLabel", data.rainEndLabel == null ? JSONObject.NULL : data.rainEndLabel);
            json.put("rainStartMinutes", data.rainStartMinutes == null ? JSONObject.NULL : data.rainStartMinutes);
            json.put("rainEndMinutes", data.rainEndMinutes == null ? JSONObject.NULL : data.rainEndMinutes);
            json.put(PREF_CACHE_SAVED_AT_KEY, System.currentTimeMillis());
            json.put("pollenLabel", data.pollenLabel);
            json.put("locationLabel", data.locationLabel);

            JSONArray hourlyTemps = new JSONArray();
            JSONArray hourlyCodes = new JSONArray();
            JSONArray hourlyPrecipProbs = new JSONArray();
            JSONArray hourlyTimes = new JSONArray();
            for (int i = 0; i < data.hourlyTemps.length; i++) {
                hourlyTemps.put(Double.isNaN(data.hourlyTemps[i]) ? JSONObject.NULL : data.hourlyTemps[i]);
                hourlyCodes.put(data.hourlyCodes[i]);
                hourlyPrecipProbs.put(Double.isNaN(data.hourlyPrecipProbs[i]) ? JSONObject.NULL : data.hourlyPrecipProbs[i]);
                hourlyTimes.put(data.hourlyTimes[i] == null ? JSONObject.NULL : data.hourlyTimes[i]);
            }
            json.put("hourlyTemps", hourlyTemps);
            json.put("hourlyCodes", hourlyCodes);
            json.put("hourlyPrecipProbs", hourlyPrecipProbs);
            json.put("hourlyTimes", hourlyTimes);

            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putString(PREF_CACHE_KEY, json.toString()).apply();
        } catch (JSONException e) {
            Log.w(TAG, "Failed to cache widget data.", e);
        }
    }

    private void putCachedDouble(JSONObject json, String key, double value) throws JSONException {
        json.put(key, Double.isNaN(value) ? JSONObject.NULL : value);
    }

    private double readCachedDouble(JSONObject json, String key) {
        if (json == null || !json.has(key) || json.isNull(key)) return Double.NaN;
        return json.optDouble(key, Double.NaN);
    }

    private int readCachedInt(JSONObject json, String key, int fallback) {
        if (json == null || !json.has(key) || json.isNull(key)) return fallback;
        return json.optInt(key, fallback);
    }

    private long readCachedLong(JSONObject json, String key, long fallback) {
        if (json == null || !json.has(key) || json.isNull(key)) return fallback;
        Object value = json.opt(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value instanceof String) {
            try {
                return Long.parseLong(((String) value).trim());
            } catch (NumberFormatException ignored) {
                return fallback;
            }
        }
        return fallback;
    }

    private void applyCachedRainTimingAge(WidgetData data, long cacheSavedAtMs) {
        if (data == null || cacheSavedAtMs <= 0L) return;
        long nowMs = System.currentTimeMillis();
        if (nowMs <= cacheSavedAtMs) return;
        int elapsedMinutes = Math.max(0, (int) Math.round((nowMs - cacheSavedAtMs) / MILLIS_PER_MINUTE));
        if (elapsedMinutes <= 0) return;

        if (data.rainStartMinutes != null) {
            data.rainStartMinutes = Math.max(0, data.rainStartMinutes - elapsedMinutes);
        }
        if (data.rainEndMinutes != null) {
            int adjustedEnd = data.rainEndMinutes - elapsedMinutes;
            if (adjustedEnd <= 0) {
                data.rainStartMinutes = null;
                data.rainEndMinutes = null;
                data.rainStartLabel = null;
                data.rainEndLabel = null;
                data.rainRate = Double.NaN;
                return;
            }
            data.rainEndMinutes = adjustedEnd;
        }
    }

    private String readCachedString(JSONObject json, String key, String fallback) {
        if (json == null || !json.has(key) || json.isNull(key)) return fallback;
        String value = json.optString(key, fallback);
        if (value == null) return fallback;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }

    private String readCachedNullableString(JSONObject json, String key) {
        if (json == null || !json.has(key) || json.isNull(key)) return null;
        String value = json.optString(key, null);
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Integer readCachedNullableInt(JSONObject json, String key) {
        if (json == null || !json.has(key) || json.isNull(key)) return null;
        Object value = json.opt(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        if (value instanceof String) {
            try {
                return Integer.parseInt(((String) value).trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
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

    private String resolveLocationLabel(Context context, double lat, double lon) {
        try {
            Geocoder geocoder = new Geocoder(context, Locale.getDefault());
            List<Address> addresses = getAddressesForLocation(geocoder, lat, lon);
            if (addresses != null && !addresses.isEmpty()) {
                Address address = addresses.get(0);
                String locality = firstNonEmpty(
                    address.getLocality(),
                    address.getSubAdminArea(),
                    address.getAdminArea()
                );
                if (locality != null) {
                    return locality;
                }
            }
        } catch (IOException | IllegalArgumentException | InterruptedException e) {
            Log.w(TAG, "Failed to resolve widget location label from coordinates.", e);
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
        }
        return context.getString(R.string.widget_location_current);
    }

    private List<Address> getAddressesForLocation(Geocoder geocoder, double lat, double lon) throws IOException, InterruptedException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            AtomicReference<List<Address>> addressesRef = new AtomicReference<>(new ArrayList<>());
            CountDownLatch latch = new CountDownLatch(1);
            geocoder.getFromLocation(lat, lon, 1, new Geocoder.GeocodeListener() {
                @Override
                public void onGeocode(List<Address> addresses) {
                    addressesRef.set(addresses);
                    latch.countDown();
                }

                @Override
                public void onError(String errorMessage) {
                    latch.countDown();
                }
            });
            latch.await(2, TimeUnit.SECONDS);
            return addressesRef.get();
        }
        return geocoder.getFromLocation(lat, lon, 1);
    }

    private String firstNonEmpty(String... values) {
        for (String value : values) {
            if (value == null) continue;
            String trimmed = value.trim();
            if (!trimmed.isEmpty()) {
                return trimmed;
            }
        }
        return null;
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

    private int readHourlyIntValue(JSONObject hourly, String field, int index) {
        if (hourly == null) return -1;
        JSONArray values = hourly.optJSONArray(field);
        if (values == null || index < 0 || index >= values.length()) return -1;
        return values.optInt(index, -1);
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

    private RainNowcastData fetchRainNowcast(double latitude, double longitude) {
        if (isInGermany(latitude, longitude)) {
            try {
                String radarUrl = String.format(
                    Locale.US,
                    BRIGHTSKY_RADAR_API_URL_TEMPLATE,
                    latitude,
                    longitude,
                    RADAR_NOWCAST_DISTANCE_METERS
                );
                String radarResponse = httpGet(radarUrl);
                RainNowcastData parsedRadar = parseBrightSkyRadarNowcast(new JSONObject(radarResponse));
                if (parsedRadar != null) {
                    return parsedRadar;
                }
            } catch (Exception e) {
                Log.w(TAG, "Bright Sky radar unavailable for widget nowcast.", e);
            }
        }

        try {
            String nowcastUrl = String.format(
                Locale.US,
                NOWCAST_API_URL_TEMPLATE,
                latitude,
                longitude
            );
            String nowcastResponse = httpGet(nowcastUrl);
            return parseOpenMeteoNowcast(new JSONObject(nowcastResponse));
        } catch (Exception e) {
            Log.w(TAG, "Open-Meteo nowcast unavailable for widget timing.", e);
            return null;
        }
    }

    private boolean isInGermany(double lat, double lon) {
        return lat >= 47.27 && lat <= 55.06 && lon >= 5.87 && lon <= 15.04;
    }

    private RainNowcastData parseOpenMeteoNowcast(JSONObject nowcast) {
        if (nowcast == null) return null;
        JSONObject minutely = nowcast.optJSONObject("minutely_15");
        if (minutely == null) return null;
        JSONArray times = minutely.optJSONArray("time");
        JSONArray precipitation = minutely.optJSONArray("precipitation");
        if (times == null || precipitation == null) return null;

        int length = Math.min(times.length(), precipitation.length());
        if (length <= 0) return null;
        RainNowcastData data = new RainNowcastData(MINUTELY_SLOT_DURATION_MINUTES);
        for (int i = 0; i < length; i++) {
            long slotMs = parseIsoTimeToMillis(times.optString(i, null));
            if (slotMs <= 0) continue;
            data.slotStartMillis.add(slotMs);
            data.precipitationMm.add(Math.max(0d, precipitation.optDouble(i, 0d)));
        }
        return data.slotStartMillis.isEmpty() ? null : data;
    }

    private RainNowcastData parseBrightSkyRadarNowcast(JSONObject radar) {
        if (radar == null) return null;
        JSONArray radarEntries = radar.optJSONArray("radar");
        if (radarEntries == null || radarEntries.length() == 0) return null;

        RainNowcastData data = new RainNowcastData(RADAR_SLOT_DURATION_MINUTES);
        for (int i = 0; i < radarEntries.length(); i++) {
            JSONObject entry = radarEntries.optJSONObject(i);
            if (entry == null) continue;
            long slotMs = parseIsoTimeToMillis(entry.optString("timestamp", null));
            if (slotMs <= 0) continue;
            JSONArray precipitationGrid = entry.optJSONArray("precipitation_5");
            if (precipitationGrid == null) continue;
            double localPrecipitation = extractLocalRadarPrecipitation(precipitationGrid);
            data.slotStartMillis.add(slotMs);
            data.precipitationMm.add(Math.max(0d, localPrecipitation));
        }
        return data.slotStartMillis.isEmpty() ? null : data;
    }

    private double extractLocalRadarPrecipitation(JSONArray grid) {
        if (grid == null || grid.length() == 0) return 0d;
        int rowCenter = grid.length() / 2;
        JSONArray centerRow = grid.optJSONArray(rowCenter);
        if (centerRow == null || centerRow.length() == 0) return 0d;
        int colCenter = centerRow.length() / 2;

        double weightedSum = 0d;
        double totalWeight = 0d;
        double localPeak = 0d;
        int rowMin = Math.max(0, rowCenter - RADAR_CENTER_RADIUS_CELLS);
        int rowMax = Math.min(grid.length() - 1, rowCenter + RADAR_CENTER_RADIUS_CELLS);

        for (int row = rowMin; row <= rowMax; row++) {
            JSONArray rowValues = grid.optJSONArray(row);
            if (rowValues == null || rowValues.length() == 0) continue;
            int colMin = Math.max(0, colCenter - RADAR_CENTER_RADIUS_CELLS);
            int colMax = Math.min(rowValues.length() - 1, colCenter + RADAR_CENTER_RADIUS_CELLS);
            for (int col = colMin; col <= colMax; col++) {
                double rawValue = rowValues.optDouble(col, 0d);
                double mmPerFiveMinutes = rawValue > 0d ? rawValue / 100d : 0d;
                int distance = Math.abs(row - rowCenter) + Math.abs(col - colCenter);
                double weight;
                if (distance == 0) {
                    weight = RADAR_CENTER_WEIGHT;
                } else if (distance == 1) {
                    weight = RADAR_ADJACENT_WEIGHT;
                } else {
                    weight = RADAR_DIAGONAL_WEIGHT;
                }
                weightedSum += mmPerFiveMinutes * weight;
                totalWeight += weight;
                localPeak = Math.max(localPeak, mmPerFiveMinutes);
            }
        }

        if (totalWeight <= 0d) return 0d;
        double localAverage = weightedSum / totalWeight;
        return Math.max(localAverage, localPeak * RADAR_LOCAL_PEAK_BLEND);
    }

    private long parseIsoTimeToMillis(String isoTime) {
        if (isoTime == null || isoTime.trim().isEmpty()) return -1L;
        String normalizedTime = isoTime.trim();
        try {
            SimpleDateFormat parser = ISO_HOUR_PARSER.get();
            Date parsed = parser.parse(normalizedTime);
            return parsed == null ? -1L : parsed.getTime();
        } catch (ParseException e) {
            String[] fallbackPatterns = {
                "yyyy-MM-dd'T'HH:mm:ssX",
                "yyyy-MM-dd'T'HH:mm:ssXXX",
                "yyyy-MM-dd'T'HH:mm:ss.SSSX",
                "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
            };
            for (String pattern : fallbackPatterns) {
                try {
                    SimpleDateFormat fallbackParser = new SimpleDateFormat(pattern, Locale.US);
                    fallbackParser.setLenient(false);
                    fallbackParser.setTimeZone(TimeZone.getTimeZone("UTC"));
                    Date parsed = fallbackParser.parse(normalizedTime);
                    if (parsed != null) {
                        return parsed.getTime();
                    }
                } catch (ParseException ignored) {
                    // Try next parser pattern.
                }
            }
            Log.d(TAG, "Unable to parse nowcast timestamp: " + normalizedTime);
            return -1L;
        }
    }

    private void updateRainTiming(WidgetData data, JSONObject hourly, int currentHourIndex, RainNowcastData nowcastData) {
        if (data == null || hourly == null || currentHourIndex < 0) return;
        data.rainStartLabel = null;
        data.rainEndLabel = null;
        data.rainStartMinutes = null;
        data.rainEndMinutes = null;
        if (applyNowcastRainTiming(data, nowcastData)) {
            return;
        }

        JSONArray times = hourly.optJSONArray("time");
        if (times == null || times.length() == 0) return;

        int length = times.length();
        int eventStartIndex = -1;
        boolean rainingNow = !Double.isNaN(data.rainRate) && data.rainRate > RAIN_TIMING_RATE_THRESHOLD_MM_H;

        if (rainingNow && hasRainSignal(hourly, currentHourIndex)) {
            eventStartIndex = currentHourIndex;
        } else {
            // When nowcast data was available and found no rain, it has already confirmed
            // there is no precipitation in the next ~120 minutes. In that case skip the
            // current hour slot (whose start time may lie in the past) to avoid reporting
            // a past hourly slot as "starting now" when the user is not actually being rained on.
            boolean nowcastConfirmedNoRain = nowcastData != null && !nowcastData.slotStartMillis.isEmpty();
            int searchFrom = (nowcastConfirmedNoRain && !rainingNow)
                ? currentHourIndex + 1
                : Math.max(0, currentHourIndex);
            for (int i = searchFrom; i < length; i++) {
                if (hasRainSignal(hourly, i)) {
                    eventStartIndex = i;
                    break;
                }
            }
        }

        if (eventStartIndex < 0) return;

        int eventEndIndex = eventStartIndex;
        for (int i = eventStartIndex + 1; i < length; i++) {
            if (hasRainSignal(hourly, i)) {
                eventEndIndex = i;
            } else {
                break;
            }
        }

        data.rainStartLabel = extractHourLabel(times, eventStartIndex);
        data.rainEndLabel = extractHourLabel(times, Math.min(eventEndIndex + 1, length - 1));

        long nowMs = System.currentTimeMillis();
        long startMs = extractHourMillis(times, eventStartIndex);
        long endMs = extractHourMillis(times, Math.min(eventEndIndex + 1, length - 1));
        if (startMs > 0) {
            data.rainStartMinutes = Math.max(0, (int) Math.round((startMs - nowMs) / MILLIS_PER_MINUTE));
        }
        if (endMs > 0) {
            data.rainEndMinutes = Math.max(0, (int) Math.round((endMs - nowMs) / MILLIS_PER_MINUTE));
        }
        if (rainingNow) {
            data.rainStartMinutes = 0;
        }
    }

    private boolean applyNowcastRainTiming(WidgetData data, RainNowcastData nowcastData) {
        if (data == null || nowcastData == null || nowcastData.slotStartMillis.isEmpty()) {
            return false;
        }

        long nowMs = System.currentTimeMillis();
        int intervalMinutes = Math.max(1, nowcastData.intervalMinutes);
        long slotDurationMs = (long) intervalMinutes * 60_000L;
        double nowcastRateFactor = 60d / intervalMinutes;
        int firstActiveIndex = -1;
        for (int i = 0; i < nowcastData.slotStartMillis.size(); i++) {
            long slotStartMs = nowcastData.slotStartMillis.get(i);
            long slotEndMs = slotStartMs + slotDurationMs;
            if (slotEndMs > nowMs) {
                firstActiveIndex = i;
                break;
            }
        }
        if (firstActiveIndex < 0) {
            return false;
        }
        int maxSlots = (int) Math.ceil((double) NOWCAST_LOOKAHEAD_MINUTES / intervalMinutes);
        int endExclusive = Math.min(nowcastData.slotStartMillis.size(), firstActiveIndex + maxSlots);
        long eventStartMs = -1L;
        long eventEndMs = -1L;
        boolean eventClosed = false;
        boolean rainingNow = false;
        boolean currentSlotFound = false;

        for (int i = firstActiveIndex; i < endExclusive; i++) {
            long slotStartMs = nowcastData.slotStartMillis.get(i);
            long slotEndMs = slotStartMs + slotDurationMs;

            double slotPrecipitation = i < nowcastData.precipitationMm.size()
                ? nowcastData.precipitationMm.get(i)
                : 0d;
            double slotRate = Math.max(0d, slotPrecipitation) * nowcastRateFactor;
            boolean hasPrecipitation = slotPrecipitation > LIGHT_PRECIP_THRESHOLD_MM;

            if (slotStartMs <= nowMs && slotEndMs > nowMs) {
                currentSlotFound = true;
                data.rainRate = slotRate;
                if (hasPrecipitation) {
                    rainingNow = true;
                }
            }

            if (eventClosed) continue;

            if (eventStartMs < 0L && hasPrecipitation) {
                eventStartMs = Math.max(slotStartMs, nowMs);
            }
            if (eventStartMs >= 0L && hasPrecipitation) {
                eventEndMs = slotEndMs;
            } else if (eventStartMs >= 0L && !hasPrecipitation) {
                eventClosed = true;
            }
        }
        if (!currentSlotFound) {
            data.rainRate = Double.NaN;
        }

        if (eventStartMs < 0L) {
            return false;
        }

        data.rainStartLabel = formatClockTime(eventStartMs);
        data.rainStartMinutes = Math.max(0, (int) Math.round((eventStartMs - nowMs) / MILLIS_PER_MINUTE));
        if (rainingNow) {
            data.rainStartMinutes = 0;
        }

        if (eventEndMs >= 0L) {
            data.rainEndLabel = formatClockTime(eventEndMs);
            data.rainEndMinutes = Math.max(0, (int) Math.round((eventEndMs - nowMs) / MILLIS_PER_MINUTE));
        }
        return true;
    }

    private String formatClockTime(long timeMs) {
        if (timeMs <= 0L) return null;
        return DateFormat.format("HH:mm", new Date(timeMs)).toString();
    }

    private boolean hasRainSignal(JSONObject hourly, int index) {
        double precipitation = readHourlyValue(hourly, "precipitation", index);
        if (!Double.isNaN(precipitation) && precipitation > LIGHT_PRECIP_THRESHOLD_MM) {
            return true;
        }
        double snowfall = readHourlyValue(hourly, "snowfall", index);
        if (!Double.isNaN(snowfall) && snowfall > LIGHT_PRECIP_THRESHOLD_MM) {
            return true;
        }
        int weatherCode = readHourlyIntValue(hourly, "weathercode", index);
        if (isRainCode(weatherCode)) {
            return true;
        }
        double precipProb = readHourlyValue(hourly, "precipitation_probability", index);
        return !Double.isNaN(precipProb) && precipProb >= RAIN_TIMING_PRECIP_PROB_THRESHOLD;
    }

    private boolean isRainCode(int weatherCode) {
        switch (weatherCode) {
            case 51:
            case 53:
            case 55:
            case 56:
            case 57:
            case 61:
            case 63:
            case 65:
            case 66:
            case 67:
            case 80:
            case 81:
            case 82:
                return true;
            default:
                return false;
        }
    }

    private String extractHourLabel(JSONArray times, int index) {
        if (times == null || index < 0 || index >= times.length()) return null;
        String raw = times.optString(index, null);
        if (raw == null || raw.trim().isEmpty()) return null;
        int tPos = raw.lastIndexOf('T');
        if (tPos >= 0 && tPos + 1 < raw.length()) {
            return raw.substring(tPos + 1);
        }
        return raw;
    }

    private long extractHourMillis(JSONArray times, int index) {
        if (times == null || index < 0 || index >= times.length()) return -1L;
        String raw = times.optString(index, null);
        return parseIsoTimeToMillis(raw);
    }

    private String formatRainWindow(Context context, WidgetData data) {
        if (data == null || data.rainStartLabel == null || data.rainEndLabel == null) {
            return context.getString(R.string.widget_metric_unavailable);
        }
        return context.getString(
            R.string.widget_rain_window_format,
            data.rainStartLabel,
            data.rainEndLabel
        );
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

    private String safeText(String value) {
        if (value == null || value.trim().isEmpty()) {
            return UNAVAILABLE;
        }
        return value;
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

    private static class RainNowcastData {
        final int intervalMinutes;
        final List<Long> slotStartMillis = new ArrayList<>();
        final List<Double> precipitationMm = new ArrayList<>();

        RainNowcastData(int intervalMinutes) {
            this.intervalMinutes = intervalMinutes;
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
        String rainStartLabel;
        String rainEndLabel;
        Integer rainStartMinutes;
        Integer rainEndMinutes;
        String pollenLabel;
        String locationLabel;
        double[] hourlyTemps = new double[6];
        int[] hourlyCodes = new int[6];
        double[] hourlyPrecipProbs = new double[6];
        String[] hourlyTimes = new String[6];

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
            data.rainStartLabel = null;
            data.rainEndLabel = null;
            data.rainStartMinutes = null;
            data.rainEndMinutes = null;
            data.pollenLabel = context.getString(R.string.widget_metric_unavailable);
            data.locationLabel = context.getString(R.string.widget_title);
            java.util.Arrays.fill(data.hourlyTemps, Double.NaN);
            java.util.Arrays.fill(data.hourlyCodes, -1);
            java.util.Arrays.fill(data.hourlyPrecipProbs, Double.NaN);
            java.util.Arrays.fill(data.hourlyTimes, null);
            return data;
        }
    }

}

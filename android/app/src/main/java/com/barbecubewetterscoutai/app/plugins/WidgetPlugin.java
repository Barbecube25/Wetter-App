package com.barbecubewetterscoutai.app.plugins;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import com.barbecubewetterscoutai.app.widget.AiReportWidgetProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetPlugin")
public class WidgetPlugin extends Plugin {

    /** Sentinel that matches AiReportWidgetProvider.NO_TEMP – signals "no data for this period". */
    private static final int NO_TEMP = Integer.MAX_VALUE;

    @PluginMethod
    public void updateAiReport(PluginCall call) {
        String report = call.getString("report", "");
        if (report == null || report.trim().isEmpty()) {
            call.resolve();
            return;
        }

        Context context = getContext();
        if (context == null) {
            call.reject("Context unavailable");
            return;
        }

        // Persist all widget data so the widget can read them without the app being open
        SharedPreferences prefs = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();

        editor.putString("ai_report", report);

        // Location name
        editor.putString("location_name", orEmpty(call.getString("locationName", "")));

        // Current conditions
        editor.putInt("current_temp", call.getInt("currentTemp", NO_TEMP));
        editor.putString("current_emoji", orEmpty(call.getString("currentEmoji", "")));
        editor.putString("current_label", orEmpty(call.getString("currentLabel", "")));

        // Time period: morning (06–10 h)
        editor.putInt("morning_temp", call.getInt("morningTemp", NO_TEMP));
        editor.putString("morning_emoji", orEmpty(call.getString("morningEmoji", "")));

        // Time period: noon (10–14 h)
        editor.putInt("noon_temp", call.getInt("noonTemp", NO_TEMP));
        editor.putString("noon_emoji", orEmpty(call.getString("noonEmoji", "")));

        // Time period: evening (16–20 h)
        editor.putInt("evening_temp", call.getInt("eveningTemp", NO_TEMP));
        editor.putString("evening_emoji", orEmpty(call.getString("eveningEmoji", "")));

        // Time period: night (21–06 h)
        editor.putInt("night_temp", call.getInt("nightTemp", NO_TEMP));
        editor.putString("night_emoji", orEmpty(call.getString("nightEmoji", "")));

        // Weather warnings
        editor.putInt("warning_count", call.getInt("warningCount", 0));
        editor.putString("warning_text", orEmpty(call.getString("warningText", "")));

        editor.commit();

        // Directly update each widget instance for immediate refresh
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(
                new ComponentName(context, AiReportWidgetProvider.class));
        for (int appWidgetId : appWidgetIds) {
            AiReportWidgetProvider.updateAppWidget(context, appWidgetManager, appWidgetId);
        }

        call.resolve();
    }

    private static String orEmpty(String s) {
        return s != null ? s : "";
    }
}

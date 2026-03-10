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

        // Persist the report text for the widget to read
        SharedPreferences prefs = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE);
        prefs.edit().putString("ai_report", report).commit();

        // Directly update each widget instance for immediate refresh
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(
                new ComponentName(context, AiReportWidgetProvider.class));
        for (int appWidgetId : appWidgetIds) {
            AiReportWidgetProvider.updateAppWidget(context, appWidgetManager, appWidgetId);
        }

        call.resolve();
    }
}

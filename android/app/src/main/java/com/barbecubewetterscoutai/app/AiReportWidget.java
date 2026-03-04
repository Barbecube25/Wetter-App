package com.barbecubewetterscoutai.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class AiReportWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences prefs = context.getSharedPreferences(WidgetPlugin.PREFS_NAME, Context.MODE_PRIVATE);
        String report = prefs.getString(WidgetPlugin.KEY_REPORT, context.getString(R.string.widget_no_data));

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_ai_report);
            views.setTextViewText(R.id.widget_report_text, report);
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}

package com.barbecubewetterscoutai.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class AiReportWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences prefs = context.getSharedPreferences(WidgetPlugin.PREFS_NAME, Context.MODE_PRIVATE);
        String report = prefs.getString(WidgetPlugin.KEY_REPORT, context.getString(R.string.widget_no_data));

        String today = new SimpleDateFormat("EEE, dd. MMM", new Locale("de", "DE")).format(new Date());

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_ai_report);
            views.setTextViewText(R.id.widget_content, report);
            views.setTextViewText(R.id.widget_date, today);
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}

package com.barbecubewetterscoutai.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.barbecubewetterscoutai.app.MainActivity
import com.barbecubewetterscoutai.app.R

class AiReportWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE)
            val reportText = prefs.getString("ai_report", "Noch kein Bericht verfügbar. Öffne die App, um die KI-Analyse zu laden.")

            val views = RemoteViews(context.packageName, R.layout.widget_ai_report)
            views.setTextViewText(R.id.widget_content, reportText)

            // Klick auf das Widget öffnet die App
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 0, intent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}

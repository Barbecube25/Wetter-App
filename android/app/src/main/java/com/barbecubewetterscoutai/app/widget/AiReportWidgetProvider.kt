package com.barbecubewetterscoutai.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import com.barbecubewetterscoutai.app.MainActivity
import com.barbecubewetterscoutai.app.R
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AiReportWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            try {
                updateAppWidget(context, appWidgetManager, appWidgetId)
            } catch (e: Exception) {
                Log.e(TAG, "Fehler beim Aktualisieren des Widgets (ID $appWidgetId)", e)
            }
        }
    }

    companion object {
        private const val TAG = "AiReportWidget"
        private const val DEFAULT_REPORT = "Noch kein Bericht verfügbar. Öffne die App, um die KI-Analyse zu laden."

        @JvmStatic
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            try {
                val prefs = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE)
                val reportText: String = prefs.getString("ai_report", null) ?: DEFAULT_REPORT

                val today = SimpleDateFormat("EEE, dd. MMM", Locale("de", "DE")).format(Date())

                val views = RemoteViews(context.packageName, R.layout.widget_ai_report)
                views.setTextViewText(R.id.widget_content, reportText)
                views.setTextViewText(R.id.widget_date, today)

                // Klick auf das Widget öffnet die App
                val intent = Intent(context, MainActivity::class.java)
                val pendingIntent = PendingIntent.getActivity(
                    context, 0, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (e: Exception) {
                Log.e(TAG, "Fehler beim Erstellen der Widget-Ansicht (ID $appWidgetId)", e)
            }
        }
    }
}

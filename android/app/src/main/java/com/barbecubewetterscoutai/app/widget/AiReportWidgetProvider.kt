package com.barbecubewetterscoutai.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.util.Log
import android.view.View
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
            } catch (t: Throwable) {
                Log.e(TAG, "Fehler beim Aktualisieren des Widgets (ID $appWidgetId)", t)
                // Show a minimal fallback so the launcher never displays "Can't load widget"
                showFallbackWidget(context, appWidgetManager, appWidgetId)
            }
        }
    }

    companion object {
        private const val TAG = "AiReportWidget"
        private const val DEFAULT_REPORT = "Noch kein Bericht verfügbar. Öffne die App, um die KI-Analyse zu laden."
        private const val NO_TEMP = Int.MAX_VALUE

        /** Maximum characters for the AI-report text sent via Binder IPC.
         *  Keeps the RemoteViews parcel well below the 1 MB Binder limit. */
        private const val MAX_REPORT_CHARS = 400

        @JvmStatic
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            try {
                val prefs = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE)

                // Truncate the report text to prevent TransactionTooLargeException when
                // passing the RemoteViews parcel to the launcher via Binder IPC.
                // WidgetPlugin.java also truncates at write-time; this is a
                // belt-and-suspenders check for data written by older app versions.
                val rawReport: String = prefs.getString("ai_report", null) ?: DEFAULT_REPORT
                val reportText = if (rawReport.length > MAX_REPORT_CHARS)
                    rawReport.take(MAX_REPORT_CHARS) + "…"
                else
                    rawReport
                val today = SimpleDateFormat("EEE, dd. MMM", Locale("de", "DE")).format(Date())

                // Location name
                val locationName = prefs.getString("location_name", "") ?: ""

                // Current conditions
                val curTemp   = prefs.getInt("current_temp", NO_TEMP)
                val curEmoji  = prefs.getString("current_emoji", "") ?: ""
                val curLabel  = prefs.getString("current_label", "") ?: ""

                // Time periods
                val morTemp  = prefs.getInt("morning_temp", NO_TEMP)
                val morEmoji = prefs.getString("morning_emoji", "") ?: ""
                val noonTemp  = prefs.getInt("noon_temp", NO_TEMP)
                val noonEmoji = prefs.getString("noon_emoji", "") ?: ""
                val eveTemp  = prefs.getInt("evening_temp", NO_TEMP)
                val eveEmoji = prefs.getString("evening_emoji", "") ?: ""
                val ngtTemp  = prefs.getInt("night_temp", NO_TEMP)
                val ngtEmoji = prefs.getString("night_emoji", "") ?: ""

                // Warnings
                val warnCount = prefs.getInt("warning_count", 0)
                val warnText  = prefs.getString("warning_text", "") ?: ""

                val views = RemoteViews(context.packageName, R.layout.widget_ai_report)

                // --- Header ---
                views.setTextViewText(R.id.widget_date, today)

                // --- Location name subtitle ---
                if (locationName.isNotEmpty()) {
                    views.setTextViewText(R.id.widget_location, "📍 $locationName")
                    views.setViewVisibility(R.id.widget_location, View.VISIBLE)
                } else {
                    views.setViewVisibility(R.id.widget_location, View.GONE)
                }

                // --- Current weather row ---
                if (curTemp != NO_TEMP) {
                    val currentLine = buildString {
                        if (curEmoji.isNotEmpty()) append("$curEmoji ")
                        append("${curTemp}°")
                        if (curLabel.isNotEmpty()) append("  $curLabel")
                    }
                    views.setTextViewText(R.id.widget_current_weather, currentLine)
                    views.setViewVisibility(R.id.widget_current_row, View.VISIBLE)
                } else {
                    views.setViewVisibility(R.id.widget_current_row, View.GONE)
                }

                // --- AI report ---
                views.setTextViewText(R.id.widget_content, reportText)

                // --- Time periods ---
                val hasPeriods = morTemp != NO_TEMP || noonTemp != NO_TEMP ||
                                 eveTemp != NO_TEMP || ngtTemp != NO_TEMP
                if (hasPeriods) {
                    views.setViewVisibility(R.id.widget_periods_row, View.VISIBLE)
                    setPeriod(views, R.id.widget_morning_emoji, R.id.widget_morning_temp, morEmoji, morTemp)
                    setPeriod(views, R.id.widget_noon_emoji,    R.id.widget_noon_temp,    noonEmoji, noonTemp)
                    setPeriod(views, R.id.widget_evening_emoji, R.id.widget_evening_temp, eveEmoji, eveTemp)
                    setPeriod(views, R.id.widget_night_emoji,   R.id.widget_night_temp,   ngtEmoji, ngtTemp)
                } else {
                    views.setViewVisibility(R.id.widget_periods_row, View.GONE)
                }

                // --- Warning row ---
                if (warnCount > 0) {
                    val warnLine = if (warnText.isNotEmpty()) {
                        "⚠️  $warnText"
                    } else {
                        "⚠️  $warnCount Wetterwarnung${if (warnCount > 1) "en" else ""}"
                    }
                    views.setTextViewText(R.id.widget_warning_text, warnLine)
                    views.setViewVisibility(R.id.widget_warning_row, View.VISIBLE)
                } else {
                    views.setViewVisibility(R.id.widget_warning_row, View.GONE)
                }

                // --- Click opens the app ---
                val intent = Intent(context, MainActivity::class.java)
                val pendingIntent = PendingIntent.getActivity(
                    context, 0, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (t: Throwable) {
                Log.e(TAG, "Fehler beim Erstellen der Widget-Ansicht (ID $appWidgetId)", t)
                showFallbackWidget(context, appWidgetManager, appWidgetId)
            }
        }

        /** Sets the emoji and temperature TextViews for one time-period column. */
        private fun setPeriod(
            views: RemoteViews,
            emojiId: Int,
            tempId: Int,
            emoji: String,
            temp: Int
        ) {
            views.setTextViewText(emojiId, if (emoji.isNotEmpty()) emoji else "–")
            views.setTextViewText(tempId,  if (temp != NO_TEMP) "${temp}°" else "–")
        }

        /**
         * Shows a minimal "please open the app" widget so the launcher never displays
         * the system "Can't load widget" error message when the normal update fails.
         */
        private fun showFallbackWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            try {
                val views = RemoteViews(context.packageName, R.layout.widget_ai_report)
                views.setTextViewText(R.id.widget_content, DEFAULT_REPORT)
                views.setViewVisibility(R.id.widget_location, View.GONE)
                views.setViewVisibility(R.id.widget_current_row, View.GONE)
                views.setViewVisibility(R.id.widget_periods_row, View.GONE)
                views.setViewVisibility(R.id.widget_warning_row, View.GONE)
                val intent = Intent(context, MainActivity::class.java)
                val pendingIntent = PendingIntent.getActivity(
                    context, 0, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)
                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (t: Throwable) {
                Log.e(TAG, "Fallback-Widget konnte nicht angezeigt werden (ID $appWidgetId)", t)
            }
        }
    }
}

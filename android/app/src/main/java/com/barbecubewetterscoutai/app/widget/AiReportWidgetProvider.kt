package com.barbecubewetterscoutai.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.os.Bundle
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

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle
    ) {
        try {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        } catch (t: Throwable) {
            Log.e(TAG, "Fehler beim Resize-Update des Widgets (ID $appWidgetId)", t)
        }
    }

    companion object {
        private const val TAG = "AiReportWidget"
        private const val DEFAULT_REPORT = "Noch kein Bericht verfügbar. Öffne die App, um die KI-Analyse zu laden."
        private const val NO_TEMP = Int.MAX_VALUE

        /** Maximum characters for the AI-report text sent via Binder IPC.
         *  Keeps the RemoteViews parcel well below the 1 MB Binder limit. */
        private const val MAX_REPORT_CHARS = 400

        /**
         * Determines display mode from the current widget width (in dp).
         * Returns 2, 3, or 4 for 2-column, 3-column, or 4-column display mode.
         *   2-col (< 180 dp): location + current temp + time periods
         *   3-col (< 250 dp): + precipitation row
         *   4-col (≥ 250 dp): + AI weather report
         */
        private fun getColumnMode(appWidgetManager: AppWidgetManager, appWidgetId: Int): Int {
            val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
            val minWidthDp = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 250)
            return when {
                minWidthDp < 180 -> 2
                minWidthDp < 250 -> 3
                else -> 4
            }
        }

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

                // Precipitation per period (in mm, -1 means no data)
                val morPrecip  = prefs.getFloat("morning_precip", -1f)
                val noonPrecip = prefs.getFloat("noon_precip", -1f)
                val evePrecip  = prefs.getFloat("evening_precip", -1f)
                val ngtPrecip  = prefs.getFloat("night_precip", -1f)

                // Warnings
                val warnCount = prefs.getInt("warning_count", 0)
                val warnText  = prefs.getString("warning_text", "") ?: ""

                // Determine how many columns are allocated to this widget instance
                val colMode = getColumnMode(appWidgetManager, appWidgetId)

                val views = RemoteViews(context.packageName, R.layout.widget_ai_report)

                // --- Header: location (bold) + date ---
                views.setTextViewText(R.id.widget_date, today)
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

                // --- Time periods (always shown when data available) ---
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

                // --- Precipitation row (shown for 3-col and wider) ---
                if (colMode >= 3) {
                    views.setViewVisibility(R.id.widget_precip_divider, View.VISIBLE)
                    views.setViewVisibility(R.id.widget_precipitation_row, View.VISIBLE)
                    views.setTextViewText(R.id.widget_morning_precip, formatPrecip(morPrecip))
                    views.setTextViewText(R.id.widget_noon_precip,    formatPrecip(noonPrecip))
                    views.setTextViewText(R.id.widget_evening_precip, formatPrecip(evePrecip))
                    views.setTextViewText(R.id.widget_night_precip,   formatPrecip(ngtPrecip))
                } else {
                    views.setViewVisibility(R.id.widget_precip_divider, View.GONE)
                    views.setViewVisibility(R.id.widget_precipitation_row, View.GONE)
                }

                // --- AI report (shown for 4-col only) ---
                if (colMode >= 4) {
                    views.setViewVisibility(R.id.widget_ai_divider, View.VISIBLE)
                    views.setViewVisibility(R.id.widget_content, View.VISIBLE)
                    views.setTextViewText(R.id.widget_content, reportText)
                } else {
                    views.setViewVisibility(R.id.widget_ai_divider, View.GONE)
                    views.setViewVisibility(R.id.widget_content, View.GONE)
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

        /** Formats a precipitation value (mm) for display. Negative means no data. */
        private fun formatPrecip(mm: Float): String {
            if (mm < 0f) return "–"
            // Always use one decimal place for consistency; integers for large amounts
            return if (mm < 10f) String.format("%.1fmm", mm) else "${mm.toInt()}mm"
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
                views.setViewVisibility(R.id.widget_location, View.GONE)
                views.setViewVisibility(R.id.widget_current_row, View.GONE)
                views.setViewVisibility(R.id.widget_periods_row, View.GONE)
                views.setViewVisibility(R.id.widget_precip_divider, View.GONE)
                views.setViewVisibility(R.id.widget_precipitation_row, View.GONE)
                views.setViewVisibility(R.id.widget_ai_divider, View.VISIBLE)
                views.setViewVisibility(R.id.widget_content, View.VISIBLE)
                views.setTextViewText(R.id.widget_content, DEFAULT_REPORT)
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

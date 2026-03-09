package com.barbecubewetterscoutai.wear

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.NoDataComplicationData
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeoutOrNull
import kotlin.math.roundToInt

/**
 * Wear OS Complication data source that provides the current temperature
 * for use on watch faces.
 *
 * Supported types:
 *  - SHORT_TEXT  → e.g. "18°"
 *  - LONG_TEXT   → e.g. "18°C ☀️ Klar"
 */
class TemperatureComplicationService : SuspendingComplicationDataSourceService() {

    companion object {
        private const val LOCATION_TIMEOUT_MS = 15_000L
    }

    /**
     * Returns static preview data shown in the watch face editor.
     * No network call is made here.
     */
    override fun getPreviewData(type: ComplicationType): ComplicationData? = when (type) {
        ComplicationType.SHORT_TEXT -> ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder("18°").build(),
            contentDescription = PlainComplicationText.Builder("Temperatur 18°C").build()
        ).build()

        ComplicationType.LONG_TEXT -> LongTextComplicationData.Builder(
            text = PlainComplicationText.Builder("18°C ☀️ Klar").build(),
            contentDescription = PlainComplicationText.Builder("Temperatur 18°C, klar").build()
        ).build()

        else -> null
    }

    /**
     * Called by the Wear OS system when fresh complication data is needed.
     * Fetches the current location and temperature, then returns the appropriate
     * [ComplicationData] based on the requested type.
     */
    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        val context = applicationContext
        return try {
            val location = resolveLocation(context)
            val data = location?.let {
                WeatherRepository.fetchWeather(it.latitude, it.longitude)
            }
            if (data != null) buildComplicationData(request.complicationType, data)
            else buildNoDataComplication(request.complicationType)
        } catch (e: Exception) {
            buildNoDataComplication(request.complicationType)
        }
    }

    private fun buildComplicationData(type: ComplicationType, data: WeatherData): ComplicationData? {
        val temp = data.temperature.roundToInt()
        val emoji = WMOCode.emoji(data.weatherCode)
        val description = WMOCode.description(data.weatherCode)

        return when (type) {
            ComplicationType.SHORT_TEXT -> ShortTextComplicationData.Builder(
                text = PlainComplicationText.Builder("$temp°").build(),
                contentDescription = PlainComplicationText.Builder("Temperatur $temp°C").build()
            ).build()

            ComplicationType.LONG_TEXT -> LongTextComplicationData.Builder(
                text = PlainComplicationText.Builder("$temp°C $emoji $description").build(),
                contentDescription = PlainComplicationText.Builder("Temperatur $temp°C, $description").build()
            ).build()

            else -> null
        }
    }

    private fun buildNoDataComplication(type: ComplicationType): ComplicationData? = when (type) {
        ComplicationType.SHORT_TEXT,
        ComplicationType.LONG_TEXT -> NoDataComplicationData()
        else -> null
    }

    @SuppressLint("MissingPermission")
    private suspend fun resolveLocation(context: Context): Location? {
        val client = LocationServices.getFusedLocationProviderClient(context)
        client.lastLocation.await()?.let { return it }
        val cts = CancellationTokenSource()
        return withTimeoutOrNull(LOCATION_TIMEOUT_MS) {
            try {
                client.getCurrentLocation(
                    Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                    cts.token
                ).await()
            } finally {
                cts.cancel()
            }
        }
    }
}

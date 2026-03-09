package com.barbecubewetterscoutai.wear

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import androidx.wear.protolayout.ColorBuilders
import androidx.wear.protolayout.DeviceParametersBuilders
import androidx.wear.protolayout.DimensionBuilders
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.protolayout.material.Text as TileText
import androidx.wear.protolayout.material.Typography
import androidx.wear.protolayout.material.layouts.PrimaryLayout
import androidx.wear.tiles.RequestBuilders.TileRequest
import androidx.wear.tiles.TileBuilders.Tile
import androidx.wear.tiles.TileService
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import com.google.common.util.concurrent.ListenableFuture
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.guava.future
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeoutOrNull
import kotlin.math.roundToInt

/**
 * Wear OS Tile service that displays a weather summary card.
 *
 * The tile is refreshed every 30 minutes. It shows the current temperature,
 * weather condition emoji/description, and today's min/max temperatures.
 */
class WeatherTileService : TileService() {

    companion object {
        private const val RESOURCES_VERSION = "0"
        private const val FRESHNESS_INTERVAL_MS = 30L * 60L * 1_000L
        private const val LOCATION_TIMEOUT_BALANCED_MS = 15_000L
        private const val LOCATION_TIMEOUT_HIGH_MS = 20_000L
    }

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun onDestroy() {
        serviceScope.cancel()
        super.onDestroy()
    }

    @SuppressLint("MissingPermission")
    override fun onTileRequest(requestParams: TileRequest): ListenableFuture<Tile> {
        val appContext = applicationContext
        return serviceScope.future {
            val weatherData = try {
                resolveLocation(appContext)?.let { loc ->
                    WeatherRepository.fetchWeather(loc.latitude, loc.longitude)
                }
            } catch (e: Exception) {
                null
            }
            buildTile(appContext, requestParams, weatherData)
        }
    }

    @SuppressLint("MissingPermission")
    private suspend fun resolveLocation(context: Context): Location? {
        val client = LocationServices.getFusedLocationProviderClient(context)

        // 1. Last known location – instant, no battery cost.
        client.lastLocation.await()?.let { return it }

        // 2. Balanced accuracy (network / Wi-Fi).
        val balancedCts = CancellationTokenSource()
        val balanced = withTimeoutOrNull(LOCATION_TIMEOUT_BALANCED_MS) {
            try {
                client.getCurrentLocation(
                    Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                    balancedCts.token
                ).await()
            } finally {
                balancedCts.cancel()
            }
        }
        if (balanced != null) return balanced

        // 3. High accuracy (GPS) – fallback for Wear OS devices without a cached location.
        val highCts = CancellationTokenSource()
        return withTimeoutOrNull(LOCATION_TIMEOUT_HIGH_MS) {
            try {
                client.getCurrentLocation(
                    Priority.PRIORITY_HIGH_ACCURACY,
                    highCts.token
                ).await()
            } finally {
                highCts.cancel()
            }
        }
    }

    private fun buildTile(
        context: Context,
        requestParams: TileRequest,
        data: WeatherData?
    ): Tile {
        val deviceParams = requestParams.deviceConfiguration
            ?: DeviceParametersBuilders.DeviceParameters.Builder()
                .setScreenWidthDp(192)
                .setScreenHeightDp(192)
                .setScreenDensity(2.0f)
                .setScreenShape(DeviceParametersBuilders.SCREEN_SHAPE_ROUND)
                .build()

        val rootLayout = LayoutElementBuilders.Layout.Builder()
            .setRoot(
                if (data != null) buildWeatherLayout(context, deviceParams, data)
                else buildErrorLayout(context, deviceParams)
            )
            .build()

        return Tile.Builder()
            .setResourcesVersion(RESOURCES_VERSION)
            .setFreshnessIntervalMillis(FRESHNESS_INTERVAL_MS)
            .setTileTimeline(
                TimelineBuilders.Timeline.Builder()
                    .addTimelineEntry(
                        TimelineBuilders.TimelineEntry.Builder()
                            .setLayout(rootLayout)
                            .build()
                    )
                    .build()
            )
            .build()
    }

    private fun buildWeatherLayout(
        context: Context,
        deviceParams: DeviceParametersBuilders.DeviceParameters,
        data: WeatherData
    ): LayoutElementBuilders.LayoutElement {
        val temp = data.temperature.roundToInt()
        val tMax = data.tempMax.roundToInt()
        val tMin = data.tempMin.roundToInt()
        val emoji = WMOCode.emoji(data.weatherCode)
        val description = WMOCode.description(data.weatherCode)
        val precipProb = data.precipitationProbability

        val content = LayoutElementBuilders.Column.Builder()
            .setWidth(DimensionBuilders.wrap())
            .setHeight(DimensionBuilders.wrap())
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .addContent(
                TileText.Builder(context, "$emoji $temp°C")
                    .setTypography(Typography.TYPOGRAPHY_DISPLAY1)
                    .setColor(ColorBuilders.argb(0xFFFFFFFF.toInt()))
                    .build()
            )
            .addContent(
                LayoutElementBuilders.Spacer.Builder()
                    .setHeight(DimensionBuilders.dp(2f))
                    .build()
            )
            .addContent(
                TileText.Builder(context, description)
                    .setTypography(Typography.TYPOGRAPHY_CAPTION1)
                    .setColor(ColorBuilders.argb(0xFFAAAAAA.toInt()))
                    .build()
            )
            .addContent(
                LayoutElementBuilders.Spacer.Builder()
                    .setHeight(DimensionBuilders.dp(4f))
                    .build()
            )
            .addContent(
                TileText.Builder(context, "↑$tMax°  ↓$tMin°")
                    .setTypography(Typography.TYPOGRAPHY_CAPTION2)
                    .setColor(ColorBuilders.argb(0xFFCCCCCC.toInt()))
                    .build()
            )
            .addContent(
                LayoutElementBuilders.Spacer.Builder()
                    .setHeight(DimensionBuilders.dp(4f))
                    .build()
            )
            .addContent(
                TileText.Builder(context, "🌧️ $precipProb%  💧 ${data.humidity}%")
                    .setTypography(Typography.TYPOGRAPHY_CAPTION2)
                    .setColor(ColorBuilders.argb(0xFF90CAF9.toInt()))
                    .build()
            )
            .build()

        return PrimaryLayout.Builder(deviceParams)
            .setContent(content)
            .build()
    }

    private fun buildErrorLayout(
        context: Context,
        deviceParams: DeviceParametersBuilders.DeviceParameters
    ): LayoutElementBuilders.LayoutElement {
        val content = LayoutElementBuilders.Column.Builder()
            .setWidth(DimensionBuilders.wrap())
            .setHeight(DimensionBuilders.wrap())
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .addContent(
                TileText.Builder(context, "⚠️")
                    .setTypography(Typography.TYPOGRAPHY_DISPLAY2)
                    .setColor(ColorBuilders.argb(0xFFAAAAAA.toInt()))
                    .build()
            )
            .addContent(
                TileText.Builder(context, "Keine Daten")
                    .setTypography(Typography.TYPOGRAPHY_CAPTION1)
                    .setColor(ColorBuilders.argb(0xFFAAAAAA.toInt()))
                    .build()
            )
            .build()

        return PrimaryLayout.Builder(deviceParams)
            .setContent(content)
            .build()
    }
}

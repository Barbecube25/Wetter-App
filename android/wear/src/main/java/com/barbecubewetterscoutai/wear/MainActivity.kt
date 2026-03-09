package com.barbecubewetterscoutai.wear

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.material3.*
import java.text.SimpleDateFormat
import java.util.Locale
import kotlin.math.roundToInt

class MainActivity : ComponentActivity() {

    private val viewModel: WeatherViewModel by viewModels()

    private val locationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
            if (granted) {
                viewModel.loadWeather()
            } else {
                viewModel.setNoPermission()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val fineGranted = ContextCompat.checkSelfPermission(
            this, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val coarseGranted = ContextCompat.checkSelfPermission(
            this, Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        if (fineGranted || coarseGranted) {
            viewModel.loadWeather()
        } else {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }

        setContent {
            WearApp(viewModel = viewModel)
        }
    }
}

@Composable
fun WearApp(viewModel: WeatherViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    MaterialTheme {
        Scaffold(
            timeText = { TimeText() }
        ) {
            when (val state = uiState) {
                is WeatherUiState.Loading -> LoadingScreen()
                is WeatherUiState.NoPermission -> NoPermissionScreen()
                is WeatherUiState.Error -> ErrorScreen(message = state.message) {
                    viewModel.refresh()
                }
                is WeatherUiState.Success -> WeatherScreen(data = state.data) {
                    viewModel.refresh()
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

@Composable
private fun LoadingScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator(modifier = Modifier.size(36.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Wetter wird geladen…",
                style = MaterialTheme.typography.labelSmall,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onBackground
            )
        }
    }
}

// ---------------------------------------------------------------------------
// No Permission
// ---------------------------------------------------------------------------

@Composable
private fun NoPermissionScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "📍 Standortberechtigung fehlt",
            style = MaterialTheme.typography.labelMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.error,
            modifier = Modifier.padding(16.dp)
        )
    }
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

@Composable
private fun ErrorScreen(message: String, onRetry: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(12.dp)
        ) {
            Text(
                text = "⚠️",
                fontSize = 24.sp,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = message,
                style = MaterialTheme.typography.labelSmall,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.error
            )
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = onRetry,
                modifier = Modifier.fillMaxWidth(0.7f)
            ) {
                Text("Wiederholen", fontSize = 11.sp)
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Weather Overview
// ---------------------------------------------------------------------------

@Composable
private fun WeatherScreen(data: WeatherData, onRefresh: () -> Unit) {
    val emoji = WMOCode.emoji(data.weatherCode)
    val description = WMOCode.description(data.weatherCode)
    val temp = data.temperature.roundToInt()
    val feelsLike = data.apparentTemperature.roundToInt()
    val tMax = data.tempMax.roundToInt()
    val tMin = data.tempMin.roundToInt()

    ScalingLazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentPadding = PaddingValues(top = 28.dp, bottom = 12.dp, start = 8.dp, end = 8.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Location name (if available)
        if (data.locationName.isNotEmpty()) {
            item {
                Text(
                    text = data.locationName,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                    textAlign = TextAlign.Center
                )
            }
        }

        // Emoji + condition
        item {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = emoji,
                    fontSize = 36.sp,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = description,
                    style = MaterialTheme.typography.labelMedium,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
        }

        // Current temperature
        item {
            Text(
                text = "$temp°C",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
                textAlign = TextAlign.Center
            )
        }

        // Feels like
        item {
            Text(
                text = "Gefühlt $feelsLike°C",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                textAlign = TextAlign.Center
            )
        }

        // Min / Max
        item {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "↑ $tMax°",
                    style = MaterialTheme.typography.labelMedium,
                    color = Color(0xFFFF6B35),
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "↓ $tMin°",
                    style = MaterialTheme.typography.labelMedium,
                    color = Color(0xFF64B5F6),
                    fontWeight = FontWeight.Medium
                )
            }
        }

        // Divider
        item { SectionDivider() }

        // Precipitation tile
        item {
            PrecipitationTile(
                precipitation = data.precipitation,
                precipitationProbability = data.precipitationProbability
            )
        }

        // Humidity
        item {
            WeatherDetailRow(
                icon = "💧",
                label = "Feuchte",
                value = "${data.humidity}%"
            )
        }

        // Wind
        item {
            WeatherDetailRow(
                icon = "💨",
                label = "Wind",
                value = "${data.windSpeed.roundToInt()} km/h"
            )
        }

        // Day outlook
        if (data.dailyForecast.isNotEmpty()) {
            item { SectionDivider() }
            item {
                DayOutlookSection(forecasts = data.dailyForecast)
            }
        }

        // Refresh button
        item {
            Spacer(modifier = Modifier.height(4.dp))
            FilledTonalButton(
                onClick = onRefresh,
                modifier = Modifier.fillMaxWidth(0.75f)
            ) {
                Text("Aktualisieren", fontSize = 11.sp)
            }
        }
    }
}

@Composable
private fun SectionDivider() {
    Box(
        modifier = Modifier
            .fillMaxWidth(0.6f)
            .height(1.dp)
            .background(MaterialTheme.colorScheme.onBackground.copy(alpha = 0.15f))
    )
}

// ---------------------------------------------------------------------------
// Precipitation tile
// ---------------------------------------------------------------------------

@Composable
private fun PrecipitationTile(
    precipitation: Double,
    precipitationProbability: Int
) {
    Box(
        modifier = Modifier
            .fillMaxWidth(0.9f)
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f))
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "🌧️ Niederschlag",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f)
                )
                Text(
                    text = "%.1f mm".format(precipitation),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "$precipitationProbability%",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (precipitationProbability >= 50) Color(0xFF64B5F6)
                            else MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                )
                Text(
                    text = "Wahrsch.",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                )
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Day outlook
// ---------------------------------------------------------------------------

@Composable
private fun DayOutlookSection(forecasts: List<DayForecast>) {
    Column(
        modifier = Modifier.fillMaxWidth(0.9f),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Text(
            text = "Ausblick",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
            modifier = Modifier.align(Alignment.CenterHorizontally)
        )
        Spacer(modifier = Modifier.height(2.dp))
        forecasts.forEach { day ->
            DayForecastRow(day)
        }
    }
}

@Composable
private fun DayForecastRow(day: DayForecast) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.4f))
            .padding(horizontal = 8.dp, vertical = 5.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = day.dayName(),
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.width(30.dp)
            )
            Text(
                text = WMOCode.emoji(day.weatherCode),
                fontSize = 14.sp
            )
            Text(
                text = "${day.tempMin.roundToInt()}°/${day.tempMax.roundToInt()}°",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurface
            )
            if (day.precipitationProbabilityMax > 0) {
                Text(
                    text = "💧${day.precipitationProbabilityMax}%",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color(0xFF64B5F6)
                )
            } else {
                Spacer(modifier = Modifier.width(32.dp))
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

@Composable
private fun WeatherDetailRow(icon: String, label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(0.85f),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "$icon $label",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onBackground
        )
    }
}

private fun DayForecast.dayName(): String {
    return try {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.GERMAN)
        val date = sdf.parse(this.date) ?: return this.date.takeLast(5)
        val dayFormat = SimpleDateFormat("EE", Locale.GERMAN)
        dayFormat.format(date).replaceFirstChar { it.uppercase() }
    } catch (e: Exception) {
        this.date.takeLast(5)
    }
}

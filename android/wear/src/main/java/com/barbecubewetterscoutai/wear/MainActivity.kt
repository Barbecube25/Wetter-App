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
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.wear.compose.material.*
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
            .background(MaterialTheme.colors.background),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator(
                modifier = Modifier.size(32.dp),
                indicatorColor = MaterialTheme.colors.primary,
                trackColor = MaterialTheme.colors.onBackground.copy(alpha = 0.2f)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Wetter wird geladen…",
                style = MaterialTheme.typography.caption2,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colors.onBackground
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
            .background(MaterialTheme.colors.background),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "📍 Standortberechtigung fehlt",
            style = MaterialTheme.typography.caption1,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colors.error,
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
            .background(MaterialTheme.colors.background),
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
                style = MaterialTheme.typography.caption2,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colors.error
            )
            Spacer(modifier = Modifier.height(8.dp))
            Chip(
                onClick = onRetry,
                label = { Text("Wiederholen") },
                colors = ChipDefaults.primaryChipColors()
            )
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
            .background(MaterialTheme.colors.background),
        contentPadding = PaddingValues(top = 28.dp, bottom = 12.dp, start = 8.dp, end = 8.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Location name (if available)
        if (data.locationName.isNotEmpty()) {
            item {
                Text(
                    text = data.locationName,
                    style = MaterialTheme.typography.caption2,
                    color = MaterialTheme.colors.onBackground.copy(alpha = 0.7f),
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
                    style = MaterialTheme.typography.caption1,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colors.onBackground
                )
            }
        }

        // Current temperature
        item {
            Text(
                text = "$temp°C",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colors.primary,
                textAlign = TextAlign.Center
            )
        }

        // Feels like
        item {
            Text(
                text = "Gefühlt $feelsLike°C",
                style = MaterialTheme.typography.caption2,
                color = MaterialTheme.colors.onBackground.copy(alpha = 0.7f),
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
                    style = MaterialTheme.typography.caption1,
                    color = Color(0xFFFF6B35),
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "↓ $tMin°",
                    style = MaterialTheme.typography.caption1,
                    color = Color(0xFF64B5F6),
                    fontWeight = FontWeight.Medium
                )
            }
        }

        // Divider
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.6f)
                    .height(1.dp)
                    .background(MaterialTheme.colors.onBackground.copy(alpha = 0.15f))
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

        // Refresh button
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Chip(
                onClick = onRefresh,
                label = { Text("Aktualisieren", fontSize = 11.sp) },
                modifier = Modifier.fillMaxWidth(0.75f),
                colors = ChipDefaults.secondaryChipColors()
            )
        }
    }
}

@Composable
private fun WeatherDetailRow(icon: String, label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(0.85f),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "$icon $label",
            style = MaterialTheme.typography.caption2,
            color = MaterialTheme.colors.onBackground.copy(alpha = 0.7f)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.caption1,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colors.onBackground
        )
    }
}

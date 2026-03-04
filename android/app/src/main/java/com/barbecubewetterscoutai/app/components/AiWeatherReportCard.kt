package com.barbecubewetterscoutai.app.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.KeyboardArrowDown
import androidx.compose.material.icons.rounded.KeyboardArrowUp
import androidx.compose.material.icons.rounded.WbSunny
import androidx.compose.material3.*
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AiWeatherReportCard(
    title: String,
    summary: String,
    detailedReport: String,
    windowSizeClass: WindowWidthSizeClass = WindowWidthSizeClass.Compact,
    modifier: Modifier = Modifier
) {
    var isExpanded by remember { mutableStateOf(false) }
    
    // Für Tablets oder Querformat (Expanded/Medium) zeigen wir zwei Spalten an
    val isWideScreen = windowSizeClass != WindowWidthSizeClass.Compact

    ElevatedCard(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
        )
    ) {
        if (isWideScreen) {
            // Adaptive 2-Spalten-Ansicht für große Bildschirme (Tablets/Landscape)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Linke Spalte: Zusammenfassung
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ReportHeader(title = title)
                    ReportSummary(summary = summary)
                }

                // Rechte Spalte: Direkt die Details anzeigen
                Surface(
                    color = MaterialTheme.colorScheme.surfaceContainer,
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = detailedReport,
                        modifier = Modifier.padding(16.dp),
                        style = MaterialTheme.typography.bodyMedium.copy(
                            lineHeight = 22.sp
                        ),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        } else {
            // Standard Accordion-Ansicht für Smartphones (Kompakt)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ReportHeader(title = title)
                ReportSummary(summary = summary)

                HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))

                // Ausklappbarer Detailbereich
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { isExpanded = !isExpanded }
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Info,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = "KI-Detaillanalyse lesen",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }
                    Icon(
                        imageVector = if (isExpanded) Icons.Rounded.KeyboardArrowUp else Icons.Rounded.KeyboardArrowDown,
                        contentDescription = "Details ausklappen",
                        tint = MaterialTheme.colorScheme.secondary
                    )
                }

                AnimatedVisibility(visible = isExpanded) {
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceContainer,
                        shape = MaterialTheme.shapes.medium,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = detailedReport,
                            modifier = Modifier.padding(12.dp),
                            style = MaterialTheme.typography.bodyMedium.copy(
                                lineHeight = 22.sp
                            ),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ReportHeader(title: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Icon(
            imageVector = Icons.Rounded.WbSunny,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary
        )
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge.copy(
                fontWeight = FontWeight.SemiBold
            ),
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
private fun ReportSummary(summary: String) {
    Text(
        text = summary,
        style = MaterialTheme.typography.bodyLarge.copy(
            lineHeight = 24.sp,
            lineHeightStyle = LineHeightStyle(
                alignment = LineHeightStyle.Alignment.Center,
                trim = LineHeightStyle.Trim.None
            )
        ),
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
}

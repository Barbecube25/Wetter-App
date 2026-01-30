package com.barbecubewetterscoutai.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final String DEFAULT_CHANNEL_ID = "default_channel";
    private static final String DEFAULT_CHANNEL_NAME = "Default Notifications";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Create notification channels
        createNotificationChannels();
        
        // Enable fullscreen/immersive mode
        enableFullscreenMode();
    }
    
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            // Re-enable immersive mode when window regains focus
            enableFullscreenMode();
        }
    }
    
    /**
     * Create notification channels for Android 8.0+ (API 26+)
     * This is required for notifications to work on Android Oreo and above
     */
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = 
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (notificationManager != null) {
                // Create default notification channel
                NotificationChannel defaultChannel = new NotificationChannel(
                    DEFAULT_CHANNEL_ID,
                    DEFAULT_CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_DEFAULT
                );
                defaultChannel.setDescription("Channel for weather notifications and alerts");
                defaultChannel.enableVibration(true);
                defaultChannel.enableLights(true);
                
                notificationManager.createNotificationChannel(defaultChannel);
                Log.d(TAG, "Notification channels created successfully");
            }
        }
    }
    
    private void enableFullscreenMode() {
        // Use modern Android 11+ (API 30+) approach with WindowInsetsController
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ (API 30+) - use WindowInsetsController
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
            if (controller != null) {
                // Hide both status bar and navigation bar
                controller.hide(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.navigationBars());
                // Use immersive sticky mode - bars will reappear on swipe and auto-hide again
                controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            // Android 10 and below - use legacy flags
            View decorView = getWindow().getDecorView();
            decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
            );
            
            // Make the content draw behind the system bars (legacy only)
            getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
            );
        }
    }
}

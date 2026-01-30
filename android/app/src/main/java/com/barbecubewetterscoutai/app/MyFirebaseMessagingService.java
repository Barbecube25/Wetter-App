package com.barbecubewetterscoutai.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "FCMService";
    private static final String DEFAULT_CHANNEL_ID = "default_channel";
    private static final String DEFAULT_CHANNEL_NAME = "Default Notifications";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // Check if message contains a notification payload
        if (remoteMessage.getNotification() != null) {
            String title = remoteMessage.getNotification().getTitle();
            String body = remoteMessage.getNotification().getBody();
            Log.d(TAG, "Message Notification Title: " + title);
            Log.d(TAG, "Message Notification Body: " + body);
            sendNotification(title, body);
        }

        // Check if message contains a data payload
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());
            // Handle data payload here if needed
        }
    }

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "Refreshed token: " + token);
        // Send token to your server if needed
        sendRegistrationToServer(token);
    }

    /**
     * Create the NotificationChannel for Android 8.0+ (API 26+)
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = 
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (notificationManager != null) {
                NotificationChannel channel = new NotificationChannel(
                    DEFAULT_CHANNEL_ID,
                    DEFAULT_CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_DEFAULT
                );
                channel.setDescription("Channel for default notifications");
                channel.enableVibration(true);
                channel.enableLights(true);
                
                notificationManager.createNotificationChannel(channel);
                Log.d(TAG, "Notification channel created: " + DEFAULT_CHANNEL_ID);
            }
        }
    }

    /**
     * Send notification to the user
     */
    private void sendNotification(String title, String messageBody) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 
            0, 
            intent,
            PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder notificationBuilder =
            new NotificationCompat.Builder(this, DEFAULT_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_icon_config_sample)
                .setContentTitle(title)
                .setContentText(messageBody)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        if (notificationManager != null) {
            notificationManager.notify(0, notificationBuilder.build());
            Log.d(TAG, "Notification sent: " + title);
        }
    }

    /**
     * Persist token to your server
     */
    private void sendRegistrationToServer(String token) {
        // Implement this method to send token to your backend server
        // For now, just log it
        Log.d(TAG, "Token sent to server: " + token);
    }
}

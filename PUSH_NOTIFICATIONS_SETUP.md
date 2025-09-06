# Push Notifications Implementation Guide

## Overview
This implementation adds Expo push notifications to your DC Vault mobile app with automatic device management and comprehensive notification features.

## What Was Implemented

### 1. Database Schema
- **New table**: `userDevices` to manage user devices and push tokens
- **Associations**: Users can have multiple devices, automatic cleanup of invalid tokens
- **Indexes**: Optimized queries for performance

### 2. Core Components

#### NotificationUtils (`server/utils/notificationUtils.js`)
Common functions used by other controllers:
- `sendNotificationToAthleteProfiles()` - Send to specific athletes
- `notifyMessageRecipients()` - Notify message participants
- `notifyAdminsOfPendingJump()` - Alert admins of verification needed
- `sendAnnouncementToAll()` - Broadcast to all users
- `sendPushNotifications()` - Core sending logic with error handling
- `handlePushReceipts()` - Check delivery status and cleanup invalid tokens

#### NotificationsController (`server/controllers/notificationsController.js`)
API endpoints for device and notification management:
- Device registration/management
- Test notifications
- Admin notification sending
- Statistics and cleanup

### 3. API Endpoints

All endpoints under `/mobileapp/user/notifications/`:

#### User Endpoints (Authenticated)
- `POST /register-device` - Register/update device token
- `GET /my-devices` - List user's registered devices
- `DELETE /devices/:deviceId` - Remove a device
- `POST /test` - Send test notification to user's devices

#### Admin Endpoints (Requires `send_notifications` permission)
- `POST /send-to-athletes` - Send notification to specific athletes
- `POST /send-announcement` - Send announcement to all users
- `GET /stats` - Get notification statistics
- `DELETE /cleanup-old-devices` - Clean up inactive devices

### 4. Automatic Integrations

#### Messages
When someone sends a message, notifications are automatically sent to:
- All conversation participants (except sender)
- Original message sender (for reactions)

#### Jump Verification
When a meet jump is submitted that needs verification:
- Admins with `verify_jumps` permission get notified automatically

## Device Management Features

### New Phone Handling
When a user gets a new phone:
1. They log into the app normally
2. The app calls `/register-device` with the new token
3. System automatically associates new token with their user account
4. Old tokens are deactivated when they become invalid

### Multiple Devices
- Users can have multiple active devices (phone + tablet)
- Each device is tracked separately
- Users can see and remove devices from their account

### Automatic Cleanup
- Invalid tokens are automatically deactivated when push receipts indicate "DeviceNotRegistered"
- Old inactive devices are cleaned up after 30 days
- Failed notifications don't break the main functionality

## Testing Guide

### 1. Database Migration
First, you'll need to create the new table. Run your app once to let Sequelize create the `userDevices` table automatically, or run:
```sql
-- The table will be created automatically by Sequelize when you start the server
-- Check it was created with: DESCRIBE userDevices;
```

### 2. Client-Side Integration
Add this to your React Native app:

```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure how notifications are handled
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register for push notifications
async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  
  // Get device info
  const deviceInfo = {
    deviceName: Device.deviceName,
    modelName: Device.modelName,
    osName: Device.osName,
    osVersion: Device.osVersion,
    platform: Device.osName,
  };

  // Send to your backend
  try {
    await fetch('/mobileapp/user/notifications/register-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourJwtToken}`,
      },
      body: JSON.stringify({
        expoPushToken: token,
        deviceInfo,
      }),
    });
    
    console.log('Device registered for push notifications');
  } catch (error) {
    console.error('Error registering device:', error);
  }
}

// Call this after successful login
useEffect(() => {
  if (isLoggedIn) {
    registerForPushNotifications();
  }
}, [isLoggedIn]);
```

### 3. Manual Testing Steps

#### Test Device Registration
```bash
# Register a device (replace with real token and JWT)
curl -X POST http://localhost:3000/mobileapp/user/notifications/register-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "deviceInfo": {
      "deviceName": "iPhone 15",
      "modelName": "iPhone15,3",
      "osName": "iOS",
      "osVersion": "17.0",
      "platform": "iOS"
    }
  }'
```

#### Test Notification Sending
```bash
# Send a test notification
curl -X POST http://localhost:3000/mobileapp/user/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test from the DC Vault backend!"
  }'
```

#### Test Admin Features
```bash
# Get notification stats (requires admin permission)
curl -X GET http://localhost:3000/mobileapp/user/notifications/stats \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Send announcement to all users (requires admin permission)
curl -X POST http://localhost:3000/mobileapp/user/notifications/send-announcement \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "title": "Important Announcement",
    "body": "Welcome to push notifications in DC Vault!"
  }'
```

### 4. Testing Message Notifications
1. Send a message through your existing message system
2. Verify that other conversation participants receive push notifications
3. Test reactions to messages

### 5. Testing Jump Verification Notifications
1. Create a meet jump that requires verification
2. Verify that admins with `verify_jumps` permission receive notifications

## Configuration Requirements

### Environment Compatibility
✅ **Node.js 16**: Compatible  
✅ **MySQL 5.7**: Compatible  
✅ **Current dependencies**: No conflicts  

### Required Permissions
You'll need to add a `send_notifications` permission to your permissions system for admin features:

```sql
INSERT INTO permissions (permissionName, permissionKey, description) 
VALUES ('Send Notifications', 'send_notifications', 'Allows sending push notifications to users');
```

### No Upgrades Needed
Your current setup (Node 16 + MySQL 5.7) works perfectly with expo-server-sdk.

## Monitoring and Maintenance

### Check Notification Statistics
Use the `/stats` endpoint to monitor:
- Total users vs users with notifications enabled
- Device breakdown by platform
- Notification delivery rates

### Cleanup Old Devices
Run the cleanup endpoint periodically:
```bash
curl -X DELETE http://localhost:3000/mobileapp/user/notifications/cleanup-old-devices \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

Or set up a cron job to run `NotificationUtils.cleanupOldDevices()` weekly.

## Security Features

1. **Token Validation**: All Expo push tokens are validated before storage
2. **User Association**: Tokens are tied to authenticated users only
3. **Permission Checks**: Admin features require proper permissions
4. **Automatic Cleanup**: Invalid tokens are automatically deactivated
5. **Error Isolation**: Notification failures don't break core functionality

## Troubleshooting

### Common Issues

1. **"Invalid Expo push token"**: Make sure you're using a real device (not simulator)
2. **No notifications received**: Check that permissions were granted on the device
3. **"Device not found"**: User needs to register their device first
4. **Admin endpoints failing**: Verify user has `send_notifications` permission

### Debug Endpoints
- Use `/test` endpoint to verify notifications work for a user
- Check `/my-devices` to see registered devices
- Use `/stats` to get overall system health

The implementation is now complete and ready for testing!

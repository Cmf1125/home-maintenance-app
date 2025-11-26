// iOS Notification Service for The Home Keeper
// Handles both push notifications and local notifications

import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

class iOSNotificationService {
    constructor() {
        this.isInitialized = false;
        this.notificationPermission = 'default';
        console.log('🔔 iOS Notification Service: Initializing...');
    }

    // Initialize notification services
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Request permissions for push notifications
            const pushPermission = await PushNotifications.requestPermissions();
            console.log('🔔 Push notification permission:', pushPermission.receive);

            // Request permissions for local notifications  
            const localPermission = await LocalNotifications.requestPermissions();
            console.log('🔔 Local notification permission:', localPermission.display);

            if (pushPermission.receive === 'granted') {
                await this.setupPushNotifications();
            }

            if (localPermission.display === 'granted') {
                await this.setupLocalNotifications();
            }

            this.isInitialized = true;
            console.log('✅ iOS Notification Service: Initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing notifications:', error);
        }
    }

    // Set up push notifications
    async setupPushNotifications() {
        // Register for push notifications
        await PushNotifications.register();

        // Listen for registration success
        PushNotifications.addListener('registration', (token) => {
            console.log('🔔 Push registration success:', token.value);
            // Send token to your server/Firebase
            this.sendTokenToServer(token.value);
        });

        // Listen for registration error
        PushNotifications.addListener('registrationError', (error) => {
            console.error('❌ Push registration error:', error);
        });

        // Listen for incoming push notifications
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('📨 Push notification received:', notification);
            this.handleIncomingNotification(notification);
        });

        // Listen for notification actions (when user taps notification)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('👆 Push notification action performed:', notification);
            this.handleNotificationAction(notification);
        });
    }

    // Set up local notifications for task reminders
    async setupLocalNotifications() {
        // Listen for local notification actions
        LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
            console.log('👆 Local notification action performed:', notification);
            this.handleLocalNotificationAction(notification);
        });
    }

    // Send push token to your server (Firebase)
    async sendTokenToServer(token) {
        // Store token for Firebase Cloud Messaging
        if (window.currentUser && window.auth) {
            try {
                const user = window.auth.currentUser;
                if (user) {
                    // Store the FCM token in user's Firebase document
                    await window.db.collection('users').doc(user.uid).update({
                        fcmToken: token,
                        lastTokenUpdate: new Date()
                    });
                    console.log('✅ FCM token saved to Firebase');
                }
            } catch (error) {
                console.error('❌ Error saving FCM token:', error);
            }
        }
    }

    // Schedule local notifications for task reminders
    async scheduleTaskReminders() {
        if (!window.tasks) return;

        try {
            // Clear existing notifications first
            await LocalNotifications.cancel({ notifications: [] });

            const now = new Date();
            const notifications = [];

            // Create notifications for overdue and upcoming tasks
            window.tasks.forEach((task, index) => {
                if (task.isCompleted || !task.dueDate) return;

                const dueDate = new Date(task.dueDate);
                const daysUntilDue = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));

                // Notification for overdue tasks
                if (daysUntilDue < 0) {
                    notifications.push({
                        id: task.id * 10 + 1,
                        title: '⚠️ Overdue Task',
                        body: `"${task.title}" is ${Math.abs(daysUntilDue)} days overdue`,
                        schedule: { at: new Date(now.getTime() + 1000 * 60) }, // 1 minute from now
                        sound: 'default',
                        actionTypeId: 'OVERDUE_TASK',
                        extra: { taskId: task.id }
                    });
                }

                // Notification for tasks due tomorrow
                if (daysUntilDue === 1) {
                    notifications.push({
                        id: task.id * 10 + 2,
                        title: '📅 Task Due Tomorrow',
                        body: `"${task.title}" is due tomorrow`,
                        schedule: { at: new Date(now.getTime() + 1000 * 60 * 60) }, // 1 hour from now
                        sound: 'default',
                        actionTypeId: 'DUE_TOMORROW',
                        extra: { taskId: task.id }
                    });
                }

                // Notification for tasks due in 3 days
                if (daysUntilDue === 3) {
                    notifications.push({
                        id: task.id * 10 + 3,
                        title: '📋 Upcoming Task',
                        body: `"${task.title}" is due in 3 days`,
                        schedule: { at: new Date(now.getTime() + 1000 * 60 * 30) }, // 30 minutes from now
                        sound: 'default',
                        actionTypeId: 'DUE_SOON',
                        extra: { taskId: task.id }
                    });
                }
            });

            // Schedule the notifications (max 64 at a time on iOS)
            const notificationsToSchedule = notifications.slice(0, 64);
            
            if (notificationsToSchedule.length > 0) {
                await LocalNotifications.schedule({ notifications: notificationsToSchedule });
                console.log(`🔔 Scheduled ${notificationsToSchedule.length} task reminder notifications`);
            }

        } catch (error) {
            console.error('❌ Error scheduling notifications:', error);
        }
    }

    // Handle incoming push notifications
    handleIncomingNotification(notification) {
        // Show in-app notification or update UI
        if (notification.data?.type === 'task_reminder') {
            this.showTaskReminder(notification.data);
        }
    }

    // Handle notification actions (when user taps notification)
    handleNotificationAction(notification) {
        const data = notification.notification.data;
        
        if (data?.taskId) {
            // Navigate to specific task
            this.navigateToTask(parseInt(data.taskId));
        } else if (data?.type === 'task_reminder') {
            // Navigate to task list
            this.navigateToTaskList();
        }
    }

    // Handle local notification actions
    handleLocalNotificationAction(notification) {
        const taskId = notification.notification.extra?.taskId;
        
        if (taskId) {
            this.navigateToTask(taskId);
        }
    }

    // Navigate to specific task
    navigateToTask(taskId) {
        // Open the task in the app
        const task = window.tasks?.find(t => t.id === taskId);
        if (task) {
            // Open task completion modal or task details
            if (typeof window.completeTask === 'function') {
                window.completeTask(taskId);
            }
        }
    }

    // Navigate to task list
    navigateToTaskList() {
        // Navigate to main task view
        if (typeof window.showTab === 'function') {
            window.showTab('dashboard');
        }
    }

    // Show in-app task reminder
    showTaskReminder(data) {
        // Create a nice in-app notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="mr-3">🔔</div>
                <div>
                    <div class="font-semibold">${data.title || 'Task Reminder'}</div>
                    <div class="text-sm opacity-90">${data.body || ''}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white opacity-75 hover:opacity-100">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Manually trigger a test notification
    async sendTestNotification() {
        try {
            await LocalNotifications.schedule({
                notifications: [{
                    id: 999,
                    title: '🧪 Test Notification',
                    body: 'The Home Keeper notifications are working!',
                    schedule: { at: new Date(Date.now() + 1000 * 2) }, // 2 seconds from now
                    sound: 'default'
                }]
            });
            console.log('🧪 Test notification scheduled');
        } catch (error) {
            console.error('❌ Error sending test notification:', error);
        }
    }

    // Update badge count (iOS app icon badge)
    async updateBadgeCount() {
        if (!window.tasks) return;
        
        const overdueCount = window.tasks.filter(task => {
            if (task.isCompleted || !task.dueDate) return false;
            return new Date(task.dueDate) < new Date();
        }).length;

        try {
            // Note: Badge updates require additional iOS permissions and setup
            console.log(`🔢 Would update badge count to: ${overdueCount}`);
            // Implementation depends on additional Capacitor plugins
        } catch (error) {
            console.error('❌ Error updating badge count:', error);
        }
    }
}

// Create global instance
window.iOSNotifications = new iOSNotificationService();

// Auto-initialize when page loads (only on iOS)
if (window.Capacitor && window.Capacitor.getPlatform() === 'ios') {
    document.addEventListener('DOMContentLoaded', () => {
        window.iOSNotifications.initialize();
    });
}

console.log('📱 iOS Notification Service loaded');
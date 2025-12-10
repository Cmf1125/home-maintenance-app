// Native iOS Features Module for Home Maintenance App
// This module provides distinctive iOS-native functionality

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Device } from '@capacitor/device';
import { Filesystem, Directory } from '@capacitor/filesystem';

class NativeIOSFeatures {
    constructor() {
        this.isInitialized = false;
        this.deviceInfo = null;
    }

    // Initialize native features
    async initialize() {
        try {
            // Get device info for personalization
            this.deviceInfo = await Device.getInfo();
            
            // Request notification permissions
            await this.requestNotificationPermissions();
            
            this.isInitialized = true;
            console.log('✅ Native iOS features initialized');
            
            // Add native feel to the app
            this.addNativeBehaviors();
            
        } catch (error) {
            console.error('❌ Failed to initialize native features:', error);
        }
    }

    // Add native iOS behaviors and styling
    addNativeBehaviors() {
        // Add iOS-style momentum scrolling
        document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch');
        
        // Add iOS-style button press feedback
        const buttons = document.querySelectorAll('button, .btn, .clickable');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                this.lightHaptic();
                button.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', () => {
                button.style.transform = 'scale(1)';
            });
        });
    }

    // PHOTO DOCUMENTATION FEATURE
    async captureTaskPhoto(taskId) {
        try {
            if (!Camera) {
                throw new Error('Camera not available');
            }

            // Haptic feedback for camera launch
            await this.mediumHaptic();

            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
                promptLabelHeader: 'Document Task Progress',
                promptLabelCancel: 'Cancel',
                promptLabelPhoto: 'Take Photo'
            });

            // Save photo to device storage
            const fileName = `task_${taskId}_${Date.now()}.jpg`;
            const savedFile = await this.savePhotoToDevice(image.dataUrl, fileName);
            
            // Success haptic
            await this.successHaptic();
            
            return {
                success: true,
                photoUrl: image.dataUrl,
                fileName: fileName,
                filePath: savedFile.uri
            };

        } catch (error) {
            console.error('❌ Photo capture failed:', error);
            await this.errorHaptic();
            return { success: false, error: error.message };
        }
    }

    // Save photo to device filesystem
    async savePhotoToDevice(dataUrl, fileName) {
        try {
            const base64Data = dataUrl.split(',')[1];
            
            const result = await Filesystem.writeFile({
                path: `maintenance_photos/${fileName}`,
                data: base64Data,
                directory: Directory.Documents
            });

            return result;
        } catch (error) {
            console.error('❌ Failed to save photo:', error);
            throw error;
        }
    }

    // NATIVE NOTIFICATION SYSTEM
    async requestNotificationPermissions() {
        try {
            const { display } = await LocalNotifications.requestPermissions();
            
            if (display === 'granted') {
                console.log('✅ Notification permissions granted');
                return true;
            } else {
                console.log('❌ Notification permissions denied');
                return false;
            }
        } catch (error) {
            console.error('❌ Failed to request notification permissions:', error);
            return false;
        }
    }

    // Schedule native iOS notifications for tasks
    async scheduleTaskReminder(task) {
        try {
            if (!LocalNotifications) {
                throw new Error('Notifications not available');
            }

            const notificationId = Math.floor(Math.random() * 100000);
            const dueDate = new Date(task.nextDue);
            
            // Schedule notification 1 day before due date
            const reminderDate = new Date(dueDate);
            reminderDate.setDate(reminderDate.getDate() - 1);
            reminderDate.setHours(9, 0, 0, 0); // 9 AM reminder

            await LocalNotifications.schedule({
                notifications: [{
                    title: '🏡 Home Maintenance Reminder',
                    body: `"${task.task}" is due tomorrow. Tap to view details.`,
                    id: notificationId,
                    schedule: { at: reminderDate },
                    sound: 'default',
                    extra: {
                        taskId: task.id,
                        taskType: 'maintenance_reminder'
                    }
                }]
            });

            // Store notification ID with task
            task.notificationId = notificationId;
            
            console.log(`✅ Reminder scheduled for ${task.task} on ${reminderDate}`);
            return notificationId;

        } catch (error) {
            console.error('❌ Failed to schedule reminder:', error);
            throw error;
        }
    }

    // Cancel task reminder
    async cancelTaskReminder(notificationId) {
        try {
            if (notificationId && LocalNotifications) {
                await LocalNotifications.cancel({
                    notifications: [{ id: notificationId }]
                });
                console.log(`✅ Cancelled reminder ${notificationId}`);
            }
        } catch (error) {
            console.error('❌ Failed to cancel reminder:', error);
        }
    }

    // HAPTIC FEEDBACK SYSTEM
    async lightHaptic() {
        try {
            if (Haptics) {
                await Haptics.impact({ style: ImpactStyle.Light });
            }
        } catch (error) {
            console.error('❌ Light haptic failed:', error);
        }
    }

    async mediumHaptic() {
        try {
            if (Haptics) {
                await Haptics.impact({ style: ImpactStyle.Medium });
            }
        } catch (error) {
            console.error('❌ Medium haptic failed:', error);
        }
    }

    async successHaptic() {
        try {
            if (Haptics) {
                await Haptics.notification({ type: 'SUCCESS' });
            }
        } catch (error) {
            console.error('❌ Success haptic failed:', error);
        }
    }

    async errorHaptic() {
        try {
            if (Haptics) {
                await Haptics.notification({ type: 'ERROR' });
            }
        } catch (error) {
            console.error('❌ Error haptic failed:', error);
        }
    }

    // DEVICE-SPECIFIC PERSONALIZATION
    getDevicePersonalization() {
        if (!this.deviceInfo) return {};

        return {
            platform: this.deviceInfo.platform,
            model: this.deviceInfo.model,
            isTablet: this.deviceInfo.platform === 'ios' && 
                     (this.deviceInfo.model.includes('iPad') || 
                      window.innerWidth > 768),
            hasNotch: this.deviceInfo.model.includes('iPhone') && 
                     parseInt(this.deviceInfo.osVersion) >= 11,
            supportsDynamicIsland: this.deviceInfo.model.includes('iPhone 14') ||
                                  this.deviceInfo.model.includes('iPhone 15')
        };
    }

    // Adaptive UI based on device
    adaptUIForDevice() {
        const personalization = this.getDevicePersonalization();
        
        if (personalization.hasNotch) {
            // Add safe area padding for devices with notch
            document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
            document.body.style.paddingTop = 'env(safe-area-inset-top)';
        }

        if (personalization.isTablet) {
            // Optimize layout for iPad
            document.body.classList.add('tablet-layout');
            const container = document.querySelector('.container');
            if (container) {
                container.style.maxWidth = '800px';
                container.style.margin = '0 auto';
            }
        }

        if (personalization.supportsDynamicIsland) {
            // Add subtle animations for Dynamic Island devices
            document.body.classList.add('dynamic-island-device');
        }
    }

    // Create photo gallery for task photos
    createPhotoGallery(taskId) {
        const photos = this.getTaskPhotos(taskId);
        if (photos.length === 0) return '';

        return `
            <div class="photo-gallery">
                <h4>📸 Progress Photos</h4>
                <div class="photo-grid">
                    ${photos.map(photo => `
                        <div class="photo-item" onclick="nativeFeatures.viewPhoto('${photo.filePath}')">
                            <img src="${photo.photoUrl}" alt="Task photo" />
                            <span class="photo-date">${new Date(photo.timestamp).toLocaleDateString()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Store task photos in localStorage (simple implementation)
    storeTaskPhoto(taskId, photoData) {
        const photos = this.getTaskPhotos(taskId);
        photos.push({
            timestamp: Date.now(),
            ...photoData
        });
        localStorage.setItem(`task_photos_${taskId}`, JSON.stringify(photos));
    }

    getTaskPhotos(taskId) {
        const stored = localStorage.getItem(`task_photos_${taskId}`);
        return stored ? JSON.parse(stored) : [];
    }

    // View photo in native viewer
    async viewPhoto(filePath) {
        await this.lightHaptic();
        // Implementation would open photo in native iOS photo viewer
        // For now, create a modal overlay
        this.createPhotoModal(filePath);
    }

    createPhotoModal(imageSrc) {
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.innerHTML = `
            <div class="photo-modal-content">
                <img src="${imageSrc}" alt="Task photo" />
                <button class="close-modal" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.lightHaptic();
            }
        });

        document.body.appendChild(modal);
        this.mediumHaptic();
    }
}

// Create and export singleton instance
const nativeFeatures = new NativeIOSFeatures();

// Make globally available
window.nativeFeatures = nativeFeatures;

export default nativeFeatures;
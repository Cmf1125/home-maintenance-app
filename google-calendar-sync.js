// Google Calendar Integration Module
// Syncs maintenance tasks with user's Google Calendar

console.log('📅 Loading Google Calendar Sync module...');

class GoogleCalendarSync {
    constructor() {
        // Google API Configuration
        this.CLIENT_ID = '111292310649-ck87c3fe6t549623rmkarrmqnnjnsqh0.apps.googleusercontent.com';
        this.API_KEY = ''; // Optional - can work without API key for OAuth flow
        this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
        this.SCOPES = 'https://www.googleapis.com/auth/calendar';
        
        this.isSignedIn = false;
        this.gapi = null;
        this.maintenanceCalendarId = null; // Will store the ID of our "Home Maintenance" calendar
        
        console.log('📅 Google Calendar Sync initialized');
    }

    // Initialize Google API
    async initializeGoogleAPI() {
        try {
            console.log('🔄 Initializing Google Calendar API...');
            
            // Load Google API script if not already loaded
            if (!window.gapi) {
                await this.loadGoogleAPIScript();
            }

            this.gapi = window.gapi;

            // Load auth2 and client
            await new Promise((resolve) => {
                this.gapi.load('auth2', resolve);
            });
            
            await new Promise((resolve) => {
                this.gapi.load('client', resolve);
            });

            const initConfig = {
                clientId: this.CLIENT_ID,
                discoveryDocs: [this.DISCOVERY_DOC],
                scope: this.SCOPES
            };

            // Only add API key if it exists
            if (this.API_KEY) {
                initConfig.apiKey = this.API_KEY;
            }

            await this.gapi.client.init(initConfig);

            // Check if user is already signed in
            const authInstance = this.gapi.auth2.getAuthInstance();
            if (authInstance) {
                this.isSignedIn = authInstance.isSignedIn.get();
            }

            console.log('✅ Google Calendar API initialized');
            console.log('🔐 Signed in status:', this.isSignedIn);
            return true;
        } catch (error) {
            console.error('❌ Error initializing Google Calendar API:', error);
            return false;
        }
    }

    // Load Google API script dynamically
    loadGoogleAPIScript() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                console.log('📦 Google API script loaded');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Sign in to Google Calendar
    async signInToGoogle() {
        try {
            if (!this.gapi) {
                const initialized = await this.initializeGoogleAPI();
                if (!initialized) {
                    throw new Error('Failed to initialize Google API');
                }
            }

            console.log('🔐 Signing in to Google Calendar...');
            const authInstance = this.gapi.auth2.getAuthInstance();
            
            if (!authInstance.isSignedIn.get()) {
                await authInstance.signIn();
            }

            this.isSignedIn = true;
            console.log('✅ Successfully signed in to Google Calendar');

            // Create or find the Home Maintenance calendar
            await this.setupMaintenanceCalendar();

            return true;
        } catch (error) {
            console.error('❌ Error signing in to Google Calendar:', error);
            this.showUserError('Failed to connect to Google Calendar. Please try again.');
            return false;
        }
    }

    // Sign out from Google Calendar
    async signOutFromGoogle() {
        try {
            if (this.gapi && this.isSignedIn) {
                const authInstance = this.gapi.auth2.getAuthInstance();
                await authInstance.signOut();
                this.isSignedIn = false;
                this.maintenanceCalendarId = null;
                console.log('👋 Signed out from Google Calendar');
            }
        } catch (error) {
            console.error('❌ Error signing out:', error);
        }
    }

    // Set up dedicated "Home Maintenance" calendar
    async setupMaintenanceCalendar() {
        try {
            console.log('🏠 Setting up Home Maintenance calendar...');

            // First, check if calendar already exists
            const calendarList = await this.gapi.client.calendar.calendarList.list();
            const existingCalendar = calendarList.result.items.find(cal => 
                cal.summary === 'Home Maintenance' || cal.summary.includes('Home Maintenance')
            );

            if (existingCalendar) {
                this.maintenanceCalendarId = existingCalendar.id;
                console.log('✅ Found existing Home Maintenance calendar:', existingCalendar.id);
                return existingCalendar.id;
            }

            // Create new calendar if it doesn't exist
            const calendar = await this.gapi.client.calendar.calendars.insert({
                resource: {
                    summary: 'Home Maintenance',
                    description: 'Maintenance tasks and schedules from The Home Keeper app',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            });

            this.maintenanceCalendarId = calendar.result.id;
            console.log('✅ Created new Home Maintenance calendar:', calendar.result.id);

            return calendar.result.id;
        } catch (error) {
            console.error('❌ Error setting up maintenance calendar:', error);
            // Fallback to primary calendar
            this.maintenanceCalendarId = 'primary';
            return 'primary';
        }
    }

    // Sync a maintenance task to Google Calendar
    async syncTaskToCalendar(task) {
        try {
            if (!this.isSignedIn) {
                console.log('⚠️ Not signed in to Google Calendar, skipping sync for:', task.title);
                return null;
            }

            console.log('📅 Syncing task to Google Calendar:', task.title);

            // Prepare event details
            const eventData = {
                summary: `🏠 ${task.title}`,
                description: this.createEventDescription(task),
                start: {
                    date: task.dueDate, // All-day event
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: {
                    date: task.dueDate, // All-day event
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                colorId: this.getCategoryColor(task.category),
                extendedProperties: {
                    private: {
                        homeKeeperTaskId: task.id.toString(),
                        homeKeeperCategory: task.category,
                        homeKeeperPriority: task.priority || 'normal'
                    }
                }
            };

            // Create the event
            const event = await this.gapi.client.calendar.events.insert({
                calendarId: this.maintenanceCalendarId,
                resource: eventData
            });

            console.log('✅ Task synced to Google Calendar:', event.result.id);

            // Store the Google event ID in the task for future updates
            if (window.tasks) {
                const taskIndex = window.tasks.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) {
                    window.tasks[taskIndex].googleEventId = event.result.id;
                    // Save to Firebase if user is logged in
                    if (window.currentUser) {
                        saveData();
                    }
                }
            }

            return event.result.id;
        } catch (error) {
            console.error('❌ Error syncing task to Google Calendar:', error);
            return null;
        }
    }

    // Create rich event description
    createEventDescription(task) {
        let description = '';

        if (task.description) {
            description += `${task.description}\n\n`;
        }

        description += `📱 From: The Home Keeper\n`;
        description += `🏷️ Category: ${task.category}\n`;
        
        if (task.priority && task.priority !== 'normal') {
            description += `⚡ Priority: ${task.priority.toUpperCase()}\n`;
        }

        if (task.estimatedCost) {
            description += `💰 Estimated Cost: $${task.estimatedCost}\n`;
        }

        // Add marketplace link if applicable
        if (window.marketplaceManager) {
            const recommendations = window.marketplaceManager.getProductRecommendations(task.title, task.description);
            if (recommendations.length > 0) {
                description += `\n🛍️ Shop Supplies: Open The Home Keeper app`;
            }
        }

        return description;
    }

    // Get color for different categories
    getCategoryColor(category) {
        const colors = {
            'HVAC': '9', // Blue
            'Water Systems': '7', // Cyan
            'Exterior': '10', // Green
            'Safety': '11', // Red
            'Pest Control': '6', // Orange
            'General': '8' // Gray
        };
        return colors[category] || '1'; // Default blue
    }

    // Update Google Calendar event when task changes
    async updateCalendarEvent(task) {
        try {
            if (!this.isSignedIn || !task.googleEventId) {
                return null;
            }

            console.log('🔄 Updating Google Calendar event for:', task.title);

            const eventData = {
                summary: `🏠 ${task.title}`,
                description: this.createEventDescription(task),
                start: {
                    date: task.dueDate,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: {
                    date: task.dueDate,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                colorId: this.getCategoryColor(task.category)
            };

            const event = await this.gapi.client.calendar.events.update({
                calendarId: this.maintenanceCalendarId,
                eventId: task.googleEventId,
                resource: eventData
            });

            console.log('✅ Google Calendar event updated');
            return event.result.id;
        } catch (error) {
            console.error('❌ Error updating Google Calendar event:', error);
            return null;
        }
    }

    // Delete Google Calendar event when task is completed/deleted
    async deleteCalendarEvent(task) {
        try {
            if (!this.isSignedIn || !task.googleEventId) {
                return;
            }

            console.log('🗑️ Deleting Google Calendar event for:', task.title);

            await this.gapi.client.calendar.events.delete({
                calendarId: this.maintenanceCalendarId,
                eventId: task.googleEventId
            });

            console.log('✅ Google Calendar event deleted');
        } catch (error) {
            console.error('❌ Error deleting Google Calendar event:', error);
        }
    }

    // Sync all existing tasks to Google Calendar
    async syncAllTasks() {
        if (!window.tasks || !this.isSignedIn) {
            console.log('⚠️ No tasks to sync or not signed in');
            return;
        }

        console.log('🔄 Syncing all tasks to Google Calendar...');
        
        let syncCount = 0;
        for (const task of window.tasks) {
            // Only sync incomplete tasks without existing Google event
            if (!task.completed && !task.googleEventId) {
                const eventId = await this.syncTaskToCalendar(task);
                if (eventId) {
                    syncCount++;
                }
                // Small delay to avoid rate limiting
                await this.delay(100);
            }
        }

        console.log(`✅ Synced ${syncCount} tasks to Google Calendar`);
        this.showUserMessage(`✅ Synced ${syncCount} tasks to your Google Calendar!`);
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Show user-friendly messages
    showUserMessage(message) {
        // You can customize this to match your app's notification system
        console.log('📢', message);
        // Could integrate with your existing toast/notification system
    }

    showUserError(message) {
        console.error('❌', message);
        // Could integrate with your existing error notification system
    }

    // Check connection status
    isConnected() {
        return this.isSignedIn && this.maintenanceCalendarId;
    }

    // Get connection info for UI
    getConnectionInfo() {
        return {
            connected: this.isConnected(),
            calendarId: this.maintenanceCalendarId,
            userEmail: this.isSignedIn && this.gapi ? 
                this.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail() : null
        };
    }
}

// Initialize the Google Calendar sync
window.googleCalendarSync = new GoogleCalendarSync();

console.log('✅ Google Calendar Sync module loaded successfully');
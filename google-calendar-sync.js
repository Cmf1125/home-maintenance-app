// Google Calendar Integration Module - Modern Google Identity Services
// Syncs maintenance tasks with user's Google Calendar


class GoogleCalendarSync {
    constructor() {
        // Google API Configuration
        this.CLIENT_ID = '111292310649-ck87c3fe6t549623rmkarrmqnnjnsqh0.apps.googleusercontent.com';
        this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
        this.SCOPES = 'https://www.googleapis.com/auth/calendar';
        
        this.isSignedIn = false;
        this.gapi = null;
        this.accessToken = null;
        this.maintenanceCalendarId = null;
        
        
        // Initialize when page loads
        this.initializeWhenReady();
    }

    // Wait for scripts to load then initialize
    async initializeWhenReady() {
        // Wait for both Google APIs to load
        await this.waitForGoogleAPIs();
        await this.initializeGoogleAPI();
    }

    // Wait for Google scripts to be available
    waitForGoogleAPIs() {
        return new Promise((resolve) => {
            const checkAPIs = () => {
                if (window.gapi && window.google && window.google.accounts) {
                    resolve();
                } else {
                    setTimeout(checkAPIs, 100);
                }
            };
            checkAPIs();
        });
    }

    // Initialize Google API
    async initializeGoogleAPI() {
        try {
            
            if (!window.gapi) {
                throw new Error('Google API library (gapi) not loaded');
            }
            
            this.gapi = window.gapi;

            // Initialize the API client
            await new Promise((resolve, reject) => {
                this.gapi.load('client', {
                    callback: resolve,
                    onerror: reject
                });
            });

            // Verify client loaded
            if (!this.gapi.client) {
                throw new Error('Google API client failed to load');
            }

            // Initialize with discovery document
            await this.gapi.client.init({
                discoveryDocs: [this.DISCOVERY_DOC]
            });

            return true;
        } catch (error) {
            console.error('❌ Error initializing Google Calendar API:', error);
            return false;
        }
    }

    // Sign in to Google Calendar using modern OAuth
    async signInToGoogle() {
        try {
            if (!this.gapi || !this.gapi.client) {
                const initSuccess = await this.initializeGoogleAPI();
                if (!initSuccess) {
                    throw new Error('Failed to initialize Google API');
                }
            }


            // Use Google Identity Services for OAuth
            return new Promise((resolve, reject) => {
                const tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: this.CLIENT_ID,
                    scope: this.SCOPES,
                    callback: async (response) => {
                        if (response.error) {
                            console.error('OAuth error:', response.error);
                            this.showUserError('Failed to connect to Google Calendar');
                            reject(new Error(response.error));
                            return;
                        }

                        this.accessToken = response.access_token;
                        this.isSignedIn = true;

                        // Ensure gapi.client is available before setting token
                        if (!this.gapi || !this.gapi.client) {
                            console.error('❌ Google API client not properly initialized');
                            reject(new Error('Google API client not initialized'));
                            return;
                        }

                        // Set the access token for API calls
                        this.gapi.client.setToken({ access_token: this.accessToken });

                        // Create or find the Home Maintenance calendar
                        await this.setupMaintenanceCalendar();
                        
                        this.showUserMessage('✅ Connected to Google Calendar!');
                        resolve(true);
                    }
                });

                // Request access token
                tokenClient.requestAccessToken();
            });

        } catch (error) {
            console.error('❌ Error signing in to Google Calendar:', error);
            this.showUserError('Failed to connect to Google Calendar. Please try again.');
            return false;
        }
    }

    // Sign out from Google Calendar
    async signOutFromGoogle() {
        try {
            if (this.accessToken && window.google && window.google.accounts.oauth2) {
                window.google.accounts.oauth2.revoke(this.accessToken);
            }
            
            this.isSignedIn = false;
            this.accessToken = null;
            this.maintenanceCalendarId = null;
            this.gapi.client.setToken(null);
            
            this.showUserMessage('Disconnected from Google Calendar');
        } catch (error) {
            console.error('❌ Error signing out:', error);
        }
    }

    // Set up dedicated "Home Maintenance" calendar
    async setupMaintenanceCalendar() {
        try {

            // First, check if calendar already exists
            const calendarList = await this.gapi.client.calendar.calendarList.list();
            const existingCalendar = calendarList.result.items.find(cal => 
                cal.summary === 'Home Maintenance' || cal.summary.includes('Home Maintenance')
            );

            if (existingCalendar) {
                this.maintenanceCalendarId = existingCalendar.id;
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
                return null;
            }


            // Ensure proper date format (YYYY-MM-DD for all-day events)
            let dueDate = task.dueDate;
            if (dueDate) {
                // Convert to string if it's not already
                if (typeof dueDate !== 'string') {
                    const date = new Date(dueDate);
                    dueDate = date.toISOString().split('T')[0];
                } else if (!dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    // Convert to proper format if needed
                    const date = new Date(dueDate);
                    dueDate = date.toISOString().split('T')[0];
                }
            } else {
                // Default to today if no due date
                dueDate = new Date().toISOString().split('T')[0];
            }

            // Prepare event details
            const eventData = {
                summary: `🏠 ${task.title}`,
                description: this.createEventDescription(task),
                start: {
                    date: dueDate // All-day event requires YYYY-MM-DD format
                },
                end: {
                    date: dueDate // All-day event requires YYYY-MM-DD format
                },
                colorId: this.getCategoryColor(task.category)
            };


            // Create the event
            const event = await this.gapi.client.calendar.events.insert({
                calendarId: this.maintenanceCalendarId,
                resource: eventData
            });


            // Store the Google event ID in the task for future updates
            if (window.tasks) {
                const taskIndex = window.tasks.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) {
                    window.tasks[taskIndex].googleEventId = event.result.id;
                    // Save to Firebase if user is logged in
                    if (window.currentUser && typeof saveData === 'function') {
                        saveData();
                    }
                }
            }

            return event.result.id;
        } catch (error) {
            console.error('❌ Error syncing task to Google Calendar:', error);
            console.error('❌ Full error details:', JSON.stringify(error, null, 2));
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


            // Ensure proper date format
            let dueDate = task.dueDate;
            if (dueDate) {
                // Convert to string if it's not already
                if (typeof dueDate !== 'string') {
                    const date = new Date(dueDate);
                    dueDate = date.toISOString().split('T')[0];
                } else if (!dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    // Convert to proper format if needed
                    const date = new Date(dueDate);
                    dueDate = date.toISOString().split('T')[0];
                }
            } else {
                // Default to today if no due date
                dueDate = new Date().toISOString().split('T')[0];
            }

            const eventData = {
                summary: `🏠 ${task.title}`,
                description: this.createEventDescription(task),
                start: {
                    date: dueDate
                },
                end: {
                    date: dueDate
                },
                colorId: this.getCategoryColor(task.category)
            };

            const event = await this.gapi.client.calendar.events.update({
                calendarId: this.maintenanceCalendarId,
                eventId: task.googleEventId,
                resource: eventData
            });

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


            await this.gapi.client.calendar.events.delete({
                calendarId: this.maintenanceCalendarId,
                eventId: task.googleEventId
            });

        } catch (error) {
            console.error('❌ Error deleting Google Calendar event:', error);
        }
    }

    // Sync all existing tasks to Google Calendar
    async syncAllTasks() {
        if (!window.tasks || !this.isSignedIn) {
            return;
        }

        
        let syncCount = 0;
        let skipCount = 0;
        for (const task of window.tasks) {
            
            // Only sync incomplete tasks without existing Google event
            if (!task.isCompleted && !task.googleEventId) {
                const eventId = await this.syncTaskToCalendar(task);
                if (eventId) {
                    syncCount++;
                } else {
                }
                // Small delay to avoid rate limiting
                await this.delay(100);
            } else {
                skipCount++;
            }
        }

        this.showUserMessage(`✅ Synced ${syncCount} tasks to your Google Calendar!`);
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Show user-friendly messages
    showUserMessage(message) {
        // Could integrate with your existing toast/notification system
    }

    showUserError(message) {
        console.error('❌', message);
        // Could integrate with your existing error notification system
    }

    // Check connection status
    isConnected() {
        return this.isSignedIn && this.accessToken && this.maintenanceCalendarId;
    }

    // Get connection info for UI
    getConnectionInfo() {
        return {
            connected: this.isConnected(),
            calendarId: this.maintenanceCalendarId,
            userEmail: null // Would need additional API call to get user info
        };
    }
}

// Initialize the Google Calendar sync
window.googleCalendarSync = new GoogleCalendarSync();


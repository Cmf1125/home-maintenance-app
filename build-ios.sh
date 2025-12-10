#!/bin/bash

echo "🍎 Building Home Keeper iOS App with Native Features"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Initialize Capacitor if needed
if [ ! -d "ios" ]; then
    echo "⚡ Initializing Capacitor..."
    npx cap add ios
fi

# Sync web assets and native plugins
echo "🔄 Syncing Capacitor..."
npx cap sync ios

# Copy web assets
echo "📁 Copying web assets..."
npx cap copy ios

# Update native plugins
echo "🔌 Updating native plugins..."
npx cap update ios

echo "✅ iOS build ready!"
echo ""
echo "Next steps:"
echo "1. Open the iOS project: npx cap open ios"
echo "2. In Xcode, build and run on device/simulator"
echo "3. Test native features: camera, notifications, haptics"
echo ""
echo "📋 New Native Features Added:"
echo "   📸 Photo documentation for tasks"
echo "   🔔 Native iOS push notifications"
echo "   📳 Haptic feedback for interactions"
echo "   📱 iOS-optimized UI and behaviors"
echo "   💾 Device-specific personalizations"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Casa Care - Baby Steps Integration</title>
</head>
<body>
    <!-- 
    🍼 BABY STEP INTEGRATION GUIDE
    
    We'll upgrade your Casa Care app in tiny, safe steps.
    Each step is reversible and won't break anything!
    
    ==========================================
    STEP 1: ADD PROFESSIONAL FONT (2 minutes)
    ==========================================
    
    This is the SAFEST first step. Just makes text look more professional.
    
    WHAT TO DO:
    1. Find this line in your HTML <head> section:
       <title>Casa Care - Smart Home Maintenance</title>
    
    2. RIGHT AFTER that line, add these 3 lines:
    -->
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- 
    3. Then find your existing <style> section and ADD this at the very top:
    -->
    
    <style>
    /* 🍼 STEP 1: Professional Font */
    * {
        font-family: 'Inter', sans-serif !important;
    }
    
    /* ✅ STOP HERE FOR STEP 1 - Save and refresh to see the font change! */
    </style>
    
    <!-- 
    ==========================================
    STEP 2: ADD COLOR VARIABLES (3 minutes)
    ==========================================
    
    This creates the foundation for easy color changes later.
    
    WHAT TO DO:
    Add this RIGHT AFTER your Step 1 CSS:
    -->
    
    <style>
    /* 🍼 STEP 2: Professional Color System */
    :root {
        --primary-600: #0f172a;
        --primary-500: #1e293b;
        --accent-600: #0ea5e9;
        --accent-500: #38bdf8;
        --success-600: #059669;
        --success-500: #10b981;
        --warning-600: #d97706;
        --warning-500: #f59e0b;
        --danger-600: #dc2626;
        --danger-500: #ef4444;
        --surface-50: #f8fafc;
        --surface-100: #f1f5f9;
        --surface-200: #e2e8f0;
    }
    
    /* ✅ STOP HERE FOR STEP 2 - Save and refresh (you won't see changes yet, but foundation is ready!) */
    </style>
    
    <!-- 
    ==========================================
    STEP 3: UPGRADE BUTTONS (5 minutes)
    ==========================================
    
    This makes your buttons look professional.
    
    WHAT TO DO:
    Add this RIGHT AFTER your Step 2 CSS:
    -->
    
    <style>
    /* 🍼 STEP 3: Professional Buttons */
    .btn-primary, 
    button[onclick*="createMaintenancePlan"],
    button[onclick*="finishTaskSetup"],
    button[onclick*="addTask"] {
        background: linear-gradient(135deg, var(--accent-600), var(--accent-500)) !important;
        color: white !important;
        font-weight: 600 !important;
        border-radius: 12px !important;
        border: none !important;
        padding: 14px 24px !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 14px rgba(14, 165, 233, 0.3) !important;
    }
    
    .btn-primary:hover,
    button[onclick*="createMaintenancePlan"]:hover,
    button[onclick*="finishTaskSetup"]:hover,
    button[onclick*="addTask"]:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4) !important;
    }
    
    /* ✅ STOP HERE FOR STEP 3 - Save and refresh to see beautiful buttons! */
    </style>
    
    <!-- 
    ==========================================
    STEP 4: UPGRADE CARDS (5 minutes)
    ==========================================
    
    This makes your cards look more professional.
    
    WHAT TO DO:
    Add this RIGHT AFTER your Step 3 CSS:
    -->
    
    <style>
    /* 🍼 STEP 4: Professional Cards */
    .bg-white,
    .stat-card {
        background: rgba(255, 255, 255, 0.9) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
        border-radius: 16px !important;
        transition: all 0.3s ease !important;
    }
    
    .stat-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
    }
    
    /* ✅ STOP HERE FOR STEP 4 - Save and refresh to see glass-effect cards! */
    </style>
    
    <!-- 
    ==========================================
    STEP 5: UPGRADE FORM INPUTS (5 minutes)
    ==========================================
    
    This makes your form inputs look more professional.
    
    WHAT TO DO:
    Add this RIGHT AFTER your Step 4 CSS:
    -->
    
    <style>
    /* 🍼 STEP 5: Professional Form Inputs */
    input[type="text"],
    input[type="number"],
    input[type="date"],
    select,
    textarea {
        border: 2px solid var(--surface-200) !important;
        border-radius: 12px !important;
        padding: 16px 20px !important;
        font-size: 16px !important;
        transition: all 0.3s ease !important;
        background: white !important;
    }
    
    input:focus,
    select:focus,
    textarea:focus {
        outline: none !important;
        border-color: var(--accent-500) !important;
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1) !important;
        transform: translateY(-1px) !important;
    }
    
    /* ✅ STOP HERE FOR STEP 5 - Save and refresh to see beautiful form inputs! */
    </style>
    
    <!-- 
    ==========================================
    STEP 6: UPGRADE BACKGROUND (3 minutes)
    ==========================================
    
    This gives your app a professional background.
    
    WHAT TO DO:
    Add this RIGHT AFTER your Step 5 CSS:
    -->
    
    <style>
    /* 🍼 STEP 6: Professional Background */
    body {
        background: linear-gradient(135deg, var(--surface-50) 0%, var(--surface-200) 100%) !important;
        min-height: 100vh !important;
    }
    
    /* ✅ STOP HERE FOR STEP 6 - Save and refresh for a professional gradient background! */
    </style>
    
    <!-- 
    ==========================================
    STEP 7: UPGRADE TASK CARDS (5 minutes)
    ==========================================
    
    This makes your task cards look amazing.
    
    WHAT TO DO:
    Add this RIGHT AFTER your Step 6 CSS:
    -->
    
    <style>
    /* 🍼 STEP 7: Professional Task Cards */
    .enhanced-task-card,
    .task-card-pro {
        background: white !important;
        border-radius: 16px !important;
        padding: 20px !important;
        border: 1px solid var(--surface-100) !important;
        transition: all 0.3s ease !important;
        position: relative !important;
        overflow: hidden !important;
    }
    
    .enhanced-task-card:hover,
    .task-card-pro:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1) !important;
    }
    
    .enhanced-task-card.priority-high {
        border-left: 4px solid var(--danger-500) !important;
    }
    
    .enhanced-task-card.priority-medium {
        border-left: 4px solid var(--warning-500) !important;
    }
    
    .enhanced-task-card.priority-low {
        border-left: 4px solid var(--success-500) !important;
    }
    
    /* ✅ STOP HERE FOR STEP 7 - Save and refresh to see beautiful task cards! */
    </style>
    
    <!-- 
    ==========================================
    COMPLETE! YOU'RE DONE! 🎉
    ==========================================
    
    Your Casa Care app now has a professional design!
    
    OPTIONAL STEP 8: FINE-TUNING (if you want to go further)
    
    If you want even more polish, add this:
    -->
    
    <style>
    /* 🎨 STEP 8: Extra Polish (Optional) */
    
    /* Better checkboxes */
    input[type="checkbox"] {
        appearance: none !important;
        width: 20px !important;
        height: 20px !important;
        border: 2px solid var(--surface-200) !important;
        border-radius: 6px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.3s ease !important;
        cursor: pointer !important;
    }
    
    input[type="checkbox"]:checked {
        background: var(--accent-500) !important;
        border-color: var(--accent-500) !important;
    }
    
    input[type="checkbox"]:checked::after {
        content: '✓' !important;
        color: white !important;
        font-size: 14px !important;
        font-weight: 600 !important;
    }
    
    /* Better navigation */
    .bottom-nav {
        background: white !important;
        border-top: 1px solid var(--surface-100) !important;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1) !important;
    }
    
    .tab-btn.bg-blue-100 {
        background: rgba(14, 165, 233, 0.1) !important;
        color: var(--accent-600) !important;
    }
    
    /* ✅ FINAL STEP - Save and enjoy your beautiful app! */
    </style>
    
    <!-- 
    ==========================================
    🆘 EMERGENCY BACKUP PLAN
    ==========================================
    
    If anything looks wrong at ANY step:
    
    1. Find the step that caused the problem
    2. Delete just that step's CSS
    3. Save and refresh
    4. Your app will be back to the previous step!
    
    Each step is independent, so removing one won't break the others.
    
    ==========================================
    🎨 EASY CUSTOMIZATION AFTER SETUP
    ==========================================
    
    Want to change colors? Just change these in Step 2:
    
    --accent-600: #your-new-color;     /* Main buttons and highlights */
    --primary-600: #your-text-color;   /* Main text color */
    --success-600: #your-green-color;  /* Success/positive elements */
    --warning-600: #your-orange-color; /* Warning elements */
    --danger-600: #your-red-color;     /* Error/urgent elements */
    
    That's it! The entire app will update with your new colors.
    -->
    
</body>
</html>

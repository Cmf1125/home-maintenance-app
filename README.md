# 🏡 Home Maintenance App

A simple app to help homeowners stay on top of seasonal and system-based maintenance tasks. This is a learning project in progress — organized by modular features and branches.

---

## 🚀 Features

- ✅ **Smart Home Setup**  
  Collects detailed property information like square footage, HVAC type, and region.

- 🧠 **Task Generator**  
  Automatically creates recurring maintenance tasks based on home systems.

- 📝 **Task Management**  
  Lets users add, edit, delete tasks and assign frequency/priority.

- 🌎 **Regional Intelligence**  
  Adjusts tasks based on seasonal climate differences (Northeast, Southeast, etc.).

---

## 📁 Folder Structure (Modular)

```
src/
  components/
    SmartHomeSetup.js       # Property & climate zone form
    TaskManager.js          # UI for managing tasks
  utils/
    taskGenerator.js        # Creates task lists from setup data
    regionTasks.js          # Adds seasonal tasks by region
```

---

## 🛠 Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/Cmf1125/home-maintenance-app.git
   cd home-maintenance-app
   ```

2. Open `index.html` in your browser  
   (or import modules into a framework later)

---

## 🧠 Future Features

- Task reminder notifications (email or browser)
- Calendar integration
- Mobile layout or PWA support
- Cloud syncing

---

## 🧰 Learning Goals

This project is being built by a beginner learning frontend dev with guidance. Each feature is broken into a separate Git branch to encourage clean workflows.

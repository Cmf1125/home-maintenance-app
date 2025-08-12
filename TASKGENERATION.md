# Home Keeper App - Task Generation Documentation

## Overview
The Home Keeper app generates personalized maintenance tasks based on property information, features, and location. Task generation follows a hierarchical approach with automatic priority assignment and intelligent scheduling.

## Task Generation Logic

### 1. Essential Tasks (All Properties)
**Universal tasks regardless of property type:**
- **Test Smoke Detectors** - Every 180 days, $0, Safety priority
- **Dryer Vent Cleaning** - Every 365 days, $100, Safety priority

### 2. Property-Type Specific Tasks

#### Properties with Exterior Responsibility
*Single-family homes, townhouses, mobile homes:*
- **Clean Gutters** - Every 180 days, $150, Exterior category
- **Inspect Caulking** - Every 365 days, $50, General category
- **Quarterly Pest Control** - Every 90 days, $150, Pest Control category
- **Termite Inspection** - Every 365 days, $0, Pest Control category
- **Tree Inspection & Pruning** - Every 365 days, $200, Exterior category
- **Lawn Fertilizer Application** - Every 120 days, $50, Exterior category

#### Limited Responsibility Properties  
*Condos, apartments:*
- **Inspect Window Seals** - Every 365 days, $0, General category

### 3. HVAC System Tasks

#### Central AC/Heat System
- **Replace HVAC Filter** - Every 90 days, $25, HVAC category
- **HVAC Professional Service** - Every 365 days, $150, HVAC category

#### Mini-Split Systems
- **Clean Mini-Split Filters** - Every 60 days, $0, HVAC category

#### Wall Air Conditioners
- **Clean Wall AC Filters** - Every 30 days, $0, HVAC category

#### Electric Baseboard Heat
- **Clean Electric Baseboard Heaters** - Every 180 days, $0, HVAC category

#### Boiler Systems
- **Boiler Annual Service** - Every 365 days, $200, HVAC category

### 4. Water System Tasks

#### Well Water Systems
- **Test Well Water** - Every 365 days, $75, Water Systems category

**Additional tasks based on well water components:**
- **Sediment Filter:** Replace every 90 days, $25
- **UV Filter:** Replace every 365 days, $150  
- **Water Softener:** Refill salt every 60 days, $30
- **Whole House Filter:** Replace every 180 days, $50

#### Septic Systems
- **Septic Tank Pumping** - Every 1095 days (3 years), $400, Water Systems category

### 5. Special Feature Tasks

#### Fireplace
- **Chimney Inspection & Cleaning** - Every 365 days, $300, Safety category

#### Deck/Patio
- **Deck Staining/Sealing** - Every 730 days (2 years), $200, Exterior category

#### Pool/Spa
- **Pool Opening/Closing** - Every 182 days (twice yearly), $300, General category

#### Garage
- **Garage Door Maintenance** - Every 365 days, $50, General category

#### Basement
- **Check Basement for Moisture** - Every 180 days, $0, General category

### 6. Regional Seasonal Tasks

Tasks generated based on state/climate region:

#### Northeast Cold Climate
*ME, NH, VT, MA, RI, CT, NY, NJ, PA*
- **Check AC Before Summer** - Annual, $0, Seasonal category
- **Check Heating Before Winter** - Annual, $0, Seasonal category
- **Winterize Outdoor Pipes** - Annual, $50, Seasonal category (exterior properties only)

#### Southeast Humid Climate
*DE, MD, VA, WV, KY, TN, NC, SC, GA, FL, AL, MS, AR, LA*
- **AC Pre-Season Tune-Up** - Annual, $150, Seasonal category
- **Hurricane Emergency Kit Check** - Annual, $50, Seasonal category

#### West Coast (California)
- **Earthquake Emergency Kit Check** - Annual, $50, Seasonal category

#### All Other Regions
- **Spring System Check** - Annual, $0, Seasonal category

## Priority Assignment Logic

### Automatic Priority Calculation
```javascript
function getAutoPriority(title, category) {
    // Safety tasks are always high priority
    if (category === 'Safety') return 'high';
    
    // Critical safety keywords
    const safetyKeywords = ['smoke', 'detector', 'carbon monoxide', 'chimney', 'boiler', 'fire'];
    if (safetyKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
        return 'high';
    }
    
    // Everything else is normal priority
    return 'normal';
}
```

### Priority Categories
- **High Priority:** Safety tasks, smoke detectors, fire-related maintenance
- **Normal Priority:** All other maintenance tasks

## Appliance-Specific Task Generation

### Task Templates by Appliance Category

#### Kitchen Appliances
- **Clean Filters** - Every 90 days, $25, Appliance category
- **Deep Clean** - Every 180 days, $0, Appliance category

#### HVAC Appliances  
- **Filter Replacement** - Every 90 days, $30, HVAC category
- **Professional Service** - Every 365 days, $150, HVAC category

#### Laundry Appliances
- **Lint Trap Clean** - Every 30 days, $0, Appliance category

#### Outdoor Appliances
- **Seasonal Prep** - Every 180 days, $25, Exterior category

### Category Mapping
Appliance categories map to task categories:
- `hvac` → `HVAC`
- `kitchen` → `Appliance` 
- `laundry` → `Appliance`
- `bathroom` → `General`
- `utility` → `General`
- `outdoor` → `Exterior`
- `other` → `Appliance`

### Initial Task Scheduling
New appliance tasks are scheduled with staggered start dates:
- **Daily/Weekly tasks** (≤30 days): Start in 1 week
- **Monthly/Quarterly tasks** (≤90 days): Start in 2 weeks  
- **Annual tasks** (>90 days): Start in 1 month

## Assessment & Recommendations

### Feature Checklist Completeness
**Current coverage is good but could be expanded:**

**Missing HVAC Options:**
- Heat pumps
- Geothermal systems
- Radiant floor heating
- Window units (beyond wall AC)

**Missing Water Features:**
- Private wells with different pump types
- Greywater systems
- Rainwater collection
- Sump pumps

**Missing Home Features:**
- Solar panels
- Generators (whole house/portable)
- Security systems
- Smart home devices
- Outdoor irrigation systems

### Frequency & Cost Audit Recommendations

**Frequencies that may need adjustment:**
- **HVAC filters:** 90 days is good average, but varies by usage/pets (30-120 days)
- **Smoke detector testing:** 180 days is longer than recommended 30-60 days
- **Pool maintenance:** Should distinguish between opening/closing vs. ongoing maintenance

**Cost estimates to review:**
- **Pest control:** $150/quarter may be high for some regions
- **Tree pruning:** $200 varies dramatically by tree size/number
- **Professional HVAC service:** $150 is conservative, often $200-300

**Regional cost adjustments needed:**
- Urban vs rural pricing differences
- Regional labor cost variations
- Seasonal demand pricing

### Suggested Enhancements

1. **Usage-based adjustments:** Frequency multipliers based on household size, pets, usage patterns
2. **Regional pricing:** Location-based cost estimates
3. **Seasonal clustering:** Group related tasks by optimal timing
4. **Manufacturer recommendations:** Import specific maintenance schedules for appliances
5. **Energy efficiency focus:** Highlight tasks that impact utility costs

## Task Generation Statistics
Based on a typical single-family home with common features:
- **Base tasks:** ~15-20 tasks
- **HVAC additions:** +2-4 tasks per system
- **Water system additions:** +1-4 tasks
- **Feature additions:** +1 task per major feature
- **Regional additions:** +2-3 seasonal tasks

**Total typical range:** 25-35 tasks per property

# Appliance-Specific Task Generation

## Overview
When users add appliances to their inventory, the system automatically generates maintenance tasks based on the appliance category. Each appliance gets a personalized task name (e.g., "Kitchen Refrigerator - Clean Filters").

## Task Generation by Appliance Category

### Kitchen Appliances
**Generated tasks for refrigerators, dishwashers, ovens, etc.:**

1. **Clean Filters**
   - Frequency: Every 90 days
   - Cost: $25
   - Category: Appliance
   - Description: "Clean or replace filters for optimal performance"

2. **Deep Clean** 
   - Frequency: Every 180 days
   - Cost: $0 (DIY)
   - Category: Appliance
   - Description: "Thorough cleaning of interior and exterior"

### HVAC Appliances
**Generated tasks for furnaces, AC units, heat pumps:**

1. **Filter Replacement**
   - Frequency: Every 90 days
   - Cost: $30
   - Category: HVAC
   - Description: "Replace HVAC filters"

2. **Professional Service**
   - Frequency: Every 365 days
   - Cost: $150
   - Category: HVAC
   - Description: "Annual professional HVAC maintenance"

### Laundry Appliances
**Generated tasks for washers, dryers:**

1. **Lint Trap Clean**
   - Frequency: Every 30 days
   - Cost: $0 (DIY)
   - Category: Appliance
   - Subcategory: Safety
   - Description: "Clean lint trap and exhaust vent"

### Outdoor Appliances
**Generated tasks for lawn equipment, generators, etc.:**

1. **Seasonal Prep**
   - Frequency: Every 180 days
   - Cost: $25
   - Category: Exterior
   - Description: "Prepare for seasonal use/storage"

### Bathroom Appliances
**Generated tasks for water heaters, exhaust fans:**
- Uses **Kitchen** template by default (filters + deep clean)
- Maps to **General** category instead of Appliance

### Utility Appliances  
**Generated tasks for water heaters, sump pumps:**
- Uses **Kitchen** template by default (filters + deep clean)
- Maps to **General** category instead of Appliance

### Other/Unclassified Appliances
**Default tasks for miscellaneous appliances:**
- Uses **Kitchen** template (filters + deep clean)
- Maps to **Appliance** category

## Category Mapping Logic

```javascript
const categoryMapping = {
    'hvac': 'HVAC',
    'kitchen': 'Appliance', 
    'laundry': 'Appliance',
    'bathroom': 'General',
    'utility': 'General',
    'outdoor': 'Exterior',
    'other': 'Appliance'
};
```

## Task Naming Convention
All appliance tasks include the appliance name:
- Format: `"[Appliance Name] - [Task Name]"`
- Example: `"Kitchen Refrigerator - Clean Filters"`
- Example: `"Basement Boiler - Professional Service"`

## Initial Scheduling Logic
New appliance tasks are staggered to avoid overwhelming users:

- **Frequent tasks** (≤30 days): Start in 1 week
- **Monthly/Quarterly** (31-90 days): Start in 2 weeks  
- **Annual tasks** (>90 days): Start in 1 month

## Priority Assignment
All appliance tasks default to **medium priority** unless:
- Task title contains safety keywords ("safety", "lint", "vent")
- Then priority = **high**

## Task Integration Features

### Appliance Linking
Each generated task includes:
```javascript
{
    applianceId: appliance.id,
    applianceName: appliance.name,
    applianceCategory: appliance.category,
    applianceManufacturer: appliance.manufacturer,
    applianceModel: appliance.model,
    isApplianceTask: true
}
```

### Task Management
- Users can view all tasks for a specific appliance
- Tasks can be removed from specific appliances
- Custom tasks can be added to appliances
- Task completion is tracked per appliance

## Current Limitations & Improvement Opportunities

### Limited Template Variety
**Current:** Only 4 basic templates (kitchen, HVAC, laundry, outdoor)
**Improvement:** Add specific templates for:
- Water heaters (anode rod replacement, flushing)
- Dishwashers (cleaning cycles, seal inspection)  
- Refrigerators (coil cleaning, defrosting)
- Washing machines (cleaning cycles, hose inspection)

### No Manufacturer-Specific Tasks
**Current:** Generic tasks for all brands/models
**Improvement:** 
- Import manufacturer maintenance schedules
- Model-specific recommended intervals
- Warranty-based task timing

### Missing Appliance Types
**Current:** 7 basic categories
**Missing Categories:**
- Small appliances (coffee makers, microwaves)
- Smart home devices (thermostats, security systems)
- Seasonal equipment (snow blowers, lawn mowers)
- Pool/spa equipment

### No Usage-Based Adjustments
**Current:** Fixed frequencies for all users
**Improvement:**
- Adjust based on household size
- Factor in usage patterns
- Consider environmental conditions

## Recommended Enhancements

1. **Expanded Templates:** Create specific maintenance schedules for common appliance types
2. **Manufacturer Integration:** Pull official maintenance schedules when possible
3. **Usage Tracking:** Allow users to input usage levels for frequency adjustments
4. **Seasonal Awareness:** Cluster related tasks (e.g., all HVAC prep before summer)
5. **Cost Accuracy:** Regional pricing and complexity-based cost estimates
6. **Warranty Tracking:** Alert users to warranty-covered maintenance windows

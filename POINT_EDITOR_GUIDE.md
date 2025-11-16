# Point Editor - User Guide 🎯

A comprehensive point management system for creating, editing, and managing game points in Congress Ingress.

## 🎯 Features

- ✅ **Create Points**: Add new claimable, mini-game, or non-claimable points
- ✅ **Edit Points**: Modify point properties, health, level, and ownership
- ✅ **Delete Points**: Remove points with confirmation
- ✅ **Search & Filter**: Find points by name or type
- ✅ **Statistics Dashboard**: View point counts and positioning status
- ✅ **Health Management**: Set and track point health values
- ✅ **Faction Assignment**: Assign points to factions
- ✅ **Position Tracking**: See which points are positioned on floors

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Points](#creating-points)
3. [Editing Points](#editing-points)
4. [Deleting Points](#deleting-points)
5. [Point Types](#point-types)
6. [Managing Health & Level](#managing-health--level)
7. [Faction Assignment](#faction-assignment)
8. [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Accessing the Point Editor

1. Navigate to `/admin` in your application
2. Click on "Point Management"
3. You'll see the point list and management interface

### Understanding the Interface

The point editor consists of:
- **Search & Filter Bar**: Find specific points
- **Statistics Dashboard**: Overview of point counts
- **Point Table**: List of all points with details
- **Editor Form**: Create or edit point properties

---

## 📝 Creating Points

### Step-by-Step Guide

1. Click the **"Add Point"** button in the top-right
2. Fill in the form:
   - **Point Name*** (required): Unique identifier (e.g., "Library Entrance")
   - **Type***: Select point type (claimable, mini_game, not_claimable)
   - **Level**: Point level (1-10, default: 1)
   - **Health**: Current health value
   - **Max Health**: Maximum health capacity
   - **Acquired By**: Assign to a faction (optional)
3. Click **"Create Point"**

### Point Creation Example

```
Name: Library Main Hall
Type: Claimable
Level: 1
Health: 100
Max Health: 100
Acquired By: None (Neutral)
```

This creates a neutral, claimable point at level 1 with full health.

---

## ✏️ Editing Points

### How to Edit

1. Find the point in the table
2. Click the **"Edit"** button (pencil icon)
3. Modify any fields in the form
4. Click **"Update Point"**

### What You Can Edit

- ✅ Point name
- ✅ Point type (claimable, mini_game, not_claimable)
- ✅ Level (1-10)
- ✅ Current health
- ✅ Max health
- ✅ Faction ownership

### Common Edit Scenarios

#### Scenario 1: Point Gets Damaged
```
Before: Health: 100 / 100
After:  Health: 45 / 100
```

#### Scenario 2: Point Gets Upgraded
```
Before: Level: 1, Max Health: 100
After:  Level: 2, Max Health: 200
```

#### Scenario 3: Faction Captures Point
```
Before: Acquired By: None (Neutral)
After:  Acquired By: Blue Faction
```

---

## 🗑️ Deleting Points

### How to Delete

1. Find the point in the table
2. Click the **"Delete"** button (trash icon)
3. Confirm the deletion in the dialog

### ⚠️ Important Warnings

- **Deletion is permanent** - Cannot be undone
- **Removes position data** - Point will be removed from all floor maps
- **Removes all references** - QR codes and actions linked to this point will fail

### Before Deleting

✅ Verify you're deleting the correct point
✅ Check if point has position data (will be lost)
✅ Consider making inactive instead of deleting
❌ Don't delete points that are actively used in gameplay

---

## 🎮 Point Types

### 1. Claimable Points 🔵

**Purpose**: Main capture points in the game
**Badge Color**: Blue (Primary)

**Characteristics**:
- Can be captured by factions
- Have health and levels
- Provide faction control
- Generate resources/points

**Use Cases**:
- Strategic locations (lobbies, hallways)
- Key objectives
- Territory control points

### 2. Mini Game Points 🟣

**Purpose**: Interactive puzzle or challenge locations
**Badge Color**: Purple (Secondary)

**Characteristics**:
- Trigger mini-games when accessed
- May provide rewards
- Optional faction ownership
- Encourage player engagement

**Use Cases**:
- Puzzle rooms
- Challenge stations
- Bonus objectives
- Interactive exhibits

### 3. Not Claimable Points 🟢

**Purpose**: Information or non-combat locations
**Badge Color**: Green (Accent)

**Characteristics**:
- Cannot be captured
- Provide information or services
- Always neutral
- Safe zones

**Use Cases**:
- Information desks
- Rest areas
- Checkpoints
- Tutorial locations

---

## ❤️ Managing Health & Level

### Health System

**Current Health**: Point's current hit points
**Max Health**: Maximum capacity

```
Healthy:    100/100  (100%) - Green
Good:        75/100  ( 75%) - Green
Damaged:     50/100  ( 50%) - Orange
Critical:    25/100  ( 25%) - Orange
Destroyed:    0/100  (  0%) - Red
```

### Level System

**Range**: 1-10
**Effect**: Higher levels = higher max health

**Typical Level Progression**:
```
Level 1: Max Health = 100
Level 2: Max Health = 200
Level 3: Max Health = 300
...
Level 10: Max Health = 1000
```

### Best Practices

1. **Match Health to Max Health** for new points
2. **Increase Max Health** when leveling up
3. **Don't exceed Max Health** (will be rejected)
4. **Set Health to 0** for destroyed/inactive points

---

## 🏴 Faction Assignment

### Assigning Factions

**Option 1**: Set during creation
**Option 2**: Edit existing point

**Dropdown Options**:
- None (Neutral)
- [List of available factions]

### Use Cases

#### Neutral Points (None)
- Starting state for new points
- Points that can be captured
- Safe zones
- Information points

#### Faction-Owned Points
- Captured territories
- Faction headquarters
- Strategic holdings
- Contested areas

### Example Workflow

1. Point created as **Neutral**
2. Faction captures → Change to **Blue Faction**
3. Enemy attacks → Reduce health
4. Point destroyed → Set health to 0, keep faction
5. Point reset → Change to **Neutral**, restore health

---

## 🔍 Search & Filter

### Search Bar

**Searches**:
- Point names (case-insensitive)
- Point IDs (partial match)

**Example**:
```
Search: "library"
Finds: "Library Main Hall", "Old Library Wing"
```

### Type Filter

**Options**:
- All Types (default)
- Claimable
- Mini Game
- Not Claimable

**Combo Search Example**:
```
Search: "main"
Filter: Claimable
Result: Only claimable points with "main" in name
```

---

## 📊 Statistics Dashboard

### Metrics Displayed

**Total Points**: All points in system
**Positioned**: Points placed on floor maps
**Claimable**: Number of capturable points
**Mini Games**: Number of mini-game points

### Understanding the Stats

```
Total Points: 50
├─ Positioned: 45  (90% complete)
├─ Claimable: 30   (60% of total)
└─ Mini Games: 10  (20% of total)
```

**Action Items**:
- If Positioned < Total → Need to position points on map
- Balanced ratio of types = better gameplay
- Too many/few mini-games affects engagement

---

## 📍 Position Status

### Status Indicators

✅ **Green Checkmark + Floor Name**: Point is positioned
⚠️ **Yellow Badge "Not positioned"**: Point needs positioning

### Positioning Points

Points created in the Point Editor must be positioned on the map:

1. Go to **Map Editor** (`/admin/map-editor`)
2. Select a floor
3. Click **"Edit Points"**
4. Position the point on the map
5. Return to Point Editor to verify

**Flow**:
```
Point Editor → Create Point
     ↓
Map Editor → Position Point
     ↓
Point Editor → Verify (checkmark appears)
```

---

## 💡 Best Practices

### Naming Conventions

✅ **Do**:
- Use descriptive names: "Main Library Entrance"
- Include location: "Building A - Room 101"
- Be consistent: "Floor 1 - East Wing"

❌ **Don't**:
- Use generic names: "Point 1", "Location A"
- Duplicate names: Multiple "Entrance" points
- Use symbols: "Room #1!!!" (IDs are auto-generated)

### Health Management

1. **New Points**: Set health = max health
2. **Upgrades**: Increase max health first, then restore health
3. **Damage**: Only reduce current health, not max health
4. **Repairs**: Increase current health up to max health
5. **Destroyed**: Set health to 0

### Level Guidelines

- **Level 1-3**: Starting/easy points
- **Level 4-6**: Medium difficulty points
- **Level 7-9**: Hard/strategic points
- **Level 10**: Boss/special points

### Type Distribution

Recommended ratio for balanced gameplay:
```
Claimable:      60% (Main objectives)
Mini Game:      25% (Engagement)
Not Claimable:  15% (Safe zones/info)
```

### Faction Assignment Strategy

1. **Start Neutral**: Let gameplay determine ownership
2. **Strategic Placement**: Don't cluster faction points
3. **Balance Power**: Distribute owned points evenly
4. **Reset Periodically**: Return to neutral for events

---

## 🔧 Troubleshooting

### "Failed to save point"

**Possible Causes**:
- Empty point name
- Health > Max Health
- Database connection issue

**Solutions**:
- ✓ Fill in required fields
- ✓ Adjust health values
- ✓ Check browser console for errors

### Point not appearing in game

**Checklist**:
- [ ] Point created successfully?
- [ ] Point positioned on map?
- [ ] Floor is active?
- [ ] Point type is correct?

### Can't delete point

**Possible Causes**:
- Point is referenced in active games
- Database foreign key constraint
- Permission issue

**Solutions**:
- ✓ Check for active references
- ✓ Contact administrator
- ✓ Consider setting health to 0 instead

### Position status not updating

**Solution**:
- Refresh the page
- Verify position saved in Map Editor
- Check database point_positions table

---

## 📱 Mobile Usage

The Point Editor works on mobile devices:

### Mobile Optimizations

- ✅ Responsive table (horizontal scroll)
- ✅ Touch-friendly buttons
- ✅ Mobile-optimized forms
- ✅ Readable on small screens

### Mobile Tips

1. **Use landscape** for better table view
2. **Search** instead of scrolling through long lists
3. **Filter** to reduce visible items
4. **Form fills faster** than desktop scrolling

---

## 🎓 Tutorial: Your First Point

### Complete Walkthrough

**Step 1: Create the Point (2 minutes)**
```
1. Click "Add Point"
2. Name: "Tutorial Point"
3. Type: Claimable
4. Level: 1
5. Health: 100
6. Max Health: 100
7. Acquired By: None
8. Click "Create Point"
```

**Step 2: Verify Creation**
```
- Point appears in table
- Status: "Not positioned" (yellow badge)
- Type: Claimable (blue badge)
- Health: 100/100 (green)
```

**Step 3: Position on Map**
```
1. Go to /admin/map-editor
2. Select a floor
3. Click "Edit Points"
4. Select "Tutorial Point"
5. Click on map
6. Click "Save All Positions"
```

**Step 4: Verify Positioning**
```
1. Return to Point Editor
2. Find "Tutorial Point"
3. Status shows: ✓ [Floor Name]
```

**Congratulations!** 🎉 You've created and positioned your first point!

---

## 📚 Integration with Map Editor

### Workflow Integration

```
Point Editor                    Map Editor
     │                               │
     ├─ Create Point                 │
     │  (Name, Type, Stats)          │
     │                               │
     └─────────────────────────────► Position Point
                                     (X, Y coordinates)
                                          │
                                          │
     ┌────────────────────────────────────┘
     │
     └─ Verify Position
        (Checkmark appears)
```

### Best Practice Workflow

1. **Plan Your Points**: List all locations
2. **Create in Bulk**: Add all points at once
3. **Position Floor-by-Floor**: One floor at a time
4. **Verify Complete**: Check all have positions
5. **Test in Game**: Ensure points work correctly

---

## 🔐 Permissions

### Admin Access Required

All point management operations require admin access.

### Database Permissions

Points are stored with RLS (Row Level Security):
- Admins: Full CRUD access
- Users: Read-only access (through game)

---

## 📊 Database Schema

### Point Table Structure

```sql
CREATE TABLE point (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  type          point_type NOT NULL DEFAULT 'claimable',
  level         INTEGER NOT NULL DEFAULT 1,
  health        INTEGER NOT NULL DEFAULT 100,
  max_health    INTEGER NOT NULL DEFAULT 100,
  acquired_by   UUID REFERENCES faction(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Point Types Enum

```sql
CREATE TYPE point_type AS ENUM (
  'claimable',
  'not_claimable',
  'mini_game'
);
```

---

## 🎯 Quick Reference

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Focus Search | `/` |
| Create Point | `Ctrl/Cmd + N` (when focused) |
| Close Editor | `Esc` |

### Status Badges

| Badge | Meaning |
|-------|---------|
| 🔵 Blue | Claimable |
| 🟣 Purple | Mini Game |
| 🟢 Green | Not Claimable |
| ⚠️ Yellow | Not Positioned |
| ✅ Green Check | Positioned |

### Health Colors

| Color | Range | Status |
|-------|-------|--------|
| 🟢 Green | 75-100% | Healthy |
| 🟡 Yellow | 50-74% | Damaged |
| 🟠 Orange | 25-49% | Critical |
| 🔴 Red | 0-24% | Destroyed |

---

## 📝 Additional Resources

- **Map Editor**: `/admin/map-editor` - Position points on floors
- **Point Details**: `/admin/point/[id]` - View individual point stats
- **Game Map**: `/game/map` - See player-facing map view
- **API Documentation**: See database.types.ts

---

## 🆘 Support

For issues or questions:
1. Check this guide first
2. Verify database migrations are applied
3. Check browser console for errors
4. Review MAP_IMPLEMENTATION_SUMMARY.md
5. Test with a simple point first

---

**Made with ❤️ for Congress Ingress**
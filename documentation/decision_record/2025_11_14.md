# Point Level

## Concept

How to add base building to the game? Point Levels!

A point will have a level with a configurable max level, by default 3, but changeable in the game's config.
With each level, the point's max health will be increased.
Each level will give additional configured max health (by default 255).

So if a point is on level 3, it has 3 * 255 = 765 health points.

To level a point, the health has to be at max health, then a user can perform the upgrade action to level up the point.
After the upgrade, the point's max health has increased, but the user has to repair it to the full new max health.

So after the upgrade the point has 2 * 255 of 3 * 255 HP.

### Level 0 Initialization

Level 0 has a max health of 0, so it can be claimed immediately and the level increases by 1.
To be fair, the point should then have 128 HP (half of the level 1 max health) to prevent playing the ping-pong claim game.

## Game Mechanics

### Action Point (AP) Costs for Upgrading

Upgrading a point should cost 50 AP or more to prevent instant upgrades and add strategic resource management. This makes upgrading a significant investment that requires planning.

### Attack and Repair Mechanics: Group Play Encouraged

The current attack/repair mechanics are designed to encourage group play:
- **Attacking high-level points**: A single player attacking a level 3 point (765 HP) would need many attacks, making it time-consuming and AP-intensive
- **Group attacks are more efficient**: Multiple players coordinating attacks can take down high-level points much faster
- **Same applies to repairs**: Defending and upgrading high-level points benefits greatly from faction coordination
- **Strategic balance**: High-level points become valuable team assets that require team effort to both capture and defend

This group-oriented design is intentional and sufficient for the current game balance. Players will naturally need to work together to be effective.

### Level Visibility

Point levels should be visible to all players. This allows players to make informed strategic decisions about which points to attack, defend, or upgrade.

Note: This visibility may change in the future if a theme or fog-of-war mechanic is added to the game.

### Level Behavior on Capture

When a point is captured by another faction:
- **Level resets to 1** (not 0, as it's already been claimed)
- **Health is set to half of level 1 max health** (128 HP by default)
- The capturing faction must rebuild the point's level from scratch

This design choice:
- Rewards successful attacks by preventing the capturing faction from immediately benefiting from the previous owner's investment
- Makes high-level points valuable but not permanent
- Encourages ongoing territorial conflict rather than static front lines
- Provides a fresh start for the new owners while preventing instant recapture

## Configuration Parameters

The following values should be configurable in the game config:
- `max_point_level`: Default 3
- `health_per_level`: Default 255
- `upgrade_ap_cost`: Default 50 or higher
- Initial health after capture: `health_per_level / 2` (128 HP at default)

## Status

Concept - Ready for implementation planning

# Arena-RL

You can play current version online here: https://furmanus.github.io/Arena-RL/

Simple roguelike currently being under construction in early development phase. Written in HTML5 and Javascript with require.js and rot.js.

Game is very far away from what I want to achieve. You can't win yet (though you can easily die). Some of currently implemented features:

- randomly generated levels with different possible themes (ordinary dungeons, caverns, forests, lakes, chasms)
- over dozen of different monsters
- scrolls and potions
- over dozen of different weapon with different stats and different special effects for critical hits (bleeding, stunning, etc.)
- ranged combat
- non trivial AI: if any weapon, armour, scroll or potion can be picked up and used by player, it can be also used by humanoid enemy (and they will use it!)

Latest changes (version 0.2):

FEATURES:

- chasms and chasm level type
- ranged combat
- rework of monster AI:
  * monsters neutral to each other no longer blocks themselves in corridor infinitely
  * when hostile gets outside monster's FOV, monster will go to hostile last known position
  * monsters have favoured weapon type, either melee or ranged
  * monsters recognize ranged weapon and ammunition, and will behave properly when dealing with them
  * monsters no longer follows hostile into deep water, unless they are able to swim
- weapons and armours statistics are now displayed in inventory, equip screen or with look command
- added death screen with option to restart
- new class to select: archer. Starts with random weapon and ammunition. Archers have different stats gain between levels, different base stats and different hp gains between levels

FIXES:

- changed down critical hit damage multiplier for weapons
- armours defense was lowered
- fixed [issue #19], monsters no longer should take action after dying due to blood loss or poison
- monster panic status is temporarily removed, as it caused some unexpected and mysterious crashes
- fixed game-crashing bug with generating cavern levels



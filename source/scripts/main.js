requirejs(['map', 'generator', 'screen', 'noise', 'light', 'player', 'monster', 'items'], function(map, generator, screen, noise, light, player, monster, items){
	
	var player1;
	
	map.initCells(0);
	generator.createArenaLevel(0);
	map.setTerrain(0, 5, 5, 'tree');
	map.setTerrain(0, 6, 7, 'shallowWater');
	map.setTerrain(0, 7, 8, 'chasm');
	map.setTerrain(0, 7, 8, 'bush');
	map.setTerrain(0, 7, 9, 'grass');
	new items.Weapon('staff', map.cells[0][10][10]);
	new items.Weapon('long sword', map.cells[0][11][10]);
	new items.Weapon('warhammer', map.cells[0][15][10]);
	new items.Weapon('dagger', map.cells[0][10][13]);
	new items.Armour('chain mail', map.cells[0][12][13]);
	new items.Armour('field plate', map.cells[0][22][13]);
	new items.Weapon('staff', map.cells[0][10][10]);
	new items.Weapon('long sword', map.cells[0][13][10]);
	new items.Weapon('warhammer', map.cells[0][12][10]);
	new items.Weapon('dagger', map.cells[0][11][13]);
	new items.Armour('chain mail', map.cells[0][16][13]);
	new items.Armour('field plate', map.cells[0][21][13]);
	new items.Weapon('dagger', map.cells[0][15][13]);
	new items.Armour('chain mail', map.cells[0][12][15]);
	new items.Scroll('teleportation', map.cells[0][16][15]);
	new items.Potion('speed', map.cells[0][4][15]);
	player1 = new player.Player();
	map.cells[0].time.engine.start();
	screen.setWindows();
	
});
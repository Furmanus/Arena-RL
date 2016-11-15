requirejs(['map', 'generator', 'screen', 'noise', 'light', 'player', 'monster', 'items', 'pathfinding', 'combat'], function(map, generator, screen, noise, light, player, monster, items, pathfinding, combat){
	
	var player1, enemy;
	
	map.initCells(0);
	generator.createArenaLevel(0);
	//map.setTerrain(0, 5, 5, 'tree');
	//map.setTerrain(0, 6, 7, 'shallowWater');
	//map.setTerrain(0, 7, 7, 'shallowWater');
	//map.setTerrain(0, 8, 7, 'deepWater');
	//map.setTerrain(0, 9, 7, 'sand');
	
	/*
	map.setTerrain(0, 7, 8, 'chasm');
	map.setTerrain(0, 7, 8, 'bush');
	map.setTerrain(0, 7, 9, 'grass');
	new items.Helmet('chain choif', map.cells[0][10][18]);
	new items.Weapon('long sword', map.cells[0][11][10]);
	new items.Weapon('warhammer', map.cells[0][15][10]);
	new items.Helmet('plate helmet', map.cells[0][14][13]);
	new items.Legs('leather leggings', map.cells[0][14][23]);
	new items.Legs('plate leggings', map.cells[0][12][16]);
    new items.Boots('chain boots', map.cells[0][17][16]);
	new items.Armour('chain mail', map.cells[0][12][13]);
	new items.Armour('field plate', map.cells[0][22][13]);
	*/
	//new items.Weapon('staff', map.cells[0][10][10]);
	//new items.Weapon('long sword', map.cells[0][13][10]);
	new items.Weapon('warhammer', map.cells[0][12][10]);
	//new items.Weapon('dagger', map.cells[0][11][13]);

	new items.Armour('chain mail', map.cells[0][16][13]);
	new items.Armour('field plate', map.cells[0][21][13]);
	new items.Weapon('dagger', map.cells[0][15][13]);
	new items.Armour('chain mail', map.cells[0][12][15]);
	new items.Scroll('teleportation', map.cells[0][16][15]);
	new items.Potion('speed', map.cells[0][4][15]);
    new items.Misc('torch', map.cells[0][14][15]);

	//new monster.Monster(0, 'rat');
	//new monster.Monster(0, 'wolf');
	//new monster.Monster(0, 'snake');
	//new monster.Monster(0, 'raven');
	new monster.Monster(0, 'kobold');
	player1 = new player.Player();

    new items.Misc('torch', player1);
	new items.Scroll('teleportation', player1);
	new items.Boots('plate boots', player1);
	new items.Armour('chain mail', player1);
	new items.Armour('field plate', player1);
	new items.Legs('plate leggings', player1);
	new items.Helmet('plate helmet', player1);
	new items.Weapon('warhammer', player1);
	new items.Weapon('staff', player1);
	new items.Potion('speed', player1);
	map.cells[0].time.engine.start();
	screen.setWindows();
	
});
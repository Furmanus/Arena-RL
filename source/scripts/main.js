requirejs(['map', 'generator', 'screen', 'noise', 'light', 'player', 'monster', 'items'], function(map, generator, screen, noise, light, player, monster, items){
	
	var player1;
	
	map.initCells(0);
	generator.createArenaLevel(0);
	new items.Weapon('staff', map.cells[0][10][10]);
	new items.Weapon('long sword', map.cells[0][11][10]);
	new items.Weapon('warhammer', map.cells[0][15][10]);
	new items.Weapon('dagger', map.cells[0][10][13]);
	new items.Armour('chain mail', map.cells[0][12][13]);
	new items.Armour('field plate', map.cells[0][22][13]);
	player1 = new player.Player();
	map.cells[0].time.engine.start();
	screen.setWindows();
	
});
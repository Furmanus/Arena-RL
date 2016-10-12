requirejs(['map', 'generator', 'screen', 'noise', 'light', 'player', 'monster'], function(map, generator, screen, noise, light, player, monster){
	
	var player;
	
	map.initCells(0);
	generator.createUniformLevel(0);
	player = new player.Player();
	map.cells[0].time.engine.start();
	screen.setWindows();
	
});
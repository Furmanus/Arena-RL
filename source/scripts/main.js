requirejs(['map', 'generator', 'screen', 'noise', 'light', 'player', 'monster'], function(map, generator, screen, noise, light, player, monster){
	
	var player;
	
	map.initCells(0);
	generator.createArenaLevel(0);
	//map.setTerrain(0,5,5,'wall');
	//map.setTerrain(0,5,6,'wall');
	//map.setTerrain(0,5,7,'wall');
	//map.setTerrain(0,5,8,'wall');
	//map.setTerrain(0,6,5,'wall');
	//map.setTerrain(0,9,10,'sand');
	//map.setTerrain(0,10,10,'sand');
	//map.setTerrain(0,11,10,'sand');
	//map.setTerrain(0,12,10,'sand');
	//map.setTerrain(0,9,11,'sand');
	map.setTerrain(0,21,20,'burntGround');
	map.setTerrain(0,11,10,'bush');
	map.setTerrain(0,12,10,'bush');
	map.setTerrain(0,10,10,'bush');
	map.setTerrain(0,10,11,'bush');
	map.setTerrain(0,10,12,'bush');
	map.setTerrain(0,11,11,'bush');
	map.setTerrain(0,12,12,'bush');
	map.setTerrain(0,12,11,'bush');
	map.setTerrain(0,11,12,'bush');
	new light.IgniteFire(0,10,11);
	new light.LightSource('fire', map.cells[0][14][14]);
	//new monster.Monster(0, 'rat');
	player = new player.Player();
	map.cells[0].time.engine.start();
	screen.setWindows();
	
});
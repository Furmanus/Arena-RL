define(['map', 'generator', 'screen', 'noise', 'light', 'player', 'monster', 'items', 'pathfinding', 'combat'], function(map, generator, screen, noise, light, player, monster, items, pathfinding, combat){
	
	var exports = {};

	function start() {

        //map.initCells(0);
        generator.generateRandomLevel();
		monster.fillLevelWithMonsters(0);
        /*new items.Weapon('long sword', map.cells[0][13][10]);
        new items.Weapon('warhammer', map.cells[0][22][10]);

        new items.Armour('chain mail', map.cells[0][16][13]);
        new items.Weapon('dagger', map.cells[0][15][13]);
        new items.Weapon('dwarven war axe', map.cells[0][5][5]);
        new items.Scroll('armour', map.cells[0][16][15]);
        new items.Potion('rage', map.cells[0][44][15]);
        */
        //new monster.Monster(0, 'kobold');
        exports.player = new player.Player();

        new items.Misc('torch', exports.player);
        new items.Scroll('teleportation', exports.player);
        new items.Boots('plate boots', exports.player);
        new items.Armour('chain mail', exports.player);
        new items.Armour('field plate', exports.player);
        new items.Legs('plate leggings', exports.player);
        new items.Helmet('plate helmet', exports.player);
        new items.Weapon('warhammer', exports.player);
        new items.Weapon('rapier', exports.player);
        new items.Potion('rage', exports.player);
        map.cells[0].time.engine.start();
        screen.setWindows();
    }

    return{

		start: start,
		exports: exports
	}
});

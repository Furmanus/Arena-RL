define(['map', 'generator', 'screen', 'noise', 'light', 'player', 'monster', 'items', 'pathfinding', 'combat', 'evHandlers'], function(map, generator, screen, noise, light, player, monster, items, pathfinding, combat, evHandlers){
	
	var exports = {};

	function start() {

        //map.initCells(0);
        document.getElementById('screen').appendChild(screen.display.getContainer());
        generator.generateRandomLevel();
		monster.fillLevelWithMonsters(0);
		items.fillLevelWithItems(0);

        exports.player = new player.Player();

        var startingWeapon = new items.Weapon('dagger', exports.player);
        var startingArmour = new items.Armour('leather armour', exports.player);

        exports.player.equipment['right hand'] = startingWeapon;
        evHandlers.doEquipmentModifiers(exports.player, startingWeapon, 'apply');
        exports.player.equipment['torso'] = startingArmour;
        evHandlers.doEquipmentModifiers(exports.player, startingArmour, 'apply');
        exports.player.weapon = startingWeapon;

        exports.player.inventory.splice(0,1);
        exports.player.inventory.splice(0,1);

        new items.Potion('healing', exports.player);

        map.cells[0].time.engine.start();
        screen.setWindows();
    }

    function startTest(){

        document.getElementById('screen').appendChild(screen.display.getContainer());
        map.initCells(0);
        map.cells.maxDungeonLevel = 0;
        //generator.generateRandomLevel();
        generator.createArenaLevel(0);
        generator.createForestRoom(0, map.cells[0])
        //monster.fillLevelWithMonsters(0);
        //items.fillLevelWithItems(0);

        //map.setTerrain(0,5,5,'sand');

        //new items.Weapon('warhammer', map.cells[0][22][10]);

        //new items.Armour('chain mail', map.cells[0][16][13]);
        //new items.Weapon('dagger', map.cells[0][15][13]);
        //new items.Weapon('dwarven war axe', map.cells[0][5][5]);
        //new items.Scroll('armour', map.cells[0][16][15]);
        //new items.Potion('rage', map.cells[0][44][15]);
        //new monster.Monster(0, 'minotaur');
        new monster.Monster(0, 'goblin');
        //new monster.Monster(0, 'goblin');
        //new monster.Monster(0, 'kobold');
        new monster.Monster(0, 'kobold');
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
        new items.Potion('healing', exports.player);
        map.cells[0].time.engine.start();
        screen.setWindows();
    }

    return{

		start: start,
        startTest: startTest,
		exports: exports
	}
});

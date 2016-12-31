/**
 * Created by Furman on 22.10.2016.
 */

define(['screen', 'map'], function(screen, map){

    //key is equal to attacker weapon type

    var msgHitWeapon = {

        'piercing': {'player': [' pierce ', ' stab ', ' thrust at '], 'monster': [' pierces ', ' stabs ', ' thrusts at ']},
        'slashing': {'player': [' swing at ', ' slash ', ' cut '], 'monster': [' swings at ', ' slashes ', ' cuts ']},
        'bludgeoning': {'player': [' swing at ', ' maul ', ' hit '], 'monster': [' swings at ', ' mauls ', ' hits ']},
        'unarmed': {'player': [' punch ', ' jab ', ' hit '], 'monster': [' punches ', ' jabs ', ' hits ']},
        'bite': {'player': [' bite '], 'monster': [' bites ']},
        'claws': {'player': [' scratch ', ' cut '], 'monster': [' scratches ', ' cuts ']},
        'hooves': {'player': [' kick '], 'monster': [ ' kicks ']},
        'horns': {'player': [' gore '], 'monster': [ ' gores ']}
    };

    var msgMissWeapon = {

        'piercing': {'player': [' try to pierce ', ' try to stab ', ' attempt to thrust at '], 'monster': [' tries to pierce ', ' tries to stab ', ' attempt to thrust at ']},
        'slashing': {'player': [' try to slash ', ' try to cut '], 'monster': [' attempt to swing at ', ' tries to slash ', ' tries to cut ']},
        'bludgeoning': {'player': [' try to swing at ', ' attempt to maul ', ' try to hit '], 'monster': [' tries to swing at ', ' attempts to maul ', ' tries to hit ']},
        'unarmed': {'player': [' try to swing at ', ' try to jab ', ' try to hit '], 'monster': [' tries to swing at ', ' tries to jab ', ' tries to hit ']},
        'bite': {'player': [' try to bite '], 'monster': [' tries to bite ']},
        'claws': {'player': [' try to scratch ', ' try to cut '], 'monster': [' tries to scratch ', ' tries to cut ']},
        'hooves': {'player': [' try to kick '], 'monster': [ ' tries to kick ']},
        'horns': {'player': [' try to gore ', ' make attempt to gore '], 'monster': [ ' tries to gore ', ' makes attempt to gore ']}
    };

    var msgCriticalHitWeapon = {

        'piercing': {'player': [' puncture ', ' skewer ', ' impale '], 'monster': [' punctures ', ' skewer ', ' impales '], 'result': ['. It was excellent hit!', '. It was a grievous strike! ']},
        'slashing': {'player': [' deeply slash ', ' grievously cut '], 'monster': [' deeply slashes ', ' grievously cuts '], 'result': ['. It was deadly strike!', '. It was excellent hit! ']},
        'bludgeoning': {'player': [' crush ', ' grievously maul '], 'monster': [' crushes ', ' grievously mauls '], 'result': ['. It was excellent strike!', '. It was deadly attack! ']},
        'unarmed': {'player': [' punch ', ' jab ', ' hit '], 'monster': [' punches ', ' jabs ', ' hits '], 'result': ['. It was excellent strike!', '. It was grievous hit! ']},
        'bite': {'player': [' deeply bite ', ' grievously bite'], 'monster': [' deeply bites ', ' grievously bites '], 'result': ['. It was very deep bite!', '. It was very aggressive bite! ']},
        'claws': {'player': [' cut ', ' tear '], 'monster': [' cuts ', ' tears '], 'result': ['. It was a deep cut!', '. It was a critical hit!']},
        'hooves': {'player': [' kick '], 'monster': [' kicks '], 'result': ['. It was strong kick!']},
        'horns': {'player': [' deeply gore ', ' mightily gore '], 'monster': [ ' deeply gores ', ' mightily gores '], 'result': ['. It was critical hit!']}
    }

    var msgCriticalMissWeapon = {

        'player': [' miss your attack by a mile.', ' widely miss your attack.', ' fumble and miss your attack.'],
        'monster': [' misses his attack by a mile.', ' widely misses his attack.', ' fumbles and misses his attack.']
    }

    var msgDeath = {

        'player': ['You die...[Press SPACE]', 'World turns black as your lifeless body falls on ground...[Press SPACE]'],
        'monster': [' dies.', ' drops dead.', '\'s dead body falls on ground.']
    }

    /*
    calculate combat message, third parameter can be 'hit', 'miss', 'critical hit' or 'critical miss'. Fourth parameter is number of damage done (if any - currently parameter is not used)
     */

    function calculateCombatMessage(attacker, defender, result, damage){

        var message,
			attackerPosition = map.cells[attacker.position.level][attacker.position.x][attacker.position.y],
			defenderPosition = map.cells[defender.position.level][defender.position.x][defender.position.y];
		
		if(attackerPosition.isVisible === true && defenderPosition.isVisible === true){
		
			switch(result){

				case 'hit':

					message = screen.capitalizeString(attacker.type.messageDisplay + msgHitWeapon[attacker.weapon.dmgType][attacker.type.type].random() + defender.type.messageDisplay + ' with ' + (attacker.type.type === 'player' ? ' your ' : ' his ') + attacker.weapon.name + '. Attack hits.');
					break;
				case 'miss':

					message = screen.capitalizeString(attacker.type.messageDisplay) + msgMissWeapon[attacker.weapon.dmgType][attacker.type.type].random() + defender.type.messageDisplay + ' with ' + (attacker.type.type === 'player' ? ' your ' : ' his ') + attacker.weapon.name + ', but attack misses.';
					break;
				case 'critical hit':

					message = screen.capitalizeString(attacker.type.messageDisplay) + msgCriticalHitWeapon[attacker.weapon.dmgType][attacker.type.type].random() + defender.type.messageDisplay + ' with ' + (attacker.type.type === 'player' ? ' your ' : ' his ') + attacker.weapon.name + msgCriticalHitWeapon[attacker.weapon.dmgType].result.random();
					break;
				case 'critical miss':

					message = screen.capitalizeString(attacker.type.messageDisplay) + msgMissWeapon[attacker.weapon.dmgType][attacker.type.type].random() + defender.type.messageDisplay + ' with ' + (attacker.type.type === 'player' ? ' your ' : ' his ') + attacker.weapon.name + '. ' + screen.capitalizeString(attacker.type.messageDisplay) + msgCriticalMissWeapon[attacker.type.type].random();
					break;
			}
		}else if(attackerPosition.isVisible === false && defenderPosition.isVisible === true){
			
			message = screen.capitalizeString(defender.type.messageDisplay) + ' is attacked by something.';
		}else if(attackerPosition.isVisible === true && defenderPosition.isVisible === false){
			
			message = screen.capitalizeString(attacker.type.messageDisplay) + ' attacks something.';
		}
		
		if(result === 'dead' && defenderPosition.isVisible === true){
			
			message = (defender.type.type === 'player' ? msgDeath.player.random() : screen.capitalizeString(defender.type.messageDisplay) + msgDeath.monster.random());
		}
		
        return message;
    }

   return{

        calculateCombatMessage: calculateCombatMessage
   }
});
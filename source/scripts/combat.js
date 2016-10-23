define(['screen', 'map', 'combatMessages'], function(screen, map, combatMessages){
	
	var sizeModifiers = {
		
		'huge': -2,
		'large': -1,
		'medium': 0,
		'small': 1, 
		'tiny': 2
	};
	
	function doCombatMelee(attacker, defender){
		
		var attackerScore = roll(1, 20),
			defenderScore,
            defenderPosition = map.cells[defender.position.level][defender.position.x][defender.position.y],
            attackerPosition = map.cells[attacker.position.level][attacker.position.x][attacker.position.y];

        if(defenderPosition.isVisible === true && attackerPosition.isVisible === true) {

            if (attackerScore === 1) {

                if (defenderPosition.isVisible === true && attackerPosition.isVisible === true) {

                    screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'critical miss', 0));
                }
            } else if (attackerScore === 20) {

                var damageDealt = calc(attacker.weapon.damage) + calc(attacker.weapon.damage);

                defender.hp -= damageDealt;
                screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'critical hit', damageDealt));
            } else {

                attackerScore += attacker.stats.baseAttackBonus + Math.floor(attacker.stats.strength / 2 - 5) + sizeModifiers[attacker.size];

                defenderScore = defender.stats.defense + Math.floor(defender.stats.dexterity / 2 - 5) + sizeModifiers[defender.size];

                if (attackerScore >= defenderScore) {

                    var damageDealt = calc(attacker.weapon.damage);

                    defender.hp -= damageDealt;
                    screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'hit', damageDealt));
                } else {

                    screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'miss', 0));
                }
            }
        }else if(defenderPosition.isVisible === false && attackerPosition.isVisible === true){

            screen.placeMessage(screen.capitalizeString(attacker.type.messageDisplay) + ' is attacking something.')
        }else if(defenderPosition.isVisible === true && attackerPosition.isVisible === false){

            screen.placeMessage(screen.capitalizeString(attacker.type.messageDisplay) + ' is attacked by something.')
        }

		if(defender.hp < 0){

            screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'dead', 0), defenderPosition);
            map.cells[defender.position.level].time.scheduler.remove(defender);
            defender.dropCorpse();
            map.cells[defender.position.level][defender.position.x][defender.position.y].entity = null;
            screen.display.clear();
            screen.drawVisibleCells(map.cells[defender.position.level]);
        }
	}
	
	function roll(rollNumber, diceSides){
		
		var result = 0;
		
		for(var i=0; i<rollNumber; i++){
			
			result += ROT.RNG.getUniformInt(1, diceSides);
		}
		
		return Math.ceil(result);
	}

	//function to calculate dmg number from description like '1d8'

	function calc(dice){

		var index = dice.search('d'),
			x = parseInt(dice.substring(0, index)),
			y = parseInt(dice.substring(index + 1));

		return roll(x, y);
	}

	return{
		
		roll: roll,
		doCombatMelee: doCombatMelee
	}
});
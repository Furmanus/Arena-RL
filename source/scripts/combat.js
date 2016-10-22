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
			defenderScore;
		
		if(attackerScore === 1){

            screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'critical miss', 0));
		}else if(attackerScore === 20){

			var damageDealt = calc(attacker.weapon.damage) + calc(attacker.weapon.damage);

			defender.hp -= damageDealt;
			screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'critical hit', damageDealt));
		}else{
			
			attackerScore += attacker.stats.baseAttackBonus + Math.floor(attacker.stats.strength / 2 - 5) + sizeModifiers[attacker.size];
			
			defenderScore = defender.stats.defense + Math.floor(defender.stats.dexterity / 2 - 5) + sizeModifiers[defender.size];
			
			if(attackerScore >= defenderScore){

				var damageDealt = calc(attacker.weapon.damage);

				defender.hp -= damageDealt;
				screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'hit', damageDealt));
			}else{

				screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'miss', 0));
			}
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
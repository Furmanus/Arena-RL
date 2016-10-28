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

        if (attackerScore === 1) {
     		
            screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'critical miss', 0));
        } else if (attackerScore === 20) {

            var damageDealt = calc(attacker.weapon.damage) + calc(attacker.weapon.damage);

            if(damageDealt < 1){

                damageDealt = 1;
            }

            defender.hp -= damageDealt;
					
            screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'critical hit', damageDealt));
        } else {

            attackerScore += calculateBaseAttackBonus(attacker) + sizeModifiers[attacker.size];

            defenderScore = calculateBaseDefenseBonus(defender) + calculateDexterityBonus(defender) + sizeModifiers[defender.size] + calculateEquipmentBonus(defender);

            if (attackerScore >= defenderScore) {

                var damageDealt = calc(attacker.weapon.damage);

                if(damageDealt < 1){

                    damageDealt = 1;
                }

                defender.hp -= damageDealt;
                
				screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'hit', damageDealt));
            } else {
					
				screen.placeMessage(combatMessages.calculateCombatMessage(attacker, defender, 'miss', 0));
            }
        }

		if(defender.hp < 1){

            screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'dead', 0), defenderPosition);
            map.cells[defender.position.level].time.scheduler.remove(defender);
            defender.dropCorpse();

            if(defender.type.type === 'player'){

                map.cells[defender.position.level].time.engine.lock();
                defender.handleEvent = function(){};
            }else{

                map.cells[defender.position.level][defender.position.x][defender.position.y].entity = null;
            }

            screen.display.clear();
            screen.drawVisibleCells(map.cells[defender.position.level]);
        }
		
		function calculateEquipmentBonus(defender){
			
			var armourBonus = 0;
			
			for(var n in defender.equipment){
				
				if(defender.equipment[n].armourBonus !== undefined){
				
					armourBonus += defender.equipment[n].armourBonus;
				}
			}
			
			return armourBonus;
		}

		function calculateDexterityBonus(defender){

            var result;

            if(defender.type.family === 'animal'){

                result = Math.floor(defender.stats.dexterity / 2 - 5);
            }else{

                if(defender.equipment.torso.description === 'empty'){

                    result = Math.floor(defender.stats.dexterity / 2 - 5);
                }else{

                    result = Math.floor(defender.stats.dexterity / 2 - 5);

                    if(result > defender.equipment.torso.maxDexBonus){

                        result = defender.equipment.torso.maxDexBonus;
                    }
                }
            }

            return result;
        }

        function calculateBaseAttackBonus(attacker){

            var result = attacker.stats.baseAttackBonus + Math.floor(attacker.stats.strength / 2 - 5);

            if(attacker.status.fallen.value === 1){

                result -= 4;
            }

            return result;
        }

        function calculateBaseDefenseBonus(defender){

            var result = defender.stats.defense;

            if(defender.status.fallen.value === 1){

                result -= 4;
            }

            return result;
        }
	}
	
	function roll(rollNumber, diceSides){
		
		var result = 0;
		
		for(var i=0; i<rollNumber; i++){
			
			result += ROT.RNG.getUniformInt(1, diceSides);
		}
		
		return Math.ceil(result);
	}

	//function to calculate dmg number from description like 'xdy+z'. Can be read as "roll x y-sided dices and add z to result. x can be float or integer

	function calc(dice) {

        var index = dice.search('d'),
            plusIndex = dice.search('\\+'),
            dotIndex = dice.search('\\.'),
            multiplier,
            x,
            z,
            y;

        if(dotIndex === -1){

            x = parseFloat(dice.substring(0, index));
            multiplier = 1;

            if (plusIndex === -1) {

                y = parseFloat(dice.substring(index + 1));
                return Math.round(multiplier * roll(x, y));
            } else {

                y = parseFloat(dice.substring(index + 1, plusIndex));
                z = parseFloat(dice.substring(plusIndex + 1));

                return Math.round(multiplier * roll(x, y) + z);
            }
        }else{

            x = 1;
            multiplier = parseFloat(dice.substring(0, index));

            if (plusIndex === -1) {

                y = parseFloat(dice.substring(index + 1));
                return Math.round(multiplier * roll(x, y));
            } else {

                y = parseFloat(dice.substring(index + 1, plusIndex));
                z = parseFloat(dice.substring(plusIndex + 1));

                return Math.round(multiplier * roll(x, y) + z);
            }
        }
    }

    //gets max value from dice roll like '1d8+3'
    function calcMax(dice){

        var index = dice.search('d'),
            plusIndex = dice.search('\\+'),
            x = parseFloat(dice.substring(0, index)),
            z,
            y;

        if(plusIndex === -1) {

            y = parseFloat(dice.substring(index + 1));
            return x*y;
        }else{

            y = parseFloat(dice.substring(index + 1, plusIndex));
            z = parseFloat(dice.substring(plusIndex + 1));

            return (x*y)+z;
        }
	}

	return{
		
		roll: roll,
		doCombatMelee: doCombatMelee,
		calc: calc,
        calcMax: calcMax
	}
});
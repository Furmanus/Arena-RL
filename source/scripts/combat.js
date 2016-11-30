define(['screen', 'map', 'combatMessages', 'status'], function(screen, map, combatMessages, status){

    /*
    object containing function triggered when critical miss in combat happens
     */
    var criticalMissEffect = {

        'dropWeapon': function(entity){

            entity.dropWeapon()
        },

        'prone': function(entity){
            //we check if entity have legs and isn't prone already
            if(status.checkIfHaveBodyPart(entity, 'legs') === true && entity.status.prone.value === 0) {

                //we make dexterity roll, if it fails, entity falls on ground
                if (Math.floor(entity.stats.dexterity / 2 - 5) + roll(1, 20) < 15) {

                    screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' stagger and fail to maintain your balance.' : ' staggers and fails to maintain its balance.'), map.cells[entity.position.level][entity.position.x][entity.position.y]);
                    entity.status.prone.initEffect(entity);
                } else {

                    screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' stagger but manage to maintain your balance.' : ' staggers but manages to maintain its balance.'), map.cells[entity.position.level][entity.position.x][entity.position.y]);
                }
            }
        }
    };

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
     		
            screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'critical miss', 0), attackerPosition);
            criticalMissEffect[Object.keys(criticalMissEffect).random()](attacker);
        } else if (attackerScore === 20) {

            var damageDealt = calc(attacker.weapon.damage) + calc(attacker.weapon.damage);

            if(damageDealt < 1){

                damageDealt = 1;
            }

            defender.hp -= damageDealt;
            screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'critical hit', damageDealt), attackerPosition);

            if(attacker.weapon.criticalHit[0] !== null && defender.hp > 0){

                status.entityStatus[attacker.weapon.criticalHit.random()].initEffect(defender);
            }

        } else {

            attackerScore += calculateBaseAttackBonus(attacker) + sizeModifiers[attacker.size];

            defenderScore = calculateBaseDefenseBonus(defender) + calculateDexterityBonus(defender) + sizeModifiers[defender.size] + calculateEquipmentBonus(defender);

            if (attackerScore >= defenderScore) {

                var damageDealt = calc(attacker.weapon.damage);

                if(damageDealt < 1){

                    damageDealt = 1;
                }

                defender.hp -= damageDealt;
                
				screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'hit', damageDealt), defenderPosition);
            } else {
					
				screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'miss', 0), defenderPosition);
            }
        }

		if(defender.hp < 1){

            screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'dead', 0), defenderPosition);
            map.cells[defender.position.level].time.scheduler.remove(defender);
            defender.dropCorpse();

            if(defender.type.type === 'player'){

                defender.updateScreenStats();
                map.cells[defender.position.level].time.engine.lock();
                defender.handleEvent = function(){};
            }else{

                map.cells[defender.position.level][defender.position.x][defender.position.y].entity = null;
            }

            screen.display.clear();
            screen.drawVisibleCells(map.cells[defender.position.level]);
        }else if(defender.hp <= Math.floor(0.25 * defender.maxHp) && defender.type.type !== 'player' && defender.abilities.fearless === false){

		    var action = ROT.RNG.getUniformInt(1, 5);
		    //monster panics
		    if(action === 1 || action === 2) {

                defender.retreatEntity = attacker;

                if(defender.retreatEntity === attacker && defender.status.afraid.value === 0){

                    screen.placeVisibleMessage(screen.capitalizeString(defender.type.messageDisplay) + ' suddenly seems to panic!', map.cells[defender.position.level][defender.position.x][defender.position.y]);
                    defender.status.afraid.value = 1;
                }
            }
        }

        defender.updateScreenStats();
		
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

            if(result > 0 && defender.status.stunned.value === 1){

                result = 0;
            }

            return result;
        }

        function calculateBaseAttackBonus(attacker){

            var result = attacker.stats.baseAttackBonus + Math.floor(attacker.stats.strength / 2 - 5);

            if(attacker.status.prone.value === 1){

                result -= 4;
            }

            return result;
        }

        function calculateBaseDefenseBonus(defender){

            var result = defender.stats.defense;

            if(defender.status.prone.value === 1){

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
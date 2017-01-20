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
	
	function doCombatMelee(attacker, defender, type){

		var attackerScore = roll(1, 20),
			defenderScore,
            defenderPosition = map.cells[defender.position.level][defender.position.x][defender.position.y],
            attackerPosition = map.cells[attacker.position.level][attacker.position.x][attacker.position.y],
            messageColor,
            distance = screen.getDistance(attacker.position.x, attacker.position.y, defender.position.x, defender.position.y),
            result;

		if(defender.type.type !== 'player' && defender.checkIfHostile(attacker) !== true){

		    defender.hostileList.entity.push(attacker);
        }

        if (attackerScore === 1) {
     		
            screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'critical miss', 0, type), attackerPosition);
            criticalMissEffect[Object.keys(criticalMissEffect).random()](attacker);

            result = 'miss';
        } else if (isHitCritical(attackerScore, attacker.weapon) === true) {

            var damageDealt = 0;

            for(var i=0; i<attacker.weapon.criticalMultiplier; i++){

                damageDealt += calc(attacker.weapon.damage);
            }

            if(damageDealt < 1){

                damageDealt = 1;
            }

            defender.hp -= damageDealt;
            if(defender.type.type !== 'player') {

                defender.currentGoal.x = attacker.position.x; //in case attacker is outside defender's fov, defender will look after him
                defender.currentGoal.y = attacker.position.y;
                defender.lookingForHostile = true;
            }
            messageColor = (defender.type.type === 'player') ? 'purple' : null;
            screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'critical hit', damageDealt, type), attackerPosition, messageColor);

            if(attacker.weapon.criticalHit[0] !== null && defender.hp > 0){

                status.entityStatus[attacker.weapon.criticalHit.random()].initEffect(defender);
            }

            result = 'hit'

        } else {

            attackerScore += calculateBaseAttackBonus(attacker, type, distance) + sizeModifiers[attacker.size];

            defenderScore = calculateBaseDefenseBonus(defender, type, distance) + calculateDexterityBonus(defender) + sizeModifiers[defender.size] + calculateEquipmentBonus(defender);

            if (attackerScore >= defenderScore) {

                var damageDealt = calc(attacker.weapon.damage);

                if(damageDealt < 1){

                    damageDealt = 1;
                }

                defender.hp -= damageDealt;

                messageColor = (defender.type.type === 'player') ? 'purple' : null;

				screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'hit', damageDealt, type), defenderPosition, messageColor);

				result = 'hit';
            } else {
					
				screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'miss', 0, type), defenderPosition);
				result = 'miss';
            }
        }

		if(defender.hp < 1){

            screen.placeVisibleMessage(combatMessages.calculateCombatMessage(attacker, defender, 'dead', 0, type), defenderPosition);
            map.cells[defender.position.level].time.scheduler.remove(defender);
            defender.dropCorpse();
            attacker.experience += defender.xp;

            /*
             we set result variable to 'miss', just to pass that value to endRangedAttack function (in case of ranged attack), so arrow would be added to floor inventory
             */

            result = 'miss';

            if(defender.type.type === 'player'){

                var evHandlers = require('evHandlers');

                defender.updateScreenStats();
                map.cells[defender.position.level].time.engine.lock();
                defender.deathCause.source = attacker;

                defender.handleEvent = function(ev){

                    if(ev.which === 32){

                        evHandlers.generateDeathScreen(this);
                    }
                };
            }else{

                map.cells[defender.position.level][defender.position.x][defender.position.y].entity = null;
            }

            if(attacker.type.type === 'player') {

                attacker.killCount++;
            }

            if(defender.type.type !== 'player') {

                screen.display.clear();
                screen.drawVisibleCells(map.cells[defender.position.level]);
            }
        }else if(defender.hp <= Math.floor(0.1 * defender.maxHp) && defender.type.type !== 'player' && defender.abilities.fearless === false){

		    var action = ROT.RNG.getUniformInt(1, 5);
		    //monster panics
		    if(action === 1 || action === 2) {

                defender.retreatEntity = attacker;

                /*
                in case if panic source is out of monster FOV (monster was wounded by ranged attack), we set his lastSeenTreatPosition (because in creatai.js module ai scans for panic source in FOV and throws error if panic source is not found)
                 */
                defender.lastSeenTreatPosition.x = attacker.position.x;
                defender.lastSeenTreatPosition.y = attacker.position.y;

                if(defender.retreatEntity === attacker && defender.status.afraid.value === 0){

                    screen.placeVisibleMessage(screen.capitalizeString(defender.type.messageDisplay) + ' suddenly seems to panic!', map.cells[defender.position.level][defender.position.x][defender.position.y]);
                    defender.status.afraid.value = 1;
                }
            }
        }

        defender.updateScreenStats();

        return result;
	}

	function doRangedAttack(attacker, lineOfShot, eventHandler, escapeEventHandler){

        var level = attacker.position.level,
            items = require('items');

        analysePath(1);

        function analysePath(cell){

            var x = lineOfShot[cell].x,
                y = lineOfShot[cell].y, //we start from second element of array, because 0 element is attacker coordinates
                screenX = screen.convertCoordinate(x, 'width'),
                screenY = screen.convertCoordinate(y, 'height');

            screen.display.draw(screenX, screenY, attacker.equipment['left hand'].display, attacker.equipment['left hand'].fgColor);

            if(map.cells[level][x][y].entity !== null){

                var result = doCombatMelee(attacker, map.cells[level][x][y].entity, 'ranged');

                endRangedAttack(result);
            }else if(cell !== lineOfShot.length - 1){

                setTimeout(function(){screen.display.draw(screenX, screenY, getDisplayChar(level, x, y), getFgColor(level, x, y));}, 25);
                setTimeout(function(){analysePath(++cell);}, 50);
            }else if(cell === lineOfShot.length - 1 && map.cells[level][x][y].entity === null){

                endRangedAttack('miss');
            }

            //type is either string 'hit' or 'miss'. In former case arrow lands on floor, in latter in target inventory
            function endRangedAttack(type) {

                if(Math.random() < attacker.equipment['left hand'].hardiness){

                    screen.placeVisibleMessage(screen.capitalizeString(attacker.equipment['left hand'].name) + ' breaks!', map.cells[level][x][y]);

                    if (attacker.equipment['left hand'].quantity === 1){

                        attacker.equipment['left hand'] = {description: 'empty'};
                    }else{

                        attacker.equipment['left hand'].quantity--;
                    }
                }else {

                    var target = (type === 'miss' ? map.cells[level][x][y] : map.cells[level][x][y].entity),
                        index = checkIfInventoryHasItem(attacker.equipment['left hand'], target);

                    if (index === null) {

                        if (attacker.equipment['left hand'].quantity === 1) {

                            target.inventory.push(attacker.equipment['left hand']);
                            attacker.equipment['left hand'].owner = target;
                            attacker.equipment['left hand'] = {description: 'empty'};
                        } else if (attacker.equipment['left hand'].quantity > 1) {

                            new items.Ammo(attacker.equipment['left hand'].name, target, 1);
                            attacker.equipment['left hand'].quantity--;
                        }
                    } else {

                        if (attacker.equipment['left hand'].quantity === 1) {

                            target.inventory[index].quantity++;
                            attacker.equipment['left hand'] = {description: 'empty'};
                        } else if (attacker.equipment['left hand'].quantity > 1) {

                            target.inventory[index].quantity++;
                            attacker.equipment['left hand'].quantity--;
                        }
                    }
                }

                if (attacker.type.type === 'player') {

                    escapeEventHandler(attacker);
                    map.cells[level].time.engine.unlock();
                    attacker.eventHandler = eventHandler;
                }

                screen.display.clear();
                screen.drawVisibleCells(map.cells[attacker.position.level]);
            }

            function checkIfInventoryHasItem(item, object){

                for(var i=0; i<object.inventory.length; i++){

                    if(item.name === object.inventory[i].name){

                        return i;
                    }
                }

                return null;
            }
        }
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

        if(result > 0 && defender.status.stunned.value === 1){

            result = 0;
        }

        return result;
    }

    function calculateBaseAttackBonus(attacker, type, distance){

        var rangePenalty = (type === 'ranged' && distance > attacker.weapon.range) ? Math.floor(attacker.weapon.range - distance) : 0,
            result = attacker.stats.baseAttackBonus + Math.floor((type === 'melee' ? attacker.stats.strength : attacker.stats.dexterity) / 2 - 5) + rangePenalty;

        if(attacker.status.prone.value === 1){

            result -= 4;
        }

        return result;
    }

    function calculateBaseDefenseBonus(defender, type, distance){

        var result = defender.stats.defense;

        if(defender.status.prone.value === 1){

            result -= 4;
        }

        return result;
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

	//function to verify whether hit is critical
	function isHitCritical(roll, weapon){

        for(var i=0; i<weapon.critical.length; i++){

            if(roll === weapon.critical[i]){

                return true;
            }
        }
    }

    function getDisplayChar(level, x, y){

	    var examinedCell = map.cells[level][x][y];

	    if(examinedCell.entity !== null){

	        return examinedCell.entity.display;
        }else if(examinedCell.inventory.length !== 0){

	        return examinedCell.inventory[0].display;
        }else{

            return examinedCell.type.display;
        }
    }

    function getFgColor(level, x, y){

        var examinedCell = map.cells[level][x][y];

        if(examinedCell.entity !== null){

            return examinedCell.entity.fgColor;
        }else if(examinedCell.inventory.length !== 0){

            return examinedCell.inventory[0].fgColor;
        }else{

            return examinedCell.type.fgColor;
        }
    }

	return{
		
		roll: roll,
		doCombatMelee: doCombatMelee,
		calc: calc,
        calcMax: calcMax,
        doRangedAttack: doRangedAttack,
        getDisplayChar: getDisplayChar,
        getFgColor: getFgColor
	}
});
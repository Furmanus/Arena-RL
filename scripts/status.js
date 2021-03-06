/**
 * Created by Furman on 27.10.2016.
 */

define(['screen', 'map', 'evHandlers'], function(screen, map, evHandlers){

    entityStatus = {

        'prone': {activatedEveryTurn: false, activateEffect: proneActivate, removeEffect: proneRemove, initEffect: proneInit},
        'bleeding': {activatedEveryTurn: true, activateEffect: bleedActivate, removeEffect: bleedRemove, initEffect: bleedingInit},
        'stunned': {activatedEveryTurn: true, activateEffect: stunActivate, removeEffect: stunRemove, initEffect: stunInit},
        'poisoned': {activatedEveryTurn: true, activateEffect: poisonActivate, removeEffect: poisonRemove, initEffect: poisonInit},
        'paralyzed': {activatedEveryTurn: true, activateEffect: paralyzeActivate, removeEffect: paralyzeRemove, initEffect: paralyzeInit},
        'berserk': {activatedEveryTurn: true, activateEffect: berserkActivate, removeEffect: berserkRemove, initEffect: berserkInit}
    }

    function proneInit(entity){

        if(checkIfHaveBodyPart(entity, 'legs')) {

            var modifier;

            entity.status.prone.value = 1;

            screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' fall' : ' falls') + ' on ground.', map.cells[entity.position.level][entity.position.x][entity.position.y], 'red');

            if (entity.stats.speed - 10 < 1) {

                modifier = entity.stats.speed - 1;
                entity.status.prone.modifiers.speed = -modifier;
                entity.stats.speed -= modifier;

                entity.updateScreenStats();
            } else {

                modifier = 10;
                entity.status.prone.modifiers.speed = -modifier;
                entity.stats.speed -= modifier;

                entity.updateScreenStats();
            }
        }
    }

    function proneActivate(entity){


    }

    function proneRemove(entity){

        entity.stats.speed -= entity.status.prone.modifiers.speed;
        entity.status.prone.modifiers = {};
        entity.status.prone.value = 0;

        entity.updateScreenStats();
    }

    /*
    function activated every turn if entity is bleeding (bleeding status value is equal to 1. Then we make check for constitution stat. If it's passed, bleeding value is set to 0, otherwise we roll and apply damage
     */
    function bleedActivate(entity){

        var position = map.cells[entity.position.level][entity.position.x][entity.position.y];

        if(entity.status.bleeding.counter === 0){

            screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' stop' : ' stops') + ' bleeding.', position);
            entity.status.bleeding.value = 0;
        }else{

            var damageDealt = calc('1d1');

            screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' lose' : ' loses') + ' blood!', position);
            entity.receiveDamage(damageDealt, {type: {type: 'bleed to death'}});
            entity.status.bleeding.counter--;
        }
    }

    function bleedingInit(entity){

        if(entity.abilities.bloodless !== true) {

            var damageDealt = calc('1d1'),
                position = map.cells[entity.position.level][entity.position.x][entity.position.y];

            entity.status.bleeding.value = 1;
            entity.status.bleeding.counter = 1;
            screen.placeVisibleMessage('Deep wound is open in ' + (entity.type.type === 'player' ? 'your ' : (entity.type.messageDisplay + 's ')) + 'body.', position, 'red');
            //entity.receiveDamage(damageDealt);

            for (var i = 0; i < 6; i++) {

                if (Math.floor((entity.stats.constitution / 2) - 5) + roll(1, 20) >= 15) {

                    entity.status.bleeding.counter++;
                }
            }
        }
    }

    function bleedRemove(entity){


    }

    function poisonInit(entity){

        var position = map.cells[entity.position.level][entity.position.x][entity.position.y];

        entity.status.poisoned.value = 1;
        entity.status.poisoned.counter = 1;
        screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' are poisoned!' : ' is poisoned!'), position, 'red');

        for(var i=0; i<6; i++){

            if(Math.floor((entity.stats.constitution / 2) - 5) + roll(1, 20) >= 15){

                entity.status.poisoned.counter++;
            }
        }
    }

    function poisonActivate(entity){

        var position = map.cells[entity.position.level][entity.position.x][entity.position.y];

        if(entity.status.poisoned.counter === 0){

            screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' are' : ' is') + ' no longer poisoned.', position);
            entity.status.poisoned.value = 0;
        }else{

            var damageDealt = calc('1d1');

            screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' cringe' : ' cringes') + ' in pain.', position);
            entity.receiveDamage(damageDealt, {type: {type: 'died due to poison'}});
            entity.status.poisoned.counter--;
        }
    }

    function poisonRemove(entity){


    }

    function stunInit(entity){

        var position = map.cells[entity.position.level][entity.position.x][entity.position.y];

        //make entity stunned status active, and set counter to 1 (so entity will be stunned for at least 1 turn)
        entity.status.stunned.value = 1;
        entity.status.stunned.counter = 1;
        screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' are stunned!' : ' is stunned!'), position, 'red');
        entity.stats.defense -= 2;

        if(entity.type.family === 'player') {

            entity.dropWeapon();
        }

        for(var i=0; i<6; i++){
            //make seven constitution stat checks - for each failed check we increase number of turns for which entity will be stunned
            if(Math.floor((entity.stats.constitution / 2) - 5) + roll(1, 20) < 15){

                entity.status.stunned.counter++
            }
        }

        if(entity.type.type === 'player'){

            entity.handleEvent = evHandlers.stunHandleEvent.bind(entity);
        }
    }

    function stunActivate(entity){

        var position = map.cells[entity.position.level][entity.position.x][entity.position.y];

        if(entity.status.stunned.counter === 0){

            entity.status.stunned.removeEffect(entity);

            if(entity.type.type === 'player'){

                entity.handleEvent = evHandlers.defaultEventHandler.bind(entity);
            }
        }

        entity.status.stunned.counter--;
    }

    function stunRemove(entity){

        var position = map.cells[entity.position.level][entity.position.x][entity.position.y];

        entity.status.stunned.value = 0;
        screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' are no longer stunned.' : ' is no longer stunned.'), position);
        entity.stats.defense += 2;
    }

    function paralyzeActivate(entity){

        entity.status.paralyzed.counter--;

        if(entity.status.paralyzed.counter === 0){

            entity.status.paralyzed.removeEffect(entity);
        }
    }

    function paralyzeInit(entity){

        var defense = 5 - entity.stats.defense,
            dexterity = 1 - entity.stats.dexterity,
            strength = 1 - entity.stats.strength,
            displayText = screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' are paralyzed!' : ' is paralyzed!');

        entity.status.paralyzed.modifiers.defense = defense;
        entity.status.paralyzed.modifiers.dexterity = dexterity;
        entity.status.paralyzed.modifiers.strength = strength;

        for(var n in entity.status.paralyzed.modifiers){

            entity.stats[n] += entity.status.paralyzed.modifiers[n];
        }

        entity.status.paralyzed.value = 1;
        entity.status.paralyzed.counter = ROT.RNG.getUniformInt(3, 5);
        screen.placeVisibleMessage(displayText, map.cells[entity.position.level][entity.position.x][entity.position.y], 'red');

    }

    function paralyzeRemove(entity){

        entity.status.paralyzed.value = 0;

        for(var n in entity.status.paralyzed.modifiers){

            entity.stats[n] -= entity.status.paralyzed.modifiers[n];
        }

        entity.status.paralyzed.modifiers = {};

        screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' are no longer paralyzed.' : ' is no longer paralyzed.'), map.cells[entity.position.level][entity.position.x][entity.position.y]);
    }

    function berserkInit(entity){

        var modifiedSpeed = Math.floor(entity.stats.speed * 0.5),
            strengthModifier = 5,
            baseAttackBonusModifier = 6,
            defenseModifier = -5;

        entity.status.berserk.modifiers.defense = defenseModifier;
        entity.status.berserk.modifiers.speed = modifiedSpeed;
        entity.status.berserk.modifiers.baseAttackBonus = baseAttackBonusModifier;
        entity.status.berserk.modifiers.strength = strengthModifier;

        for(var n in entity.status.berserk.modifiers){

            entity.stats[n] += entity.status.berserk.modifiers[n];
        }

        entity.status.berserk.value = 1;
        entity.status.berserk.counter = ROT.RNG.getUniformInt(14, 20);

        useText = screen.capitalizeString((screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' go berserk!' : ' goes berserk!'));

        screen.placeVisibleMessage(useText, map.cells[entity.position.level][entity.position.x][entity.position.y], 'red');
    }

    function berserkActivate(entity){

        entity.status.berserk.counter--;

        if(entity.status.berserk.counter === 0){

            entity.status.berserk.removeEffect(entity);
        }
    }

    function berserkRemove(entity){

        entity.status.berserk.value = 0;

        for(var n in entity.status.berserk.modifiers){

            entity.stats[n] -= entity.status.berserk.modifiers[n];
        }

        entity.status.berserk.modifiers = {};

        screen.placeVisibleMessage(screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' calm down.' : ' calms down.'), map.cells[entity.position.level][entity.position.x][entity.position.y]);
    }

    function roll(rollNumber, diceSides){

        var result = 0;

        for(var i=0; i<rollNumber; i++){

            result += ROT.RNG.getUniformInt(1, diceSides);
        }

        return Math.ceil(result);
    }

    //function to calculate dmg number from string like 'xdy+z'. Can be read as "roll x y-sided dices and add z to result. x can be float or integer

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


    function checkIfHaveBodyPart(entity, bodyPart){

        for(var n in entity.equipment){

            if(n === bodyPart){

                return true;
            }
        }
    }

   return {

       entityStatus: entityStatus,
       checkIfHaveBodyPart: checkIfHaveBodyPart
   }
});

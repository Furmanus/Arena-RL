/**
 * Created by Furman on 27.10.2016.
 */

define(['screen', 'map'], function(screen, map){

    entityStatus = {

        'prone': {activatedEveryTurn: false, activateEffect: proneActivate, removeEffect: proneRemove},
        'bleeding': {activatedEveryTurn: true, activateEffect: bleedActivate, removeEffect: bleedRemove}
    }

    function proneActivate(entity){

        if(checkIfHaveBodyPart(entity, 'legs')) {

            var modifier;

            entity.status.prone.value = 1;

            screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' fall' : ' falls') + ' on ground.', map.cells[entity.position.level][entity.position.x][entity.position.y]);

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

        entity.status.bleeding.value = 1;

        if(Math.floor((entity.stats.constitution / 2) - 5) + roll(1, 20) >= 15){

            entity.status.bleeding.value = 0;
        }else{

            var damageDealt = calc('1d1');

            screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' lose' : ' loses') + ' blood!', position);
            entity.receiveDamage(damageDealt);
        }
    }

    function bleedRemove(entity){


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


    function checkIfHaveBodyPart(entity, bodyPart){

        for(var n in entity.equipment){

            if(n === bodyPart){

                return true;
            }
        }
    }

   return {

       entityStatus: entityStatus
   }
});

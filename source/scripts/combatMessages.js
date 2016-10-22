/**
 * Created by Furman on 22.10.2016.
 */

define(['screen'], function(screen){

    //key is equal to attacker weapon type

    var msgHitWeapon = {

        'piercing': {'player': [' pierce ', ' stab ', ' thrust at'], 'monster': [' pierces ', ' stabs ', ' thrusts at']},
        'slashing': {'player': [' swing at ', ' slash ', ' cut '], 'monster': [' swings at ', ' slashes ', ' cuts ']},
        'bludgeoning': {'player': [' swing at ', ' maul '], 'monster': [' swings at ', ' mauls ']},
        'unarmed': {'player': [' punch ', ' jab ', ' hit '], 'monster': [' punches ', ' jabs ', ' hits ']},
        'bite': {'player': [' bite '], 'monster': [' bites ']}
    };

    var msgMissWeapon = {

        'piercing': {'player': [' try to pierce ', ' try to stab ', ' attempt to thrust at'], 'monster': [' tries to pierce ', ' tries to stab ', ' attempt to thrust at']},
        'slashing': {'player': [' try to slash ', ' try to cut '], 'monster': [' attempt to swing at ', ' tries to slash ', ' tries to cut ']},
        'bludgeoning': {'player': [' try to swing at ', ' attempt to maul '], 'monster': [' tries to swing at ', ' attempts to maul ']},
        'unarmed': {'player': [' try to swing at ', ' try to jab ', ' try to hit '], 'monster': [' tries to swing at ', ' tries to jab ', ' tries to hit ']},
        'bite': {'player': [' try to bite '], 'monster': [' tries to bite ']}
    };

    var msgCriticalHitWeapon = {

        'piercing': {'player': [' puncture ', ' skewer '], 'monster': [' punctures ', ' skewer '], 'result': ['. It was excellent thrust!', '. It was grievous strike! ']},
        'slashing': {'player': [' deeply slash ', ' grievously cut '], 'monster': [' deeply slashes ', ' grievously cuts '], 'result': ['. It was deadly strike!', '. It was excellent hit! ']},
        'bludgeoning': {'player': [' crush ', ' grievously maul '], 'monster': [' crushes ', ' grievously mauls '], 'result': ['. It was excellent strike!', '. It was deadly attack! ']},
        'unarmed': {'player': [' punch ', ' jab ', ' hit '], 'monster': [' punches ', ' jabs ', ' hits '], 'result': ['. It was excellent strike!', '. It was grievous hit! ']},
        'bite': {'player': [' deeply bite ', ' grievously bite'], 'monster': [' deeply bites ', ' grievously bites '], 'result': ['. It was very deep bite!', '. It was very aggressive bite! ']}
    }

    var msgCriticalMissWeapon = {

        'player': [' miss your attack by a mile.', ' widely miss your attack.'],
        'monster': [' misses his attack by a mile.', ' widely misses his attack.']
    }

    /*
    calculate combat message, third parameter can be 'hit', 'miss', 'critical hit' or 'critical miss'. Fourth parameter is number of damage done (if any)
     */

    function calculateCombatMessage(attacker, defender, result, damage){

        var message;

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

        return message;
    }

   return{

        calculateCombatMessage: calculateCombatMessage
   }
});
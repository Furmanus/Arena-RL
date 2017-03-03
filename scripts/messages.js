/**
 * Created by Furman on 02.12.2016.
 */

define([], function(){

    //messages displayed when player gains points in certain stat
    var statGainMessages = {

        'strength': 'You feel stronger!',
        'dexterity': 'Your movements are getting swifter!',
        'constitution': 'You feel tougher!',
        'intelligence': 'You feel smarter!',
        'wisdom': 'You feel wiser!',
        'charisma': 'You feel more charismatic!'
    }

    var statGainMonsterMessages = {

        'strength': ' looks stronger!',
        'dexterity': ' looks more agile!',
        'constitution': ' looks tougher!',
        'intelligence': ' seems to be smarter!',
        'wisdom': ' seems to be wiser!',
        'charisma': ' feels more charismatic!'
    }

    return{

        statGainMessages: statGainMessages,
        statGainMonsterMessages: statGainMonsterMessages
    }
});

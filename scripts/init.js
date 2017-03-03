/**
 * Created by Furman on 08.12.2016.
 */

requirejs(['main', 'player', 'screen'], function(main, player, screen){

   //main.start();
   //main.startTest();

    function setStartScreen(){

        var selectedClass,
            selectedDisplay,
            selectedName;

        document.getElementById('domName').addEventListener('change', nameChange, true);
        document.getElementById('domClass').addEventListener('change', changeClass, true);
        document.getElementById('domDisplay').addEventListener('change', changeDisplay, true);

        document.getElementById('domStart').addEventListener('click', startGame, true);

        function startGame(){

            selectedClass = document.getElementById('domClass').value;
            selectedDisplay = document.getElementById('domDisplay').value;

            player.playerOptions.name = selectedName;
            player.playerOptions.class = selectedClass;

            if(player.playerOptions.name && validateName() === true) {

                clearBody();

                createGameScreen();

                document.body.style.display = 'flex';
                main.start();
                //main.startTest();
            }else if(!(player.playerOptions.name) || validateName() !== true){

                document.getElementById('nameWarning').innerHTML = 'Please enter your name (name has to be shorter than 9 signs)!';
            }
        }

        function nameChange(){

            selectedName = document.getElementById('domName').value;
        }

        function changeClass(){

            selectedClass = document.getElementById('domClass').value;
        }

        function changeDisplay(){

            screen.options.layout = document.getElementById('domDisplay').value;
        }

        function validateName(){

            if(player.playerOptions.name.length > 0 && player.playerOptions.name.length <= 9){

                for(var i=0; i<player.playerOptions.name.length; i++){

                    if(player.playerOptions.name[i] !== ' '){

                        return true;
                    }else if(i === player.playerOptions.name.length - 1 && player.playerOptions.name[i] === ' '){

                        return false;
                    }
                }
            }else if(player.playerOptions.name.length > 9){

                return false;
            }

            return false;
        }

        function createGameScreen(){

            var divPlayer = document.createElement('div');
            divPlayer.id = 'player';
            document.body.appendChild(divPlayer);

            var divScreen = document.createElement('div');
            divScreen.id = 'screen';
            document.body.appendChild(divScreen);

            var divMessages = document.createElement('div');
            divMessages.id = 'messages';
            document.body.appendChild(divMessages);
            var ulMessages = document.createElement('ul');
            ulMessages.id = 'messageBox';
            divMessages.appendChild(ulMessages);

            var playerInfo = document.createElement('p');
            divPlayer.appendChild(playerInfo);
            var playerName = document.createElement('span');
            playerName.id = 'domPlayerName';
            var playerLevel = document.createElement('span');
            playerLevel.id = 'domPlayerLevel';
            var playerClass = document.createElement('span');
            playerClass.id = 'domPlayerClass';

            playerInfo.appendChild(playerName);
            playerInfo.innerHTML += ' level ';
            playerInfo.appendChild(playerLevel);
            playerInfo.innerHTML += ' ';
            playerInfo.appendChild(playerClass);

            var hpInfo = document.createElement('p');
            hpInfo.innerHTML = 'Hp: ';
            divPlayer.appendChild(hpInfo);
            var hp = document.createElement('span');
            hp.id = 'domHp';
            hpInfo.appendChild(hp);
            hpInfo.innerHTML += '/';
            var maxHp = document.createElement('span');
            maxHp.id = 'domMaxHp';
            hpInfo.appendChild(maxHp);

            var strengthInfo = document.createElement('p');
            divPlayer.appendChild(strengthInfo);
            strengthInfo.innerHTML = 'Strength: ';
            var domStr = document.createElement('span');
            domStr.id = 'domStrength';
            strengthInfo.appendChild(domStr);

            var dexterityInfo = document.createElement('p');
            divPlayer.appendChild(dexterityInfo);
            dexterityInfo.innerHTML = 'Dexterity: ';
            var domDex = document.createElement('span');
            domDex.id = 'domDexterity';
            dexterityInfo.appendChild(domDex);

            var constitutionInfo = document.createElement('p');
            divPlayer.appendChild(constitutionInfo);
            constitutionInfo.innerHTML = 'Constitution: ';
            var domCon = document.createElement('span');
            domCon.id = 'domConstitution';
            constitutionInfo.appendChild(domCon);

            var intelligenceInfo = document.createElement('p');
            divPlayer.appendChild(intelligenceInfo);
            intelligenceInfo.innerHTML = 'Intelligence: ';
            var domInt = document.createElement('span');
            domInt.id = 'domIntelligence';
            intelligenceInfo.appendChild(domInt);

            var wisdomInfo = document.createElement('p');
            divPlayer.appendChild(wisdomInfo);
            wisdomInfo.innerHTML = 'Wisdom: ';
            var domWis = document.createElement('span');
            domWis.id = 'domWisdom';
            wisdomInfo.appendChild(domWis);

            var charismaInfo = document.createElement('p');
            divPlayer.appendChild(charismaInfo);
            charismaInfo.innerHTML = 'Charisma: ';
            var domCha = document.createElement('span');
            domCha.id = 'domCharisma';
            charismaInfo.appendChild(domCha);

            var speedInfo = document.createElement('p');
            divPlayer.appendChild(speedInfo);
            speedInfo.innerHTML = 'Speed: ';
            var domSpe = document.createElement('span');
            domSpe.id = 'domSpeed';
            speedInfo.appendChild(domSpe);

            var levelInfo = document.createElement('p');
            divPlayer.appendChild(levelInfo);
            levelInfo.innerHTML = 'Dungeon level: ';
            var domLev = document.createElement('span');
            domLev.id = 'domDungeonLevel';
            levelInfo.appendChild(domLev);

            var statusRow1 = document.createElement('p');
            statusRow1.setAttribute('class', 'status');
            divPlayer.appendChild(statusRow1);
            var prone = document.createElement('span');
            prone.id = 'prone';
            statusRow1.appendChild(prone);
            statusRow1.innerHTML += ' ';
            var bleeding = document.createElement('span');
            bleeding.id = 'bleeding';
            statusRow1.appendChild(bleeding);
            statusRow1.innerHTML += ' ';
            var stunned = document.createElement('span');
            stunned.id = 'stunned';
            statusRow1.appendChild(stunned);

            var statusRow2 = document.createElement('p');
            statusRow2.setAttribute('class', 'status');
            divPlayer.appendChild(statusRow2);
            var poisoned = document.createElement('span');
            poisoned.id = 'poisoned';
            statusRow2.appendChild(poisoned);
            statusRow2.innerHTML += ' ';
            var paralyzed = document.createElement('span');
            paralyzed.id = 'paralyzed';
            statusRow2.appendChild(paralyzed);
            statusRow2.innerHTML += ' ';
            var berserk = document.createElement('span');
            berserk.id = 'berserk';
            statusRow2.appendChild(berserk);

            var domInfo = document.createElement('p');
            divPlayer.appendChild(domInfo);
            domInfo.id = 'info';
            domInfo.innerHTML = 'Press "?" to display game help.';
        }
    }

    function clearBody(){

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    }

    setStartScreen();
});
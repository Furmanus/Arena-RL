define(['screen', 'map'], function(screen, map){
	
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
			//kod odpowiedzialny za automatyczne chybienie...
			console.log('critical miss');
		}else if(attackerScore === 20){
			//kod odpowiedzialny za automatyczne trafienie i trafienie krytyczne...
			console.log('critical hit');
		}else{
			
			attackerScore += attacker.stats.baseAttackBonus + Math.floor(attacker.stats.strength / 2 - 5) + sizeModifiers[attacker.size];
			
			defenderScore = defender.stats.defense + Math.floor(defender.stats.dexterity / 2 - 5) + sizeModifiers[defender.size];
			
			if(attackerScore >= defenderScore){
				
				console.log('hit!');
			}else{
				
				console.log('miss');
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
	
	return{
		
		roll: roll,
		doCombatMelee: doCombatMelee
	}
});
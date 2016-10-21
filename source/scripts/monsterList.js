define(['screen', 'animalai'], function(screen, animalai){
	
	var monsterType = {
		
		'rat': {
			display: 'r', 
			fgColor: 'darkgoldenrod', 
			bgColor: 'transparent', 
			lookDescription: 'a rat', 
			type: {messageDisplay: 'rat', type: 'monster', family: 'animal', species: 'rat', name: 'a rat'}, 
			HD: '0.25,8', 
			size: 'tiny', 
			stats: {strength: 2, dexterity: 15, constitution: 10, intelligence: 2, wisdom: 12, charisma: 2, speed: 15, perception: 8, baseAttackBonus: 0, defense: 14}, 
			ai: animalai.ai, 
			abilities: {breatheUnderWater: true, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0},
			hostileList: {species: ['human'], family: [], entity: []}
			}
	};
	
	return{
		
		monsterType: monsterType
	}
});
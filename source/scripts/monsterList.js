define(['screen', 'animalai', 'combat', 'creatai'], function(screen, animalai, combat, creatai){
	
	var monsterType = {
		
		'rat': {
			display: 'r', 
			fgColor: 'darkgoldenrod', 
			bgColor: 'transparent', 
			lookDescription: 'a rat', 
			type: {messageDisplay: 'rat', type: 'monster', family: 'animal', species: 'rat', name: 'a rat'}, 
			HD: '0.25d8',
			size: 'tiny', 
			stats: {strength: 2, dexterity: 15, constitution: 10, intelligence: 2, wisdom: 12, charisma: 2, speed: 20, perception: 8, baseAttackBonus: 0, defense: 10},
			equipment: {
				
				'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'arms': {description: 'empty'},
                'legs': {description: 'empty'}
                
			},
			ai: animalai.ai, 
			abilities: {breatheUnderWater: true, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0},
			hostileList: {species: ['human', 'snake'], family: [], entity: []},
			defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, damage: '1d3-4', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: [null]}
			},

		'snake': {
			display: 's',
			fgColor: 'lightgreen',
			bgColor: 'transparent',
			lookDescription: 'a snake',
			type: {messageDisplay: 'snake', type: 'monster', family: 'animal', species: 'snake', name: 'a snake'},
			HD: '3d8+6',
			size: 'medium',
			stats: {strength: 17, dexterity: 17, constitution: 13, intelligence: 1, wisdom: 12, charisma: 2, speed: 20, perception: 4, baseAttackBonus: 2, defense: 12},
			equipment: {

				'head': {description: 'empty'},
				'torso': {description: 'empty'}
			},
			ai: animalai.ai,
			abilities: {breatheUnderWater: true, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0},
			hostileList: {species: ['human', 'rat', 'kobold'], family: [], entity: []},
			defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, damage: '1d7', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: ['poisoned']}
		},

		'wolf': {
			display: 'w',
			fgColor: 'silver',
			bgColor: 'transparent',
			lookDescription: 'a wolf',
			type: {messageDisplay: 'wolf', type: 'monster', family: 'animal', species: 'wolf', name: 'a wolf'},
			HD: '2d8+4',
			size: 'medium',
			stats: {strength: 13, dexterity: 15, constitution: 15, intelligence: 2, wisdom: 12, charisma: 6, speed: 50, perception: 5, baseAttackBonus: 1, defense: 12},
			equipment: {

				'head': {description: 'empty'},
				'torso': {description: 'empty'},
				'arms': {description: 'empty'},
				'legs': {description: 'empty'}
			},
			ai: animalai.ai,
			abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0},
			hostileList: {species: ['human'], family: [], entity: []},
			defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, damage: '1d6+1', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: ['bleeding']}
		},

		'raven': {
			display: 'r',
			fgColor: 'rgb(51,51,51)',
			bgColor: 'transparent',
			lookDescription: 'a raven',
			type: {messageDisplay: 'raven', type: 'monster', family: 'animal', species: 'raven', name: 'a raven'},
			HD: '0.25d8',
			size: 'tiny',
			stats: {strength: 1, dexterity: 15, constitution: 10, intelligence: 2, wisdom: 14, charisma: 6, speed: 40, perception: 7, baseAttackBonus: 0, defense: 10},
			equipment: {

				'head': {description: 'empty'},
				'torso': {description: 'empty'},
				'wings': {description: 'empty'},
				'legs': {description: 'empty'}
			},
			ai: animalai.ai,
			abilities: {breatheUnderWater: false, canFly: true, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0},
			hostileList: {species: ['human'], family: [], entity: []},
			defaultWeapon: {name: 'claws', description: 'a claws', natural: true, damage: '1d2-5', critical: [20], dmgType: 'claws', criticalMultiplier: 2, criticalHit: ['bleeding']}
		},

		'kobold': {
			display: 'k',
			fgColor: 'green',
			bgColor: 'transparent',
			lookDescription: 'a kobold',
			type: {messageDisplay: 'kobold', type: 'monster', family: 'creature', species: 'kobold', name: 'a kobold'},
			HD: '1d8',
			size: 'small',
			stats: {strength: 9, dexterity: 13, constitution: 10, intelligence: 10, wisdom: 9, charisma: 8, speed: 30, perception: 8, baseAttackBonus: 1, defense: 11},
			equipment: {

				'head': {description: 'empty'},
				'torso': {description: 'empty'},
				'right hand': {description: 'empty'},
				'left hand': {description: 'empty'},
				'legs': {description: 'empty'},
				'feet': {description: 'empty'}
			},
			ai: creatai.ai,
			abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0},
			hostileList: {species: ['human', 'snake'], family: [], entity: []},
			defaultWeapon: {name: 'fist', description: 'a fist', natural: true, damage: '1d2', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2, criticalHit: [null]}
		}
	};
	
	return{
		
		monsterType: monsterType
	}
});
define(['screen', 'animalai', 'combat', 'creatai'], function(screen, animalai, combat, creatai){

	var monsterList = [{key: 'rat'}, {key: 'snake'}, {key: 'wolf'}, {key: 'raven'}, {key: 'kobold'}, {key: 'skeleton'}];
	
	var monsterType = {
		
		'rat': {
			display: 'r', 
			fgColor: 'darkgoldenrod', 
			bgColor: 'transparent', 
			lookDescription: 'a rat', 
			type: {messageDisplay: 'rat', type: 'monster', family: 'animal', species: 'rat', group: 'rodent', name: 'a rat'},
			HD: '0.25d8',
			xp: 135,
			size: 'tiny', 
			stats: {strength: 2, dexterity: 15, constitution: 10, intelligence: 2, wisdom: 12, charisma: 2, speed: 20, perception: 8, baseAttackBonus: 0, defense: 10},
			equipment: {
				
				'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'arms': {description: 'empty'},
                'legs': {description: 'empty'}
                
			},
			ai: animalai.ai, 
			abilities: {breatheUnderWater: true, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
			hostileList: {species: ['human', 'snake'], family: [], entity: [], group: []},
			defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, damage: '1d3-4', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: [null]}
			},

		'snake': {
			display: 's',
			fgColor: 'lightgreen',
			bgColor: 'transparent',
			lookDescription: 'a snake',
			type: {messageDisplay: 'snake', type: 'monster', family: 'animal', species: 'snake', group: 'reptile', name: 'a snake'},
			HD: '3d8+6',
			xp: 600,
			size: 'medium',
			stats: {strength: 17, dexterity: 17, constitution: 13, intelligence: 1, wisdom: 12, charisma: 2, speed: 20, perception: 4, baseAttackBonus: 2, defense: 12},
			equipment: {

				'head': {description: 'empty'},
				'torso': {description: 'empty'}
			},
			ai: animalai.ai,
			abilities: {breatheUnderWater: true, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
			hostileList: {species: ['human', 'rat', 'kobold', 'wolf'], family: [], entity: [], group: []},
			defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, damage: '1d7', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: ['poisoned']}
		},

		'wolf': {
			display: 'w',
			fgColor: 'silver',
			bgColor: 'transparent',
			lookDescription: 'a wolf',
			type: {messageDisplay: 'wolf', type: 'monster', family: 'animal', species: 'wolf', group: 'canine', name: 'a wolf'},
			HD: '2d8+4',
			xp: 400,
			size: 'medium',
			stats: {strength: 13, dexterity: 15, constitution: 15, intelligence: 2, wisdom: 12, charisma: 6, speed: 50, perception: 5, baseAttackBonus: 1, defense: 12},
			equipment: {

				'head': {description: 'empty'},
				'torso': {description: 'empty'},
				'arms': {description: 'empty'},
				'legs': {description: 'empty'}
			},
			ai: animalai.ai,
			abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
			hostileList: {species: ['human', 'snake'], family: [], entity: [], group: []},
			defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, damage: '1d6+1', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: ['bleeding']}
		},

		'raven': {
			display: 'r',
			fgColor: 'rgb(51,51,51)',
			bgColor: 'transparent',
			lookDescription: 'a raven',
			type: {messageDisplay: 'raven', type: 'monster', family: 'animal', species: 'raven', group: 'birds', name: 'a raven'},
			HD: '0.25d8',
			xp: 65,
			size: 'tiny',
			stats: {strength: 1, dexterity: 15, constitution: 10, intelligence: 2, wisdom: 14, charisma: 6, speed: 40, perception: 7, baseAttackBonus: 0, defense: 10},
			equipment: {

				'head': {description: 'empty'},
				'torso': {description: 'empty'},
				'wings': {description: 'empty'},
				'legs': {description: 'empty'}
			},
			ai: animalai.ai,
			abilities: {breatheUnderWater: false, canFly: true, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
			hostileList: {species: ['human'], family: [], entity: [], group: []},
			defaultWeapon: {name: 'claws', description: 'a claws', natural: true, damage: '1d2-5', critical: [20], dmgType: 'claws', criticalMultiplier: 2, criticalHit: ['bleeding']}
		},

		'kobold': {
			display: 'k',
			fgColor: 'green',
			bgColor: 'transparent',
			lookDescription: 'a kobold',
			type: {messageDisplay: 'kobold', type: 'monster', family: 'creature', group: 'kobolds', species: 'kobold', name: 'a kobold'},
			HD: '1d8',
			xp: 100,
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
			abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: false, cantDrinkPotions: false, illiterate: false, mindless: false, bloodless: false},
			hostileList: {species: ['human', 'snake'], family: [], entity: [], group: ['undead']},
			defaultWeapon: {name: 'fist', description: 'a fist', natural: true, damage: '1d2', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2, criticalHit: [null]}
		},

        'skeleton': {
            display: 'z',
            fgColor: 'white',
            bgColor: 'transparent',
            lookDescription: 'a skeleton',
            type: {messageDisplay: 'skeleton', type: 'monster', family: 'creature', group: 'undead', species: 'skeleton', name: 'a skeleton'},
            HD: '1d12',
            xp: 135,
            size: 'medium',
            stats: {strength: 15, dexterity: 14, constitution: 1, intelligence: 1, wisdom: 10, charisma: 10, speed: 30, perception: 7, baseAttackBonus: 1, defense: 12},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: true, cantDrinkPotions: true, illiterate: true, mindless: true, bloodless: true},
            hostileList: {species: ['human'], family: [], entity: [], group: ['kobolds']},
            defaultWeapon: {name: 'claws', description: 'a claws', natural: true, damage: '1d4+2', critical: [20], dmgType: 'claws', criticalMultiplier: 2, criticalHit: ['bleeding']}
        }
	};
	
	return{
		
		monsterType: monsterType,
		monsterList: monsterList
	}
});
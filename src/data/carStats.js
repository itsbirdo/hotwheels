export const CAR_STATS = {
  monsterTruck: {
    name: 'Monster Truck',
    description: 'Heavy hitter. Top speed beast with sluggish handling.',
    speed: 4,        // out of 5
    acceleration: 3, // out of 5
    handling: 2,     // out of 5
    // Actual physics values
    maxSpeed: 480,
    accelRate: 220,
    turnRate: 2.8,
    friction: 0.97,
    pickupRadius: 1.0,
    colors: { primary: '#1a1a1a', secondary: '#cc2222', accent: '#ff4444' }
  },
  sportsCar: {
    name: 'Sports Car',
    description: 'Nimble and quick. Corners like a dream.',
    speed: 3,
    acceleration: 4,
    handling: 4,
    maxSpeed: 440,
    accelRate: 280,
    turnRate: 3.8,
    friction: 0.965,
    pickupRadius: 1.0,
    colors: { primary: '#cc2222', secondary: '#ffffff', accent: '#ff6666' }
  },
  topHatCar: {
    name: 'Top Hat',
    description: 'Balanced ride with a wider power-up magnet.',
    speed: 3,
    acceleration: 3,
    handling: 3,
    maxSpeed: 450,
    accelRate: 250,
    turnRate: 3.4,
    friction: 0.965,
    pickupRadius: 1.5, // wider pickup radius bonus
    colors: { primary: '#ff3366', secondary: '#33ccff', accent: '#ffcc00' }
  }
};

export const CAR_KEYS = ['monsterTruck', 'sportsCar', 'topHatCar'];

export const DIFFICULTY = {
  easy: {
    name: 'Easy',
    baseSpeedMult: 0.50,
    rubberBandStrength: 1.0,
    mistakeChance: 0.35,
    powerUpDelay: 4000,
    powerUpWasteChance: 0.7
  },
  medium: {
    name: 'Medium',
    baseSpeedMult: 0.85,
    rubberBandStrength: 0.5,
    mistakeChance: 0.07,
    powerUpDelay: 1200,
    powerUpWasteChance: 0.15
  },
  hard: {
    name: 'Hard',
    baseSpeedMult: 0.95,
    rubberBandStrength: 0.25,
    mistakeChance: 0.02,
    powerUpDelay: 600,
    powerUpWasteChance: 0.05
  }
};

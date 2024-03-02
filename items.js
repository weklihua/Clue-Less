// Suspects:
let plum = {
   name: "Prof. Plum",
   image: null,
   color: "red",
};

let scarlet = {
   name: "Miss Scarlet",
   image: null,
   color: "orange",
}

let mustard = {
   name: "Col Mustard",
   image: null,
   color: "yellow",
}

let white = {
   name: "Mrs White",
   image: null,
   color: "green",
}

let green = {
   name: "Mr. Green",
   image: null,
   color: "pink",
}

let peacock = {
   name: "Mrs Peacock",
   image: null,
   color: "purple",
}

// weapons: 
let candlestick = {
   name : "Candle Stick",
   image: null,
}

let wrench = {
   name: "wrench",
   image: null,
}

let leadPipe = {
   name: "Lead Pipe",
   image: null,
}

let rope = {
   name: "rope",
   image: null,
}

let dagger = {
   name: "dagger",
   image: null,
}

let revolver = {
   name: "revolver",
   image: null,
}

//rooms:
let study = {
   name: "Study Room",
   image: null,
}

let hall = {
   name: "Hall",
   image: null,
}

let lounge = {
   name: "Lounge",
   image: null,
}

let library = {
   name: "Library",
   image: null,
}

let billiardRoom = {
   name: "Billiard Room",
   image: null,
}

let diningRoom = {
   name: "Dining Room",
   image: null,
}

let conservatory = {
   name: "Conservatory",
   image: null,
}

let ballroom = {
   name: "Ballroom",
   image: null,
}

let kitchen = {
   name: "Kitchen",
   image: null,
}

// create arrays for suspects, weapons, and rooms
let suspectsArray = [plum, scarlet, mustard, white, green, peacock]

let weaponsArray = [candlestick, wrench, leadPipe, rope, dagger, revolver]

let roomsArray = [hall, study, ballroom, billiardRoom, diningRoom, kitchen, lounge, conservatory, library]

// Generate 3 random cards from each category at the initial game state
let randomSuspect = suspectsArray[Math.floor(Math.random() * suspectsArray.length)]

let randomWeapon = weaponsArray[Math.floor(Math.random() * weaponsArray.length)]

let randomRoom = roomsArray[Math.floor(Math.random() * roomsArray.length)]
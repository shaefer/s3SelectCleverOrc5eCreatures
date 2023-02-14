const fs = require('fs');
const prompt = require('prompt-sync')();
const lineByLine = require('n-readlines');

const now = new Date();
const fileNameDateAndTime = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}-${now.getTime()}`;
const newFileStream = fs.createWriteStream('allCreatures5e-'+ fileNameDateAndTime +'.jsonl', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})



const liner = new lineByLine('../../allCreatures5e.jsonl')
let line;
let lineNumber = 1;
 
        //const yesNo = prompt(`What are the habitats of the ${obj.Name} > `);
        //console.log(`Why did you say: ${yesNo}`);
while (line = liner.next()) {
    let obj = JSON.parse(line.toString('ascii'));
    if (obj.Type == "Undead") {
        obj.primaryEnvironment = "Any";
        newFileStream.write(JSON.stringify(obj) + "\n"); // append string to your file
    } else if (obj.Type == "Fiend") {
        obj.primaryEnvironment = "Lower Plane";
        newFileStream.write(JSON.stringify(obj) + "\n"); // append string to your file
    } else if (obj.Type == "Elemental") {
        obj.primaryEnvironment = "Elemental Plane";
        newFileStream.write(JSON.stringify(obj) + "\n"); // append string to your file
    } else if (obj.Type == "Celestial") {
        obj.primaryEnvironment = "Upper Plane";
        newFileStream.write(JSON.stringify(obj) + "\n"); // append string to your file
    }
    lineNumber++;
}
 
console.log('end of line reached');



// const name = prompt('What is your name?');
// console.log(`Hey there ${name}`);


// Aberrations 1. Underground
// Beasts 
// Celestials
// Constructs
// Dragons standard preference by color
// Elementals standard preference by element
// Fey 1. Forest, 2. Swamp
// Fiends
// Giants
// Humanoids
// Monstrosities
// Oozes 1. Underground 2
// Plants 
// Undead

//We'll definitely need to go find all the Aquatic creatures in any of these categories.
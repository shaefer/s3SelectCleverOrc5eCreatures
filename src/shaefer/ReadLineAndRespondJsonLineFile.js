console.time('Time');

const { kMaxLength } = require('buffer');
const fs = require('fs');
const readline = require('readline');
const prompt = require('prompt-sync')();


const fileToReadIn = 'allCreatures5e.jsonl';
const baseNameOfNewFile = 'allCreatures5eNewFields';

const LineByLineReader = require('line-by-line');
const rl = new LineByLineReader('allCreatures5e.jsonl');

//void (async () => {

  const terminalInput = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  


  const now = new Date();
  const fileNameDateAndTime = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}-${now.getTime()}`;
  // const newFileStream = fs.createWriteStream(baseNameOfNewFile + '-' + fileNameDateAndTime + '.jsonl', {
  //   flags: 'a' // 'a' means appending (old data will be preserved)
  // })

  // rl.on('line', (line) => {
  //   let obj = JSON.parse(line.trim());
  //   console.log(`On line with creature ${obj.Name}`)

    
  //   console.log(`Hello, ${name}`);
  //   //newFileStream.write(JSON.stringify(obj) + "\n"); // append string to your file
  // });

  rl.on('line', (line) => {
    let obj = JSON.parse(line.trim());
    const monsterName = obj.Name;
    console.log(obj);
    // pause emitting of lines...
 
    //const name = prompt(`What is your name? I'm asking about ${monsterName}`);
    //console.log(`Hey there ${name}`);
    //rl.resume();
    rl.pause();
    setTimeout(() => {
      console.log("Waiting here for a sec.")
      
      terminalInput.question('Who are you?', name => {
        console.log(`Hey there ${name}!`);
        terminalInput.close();
        rl.resume();
      });

     
    }, 2000)
  });

  rl.on('end', () => {
    console.log("END OF FILE");
    console.log(`Used ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
    console.timeEnd('Time');
  });
  //await new Promise((res) => rl.once('close', res));

 
//})();




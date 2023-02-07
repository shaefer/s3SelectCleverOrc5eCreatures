console.time('Time');

const { kMaxLength } = require('buffer');
const fs = require('fs');
const readline = require('readline');

void (async () => {

  const now = new Date();
  const fileNameDateAndTime = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}-${now.getTime()}`;
  const newFileStream = fs.createWriteStream('allCreatures5e-'+ fileNameDateAndTime +'.jsonl', {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })

  const rl = readline.createInterface({
    input: fs.createReadStream('allCreatures5e.jsonl'),
    crlfDelay: Infinity,
  });

  rl.on('line', (line) => {
    let obj = JSON.parse(line.trim());
    obj = parseAndWriteSpeeds(obj);

    newFileStream.write(JSON.stringify(obj) + "\n"); // append string to your file
  });

  await new Promise((res) => rl.once('close', res));

  console.log(`Used ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
  console.timeEnd('Time');
})();

const setSpeed = (obj, type, item) => {
  if (item.includes(`${type}`)) {
      console.log("Found type " + type)
      obj[`speed_${type}`] = parseInt(new RegExp(/\d+/).exec(item)[0]);
  } else {
    obj[`speed_${type}`] = 0;
  }
}

const parseAndWriteSpeeds = (obj) => {
  const speedString = obj.Speeds.toString();
  console.log(obj.Name + " " + obj.Speeds)
  const speedArray = speedString.split(",");
  speedArray.forEach(i => {
      setSpeed(obj, 'climb', i);
      setSpeed(obj, 'swim', i);
      setSpeed(obj, 'burrow', i);
      setSpeed(obj, 'fly', i);
      if (new RegExp(/^\d+$/).test(i)) {
          obj.speed_land = parseInt(i);
      }
  });

  return obj;
}
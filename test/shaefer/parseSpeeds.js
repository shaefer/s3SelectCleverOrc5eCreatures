const testStr = {Name:"Some monster", Speeds:"40, climb 30, 35 swim"};


const setSpeed = (obj, type, item) => {
    if (item.includes(`${type}`)) {
        console.log("Found type " + type)
        obj[`speed_${type}`] = parseInt(new RegExp(/\d+/).exec(item)[0]);
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


const result = parseAndWriteSpeeds(testStr);
console.log(result)
if (result.speed_land != 40) throw "Test failure land speed"
if (result.speed_climb != 30) throw "Test failure climb speed"
if (result.speed_swim != 35) throw "Test failure swim speed"

const result2 = parseAndWriteSpeeds({Name:"anotherMonster", Speeds:"fly 40"})
console.log(result2)
if (result2.speed_fly != 40) throw "Test 2 failure fly speed"
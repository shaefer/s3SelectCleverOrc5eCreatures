const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const parseSize = (sizeTypeAndAlignment) => {
    //expects format: Tiny fey, neutral 
    //new RegExp(/^\d+$/).test(i)
    const matchResults = new RegExp(/^(\w+) ([\w\s\(\)]+), ([\w\s]+)$/).exec(sizeTypeAndAlignment);
    const matchResultsFull = matchResults[0];
    const size = matchResults[1];
    const type = matchResults[2];
    const alignment = matchResults[3];
    return {size, type, alignment};
}

const parseAC = (armorClassAndType) => {
    //expects format: 13 (natural armor)
    const matchResults = new RegExp(/(\d+) ?\(?([\w\s]+)?\)?/).exec(armorClassAndType);
    const matchResultsFull = matchResults[0];
    const armorClass = parseInt(matchResults[1]);
    const armorClassType = matchResults[2];
    const obj = {armorClass};
    if (armorClassType) {
        obj.armorClassType = armorClassType;
    }
    return obj;
}

const parseSpeed = (speeds) => {
    //expects format: 10 ft., fly 40 ft. (hover)
    const regexp = /(([a-z]*) ?(\d+) ft. ?(\(hover\))?),?/g;
    const matchResults = [...speeds.matchAll(regexp)];
    const speedEntries = matchResults.map(x => {
        const type = x[2] || 'land';
        const value = parseInt(x[3]);
        return {text: x[1], type, value}
    });
    const speedObj = {};
    speedEntries.forEach(x => {
        speedObj[`${x.type}_speed`] = x;
    });
    return speedObj;
}

const parseStat = (stat, statName) => {
    const matchResults = new RegExp(/(\d+) \(([-+]\d+)\)/).exec(stat);
    const abilityScore = parseInt(matchResults[1]);
    const abilityScoreBonus = parseInt(matchResults[2]);
    const abilityScoreObj = {};
    abilityScoreObj[statName] = abilityScore
    abilityScoreObj[`${statName}_full`] = matchResults[0];
    abilityScoreObj[`${statName}_bonus`] = abilityScoreBonus;
    return abilityScoreObj;
};

const scrapeCreature = async (uri) => {

    //const creatureNameFormatted = creatureName;
    //https://dr-eigenvalue.github.io/bestiary/tag/tome-of-beasts
    const html = await axios.get(`https://dr-eigenvalue.github.io${uri}`);
    const $ = await cheerio.load(html.data); //cheerio tutorials: https://cheerio.js.org/

    let creature = {};
    const name = $('body').find("h1").text();
    creature.name = name;

    const sizeTypeAndAlignment = $('.creature-heading > h2').text();
    const parsedSizeTypeAndAlignment = parseSize(sizeTypeAndAlignment);
    creature = Object.assign(creature, parsedSizeTypeAndAlignment);

    const armorClass = $(`h4:contains('Armor Class') + p`).text();
    const armorClassAndType = parseAC(armorClass);
    creature = Object.assign(creature, armorClassAndType);

    const speed = $(`h4:contains('Speed') + p`).text();
    const speeds = parseSpeed(speed);
    creature = Object.assign(creature, speeds);

    const strObj = parseStat($('.ability-strength > p').text(), "str");
    const dexObj = parseStat($('.ability-dexterity > p').text(), "dex");
    const conObj = parseStat($('.ability-constitution > p').text(), "con");
    const intObj = parseStat($('.ability-intelligence > p').text(), "int");
    const wisObj = parseStat($('.ability-wisdom > p').text(), "wis");
    const chaObj = parseStat($('.ability-charisma > p').text(), "cha");

    //TODO: Rewrap for convenience?
    creature = Object.assign(creature, strObj);
    creature = Object.assign(creature, dexObj);
    creature = Object.assign(creature, conObj);
    creature = Object.assign(creature, intObj);
    creature = Object.assign(creature, wisObj);
    creature = Object.assign(creature, chaObj);

    //TODO: Break out each sense or pull out passive perception?
    creature.senses = $(`h4:contains('Senses') + p`).text();
    creature.skills = $(`h4:contains('Skills') + p`).text();
    creature.languages = $(`h4:contains('Languages') + p`).text();
    creature.cr = $(`h4:contains('Challenge') + p`).text(); //TODO: Break out exp from CR...also add a numeric non-fractional version.
    creature.damageImmunities = $(`h4:contains('Damage Immunities') + p`).text();
    creature.damageResistances = $(`h4:contains('Damage Resistances') + p`).text();
    creature.damageVulnerabilities = $(`h4:contains('Damage Vulnerabilities') + p`).text();
    creature.conditionImmunities = $(`h4:contains('Condition Immunities') + p`).text();
    creature.savingThrows = $(`h4:contains('Saving Throws') + p`).text();

    const abilityNames = $(`.top-stats + svg`).nextUntil('h3, dl', 'p');
    const abilityList = [];
    abilityNames.each((i, elm) => {
        const name = $(elm).find("strong > em").text();
        const spellItemsSelected = $(elm).next().find("li > p");
        const spellItems = [];
        spellItemsSelected.each((i, elm) => {
            spellItems.push(" " + $(elm).text());
        });
        const fullText = $(elm).text() + spellItems.join();
        
        abilityList.push({name, fullText});
    })
    creature.abilities = abilityList;

    const actions = $('#actions').nextUntil('h3, dl', 'p');
    const actionList = [];
    actions.each((i, elm) => {
        const name = $(elm).find("strong > em").text();
        const spellItemsSelected = $(elm).next().find("li > p");
        const spellItems = [];
        spellItemsSelected.each((i, elm) => {
            spellItems.push(" " + $(elm).text());
        });
        const fullText = $(elm).text() + spellItems.join();
        actionList.push({name, fullText});
    });
    creature.actions = actionList;

    const reactions = $('#reactions').nextUntil('h3, dl', 'p');
    const reactionList = [];
    reactions.each((i, elm) => {
        const name = $(elm).find("strong > em").text();
        const spellItemsSelected = $(elm).next().find("li > p");
        const spellItems = [];
        spellItemsSelected.each((i, elm) => {
            spellItems.push(" " + $(elm).text());
        });
        const fullText = $(elm).text() + spellItems.join();
        reactionList.push({name, fullText});
    });
    creature.reactions = reactionList;

    //console.log(creature);
    return creature;
 };

//  const creatures = ["shroud", "azza-gremlin", "stryx", "clurichaun"];
//  creatures.forEach(c => {
//     scrapeCreature(c);
//  });
//scrapeCreature(creatures[3])


//const uris = await scrapeCreatureNames();


const scrapeCreatureNames = async () => {
    const html = await axios.get(`https://dr-eigenvalue.github.io/bestiary/tag/tome-of-beasts`);
    const $ = await cheerio.load(html.data); //cheerio tutorials: https://cheerio.js.org/

    const creatureNames = $('.post-link');
    const links = [];
    creatureNames.each((i, elm) => {
        links.push($(elm).attr('href'))
    });
    
    const now = new Date();
    const fileNameDateAndTime = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}-${now.getTime()}`;
    const newFileStream = fs.createWriteStream('tomeOfBeasts-'+ fileNameDateAndTime +'.jsonl', {
      flags: 'a' // 'a' means appending (old data will be preserved)
    })

    for (let i = 0;i<links.length; i++) {
        try {
            const creature = await scrapeCreature(links[i]);
            newFileStream.write(JSON.stringify(creature) + "\n");
        } catch (ex) {
            //TODO: We shouldn't just skip broken ones, but we would need to make some of the matching in regex more resilient and then just update things that are broken...maybe parse everything and just fail that field setting and log an error.
            console.log("FAILED: " + links[i])
        }
    }
}


scrapeCreatureNames();
//scrapeCreature('/bestiary/creature/cikavak');

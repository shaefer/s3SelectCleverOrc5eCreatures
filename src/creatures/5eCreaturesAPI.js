const {getCreatureByName} = require('./endpoints/GetCreatureByName');
const {allCreatures} = require('./endpoints/GetAllCreatures');
const {getCreatureByCR} = require('./endpoints/GetCreatureByCR');
const {creatureSearch} = require('./endpoints/CreatureSearch');
const {getCreatureByAbilityScore} = require('./endpoints/GetCreatureByAbilityScore');

//serverless invoke local --function GetCreatureByName --data '{"pathParameters":{"name":"Troll"}}'
module.exports.getCreatureByName = getCreatureByName;
//serverless invoke local --function GetAllCreatures
module.exports.allCreatures = allCreatures;
//serverless invoke local --function GetCreaturesByCR --data '{"pathParameters":{"range":"30"}}'
module.exports.getCreatureByCR = getCreatureByCR;
//serverless invoke local --function GetCreaturesByAbilityScore --data '{"pathParameters":{"abilityScore": "STR", "range":"30"}}'
module.exports.getCreatureByAbilityScore = getCreatureByAbilityScore;
//serverless invoke local --function GetCreatures --data '{"queryStringParameters":{"str":"30", "cha": "20-23", "alignment":"CE", "source":"Monster Manual", "Size":"Gargantuan"}}'
//serverless invoke local --function GetCreatures --data '{"queryStringParameters":{"Size":"<=Small","Type":"Dragon"}}'
module.exports.creatureSearch = creatureSearch;





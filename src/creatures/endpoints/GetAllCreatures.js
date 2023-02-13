const {s3SelectWithExpression} = require('../s3SelectBase');
const {http500, wrapData} = require('../httpBase');

const allSources = ["Monster Manual", "Volo's Guide to Monsters", "Mordenkainen's Tome of Foes", "Tomb of Annihilation", "Tales from the Yawning Portal", "Curse of Strahd", "Out of the Abyss", "Storm King's Thunder", "Xanathar's Guide to Everything", "Rise of Tiamat", "Princes of the Apocalypse", "Hoard of the Dragon Queen", "The Tortle Package", "Dungeon Master's Guide"];
//serverless invoke local --function GetAllCreatures
module.exports.allCreatures = async (event, context, callback) => {
  const expression = `SELECT * FROM S3Object s`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(wrapData(data))
  } catch (error) {
    context.fail(http500(error))
  }
};
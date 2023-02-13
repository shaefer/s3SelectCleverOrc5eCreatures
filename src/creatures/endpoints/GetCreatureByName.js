const {s3SelectWithExpression} = require('../s3SelectBase');
const {http500, wrapData} = require('../httpBase');

//serverless invoke local --function GetCreatureByName --data '{"pathParameters":{"name":"Troll"}}'
module.exports.getCreatureByName = async (event, context, callback) => {

    const name = event.pathParameters.name;
    const expression = `SELECT * FROM S3Object s WHERE s.Name = '`+name+`'`;
    try {
      const data = await s3SelectWithExpression(expression);
      context.succeed(wrapData(data))
    } catch (error) {
      context.fail(http500(error))
    }
};
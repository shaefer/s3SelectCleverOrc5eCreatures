const {s3SelectWithExpression} = require('../s3SelectBase');
const {http500, wrapData} = require('../httpBase');
const {parseRangeToWhereClause} = require('./utilities/whereClause');

//serverless invoke local --function GetCreaturesByAbilityScore --data '{"pathParameters":{"abilityScore": "STR", "range":"30"}}'
module.exports.getCreatureByAbilityScore = async (event, context, callback) => {
    console.log(event)
    const abilityScore = event.pathParameters.abilityScore;
    const rangeParam = decodeURI(event.pathParameters.range); //range was not being decoded so > was showing up as %3E
  
    const isValid = new RegExp(/\d+-\d+|\d+|[<>]=?\d+/).test(rangeParam);
    if (!isValid) return context.fail(http500(`Input '${rangeParam}' does not match expected input e.g. 3-4, >=5, 10`))
  
    const tableRef = "s";
    const whereClause = parseRangeToWhereClause(rangeParam, tableRef, abilityScore.toUpperCase());
    const expression = `SELECT * FROM S3Object ${tableRef} WHERE ${whereClause}`;
    try {
      const data = await s3SelectWithExpression(expression);
      context.succeed(wrapData(data))
    } catch (error) {
      context.fail(http500(error))
    }
};
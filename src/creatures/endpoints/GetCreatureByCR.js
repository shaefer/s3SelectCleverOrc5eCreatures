const {s3SelectWithExpression} = require('../s3SelectBase');
const {http500, wrapData} = require('../httpBase');
const {parseRangeToWhereClause} = require('./utilities/whereClause');

//serverless invoke local --function GetCreaturesByCR --data '{"pathParameters":{"range":"30"}}'
module.exports.getCreatureByCR = async (event, context, callback) => {
    const rangeParam = decodeURI(event.pathParameters.range); //range was not being decoded so > was showing up as %3E
    const isValid = new RegExp(/\d+-\d+|\d+|[<>]=?\d+/).test(rangeParam);
    if (!isValid) return context.fail(`Input '${rangeParam}' does not match expected input e.g. 3-4, >=5, 10`)
  
    const tableRef = "s";
    const whereClause = parseRangeToWhereClause(rangeParam, tableRef, "CR");
    const expression = `SELECT * FROM S3Object ${tableRef} WHERE ${whereClause}`;
    try {
      const data = await s3SelectWithExpression(expression);
      context.succeed(wrapData(data))
    } catch (error) {
      context.fail(http500(error))
    }
  };
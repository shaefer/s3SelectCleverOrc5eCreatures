const {s3SelectWithExpression} = require('./s3SelectBase');

module.exports.getCreatureByName = async (event, context, callback) => {
  const name = event.pathParameters.name;
  const expression = `SELECT * FROM S3Object s WHERE s.Name = '`+name+`'`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(data)
  } catch (error) {
    context.fail(error)
  }
};

module.exports.getCreatureByCR = async (event, context, callback) => {
  const crRangeParam = event.pathParameters.crRange;
  //3-6
  //4
  //>5 >=5
  //<3 <=5
  //contains -
  //contains >
  //contains <
  //just digits
  const parseRangeToWhereClause = (crRange) => {
    return "WHERE s.CR = 5";
  }
  const whereClause = parseRangeToWhereClause(crRangeParam);
  const expression = `SELECT * FROM S3Object s ${whereClause}`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(data)
  } catch (error) {
    context.fail(error)
  }
};
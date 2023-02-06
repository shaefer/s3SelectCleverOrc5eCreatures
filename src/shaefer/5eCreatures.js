const {s3SelectWithExpression} = require('./s3SelectBase');

const wrapData = (data) => {
  return {results: data, count: data.length};
}

module.exports.getCreatureByName = async (event, context, callback) => {
  const name = event.pathParameters.name;
  const expression = `SELECT * FROM S3Object s WHERE s.Name = '`+name+`'`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(wrapData(data))
  } catch (error) {
    context.fail(error)
  }
};

const parseRangeToWhereClause = (numRange, tableRef, field) => {
  //add a general match to ensure the input actually conforms to all our expectations. You could currently have a > and no digit after and it would break.
  if (numRange.includes(">") || numRange.includes("<")) {
    const regexParse = new RegExp(/([><]=?)(\d+)/).exec(numRange);
    const operator = regexParse[1];
    const base = regexParse[2];
    return `WHERE ${tableRef}.${field} ${operator} ${base}`;
  } else {
    const regexParse = new RegExp(/(\d+)-?(\d+)?/).exec(numRange);
    if (numRange.includes("-")) {
      const start = parseInt(regexParse[1]);
      const end = parseInt(regexParse[2]);
      return `WHERE ${tableRef}.${field} >= ${start} AND ${tableRef}.${field} <= ${end}`;
    } else {
      const numExact = parseInt(regexParse[1]);
      return `WHERE ${tableRef}.${field} = ${numExact}`;
    }
  }
}

module.exports.getCreatureByCR = async (event, context, callback) => {
  const rangeParam = event.pathParameters.cr;

  const isValid = new RegExp(/\d+-\d+|\d+|[<>]=?\d+/).test(rangeParam);
  if (!isValid) return context.fail(`Input '${rangeParam}' does not match expected input e.g. 3-4, >=5, 10`)

  const tableRef = "s";
  const whereClause = parseRangeToWhereClause(rangeParam, tableRef, "CR");
  const expression = `SELECT * FROM S3Object ${tableRef} ${whereClause}`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(wrapData(data))
  } catch (error) {
    context.fail(error)
  }
};

module.exports.getCreatureByAbilityScore = async (event, context, callback) => {
  console.log(event)
  const rangeParam = event.pathParameters.str;

  const isValid = new RegExp(/\d+-\d+|\d+|[<>]=?\d+/).test(rangeParam);
  if (!isValid) return context.fail(`Input '${rangeParam}' does not match expected input e.g. 3-4, >=5, 10`)

  const tableRef = "s";
  const whereClause = parseRangeToWhereClause(rangeParam, tableRef, "STR");
  const expression = `SELECT * FROM S3Object ${tableRef} ${whereClause}`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(wrapData(data))
  } catch (error) {
    context.fail(error)
  }
};

module.exports.creatureSearch = async (event, context, callback) => {
  console.log(event)
  const searchFields = event.queryParameters;

  //parse queryParameters into all the search fields provided and parse each one with the below code. 

  const isValid = new RegExp(/\d+-\d+|\d+|[<>]=?\d+/).test(rangeParam);
  if (!isValid) return context.fail(`Input '${rangeParam}' does not match expected input e.g. 3-4, >=5, 10`)

  const fieldName = "STR"; //make sure to also have a function to adjust the capitalization or other syntax.
  const tableRef = "s";
  const whereClause = parseRangeToWhereClause(rangeParam, tableRef, fieldName);
  const expression = `SELECT * FROM S3Object ${tableRef} ${whereClause}`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(wrapData(data))
  } catch (error) {
    context.fail(error)
  }
};
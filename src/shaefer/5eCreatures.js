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
    return `${tableRef}.${field} ${operator} ${base}`;
  } else {
    const regexParse = new RegExp(/(\d+)-?(\d+)?/).exec(numRange);
    if (numRange.includes("-")) {
      const start = parseInt(regexParse[1]);
      const end = parseInt(regexParse[2]);
      return `${tableRef}.${field} >= ${start} AND ${tableRef}.${field} <= ${end}`;
    } else {
      const numExact = parseInt(regexParse[1]);
      return `${tableRef}.${field} = ${numExact}`;
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
  const expression = `SELECT * FROM S3Object ${tableRef} WHERE ${whereClause}`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(wrapData(data))
  } catch (error) {
    context.fail(error)
  }
};

/**
  * @param {Object} object
  * @param {string} key
  * @return {any} value
 */
const getParameterCaseInsensitive = (object, key) => {
  return object[Object.keys(object)
    .find(k => k.toLowerCase() === key.toLowerCase())
  ];
}

//serverless invoke local --function GetCreatures --data '{"queryStringParameters":{"str":"30", "cha": "20-23", "alignment":"CE", "source":"Monster Manual", "Size":"Gargantuan"}}'
module.exports.creatureSearch = async (event, context, callback) => {
  console.log(event)
  const searchFields = event.queryStringParameters;

  const searchableFields = ["STR", "DEX", "CON", "INT", "WIS", "CHA", "Size", "Alignment", "CR", "Source"];
  const rangeFields = ["STR", "DEX", "CON", "INT", "WIS", "CHA", "CR"];
  const tableRef = "s";

  const whereClauses = [];
  searchableFields.forEach((field) => {
    const fieldValue = getParameterCaseInsensitive(searchFields, field);
    if (fieldValue) {
      console.log("Found  a value for field: " + field + " value: " + fieldValue)
      if (rangeFields.includes(field)) {
        const isValid = new RegExp(/\d+-\d+|\d+|[<>]=?\d+/).test(fieldValue);
        if (!isValid) console.log(`Input '${fieldValue}' does not match expected input e.g. 3-4, >=5, 10`)
        const whereClause = parseRangeToWhereClause(fieldValue, tableRef, field);
        whereClauses.push(whereClause);
      } else if (field == "Source") {
        whereClauses.push(`LOWER(${tableRef}.Source) like LOWER('${fieldValue}')`);
      } else if (field == "Size") {
        //TODO: Implement special handling.
        whereClauses.push(`LOWER(${tableRef}."Size") like LOWER('${fieldValue}')`);
      } else if (field == "Alignment") {
        whereClauses.push(`LOWER(${tableRef}."Align.") = LOWER('${fieldValue}')`);
      }  
    } else {
      console.log("Found no value for field: " + field);
    }

  });
  
  const finalWhereClause = (whereClauses.length > 0) ? whereClauses.join(" AND ") : " CR = 30";
  const expression = `SELECT * FROM S3Object ${tableRef} WHERE ${finalWhereClause}`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(wrapData(data))
  } catch (error) {
    context.fail(error)
  }
};
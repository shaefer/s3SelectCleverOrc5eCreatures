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
  const crRangeParam = event.pathParameters.cr;
  //3-6
  //4
  //>5 >=5
  //<3 <=5
  //contains -
  //contains >
  //contains <
  //just digits
  const parseRangeToWhereClause = (crRange) => {
    //add a general match to ensure the input actually conforms to all our expectations. You could currently have a > and no digit after and it would break.
    if (crRange.includes(">") || crRange.includes("<")) {
      const regexParse = new RegExp(/([><]=?)(\d+)/).exec(crRange);
      const operator = regexParse[1];
      const crBase = regexParse[2];
      return `WHERE s.CR ${operator} ${crBase}`;
    } else {
      const regexParse = new RegExp(/(\d+)-?(\d+)?/).exec(crRange);
      if (crRange.includes("-")) {
        const crStart = parseInt(regexParse[1]);
        const crEnd = parseInt(regexParse[2]);
        return `WHERE s.CR >= ${crStart} AND s.CR <= ${crEnd}`;
      } else {
        const crExact = parseInt(regexParse[1]);
        return `WHERE s.CR = ${crExact}`;
      }
    }
  }

  const isValid = new RegExp(/\d+-\d+|\d+|[<>]=?\d+/).test(crRangeParam);
  if (!isValid) return context.fail(`Input '${crRangeParam}' does not match expected input e.g. 3-4, >=5, 10`)
  const whereClause = parseRangeToWhereClause(crRangeParam);
  const expression = `SELECT * FROM S3Object s ${whereClause}`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(data)
  } catch (error) {
    context.fail(error)
  }
};
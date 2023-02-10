const {s3SelectWithExpression} = require('./s3SelectBase');

const http200 = (data) => {
  const response = {
    statusCode: '200',
    body: JSON.stringify(data),
  };
  return response;
}
const http500 = (error) => {
  const response = {
    statusCode: '500',
    body: error,
  };
  return response;
}

const http400 = (error) => {
  const response = {
    statusCode: '400',
    body: error,
  };
  return response;
}

const wrapData = (data) => {
  return http200({count: data.length, results: data});
}

const parseRangeToWhereClause = (numRange, tableRef, field) => {
  //add a general match to ensure the input actually conforms to all our expectations. You could currently have a > and no digit after and it would break.
  console.log(`Parsing Range: ${numRange} for field: ${field}`)
  if (numRange.includes(">") || numRange.includes("<")) {
    const regexParse = new RegExp(/([><]=?)(\d+)/).exec(numRange);
    const operator = regexParse[1];
    const base = regexParse[2];
    const whereClauseOutput = `${tableRef}.${field} ${operator} ${base}`;
    console.log("Greater than or less than comparator where clause: " + whereClauseOutput);
    return whereClauseOutput;
  } else {
    const regexParse = new RegExp(/(\d+)-?(\d+)?/).exec(numRange);
    if (numRange.includes("-")) {
      const start = parseInt(regexParse[1]);
      const end = parseInt(regexParse[2]);
      const whereClauseOutput = `${tableRef}.${field} >= ${start} AND ${tableRef}.${field} <= ${end}`;
      console.log("Range output where clause: " + whereClauseOutput);
      return whereClauseOutput;
    } else {
      const numExact = parseInt(numRange); //assumes it is just a number like 27
      console.log("Parsing as exact match with number: " + numExact);
      return `${tableRef}.${field} = ${numExact}`;
    }
  }
}

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

const allSources = ["Monster Manual", "Volo's Guide to Monsters", "Mordenkainen's Tome of Foes", "Tomb of Annihilation", "Tales from the Yawning Portal", "Curse of Strahd", "Out of the Abyss", "Storm King's Thunder", "Xanathar's Guide to Everything", "Rise of Tiamat", "Princes of the Apocalypse", "Hoard of the Dragon Queen", "The Tortle Package", "Dungeon Master's Guide"];
module.exports.allCreatures = async (event, context, callback) => {
  const expression = `SELECT * FROM S3Object s`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(wrapData(data))
  } catch (error) {
    context.fail(http500(error))
  }
};

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

const sqlList = (list) => {
  return list.map(x => `'${x}'`).join(",")
}

const fixCaseForSize = (sizeWord) => {
  return sizeWord.charAt(0).toUpperCase() + sizeWord.slice(1).toLowerCase();
}

//serverless invoke local --function GetCreatures --data '{"queryStringParameters":{"str":"30", "cha": "20-23", "alignment":"CE", "source":"Monster Manual", "Size":"Gargantuan"}}'
module.exports.creatureSearch = async (event, context, callback) => {
  console.log(event)
  const searchFields = event.queryStringParameters; //for whatever reason the queryStringParameters do seem to be decoded whereas the Path params were not.
  
  const searchableFields = ["STR", "DEX", "CON", "INT", "WIS", "CHA", "Size", "Alignment", "CR", "Source", "Type"];
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
        const sizes = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
        //0-5 T<S<M<L<H<G
        //>Tiny = 1-5, >Small = 2-5 (>= means just subtract 1 from the starting range)
        //<Gargantuan = 0-4, <Huge = 0-3 (<= means add 1 to the ending range)
        const regexMatch = new RegExp(/([<>]=?)?([a-zA-Z]+)/).exec(fieldValue);
        const sizeWord = fixCaseForSize(regexMatch[2]);
        const index = sizes.findIndex((el) => el == sizeWord);
        const operator = regexMatch[1];
        console.log(`SIZE RANGE: ${operator} ${sizeWord} `);
        if (operator && index != -1) {
          console.log("has operator and size");
          if (operator.includes(">")) {
            const startRange = (operator.includes("=")) ? index : index + 1;
            const endRange = 5;
            const rangeSizes = sizes.slice(startRange, endRange + 1); //slice is inclusize for start and exclusive for end
            whereClauses.push(`${tableRef}."Size" IN (${sqlList(rangeSizes)})`);
          } else if (operator.includes("<")) {
            const startRange = 0;
            const endRange = (operator.includes("=")) ? index : index - 1;
            const rangeSizes = sizes.slice(startRange, endRange + 1);
            whereClauses.push(`${tableRef}."Size" IN (${sqlList(rangeSizes)})`);
          }
        } else if (!operator && index != -1) {
          console.log("No operator but we had a good Size")
          whereClauses.push(`LOWER(${tableRef}."Size") like LOWER('${sizeWord}')`);
        } else {
          console.log("Size was bad: " + sizeWord + " not adding a where clause");
        }
      } else if (field == "Alignment") {
        whereClauses.push(`LOWER(${tableRef}."Alignment") = LOWER('${fieldValue}')`);
      } else if (field == "Type") {
        whereClauses.push(`LOWER(${tableRef}."Type") = LOWER('${fieldValue}')`);
      }
    } else {
      console.log("Found no value for field: " + field);
    }

  });
  
  if (whereClauses.length == 0) context.fail(http400({message:"No results because your input was malformed."}))
  const finalWhereClause = (whereClauses.length > 0) ? whereClauses.join(" AND ") : " s.CR = 30";
  const expression = `SELECT * FROM S3Object ${tableRef} WHERE ${finalWhereClause}`;
  try {
    const data = await s3SelectWithExpression(expression);
    context.succeed(wrapData(data))
  } catch (error) {
    context.fail(http500(error))
  }
};
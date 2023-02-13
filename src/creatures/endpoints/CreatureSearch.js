const {s3SelectWithExpression} = require('../s3SelectBase');
const {http500, wrapData} = require('../httpBase');
const {parseRangeToWhereClause} = require('./utilities/whereClause');

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
//serverless invoke local --function GetCreatures --data '{"queryStringParameters":{"Size":"<=Small","Type":"Dragon"}}'
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
      console.log("Error occured", error);
      context.fail(http500(error))
    }
  };
module.exports.parseRangeToWhereClause = (numRange, tableRef, field) => {
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
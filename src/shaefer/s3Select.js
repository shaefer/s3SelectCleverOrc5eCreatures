const S3 = require('aws-sdk/clients/s3');
const client = new S3({
	region: 'us-east-1'
});

const getS3Data = async (params) => {
  return new Promise((resolve, reject) => {
    client.selectObjectContent(params, (err, data) => {
      if (err) { reject(err); }
      if (!data) {
        reject('Empty data object');
      }

      const records = [] //array of bytes of data to be converted to buffer

      data.Payload.on('data', (event) => {
        if (event.Records) {
          records.push(event.Records.Payload); //THere are multiple events in the eventSTream but we only care about Records. If we have Records we have data.
        }
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('end', () => {
        const rawPlanetString = Buffer.concat(records).toString('utf8'); //bytes to buffer to string
        const planetString = `[${rawPlanetString.replace(/\,$/, '')}]`; //remove trailing commas? //force into json array

        try {
          const planetData = JSON.parse(planetString);
          resolve(planetData);
        } catch (e) {
          reject(new Error(`Unable to convert S3 data to JSON object. S3 Select Query: ${planetString} ${params.Expression} ${e}`));
        }
      });
    });
  });
}

const allSources = ["Monster Manual", "Volo's Guide to Monsters", "Mordenkainen's Tome of Foes", "Tomb of Annihilation", "Tales from the Yawning Portal", "Curse of Strahd", "Out of the Abyss", "Storm King's Thunder", "Xanathar's Guide to Everything", "Rise of Tiamat", "Princes of the Apocalypse", "Hoard of the Dragon Queen", "The Tortle Package", "Dungeon Master's Guide"];

module.exports.allCreatures = async (event, context, callback) => {
  console.log("Called s3Select");
  console.log(event);
  const quotedSources = allSources.map(
    s => {
      const escaped = s.replace("'", "\'\'")
      return`'${escaped}'`
    }
  );

  const sourceWhereClause = quotedSources.map(s => {
    return `s.source != ${s}`
  });
  
  const expression = `SELECT (s.source) FROM S3Object s where ` + sourceWhereClause.join(" AND ");
  console.log("expression: " + expression);
  const s3SelectParams = {
    Bucket: 'cleverorc',
    Key: '5e/allCreatures5e.json',
    ExpressionType: 'SQL',
    //Expression: 'SELECT s.Name, s.type, s.alignment, s.source, s.CR, s.STR, s.DEX, s.CON, s."INT", s.WIS, s.CHA FROM S3Object s where s.CR > 20 and s.STR > 29',
    Expression: expression,
    InputSerialization: {
      JSON: {
        Type: 'DOCUMENT'
      }
    },
    OutputSerialization: {
      JSON: {
        RecordDelimiter: ','
      }
    }
  };
  try {
    const data = await getS3Data(s3SelectParams);
    context.succeed(data);
  } catch (error) {
    context.fail(error);
  }
  
};

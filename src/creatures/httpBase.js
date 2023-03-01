const http200 = (data) => {
    const response = {
      statusCode: '200',
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "https://www.example.com",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: JSON.stringify(data),
    };
    return response;
  }
  module.exports.http500 = (error) => {
    const response = {
      statusCode: '500',
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "https://www.example.com",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: error,
    };
    return response;
  }
  
  module.exports.http400 = (error) => {
    const response = {
      statusCode: '400',
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "https://www.example.com",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: error,
    };
    return response;
  }

  module.exports.wrapData = (data) => {
    return http200({count: data.length, results: data});
  }
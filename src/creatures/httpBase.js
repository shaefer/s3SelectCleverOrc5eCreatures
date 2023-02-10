const http200 = (data) => {
    const response = {
      statusCode: '200',
      body: JSON.stringify(data),
    };
    return response;
  }
  module.exports.http500 = (error) => {
    const response = {
      statusCode: '500',
      body: error,
    };
    return response;
  }
  
  module.exports.http400 = (error) => {
    const response = {
      statusCode: '400',
      body: error,
    };
    return response;
  }

  module.exports.wrapData = (data) => {
    return http200({count: data.length, results: data});
  }
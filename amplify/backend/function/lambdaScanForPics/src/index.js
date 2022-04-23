const aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    let dynamotable = event.queryStringParameters.table;

    var paramsQuery = {
      TableName : dynamotable
    };

    let response = await dynamodb.scan(paramsQuery).promise()
      .then(qresult => {
          let qPictures = [];
          let aPictures = [];
          var questions = qresult.Items;
          // collect question pictures
          questions.forEach(q => {
            if(q.pic !== ""){
              qPictures.push(q.pic);
            }
            for(var i=0; i<5; i++){
              if(q.apic[i].p !== "") aPictures.push(q.apic[i].p);
            }
          });

          var pictures = {
              question: qPictures,
              answer: aPictures
          };
          return pictures;
      })
      .catch(err => {
          console.log(err, err.stack)
      });

    return {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
        headers: {
           "Access-Control-Allow-Origin": "*",
           "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(response),
    };
};

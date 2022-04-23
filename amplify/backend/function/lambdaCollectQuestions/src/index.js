/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_S3QUESTIONPICS_BUCKETNAME
Amplify Params - DO NOT EDIT */'use strict';
const aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    const evBody = JSON.parse(event.body)
    console.log("Course ID >>", evBody.courseid);
    console.log("T Value >>", evBody.t);
    console.log("Table >>", evBody.table);

    const TABLE_NAME = evBody.table;
    var crawlUrl = 'https://de.khnu.km.ua/vtestsrc.aspx?M='+evBody.courseid+'&T='+evBody.t+'&n=0.333107776563793'
    let cond = true;
    let count = 0;
    let maxElement = 0;
    let scans = 0;

    do{
        console.log("Scan Attempt >> ", scans++);
        // Get questions from the server
        await parseQuestion(crawlUrl).then(resp => {
            console.log("1: Questions from the server obtained");
            return resp;
        })
        // Create an array of questions
        .then(async response => {
            console.log("2: Form the array of questions");
            let strData = response;
            let questions = [];
            // Generate 25 unique numbers from 30
            var arr = [];
            while(arr.length < 25){
                var r = Math.floor(Math.random() * 30);
                if(arr.indexOf(r) === -1) arr.push(r);
            }
            for(let i=0; i<25; i++){
              questions.push({
                  PutRequest: {
                    Item: {
                      nom: strData[arr[i]].nom,
                      tip: strData[arr[i]].tip,
                      time: strData[arr[i]].time,
                      pic: strData[arr[i]].pic,
                      txt: strData[arr[i]].txt,
                      prim: strData[arr[i]].prim,
                      comm: strData[arr[i]].comm,
                      apic: strData[arr[i]].apic,
                      atxt: strData[arr[i]].atxt,
                      aball: strData[arr[i]].aball,
                      b: strData[arr[i]].b
                    }
                  }
                });
              }
              return questions;
        })
        // Insert data into DynamoDb
        .then(async rsp => {
          console.log("3: Insert into the DynamoDB");
          let writeResp = await writeToDynamo(TABLE_NAME, rsp);
          console.log("Write Reponse >> ", writeResp);
          return writeResp;
        })
        // Check how many question have been inserted
        .then(async rsp => {
            console.log("4: Scan and verify how many items are there in the Dynamo");
            // Retrieve from DynamoDB
            var paramsQuery = {
              TableName : TABLE_NAME,
            };

            let dynamoresult = await dynamodb.scan(paramsQuery).promise()
            .then(qresult => {
              count = 0;
              qresult.Items.forEach(function(element, index, array) {
                maxElement = Math.max(maxElement, parseInt(element.nom,10));
                console.log("Selected >> ", count++)
              });
              console.log("COUNT >>", count);
              console.log("MAX >>", maxElement);
            })
            .catch(err => {
                console.log(err, err.stack)
            });
        })
        .catch(err => {
            console.log(err, err.stack);
            const response = {
                statusCode: 200,
                headers: {
                   "Access-Control-Allow-Origin": "*",
                   "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify(err),
            };
            return response;

        });
    }while (count < maxElement);


    const response = {
        statusCode: 200,
        headers: {
           "Access-Control-Allow-Origin": "*",
           "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(`{"InsertedItems": ${count}}`),
    };
    return response;
}

/// Support functions
async function parseQuestion(url) {
  const axios = require('axios');
  // create a promise for the axios request
  const promise = axios.get(url)
  const dataPromise = promise.then((response) => response.data)
  return dataPromise
}

async function writeToDynamo(table, questions){

    try{
        let params = {
              RequestItems: {
                  [table]: questions
              }
          };
        const resp = await dynamodb.batchWrite(params).promise();
        return resp;
    } catch (e) {
        throw new Error(`Could not write to DynamoDB: ${e.message}`);
    }
}

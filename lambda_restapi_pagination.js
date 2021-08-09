const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

const scanAll = async (params) => {
  let lastEvaluatedKey = 'dummy'; // string must not be empty
  const itemsAll = [];
  while (lastEvaluatedKey) {
    const data = await dynamo.scan(params).promise();
    itemsAll.push(...data.Items);
    lastEvaluatedKey = data.LastEvaluatedKey;
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
  }
  return itemsAll;
}
     
exports.handler = async (event) => {
        
    //      console.log("Hello world.get ...")
    //   console.log(event.httpMethod)
    //   //  console.log(event.body)
    //    console.log(event.pathParameters.id)
      
      //let requestJSON = JSON.parse(event)
      
      let resource = event.httpMethod + " " +event.resource
      console.log(resource)
  
      
      try {
    switch (resource) {
      case "DELETE /items/{id}":
        await dynamo
          .delete({
            TableName: "chtc",
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /items/{id}":
        body = await dynamo
          .get({
            TableName: "chtc",
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        break;
      case "GET /items":
        body = await dynamo.scan({ TableName: "chtc" }).promise();
        break;
      case "GET /items/search":
        
        //HOW TO CREATE GLOBAL INDEX 
        // var params = {
        //   TableName: 'chtc',
        //   IndexName: 'pname-index',
        //   KeyConditionExpression: 'pname = :pname',
        //   ExpressionAttributeValues: { ':pname': event['queryStringParameters']['name']} 
        // };
        
        // //body = await dynamo.scan({ TableName: "chtc" }).promise();
        // body = await dynamo.query(params).promise()
        
        //HOW TO DO PAGINATION
        // keyword = event['queryStringParameters']['keyword']
        // pageSize = parseInt(event['queryStringParameters']['pageSize'])
        // pageNo =  parseInt(event['queryStringParameters']['pageNo'])
        
        // body = await dynamo.scan({ TableName: "chtc" }).promise();
        // body = body.Items.filter(s=>s.pname.indexOf(keyword)>=0)
        // body = body.slice((pageNo-1)*pageSize, pageNo*pageSize)
        
         //body = await dynamo.query(params).promise()
         
         //  KeyConditionExpression: '#user_id = :user_id and begins_with(#user_relation, :user_relation)',

         
        // body = await dynamo.query({
        //   TableName: 'chtc',
        //   //KeyConditionExpression: 'id = :id',
        //   KeyConditionExpression: 'begins_with(id, :id)', //THIS NOT WORK
        //   FilterExpression : 'contains (student_name, :keyword)',
        //   ExpressionAttributeValues: {
        //     ':id': 'u',
        //     ':keyword': event['queryStringParameters']['name']
        //   }
        // }).promise()
        
      const SEARCH_KEYWORD = event['queryStringParameters']['name']
      let params = {
          TableName : 'chtc',
          FilterExpression: "contains(#student_name, :keyword)",
          ExpressionAttributeNames: { 
              "#student_name": "name", //student_name is a new place holder, name is column in the db
          },
          ExpressionAttributeValues: {
              ":keyword": SEARCH_KEYWORD,
          }       
      };
      
       //body = await dynamo.scan(params).promise() //DO NOT WORK WITH QUERY
       
        let lastEvaluatedKey = 'dummy'; // string must not be empty
        const itemsAll = [];
        while (lastEvaluatedKey) {
          const data = await dynamo.scan(params).promise();
          itemsAll.push(...data.Items);
          lastEvaluatedKey = data.LastEvaluatedKey;
          if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
          }
        }
        body = {"Items": itemsAll}
        
        break;
      case "PUT /items":
        let requestJSON = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: "chtc",
            Item: {
              id:  requestJSON.id,
              price: requestJSON.price,
              name: requestJSON.name
            }
          })
          .promise();
        body = `Put item ${requestJSON.id}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
    //body = event['queryStringParameters']['name'];
  }
     
        
    //   console.log(JSON.stringify(event))
       
      
       
      return {
          statusCode: 200,
            headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
        },
         body: body
      }
};

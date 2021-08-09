
const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();
     
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
        
        
        // var params = {
        //   TableName: 'chtc',
        //   IndexName: 'pname-index',
        //   KeyConditionExpression: 'pname = :pname',
        //   ExpressionAttributeValues: { ':pname': event['queryStringParameters']['name']} 
        // };
        
        // //body = await dynamo.scan({ TableName: "chtc" }).promise();
        // body = await dynamo.query(params).promise()
        keyword = event['queryStringParameters']['keyword']
        pageSize = parseInt(event['queryStringParameters']['pageSize'])
        pageNo =  parseInt(event['queryStringParameters']['pageNo'])
        
        body = await dynamo.scan({ TableName: "chtc" }).promise();
        body = body.Items.filter(s=>s.pname.indexOf(keyword)>=0)
        body = body.slice((pageNo-1)*pageSize, pageNo*pageSize)
        
        break;
      case "PUT /items":
        let requestJSON = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: "chtc",
            Item: {
              id: requestJSON.id,
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

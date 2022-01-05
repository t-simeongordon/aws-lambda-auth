
// A simple token-based authorizer example to demonstrate how to use an authorization token 
// to allow or deny a request. In this example, the caller named 'user' is allowed to invoke 
// a request if the client-supplied token value is 'allow'. The caller is not allowed to invoke 
// the request if the token value is 'deny'. If the token value is 'unauthorized' or an empty
// string, the authorizer function returns an HTTP 401 status code. For any other token value, 
// the authorizer returns an HTTP 500 status code. 
// Note that token values are case-sensitive.

const AWS = require('aws-sdk');


exports.handler =  async function(event, context, callback) {
    const Name = '/Project/Service/AuthToken';
    const options = { endpoint: 'https://ssm.eu-west-2.amazonaws.com'};
    let response = {};
    
    try{
        console.log(`events: ${JSON.stringify(event)}`);
        const paramToken = await new AWS.SSM(options).getParameter({Name}).promise();
        console.log(`new AWS.SSM(options).getParameter({Name}).promise(): ${JSON.stringify(paramToken)}`);
        
        var token = event.authorizationToken;
        console.log(`type of new token: ${typeof token}`);
        console.log(`type of paramToken: ${typeof paramToken}`);

        if(token === paramToken.Parameter.Value){
            console.log(`token: allow`);
            response = generatePolicy('user', 'Allow', event.methodArn);
        }else{
            console.log(`token: deny`);
            response = generatePolicy('user', 'Deny', event.methodArn);
        }
    }catch(error){
        console.error(`Main function caught error: ${error}`);
    }
    
    
    // switch (token) {
    //     case 'allow':
    //         callback(null, generatePolicy('user', 'Allow', event.methodArn));
    //         break;
    //     case 'deny':
    //         callback(null, generatePolicy('user', 'Deny', event.methodArn));
    //         break;
    //     case 'unauthorized':
    //         callback("Unauthorized");   // Return a 401 Unauthorized response
    //         break;
    //     default:
    //         callback("Error: Invalid token"); // Return a 500 Invalid token response
    // }
};

// Help function to generate an IAM policy
var generatePolicy = function(principalId, effect, resource) {
    var authResponse = {};
    
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; 
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; 
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        "stringKey": "stringval",
        "numberKey": 123,
        "booleanKey": true
    };
    return authResponse;
}
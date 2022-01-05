
const AWS = require('aws-sdk');


exports.handler =  async function(event, context, callback) {
    const Name = '/Project/Service/AuthToken';
    const options = { endpoint: 'https://ssm.eu-west-2.amazonaws.com'};
    let response = {};

    try{
        console.log(`events: ${JSON.stringify(event)}`);
        const result = new AWS.SSM(options).getParameter({Name}).promise();
        console.log(`new AWS.SSM(options).getParameter({Name}).promise(): ${JSON.stringify(result)}`);
        var token = event.authorizationToken;
        console.log(`new token: ${JSON.stringify(token)}`);

        if(token === null){
            console.log(`token: null`);
            response = "Error: Token not defined"
        }
        if(token === '1234'){
            console.log(`token: allow`);
            response = generatePolicy('user', 'Allow', event.methodArn);
            console.log(`token: allow: response: ${JSON.stringify(response)}`);
        }else{
            console.log(`token: deny`);
            response = generatePolicy('user', 'Deny', event.methodArn);
            console.log(`token: deny: response: ${JSON.stringify(response)}`);
        }
    }catch(error){
        console.error(`Main function caught error: ${error}`);
    }
    
        console.log(`response: ${JSON.stringify(response)}`);

    return response;
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
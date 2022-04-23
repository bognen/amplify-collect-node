export type AmplifyDependentResourcesAttributes = {
    "auth": {
        "amplifycollectnode3d349a55": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string"
        }
    },
    "storage": {
        "s3questionpics": {
            "BucketName": "string",
            "Region": "string"
        }
    },
    "function": {
        "amplifyMainLambda": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "lambdaCollectQuestions": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "lambdaScanForPics": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    },
    "api": {
        "apiMainLambda": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        }
    }
}
import {
  App,
  Duration,
  Stack,
  StackProps,
  aws_lambda as lambda,
  aws_s3 as s3,
  aws_iam as iam,
  aws_apigateway as apiGW,
} from "aws-cdk-lib";

import * as dotenv from "dotenv";
dotenv.config();

export class LambdaStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id);
    const lambdaAuthBootstrapLocation = `${__dirname}/../../lambda/target/cdk/release/lambda_auth_bootstrap`;

    const lambdaAuthFunction = new lambda.Function(this, "lambdaAuthFunction", {
      description: "Lambda authorizer",
      runtime: lambda.Runtime.PROVIDED_AL2,
      handler: `${id}`,
      code: lambda.Code.fromAsset(lambdaAuthBootstrapLocation),
      memorySize: 256,
      timeout: Duration.seconds(10),
      environment: {
        LAMBDA_AUTH_TOKEN: process.env.LAMBDA_AUTH_TOKEN ?? "",
        LINE_CLIENT_ID: process.env.LINE_CLIENT_ID ?? "",
        LINE_CLIENT_SECRET: process.env.LINE_CLIENT_SECRET ?? "",
        S3_DOMAIN: process.env.S3_DOMAIN ?? "",
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      },
    });

    const lineAuthBootstrapLocation = `${__dirname}/../../lambda/target/cdk/release/line_auth_bootstrap`;

    const lineAuthFunction = new lambda.Function(this, "lineAuthFunction", {
      description: "lineAuth",
      runtime: lambda.Runtime.PROVIDED_AL2,
      handler: `${id}`,
      code: lambda.Code.fromAsset(lineAuthBootstrapLocation),
      memorySize: 256,
      timeout: Duration.seconds(10),
      tracing: lambda.Tracing.ACTIVE,
    });

    const api = new apiGW.RestApi(this, "lineAuthApi", {
      restApiName: "line auth service",
      defaultCorsPreflightOptions: {
        allowOrigins: apiGW.Cors.ALL_ORIGINS,
        allowMethods: ["POST", "OPTIONS"],
        statusCode: 200,
      },
    });

    const role = new iam.Role(this, "RestApiAuthHandlerRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    lambdaAuthFunction.grantInvoke(role);

    const policyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["sts:AssumeRole"],
      resources: ["*"],
    });
    const assumePolicy = new iam.Policy(this, "StsAssumeForApigateway");
    assumePolicy.addStatements(policyStatement);
    role.attachInlinePolicy(assumePolicy);

    const apiAuthorizer = new apiGW.CfnAuthorizer(this, "apiAuthorizer", {
      restApiId: api.restApiId,
      authorizerCredentials: role.roleArn,
      authorizerUri: `arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/${lambdaAuthFunction.functionArn}/invocations`,
      identitySource: "method.request.header.Authorization",
      name: "api-authorizer",
      type: "TOKEN",
    });

    const lineAuthIntegration = new apiGW.LambdaIntegration(lineAuthFunction, {
      proxy: false,
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Origin,Content-Type,Authorization'",
            "method.response.header.Access-Control-Allow-Methods":
              "'POST,OPTIONS'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
          },
          responseTemplates: {
            "application/json": '$input.json("$")',
          },
        },
      ],
      passthroughBehavior: apiGW.PassthroughBehavior.WHEN_NO_MATCH,
      requestTemplates: {
        "application/json": '{ "code": "$input.path(\'$\').code"}',
      },
    });

    const apiOrigin = api.root.addResource("api");
    const apiVersion = apiOrigin.addResource("v1");
    apiVersion.addMethod("POST", lineAuthIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
      authorizationType: apiGW.AuthorizationType.CUSTOM,
      authorizer: {
        authorizerId: apiAuthorizer.ref,
      },
    });
  }
}

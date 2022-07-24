import { App, DefaultStackSynthesizer } from "aws-cdk-lib";
import { LambdaStack } from "../lib/lambda-stack";
import { S3Stack } from "lib/s3-stack";
import * as pkg from "../package.json";

export default class LineAuthCdkStack {
  public lambdaStack: LambdaStack;
  public s3Stack: S3Stack;

  constructor(app: App) {
    this.lambdaStack = new LambdaStack(app, `${pkg.name}-Lambda-Stack`, {});
    this.s3Stack = new S3Stack(app, `${pkg.name}-S3-Stack`, {});
  }
}

const app = new App();
new LineAuthCdkStack(app);

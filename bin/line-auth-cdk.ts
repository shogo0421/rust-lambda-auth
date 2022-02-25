#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LineAuthCdkStack } from '../lib/line-auth-cdk-stack';

const app = new cdk.App();
new LineAuthCdkStack(app, 'LineAuthCdkStack');

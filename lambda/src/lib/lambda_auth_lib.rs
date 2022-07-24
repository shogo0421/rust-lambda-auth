use log::debug;
use serde_json::json;
use serde::{Deserialize, Serialize};
use lambda_runtime::Error;
use dotenv::dotenv;
use std::env;

// Lambdaが受け取るデータの型
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(non_snake_case)]
pub struct AuthorizerEvent {
    pub _type: String,
    pub authorization_token: String,
    pub method_arn: String,
  }

// Lambdaが出力するデータの型
#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
#[allow(non_snake_case)]
  pub struct PolicyOutput {
    pub principal_id: i64,
    pub policy_document: AuthorizerPolicyDocument,
    pub context:PolicyContext
  }


#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[allow(non_snake_case)]
  pub struct PolicyContext {
    authorizedUser: String
  }

#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[allow(non_snake_case)]
  pub struct AuthorizerPolicyDocument {
    Version: String,
    Statement: Vec<PolicyStatement>
  }

#[derive(Serialize, Deserialize, Debug, PartialEq)]  
#[allow(non_snake_case)]
struct PolicyStatement {
    Action: String,
    Effect: String,
    Resource: String
  }

struct Authorize{
    policy: PolicyOutput
}

impl Authorize{
    pub fn new(
        event: AuthorizerEvent,
        env_token: String
    ) -> Authorize{
        let policy_statement:PolicyStatement = PolicyStatement{
            Action: String::from("*"),
            Effect: match event.authorization_token {
              auth_token if auth_token == env_token => "Allow".to_string(),
              _ => "Deny".to_string()
            },
            Resource: event.method_arn.to_string(),
          };
      
        let user_id:String = String::from("my-user-id");
      
        let policy_output= PolicyOutput { principal_id: 1, policy_document: AuthorizerPolicyDocument{
            Version: String::from("2012-10-17"),
            Statement: vec![policy_statement]
        }, context: PolicyContext{authorizedUser:user_id} };
        
        Self{
          policy:policy_output,
        }
    }
}

pub async fn lambda_auth_handler(event: AuthorizerEvent, _: lambda::Context) -> Result<PolicyOutput, Error> {
    println!("lambda_auth_handler");
    dotenv().ok();
    debug!("Event: {}", json!(event));
    let lambda_auth_token = env::var("LAMBDA_AUTH_TOKEN").expect("LAMBDA_AUTH_TOKEN must be set");
    
    let output=Authorize::new(event,lambda_auth_token);
       
    Ok(output.policy)
}
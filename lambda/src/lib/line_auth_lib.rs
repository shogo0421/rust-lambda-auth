use serde_json::json;
use lambda_runtime::Error;
use serde_json::Value;
use serde::{Serialize,Deserialize};

pub async fn line_auth_handler(event: Value, _: lambda::Context) -> Result<Value, Error> {
  println!("line_auth_handler");


  #[derive(Serialize,Deserialize)]
  struct OAuthResp {
      access_token: String,
      token_type: String,
      refresh_token: String,
      expires_in: u32,
      scope: String,
      id_token: String
  }

  #[derive(Serialize, Deserialize)]
  #[serde(rename_all = "camelCase")]
  struct ProfileResp {
      user_id: String,
      display_name: String,
      picture_url: String,
    }

  let params = [
      ("grant_type", "authorization_code"),
      ("code", event["code"].as_str().unwrap_or("null")),
      ("redirect_uri", "(LAMBDA_ENDPOINT)"),
      ("client_id", "(Channel ID)"),
      ("client_secret", "(Channel secret)")
      ];

  let client = reqwest::Client::new();
  let auth_res_json = client.post("https://api.line.me/oauth2/v2.1/token")
      .header(reqwest::header::CONTENT_TYPE, "application/x-www-form-urlencoded")
      .form(&params)
      .header("Access-Control-Allow-Origin", "*")
      .send()
      .await?
      .json::<Value>().await?;

  Ok(json!(
    {
    "body": format!("{}", serde_json::to_string(&auth_res_json).unwrap())
  }
))
}
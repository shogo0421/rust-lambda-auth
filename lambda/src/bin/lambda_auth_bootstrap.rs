use lambda::handler_fn;
use lib::lambda_auth_lib::lambda_auth_handler;
use lambda_runtime::Error;

#[tokio::main]
async fn main() -> Result<(), Error> {
    println!("execute bootstrap#main in lambda_auth_bootstrap");
    let runtime_handler = handler_fn(lambda_auth_handler);
    lambda::run(runtime_handler).await?;
    Ok(())
}
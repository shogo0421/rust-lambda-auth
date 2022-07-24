use lambda::handler_fn;
use lib::line_auth_lib::line_auth_handler;
use lambda_runtime::Error;

#[tokio::main]
async fn main() -> Result<(), Error> {
    println!("execute bootstrap#main in line_auth_bootstrap");
    let runtime_handler = handler_fn(line_auth_handler);
    lambda::run(runtime_handler).await?;
    Ok(())
}
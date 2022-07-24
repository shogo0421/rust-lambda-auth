rustup target add x86_64-unknown-linux-musl
cargo build --release --target x86_64-unknown-linux-musl
mkdir -p ./target/cdk/release/lambda_auth_bootstrap
mkdir -p ./target/cdk/release/line_auth_bootstrap 
cp ./target/x86_64-unknown-linux-musl/release/lambda_auth_bootstrap ./target/cdk/release/lambda_auth_bootstrap/bootstrap
cp ./target/x86_64-unknown-linux-musl/release/line_auth_bootstrap ./target/cdk/release/line_auth_bootstrap/bootstrap
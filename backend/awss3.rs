use aws_sdk_s3::error::SdkError;
use aws_sdk_s3::operation::put_object::PutObjectError;
use aws_sdk_s3::primitives::{ByteStream, ByteStreamError};
use base64;
use base64::{engine::general_purpose::URL_SAFE, Engine as _};
use rand::prelude::*;
use std::fmt;

#[derive(Debug)]
pub enum S3ExampleError {
    S3Error(SdkError<PutObjectError>),
    IOError(std::io::Error),
    ByteStreamError(ByteStreamError),
}

impl fmt::Display for S3ExampleError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            S3ExampleError::S3Error(e) => write!(f, "S3 Error: {}", e),
            S3ExampleError::IOError(e) => write!(f, "IO Error: {}", e),
            S3ExampleError::ByteStreamError(e) => write!(f, "ByteStream Error: {}", e), // แสดงข้อความของ ByteStreamError
        }
    }
}

impl From<SdkError<PutObjectError>> for S3ExampleError {
    fn from(error: SdkError<PutObjectError>) -> Self {
        S3ExampleError::S3Error(error)
    }
}

impl From<std::io::Error> for S3ExampleError {
    fn from(error: std::io::Error) -> Self {
        S3ExampleError::IOError(error)
    }
}

impl From<ByteStreamError> for S3ExampleError {
    fn from(error: ByteStreamError) -> Self {
        S3ExampleError::ByteStreamError(error)
    }
}

pub fn generate_random_url(length: usize) -> String {
    let mut rng = thread_rng();
    let random_bytes: Vec<u8> = (0..length).map(|_| rng.gen()).collect();

    let random_url = URL_SAFE.encode(random_bytes);
    let trimmed_url = &random_url[..length];
    trimmed_url.to_string()
}
pub async fn to_encode(text: &String) -> String {
    URL_SAFE.encode(text)
}


pub async fn upload_object(
    client: &aws_sdk_s3::Client,
    bucket_name: &str,
    body: ByteStream,
    tierlist_name: &String,
) -> Result<String, S3ExampleError> {
    let mut custom_key = String::from("tomkaiscfrtierlist/");
    custom_key.push_str(&URL_SAFE.encode(tierlist_name.as_str()));
    custom_key.push_str("_");
    custom_key.push_str(&generate_random_url(10));
    client
        .put_object()
        .bucket(bucket_name)
        .key(custom_key.clone())
        .body(body)
        .content_type("image/png")
        .cache_control("public, max-age=31536000, immutable")
        .send()
        .await
        .map_err(S3ExampleError::from)?;

    let url = format!(
        "url(\"https://{}.s3.{}.amazonaws.com/{}\")",
        bucket_name, "ap-southeast-1", &custom_key
    );

    Ok(url)
}

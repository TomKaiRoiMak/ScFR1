//
//
//
//
use aws_sdk_s3 as s3;
use aws_sdk_s3::presigning::PresigningConfig;
use aws_sdk_s3::Client;
use axum::{
    extract::{DefaultBodyLimit, Extension, Multipart, Path, Query},
    response::Json,
    routing::{get, post},
    Router,
};
use chrono::offset;
use std::path::Path as path;
use std::{fmt::format, io::Write, time::SystemTime};
use std::{fs::File, vec};

use image::codecs::png::PngEncoder; //PngDecoder
use image::{ExtendedColorType, ImageEncoder, ImageReader};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::io::BufWriter;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tower_http::cors::{Any, CorsLayer};
use tower_http::limit::RequestBodyLimitLayer;

use fast_image_resize::images::Image;
use fast_image_resize::{PixelType, Resizer}; //IntoImageView
use std::io::Cursor;

mod awss3;

#[derive(Serialize, Deserialize, Debug)]
struct RankObject {
    id: String,
    origin: String,
    name: String,
    description: String,
    all_ranks: Vec<Rank>,
    remained_candidates: Vec<String>,
}
#[derive(Serialize, Deserialize, Debug)]
struct TemplateObject {
    id: String,
    name: String,
    description: String,
    all_ranks: Vec<Rank>,
    remained_candidates: Vec<String>,
}

#[derive(Deserialize, Serialize, Debug)]
struct Rank {
    rank: String,
    background_color: String,
    text_color: String,
    candidates: Vec<String>,
}

#[derive(Deserialize, Serialize, Debug)]
struct RankObjectQuery {
    origin: String,
}

#[derive(Deserialize, Serialize, Debug)]
struct GetLoadTemplate {
    limit: String,
    page: String,
}

async fn add_tierlist(
    Extension(conn): Extension<Arc<Mutex<Connection>>>,
    Json(rank_object): Json<RankObject>,
) -> Json<String> {
    let conn: std::sync::MutexGuard<'_, Connection> = conn.lock().unwrap();
    conn.execute(
        "INSERT INTO rank_objects (id, origin, name, description, remained_candidates) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            rank_object.id,
            rank_object.origin,
            rank_object.name,
            rank_object.description,
            serde_json::to_string(&rank_object.remained_candidates).unwrap()
        ],
    )
    .unwrap();

    println!("{:?}", &rank_object);
    for rank in rank_object.all_ranks {
        conn.execute(
            "INSERT INTO ranks (rank_object_id, rank_object_origin, rank, background_color, candidates, text_color) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                rank_object.id,
                rank_object.origin,
                rank.rank,
                rank.background_color,
                serde_json::to_string(&rank.candidates).unwrap(),
                rank.text_color,
            ],
        ).unwrap();
    }

    Json(rank_object.id)
}

async fn online() {
    println!("Bluetooth Device_s Connected Successfully");
}

async fn get_id_count(Extension(conn): Extension<Arc<Mutex<Connection>>>) -> Json<String> {
    let conn = conn.lock().unwrap();
    let mut stmt_count = conn.prepare("SELECT COUNT(id) FROM rank_objects").unwrap();
    let count: i32 = stmt_count.query_row([], |row| row.get(0)).unwrap();
    println!("{}", count.to_string());
    Json(count.to_string())
}

async fn get_rank_objects_by_id(
    Extension(conn): Extension<Arc<Mutex<Connection>>>,
    Path(id): Path<String>,
    Query(query): Query<RankObjectQuery>,
) -> Json<RankObject> {
    let conn = conn.lock().unwrap();
    ////////////////
    let mut stmt_count = conn.prepare("SELECT COUNT(id) FROM rank_objects").unwrap();
    let count: i32 = stmt_count.query_row([], |row| row.get(0)).unwrap();
    println!("Count of rank_objects: {}", count);
    //////////////
    let origin = query.origin;

    let mut stmt = conn
        .prepare("SELECT name, description, remained_candidates FROM rank_objects WHERE id = ?")
        .unwrap();
    let mut tierlist_objects = stmt
        .query_row(params![id], |row| {
            let name = row.get(0)?;
            println!("Name : {}", name);
            let description = row.get(1)?;
            println!("Description : {}", description);
            let tierlist_remained_candidates: String = row.get(2)?;
            Ok(RankObject {
                id: id.clone(),
                origin: origin.clone(),
                name,
                description,
                all_ranks: Vec::new(),
                remained_candidates: serde_json::from_str(&tierlist_remained_candidates)
                    .unwrap_or_else(|_| Vec::new()),
            })
        })
        .unwrap_or_else(|_| RankObject {
            id: id.clone(),
            origin: origin.clone(),
            name: String::from("Error"),
            description: String::from("Error"),
            all_ranks: Vec::new(),
            remained_candidates: Vec::new(),
        });
    let mut stmt = conn
        .prepare("SELECT rank, background_color, candidates, text_color FROM ranks WHERE rank_object_id = ?")
        .unwrap();

    let ranks_iter = stmt
        .query_map([id], |row| {
            let rank: String = row.get(0)?;
            let background_color: String = row.get(1)?;
            let candidates: String = row.get(2)?;
            let text_color: String = row.get(3)?;
            Ok(Rank {
                rank,
                background_color,
                candidates: serde_json::from_str(&candidates).unwrap_or_else(|_| Vec::new()),
                text_color,
            })
        })
        .unwrap();

    for rank in ranks_iter {
        tierlist_objects.all_ranks.push(rank.unwrap());
    }

    println!("{:?}", Json(&tierlist_objects));
    Json(tierlist_objects)
}

async fn get_client() -> Result<Client, s3::Error> {
    let config = aws_config::load_from_env().await;
    let client = s3::Client::new(&config);
    Ok(client)
}
async fn get_object(
    client: &Client,
    bucket: &str,
    object: &str,
    expires_in: u64,
) -> Result<(), Box<dyn Error>> {
    let expires_in = Duration::from_secs(expires_in);
    let presigned_request = client
        .get_object()
        .bucket(bucket)
        .key(object)
        .presigned(PresigningConfig::expires_in(expires_in)?)
        .await?;

    println!("Object URI: {}", presigned_request.uri());
    let valid_until = chrono::offset::Local::now() + expires_in;
    println!("Valid until: {valid_until}");

    Ok(())
}

async fn add_template(
    Extension(conn): Extension<Arc<Mutex<Connection>>>,
    mut multipart: Multipart,
) {
    let mut description: String = String::from("");
    let mut tierlist_name: String = String::from("");
    let mut rank_object = TemplateObject {
        id: String::new(),
        name: String::new(),
        description: String::new(),
        all_ranks: Vec::new(),
        remained_candidates: Vec::new(),
    };
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();
        match name.as_str() {
            "name" => {
                let tierlist_name_temp = field.bytes().await.unwrap();
                tierlist_name = String::from_utf8_lossy(&tierlist_name_temp).into_owned();
            }
            "description" => {
                let description_temp = field.bytes().await.unwrap();
                description = String::from_utf8_lossy(&description_temp).into_owned();
            }
            "rankObject" => {
                let rankobject_temp = field.bytes().await.unwrap();

                let rank_object_pre = String::from_utf8_lossy(&rankobject_temp).into_owned();
                rank_object = serde_json::from_str(&rank_object_pre).unwrap();
            }
            "candidates" => {
                let src_image = field.bytes().await.unwrap();
                let image = ImageReader::new(Cursor::new(&src_image))
                    .with_guessed_format()
                    .unwrap()
                    .decode()
                    .unwrap();
                let rgb_image = image.clone().into_rgba8();
                let (rgb_image_width, rgb_image_height) = rgb_image.clone().dimensions();
                //println!("{:?},{:?}", rgb_image_width, rgb_image_height);

                let pre_image = Image::from_vec_u8(
                    rgb_image_width,
                    rgb_image_height,
                    rgb_image.clone().into_raw(),
                    PixelType::U8x4,
                )
                .unwrap();
                //print!("{:?}",pre_image);
                //println!("{:?}",rgb_image.into_raw());
                let dst_width = 300;
                let dst_height = 300;

                let mut dst_image = Image::new(dst_width, dst_height, pre_image.pixel_type());
                let mut resizer = Resizer::new();
                resizer.resize(&pre_image, &mut dst_image, None).unwrap();

                let mut result_buf = BufWriter::new(Vec::new());
                PngEncoder::new(&mut result_buf)
                    .write_image(
                        dst_image.buffer(),
                        dst_width,
                        dst_height,
                        ExtendedColorType::Rgba8,
                    )
                    .unwrap();
                //println!("{:?}", result_buf);
                let png_data = result_buf.into_inner().unwrap();
                //println!("{:?}",png_data);
                let file_name = "candidate.png";

                let mut file = File::create(path::new(file_name)).unwrap();
                file.write_all(&png_data).unwrap();

                println!("Saved image to: {}", file_name);
                let client = get_client().await.unwrap();
                let body = aws_sdk_s3::primitives::ByteStream::from(png_data);
                let url = awss3::upload_object(&client, "tomkaiscfr", body, &tierlist_name)
                    .await
                    .unwrap();
                rank_object.remained_candidates.push(url.clone());
                println!("{:?}", rank_object.remained_candidates);
            }
            _ => {
                print!("No case Add_template!")
            }
        }
    }
    let url_name = awss3::to_encode(&tierlist_name).await;
    let unique_id: String = awss3::generate_random_url(5);
    let id = format!("{}_{}", url_name, unique_id);
    rank_object.id = id;
    rank_object.name = tierlist_name.clone();
    rank_object.description = description.clone();
    println!("{:?}", rank_object);
    println!("{}", tierlist_name);
    println!("{}", description);
    template_handler(Extension(conn), rank_object).await;
}
async fn template_handler(
    Extension(conn): Extension<Arc<Mutex<Connection>>>,
    template: TemplateObject,
) {
    println!("Template : {:?}", template.remained_candidates);
    let conn = conn.lock().unwrap();
    let remained_candidates_json = serde_json::to_string(&template.remained_candidates).unwrap();
    println!("Remained Candidates JSON: {:?}", remained_candidates_json);

    let result = conn.execute(
        "INSERT INTO template_objects (id, name, description, remained_candidates) VALUES (?1, ?2, ?3, ?4)",
        params![template.id, template.name, template.description, remained_candidates_json],
    );
    match result {
        Ok(rows) => println!("Inserted {} rows", rows),
        Err(e) => println!("Error: {:?}", e),
    }

    for template_ranks in template.all_ranks {
        conn.execute(
            "INSERT INTO template_ranks (template_objects_id, template_rank, background_color, text_color) VALUES (?1, ?2, ?3, ?4)",
            params![
                template.id, template_ranks.rank, template_ranks.background_color, template_ranks.text_color
            ],
        ).unwrap();
    }
}

async fn load_template_object(
    Extension(conn): Extension<Arc<Mutex<Connection>>>,
    Path(template_id): Path<String>,
) -> Json<RankObject> {
    let conn = conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT name, description, remained_candidates FROM template_objects WHERE id = ?")
        .unwrap();
    let mut template_object = stmt
        .query_row(params![template_id], |row| {
            let name: String = row.get(0)?;
            let description = row.get(1)?;
            let remained_candidates: String = row.get(2)?;
            Ok(RankObject {
                id: template_id.clone(),
                origin: template_id.clone(),
                name,
                description,
                all_ranks: Vec::new(),
                remained_candidates: serde_json::from_str(&remained_candidates)
                    .unwrap_or_else(|_| Vec::new()),
            })
        })
        .unwrap_or_else(|_| RankObject {
            id: "error".to_string(),
            origin: "error".to_string(),
            name: "error or not found".to_string(),
            description: "error, but you can still load tierlist by unique id 😉".to_string(),
            all_ranks: Vec::new(),
            remained_candidates: Vec::new(),
        });

    let mut stmt = conn.prepare("SELECT template_rank, background_color, text_color FROM template_ranks WHERE template_objects_id = ?").unwrap();

    let template_ranks = stmt
        .query_map(params![template_id.clone()], |row| {
            let template_ranks = row.get(0)?;
            let background_color = row.get(1)?;
            let text_color = row.get(2)?;

            Ok(Rank {
                rank: template_ranks,
                background_color,
                text_color,
                candidates: Vec::new(),
            })
        })
        .unwrap();
    for rank in template_ranks {
        template_object.all_ranks.push(rank.unwrap());
    }
    Json(template_object)
}

async fn browse_template(
    Extension(conn): Extension<Arc<Mutex<Connection>>>,
    Query(query): Query<GetLoadTemplate>,
) -> String {
    let limit: String = query.limit;
    let page: String = query.page;
    let limit_int: u16 = limit.parse().expect("limit, Not a valid Number");
    let page_int: u16 = page.parse().expect("page, Not a valid Number");
    let offset: u16 = (page_int - 1) * limit_int;
    let conn = conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, name FROM template_objects ORDER BY created_at LIMIT ? OFFSET ?")
        .unwrap();
    let templates: Vec<(String, String)> = stmt
        .query_map(params![limit, offset], |row| Ok((row.get(0)?, row.get(1)?)))
        .unwrap()
        .filter_map(Result::ok)
        .collect();

    println!("{:?}", templates);
    serde_json::to_string(&templates).unwrap_or_else(|_| String::from("Error"))
}

#[tokio::main]
async fn main() {
    let conn: Arc<Mutex<Connection>> =
        Arc::new(Mutex::new(Connection::open("my_database.db").unwrap()));
    conn.lock()
        .unwrap()
        .execute(
            "CREATE TABLE IF NOT EXISTS rank_objects (
            id TEXT PRIMARY KEY,
            origin TEXT,
            name TEXT,
            description TEXT,
            remained_candidates TEXT,
            FOREIGN KEY (origin) REFERENCES template_objects (id)
        );
        ",
            [],
        )
        .unwrap();
    conn.lock()
        .unwrap()
        .execute(
            "CREATE TABLE IF NOT EXISTS ranks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rank_object_id TEXT, 
            rank_object_origin TEXT,
            rank TEXT NOT NULL,          
            background_color TEXT NOT NULL,  
            candidates TEXT NOT NULL,
            text_color TEXT NOT NULL,      
            FOREIGN KEY (rank_object_id) REFERENCES rank_objects (id)
        )",
            [],
        )
        .unwrap();
    conn.lock()
        .unwrap()
        .execute(
            "CREATE TABLE IF NOT EXISTS template_objects (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            remained_candidates TEXT NOT NULL,
            created_at TEXT DEFAULT (DATETIME('now'))
        );
        ",
            [],
        )
        .unwrap();
    conn.lock()
        .unwrap()
        .execute(
            "CREATE TABLE IF NOT EXISTS template_ranks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_objects_id TEXT, 
                template_rank TEXT NOT NULL,          
                background_color TEXT NOT NULL,  
                text_color TEXT NOT NULL,      
                FOREIGN KEY (template_objects_id) REFERENCES template_objects (id)
            )",
            [],
        )
        .unwrap();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/online", get(online))
        .route("/addTierList", post(add_tierlist))
        .route("/loadRankObjects/:id", get(get_rank_objects_by_id))
        .route("/get_id_count", get(get_id_count))
        .route("/browseTemplate", get(browse_template))
        .route("/loadTemplateObject/:templateId", get(load_template_object))
        .route("/addTemplate", post(add_template))
        .layer(DefaultBodyLimit::disable())
        .layer(RequestBodyLimitLayer::new(
            250 * 1024 * 1024, /* 250mb */
        ))
        .layer(tower_http::trace::TraceLayer::new_for_http())
        .layer(cors)
        .layer(Extension(conn));

    let addr = SocketAddr::from(([0, 0, 0, 0], 4000));
    println!("Listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

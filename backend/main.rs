//
//
//
//
//
//
//
//
//
//
//
use axum::{
    extract::{Extension, Path},
    response::Json,
    routing::{get, post},
    Router,
};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use tower_http::cors::{Any, CorsLayer};

#[derive(Serialize, Deserialize, Debug)]
struct RankObject {
    id: String,
    all_ranks: Vec<Rank>,
    remained_candidates: Vec<String>,
}

#[derive(Deserialize, Serialize, Debug)]
struct Rank {
    rank: String,
    background_color: String,
    candidates: Vec<String>,
}

async fn add_tierlist(
    Extension(conn): Extension<Arc<Mutex<Connection>>>,
    Json(rank_object): Json<RankObject>,
) -> Json<String> {
    println!("Received: {:?}", rank_object);

    let conn = conn.lock().unwrap();

    conn.execute(
        "INSERT INTO rank_objects (id, remained_candidates) VALUES (?1, ?2)",
        params![
            rank_object.id,
            serde_json::to_string(&rank_object.remained_candidates).unwrap()
        ],
    )
    .unwrap();

    for rank in rank_object.all_ranks {
        conn.execute(
            "INSERT INTO ranks (rank_object_id, rank, background_color, candidates) VALUES (?1, ?2, ?3, ?4)",
            params![
                rank_object.id,
                rank.rank,
                rank.background_color,
                serde_json::to_string(&rank.candidates).unwrap(),
            ],
        ).unwrap();
    }

    Json(rank_object.id)
}

async fn online(Extension(conn): Extension<Arc<Mutex<Connection>>>) -> Json<String> {
    let connection = conn.lock().unwrap();
    println!("Bluetooth Device_s Connected Successfully");
    match connection.execute("SELECT 1", []) {
        Ok(_) => Json("Server is online".to_string()),
        Err(_) => Json("Server is Offine".to_string()),
    }
}

async fn get_rank_objects(
    Extension(conn): Extension<Arc<Mutex<Connection>>>,
) -> Json<Vec<RankObject>> {
    let conn = conn.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT id, remained_candidates FROM rank_objects")
        .unwrap();

    let rank_objects_iter = stmt
        .query_map([], |row| {
            let id: String = row.get(0)?;
            let remained_candidates: String = row.get(1)?;
            Ok(RankObject {
                id,
                all_ranks: Vec::new(),
                remained_candidates: serde_json::from_str(&remained_candidates)
                    .unwrap_or_else(|_| Vec::new()),
            })
        })
        .unwrap();

    let mut rank_objects = Vec::new();

    for rank_object in rank_objects_iter {
        let mut rank_object = rank_object.unwrap();

        let mut stmt = conn
            .prepare(
                "SELECT rank, background_color, candidates FROM ranks WHERE rank_object_id = ?",
            )
            .unwrap();
        let ranks_iter = stmt
            .query_map(params![rank_object.id], |row| {
                let rank: String = row.get(0)?;
                let background_color: String = row.get(1)?;
                let candidates: String = row.get(2)?;

                Ok(Rank {
                    rank,
                    background_color,
                    candidates: serde_json::from_str(&candidates).unwrap_or_else(|_| Vec::new()),
                })
            })
            .unwrap();

        for rank in ranks_iter {
            rank_object.all_ranks.push(rank.unwrap());
        }

        rank_objects.push(rank_object);
    }

    Json(rank_objects)
}

async fn get_rank_objects_by_id(
    Extension(conn): Extension<Arc<Mutex<Connection>>>,
    Path(id): Path<String>,
) -> Json<RankObject> {
    let conn = conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, remained_candidates FROM rank_objects WHERE id = ?")
        .unwrap();
    let mut tierlist_objects = stmt
        .query_row(params![id], |row| {
            let tierlist_id: String = row.get(0)?;
            let tierlist_remained_candidates: String = row.get(1)?;
            Ok(RankObject {
                id: tierlist_id,
                all_ranks: Vec::new(),
                remained_candidates: serde_json::from_str(&tierlist_remained_candidates)
                    .unwrap_or_else(|_| Vec::new()),
            })
        })
        .unwrap_or_else(|_| RankObject {
            id: id.clone(),
            all_ranks: Vec::new(),
            remained_candidates: Vec::new(),
        });

    let mut stmt = conn
        .prepare("SELECT rank, background_color, candidates FROM ranks WHERE rank_object_id = ?")
        .unwrap();

    let ranks_iter = stmt
        .query_map(params![id], |row| {
            let rank: String = row.get(0)?;
            let background_color: String = row.get(1)?;
            let candidates: String = row.get(2)?;
            Ok(Rank {
                rank,
                background_color,
                candidates: serde_json::from_str(&candidates).unwrap_or_else(|_| Vec::new()),
            })
        })
        .unwrap();
    for rank in ranks_iter {
        tierlist_objects.all_ranks.push(rank.unwrap());
    }

    println!("{:?}", Json(&tierlist_objects));
    Json(tierlist_objects)
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
            remained_candidates TEXT
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
                rank TEXT NOT NULL,          
                background_color TEXT NOT NULL,  
                candidates TEXT NOT NULL,      
                FOREIGN KEY (rank_object_id) REFERENCES rank_objects (id)
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
        .route("/rankObjects", get(get_rank_objects))
        .route("/loadRankObjects/:id", get(get_rank_objects_by_id))
        .layer(cors)
        .layer(Extension(conn));

    let addr = SocketAddr::from(([0, 0, 0, 0], 4000));
    println!("Listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

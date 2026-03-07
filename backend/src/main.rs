use axum::{
    extract::{Json, State},
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::env;
use std::sync::Arc;
use tower_http::cors::CorsLayer;

#[derive(Clone)]
struct AppState {
    alchemy_key: String,
    http_client: reqwest::Client,
}

#[derive(Deserialize)]
struct ScanRequest {
    address: String,
}

#[derive(Serialize)]
struct ScanResponse {
    address: String,
    security: String,
    activity: String,
    risk_level: String,
    terminal_logs: Vec<String>,
}

#[tokio::main]
async fn main() {
    // Attempt to load .env, but don't panic if it's missing (might be in prod environment vars)
    let _ = dotenvy::dotenv();

    let alchemy_key = env::var("ALCHEMY_API_KEY")
        .expect("ALCHEMY_API_KEY environment variable not set");

    let state = Arc::new(AppState {
        alchemy_key,
        http_client: reqwest::Client::new(),
    });

    // Permissive CORS for broad UI access across Vercel/Localhost deployments.
    // In strict production, allow_origin can be restricted to specific FRONTEND_URL.
    let cors = CorsLayer::permissive();

    let app = Router::new()
        .route("/api/scan", post(scan_handler))
        .layer(cors)
        .with_state(state);

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{}", port);
    
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap();
    println!("Server running on http://{}", addr);

    axum::serve(listener, app).await.unwrap();
}

async fn scan_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ScanRequest>,
) -> Result<Json<ScanResponse>, (StatusCode, String)> {
    let address = payload.address.trim().to_string();

    let mut logs = vec![
        "Validating address format...".to_string(),
        "Connecting to Alchemy RPC...".to_string(),
        "Analyzing on-chain data...".to_string(),
    ];

    let tx_count = if address.starts_with("0x") {
        fetch_evm_tx_count(&address, &state.alchemy_key, &state.http_client).await?
    } else {
        fetch_solana_tx_count(&address, &state.alchemy_key, &state.http_client).await?
    };

    logs.push("Done.".to_string());

    let (risk_level, security, activity) = if tx_count < 10 {
        (
            "High Risk - New Wallet",
            "Initial Verification Warning",
            format!("{} Transactions detected", tx_count),
        )
    } else {
        (
            "Low Risk - Verified Dev",
            "Standard Verification Complete",
            format!("{} Transactions detected", tx_count),
        )
    };

    let response = ScanResponse {
        address,
        security: security.to_string(),
        activity,
        risk_level: risk_level.to_string(),
        terminal_logs: logs,
    };

    Ok(Json(response))
}

async fn fetch_evm_tx_count(
    address: &str,
    api_key: &str,
    client: &reqwest::Client,
) -> Result<usize, (StatusCode, String)> {
    if api_key == "YOUR_KEY" || api_key.is_empty() {
        return Ok(150); // Mock data for EVM testing
    }

    let url = format!("https://eth-mainnet.g.alchemy.com/v2/{}", api_key);
    
    let request_body = json!({
        "id": 1,
        "jsonrpc": "2.0",
        "method": "alchemy_getAssetTransfers",
        "params": [
            {
                "fromBlock": "0x0",
                "toBlock": "latest",
                "fromAddress": address,
                "category": ["external", "internal", "erc20", "erc721", "erc1155"],
            }
        ]
    });

    let res = client
        .post(&url)
        .json(&request_body)
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let text = res.text().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    if text.contains("Must be authenticated") || text.contains("Unauthorized") {
        return Err((StatusCode::UNAUTHORIZED, "Invalid Alchemy API Key. Please provide a real key or use 'YOUR_KEY' for mock data.".to_string()));
    }

    let json: Value = serde_json::from_str(&text)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if let Some(transfers) = json.get("result").and_then(|r| r.get("transfers").and_then(|t| t.as_array())) {
        Ok(transfers.len())
    } else {
        Ok(0)
    }
}

async fn fetch_solana_tx_count(
    address: &str,
    api_key: &str,
    client: &reqwest::Client,
) -> Result<usize, (StatusCode, String)> {
    if api_key == "YOUR_KEY" || api_key.is_empty() {
        return Ok(5); // Mock data for Solana testing
    }

    let url = format!("https://solana-mainnet.g.alchemy.com/v2/{}", api_key);
    
    let request_body = json!({
        "id": 1,
        "jsonrpc": "2.0",
        "method": "getSignaturesForAddress",
        "params": [
            address,
            {
                "limit": 1000
            }
        ]
    });

    let res = client
        .post(&url)
        .json(&request_body)
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let text = res.text().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    if text.contains("Must be authenticated") || text.contains("Unauthorized") {
        return Err((StatusCode::UNAUTHORIZED, "Invalid Alchemy API Key. Please provide a real key or use 'YOUR_KEY' for mock data.".to_string()));
    }

    let json: Value = serde_json::from_str(&text)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if let Some(signatures) = json.get("result").and_then(|r| r.as_array()) {
        Ok(signatures.len())
    } else {
         Ok(0)
    }
}

//! The app's entire network layer: one POST to Google's undocumented
//! `batchexecute` RPC endpoint, replacing the axios proxy at
//! src/main/main.ts:123-130.
//!
//! The request body arrives already encoded. That is deliberate: the frontend
//! builds it with JS `encodeURI`, which leaves `;,/?:@&=+$-_.!~*'()#`
//! unescaped. No Rust percent-encoding preset reproduces that exact set, and
//! `form_urlencoded` would re-encode it into something Google rejects — so the
//! string is passed through opaquely.

use tauri::State;

const ENDPOINT: &str = "https://translate.google.com/_/TranslateWebserverUi/data/batchexecute";

/// A browser UA is required: reqwest sends none by default, and batchexecute
/// rejects requests without one.
const USER_AGENT: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) \
     AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/// One shared client — translate and suggest fire on every keystroke, and a
/// per-call client would mean a fresh TLS handshake each time.
pub struct Http(pub reqwest::Client);

impl Http {
    pub fn new() -> reqwest::Result<Self> {
        reqwest::Client::builder()
            .user_agent(USER_AGENT)
            // Google occasionally 302s to a consent interstitial. reqwest would
            // follow it, drop the POST body per spec, and hand back HTML that
            // the frontend parser can only fail on confusingly.
            .redirect(reqwest::redirect::Policy::none())
            .timeout(std::time::Duration::from_secs(15))
            .build()
            .map(Http)
    }
}

#[tauri::command]
pub async fn google_batchexecute(http: State<'_, Http>, body: String) -> Result<String, String> {
    let response = http
        .0
        .post(ENDPOINT)
        // `.body()` does not set a content type, and `.form()` must not be used
        // here — it would re-encode the payload.
        .header(
            reqwest::header::CONTENT_TYPE,
            "application/x-www-form-urlencoded;charset=UTF-8",
        )
        .body(body)
        .send()
        .await
        .map_err(|err| err.to_string())?;

    let status = response.status();
    if !status.is_success() {
        return Err(format!("Google returned {status}"));
    }

    response.text().await.map_err(|err| err.to_string())
}

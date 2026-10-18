//! The app's network layer: Google's undocumented translation RPC and
//! structured dictionary endpoints.
//!
//! The request body arrives already encoded. That is deliberate: the frontend
//! builds it with JS `encodeURI`, which leaves `;,/?:@&=+$-_.!~*'()#`
//! unescaped. No Rust percent-encoding preset reproduces that exact set, and
//! `form_urlencoded` would re-encode it into something Google rejects — so the
//! string is passed through opaquely.

use tauri::State;

const ENDPOINT: &str = "https://translate.google.com/_/TranslateWebserverUi/data/batchexecute";
const DICTIONARY_ENDPOINT: &str = "https://translate.google.com/translate_a/single";

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

fn validate_dictionary_query(text: &str, from: &str, to: &str) -> Result<(), String> {
    if text.trim().is_empty() || text.chars().count() > 200 {
        return Err("Dictionary text must contain 1 to 200 characters".into());
    }
    for language in [from, to] {
        if language.is_empty()
            || language.len() > 32
            || !language
                .bytes()
                .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-')
        {
            return Err("Invalid dictionary language code".into());
        }
    }
    Ok(())
}

impl Http {
    async fn dictionary(&self, text: &str, from: &str, to: &str) -> Result<String, String> {
        validate_dictionary_query(text, from, to)?;

        let response = self
            .0
            .get(DICTIONARY_ENDPOINT)
            .query(&[
                ("client", "gtx"),
                ("sl", from),
                ("tl", to),
                ("dj", "1"),
                ("q", text),
                ("dt", "t"),
                ("dt", "bd"),
                ("dt", "md"),
                ("dt", "ex"),
                ("dt", "ss"),
                ("dt", "at"),
            ])
            .send()
            .await
            .map_err(|err| err.without_url().to_string())?;

        let status = response.status();
        if !status.is_success() {
            return Err(format!("Google dictionary returned {status}"));
        }
        let is_html = response
            .headers()
            .get(reqwest::header::CONTENT_TYPE)
            .and_then(|value| value.to_str().ok())
            .map(|value| value.to_ascii_lowercase().contains("text/html"))
            .unwrap_or(false);
        let body = response
            .text()
            .await
            .map_err(|err| err.without_url().to_string())?;
        if is_html || body.trim_start().starts_with('<') {
            return Err("Google dictionary returned an HTML page".into());
        }
        Ok(body)
    }
}

#[tauri::command]
pub async fn google_dictionary(
    http: State<'_, Http>,
    text: String,
    from: String,
    to: String,
) -> Result<String, String> {
    http.dictionary(&text, &from, &to).await
}

#[cfg(test)]
mod tests {
    use super::{validate_dictionary_query, Http};

    #[test]
    fn dictionary_query_counts_unicode_characters() {
        assert!(validate_dictionary_query(&"字".repeat(200), "auto", "zh-CN").is_ok());
        assert!(validate_dictionary_query(&"字".repeat(201), "en", "it").is_err());
        assert!(validate_dictionary_query(" \n\t", "en", "it").is_err());
        assert!(validate_dictionary_query("", "en", "it").is_err());
    }

    #[test]
    fn dictionary_query_rejects_invalid_language_codes() {
        for language in ["", "en&dt=other", "en_US", "é", " en", &"a".repeat(33)] {
            assert!(validate_dictionary_query("run", language, "it").is_err());
            assert!(validate_dictionary_query("run", "en", language).is_err());
        }
        assert!(validate_dictionary_query("run", &"a".repeat(32), "pt-BR").is_ok());
    }

    #[test]
    #[ignore = "requires a live Google Translate request"]
    fn live_dictionary_returns_rich_cards() {
        tauri::async_runtime::block_on(async {
            let http = Http::new().expect("HTTP client should initialize");
            let body = http
                .dictionary("run", "en", "it")
                .await
                .expect("native dictionary request should succeed");
            let data: serde_json::Value =
                serde_json::from_str(&body).expect("dictionary response should be JSON");
            for field in ["dict", "definitions", "synsets"] {
                assert!(
                    data[field]
                        .as_array()
                        .is_some_and(|items| !items.is_empty()),
                    "dictionary response should contain nonempty {field}"
                );
            }
            assert!(
                data["examples"]["example"]
                    .as_array()
                    .is_some_and(|items| !items.is_empty()),
                "dictionary response should contain usage examples"
            );
        });
    }
}

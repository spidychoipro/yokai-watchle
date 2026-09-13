import sys, json, base64, urllib.parse, urllib.request, os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "namu")
os.makedirs(OUT_DIR, exist_ok=True)

UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
}

def get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, r.read()

def fetch_raw_w(title):
    enc = urllib.parse.quote(title, safe="/")
    yield f"https://api.namu.wiki/documents/{enc}"
    yield f"https://api.namu.wiki/raw/{enc}"
    yield f"https://api.namu.wiki/v2/documents/{enc}"
    yield f"https://namu.wiki/raw/{enc}"

def main():
    title = sys.argv[1]
    slug = title.replace("/", "_").replace(" ", "_")
    out_path = os.path.join(OUT_DIR, slug + ".txt")
    for url in fetch_raw_w(title):
        try:
            status, body = get(url)
            text = body.decode("utf-8", errors="replace")
            print(f"[{url}] status={status} len={len(text)}")
            head = text[:120].replace("\n", " ")
            print("   head:", head)
            if "Loading" in text[:200] or "namu" in text.lower() and len(text) < 800:
                continue
            if url.endswith("documents") or "/documents/" in url:
                try:
                    j = json.loads(text)
                    d = j.get("data", {})
                    t = d.get("text") or d.get("raw") or ""
                    if t:
                        if t.startswith("TEXT_HASH:"):
                            continue
                        text = t
                except Exception as e:
                    print("   json err", e)
            if text.lstrip().startswith("<!doctype") or text.lstrip().startswith("<html"):
                print("   html shell, skip")
                continue
            if "Loading" in text[:200]:
                print("   loading shell, skip")
                continue
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(text)
            print("   SAVED ->", out_path)
            return
        except Exception as e:
            print(f"[{url}] ERR {e}")
    print("ALL endpoints failed for", title)
    sys.exit(1)

if __name__ == "__main__":
    main()
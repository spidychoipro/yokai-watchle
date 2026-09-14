import re, json, sys, time, urllib.request

PAGES = {
    "ykw1": "List_of_Yo-kai_by_Medallium_Number_(Yo-kai_Watch)",
    "ykw2": "List_of_Yo-kai_by_Medallium_Number_(Yo-kai_Watch_2)",
    "ykw3": "List_of_Yo-kai_by_Medallium_Number_(Yo-kai_Watch_3)",
    "blasters": "List_of_Yo-kai_by_Medallium_Number_(Yo-kai_Watch_Blasters)",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/plain,text/html,application/json,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://yokaiwatch.fandom.com/wiki/Main_Page",
    "Origin": "https://yokaiwatch.fandom.com",
    "Connection": "keep-alive",
}

def fetch_raw(title):
    import urllib.parse
    url = "https://yokaiwatch.fandom.com/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&titles=" + urllib.parse.quote(title)
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", errors="replace")

def main(fetch):
    out = {}
    for key, title in PAGES.items():
        if fetch:
            txt = fetch_raw(title)
            path = f"data/raw/{key}.fandom.txt"
            open(path, "w", encoding="utf-8").write(txt)
            print(f"- saved {key} -> {path} ({len(txt)} chars)")
        else:
            txt = open(f"data/raw/{key}.fandom.txt", encoding="utf-8").read()
        out[key] = txt
        time.sleep(2)
    json.dump(out, open("data/raw/fandom_raw.json", "w", encoding="utf-8"), ensure_ascii=False)
    print("done")

if __name__ == "__main__":
    main(fetch=("--fetch" in sys.argv))
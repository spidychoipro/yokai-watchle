import re, glob, json, sys, os

sys.stdout.reconfigure(encoding='utf-8')

DIR = r'C:\Users\swpar\.local\share\opencode\tool-output'
SEP = re.compile(r'\[([^\]]*)\]\(#s-([^)]*)\)')
LINK = re.compile(r'\[([^\]]*)\]\(\/w\/[^)]*\)')
PAREN = re.compile(r'\(([^()]*)\)')
LATIN = re.compile(r"^[A-Za-z][A-Za-z0-9 .'&!?,/()#:-]{1,45}$")
STRIP_MARK = re.compile(r'[\s]*[Ⓡⓐⓓ☆ⓛⓀ][\s]*$')
KO_EN = re.compile(r'\s*\([^()]*[A-Za-z][^()]*\)\s*$')

def strip_links(s):
    return LINK.sub(r'\1', s)

def clean_ko(s):
    s = re.sub(STRIP_MARK, '', s).strip()
    s = re.sub(KO_EN, '', s).strip()
    return s

def extract_en(s):
    for p in PAREN.findall(s):
        for seg in p.split(','):
            seg = seg.strip()
            if LATIN.match(seg):
                return seg
    return None

def is_namu(path):
    try:
        t = open(path, encoding='utf-8').read()
    except Exception:
        return False
    return ('namu.wiki' in t) or ('나무위키' in t) or ('요괴워치' in t)

files = [f for f in glob.glob(os.path.join(DIR, 'tool_*')) if is_namu(f)]
print('namu files:', len(files))

all_pairs = []
per_src = {}
skipped = []

for path in files:
    t = open(path, encoding='utf-8').read()
    m = re.search(r'#\s*\[([^\]]*)\]\(\/w\/', t)
    title = m.group(1) if m else os.path.basename(path)
    idm = re.search(r'([^\s\[\]]+)\s*:\s*([^\n]+)', t[:2000])
    parts = SEP.split(t)
    segs = []
    i = 1
    while i < len(parts) - 1:
        segs.append(parts[i + 2])
        i += 3
    src_count_ko = 0
    for idx, content in enumerate(segs):
        c = content.strip()
        if not c or ' / ' not in c:
            continue
        c = c.lstrip('. ')
        cc = strip_links(c)
        toks = [p.strip() for p in re.split(r'\s+/\s+', cc)]
        if len(toks) < 2:
            continue
        if any(x in c for x in ('http', 'rfn-', 'CC BY', 'licen', 'namu.wiki', '수정 시각')):
            continue
        jp = toks[0]
        ko = clean_ko(toks[1])
        rest = ' '.join(toks[1:])
        en = extract_en(cc)
        if not en or len(en) > 45 or len(ko) > 40:
            skipped.append((title, c[:80]))
            continue
        all_pairs.append({'en': en, 'ko': ko, 'src': title, 'jp': jp})
        src_count_ko += 1
    per_src[title] = src_count_ko
    print(f'{title:20s} ko+en={src_count_ko:4d}  segs={len(segs)}')

from collections import Counter
dup = Counter(p['en'] for p in all_pairs)
dups = {k: v for k, v in dup.items() if v > 1}
print('total pairs:', len(all_pairs))
print('dup en names:', len(dups))
for k in list(dups)[:40]:
    rows = [p for p in all_pairs if p['en'] == k]
    print('  ', k, '->', [(r['ko'], r['src']) for r in rows])

print('\nskipped (en 없음):', len(skipped))
for s in skipped[:60]:
    print('  ', s[0], '|', s[1])

out = {'pairs': all_pairs, 'notes': []}
with open('data/out/kr_pairs2.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print('\nwritten data/out/kr_pairs2.json')
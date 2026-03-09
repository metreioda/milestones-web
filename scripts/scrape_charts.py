#!/usr/bin/env python3
"""
Scrape Wikipedia pour les singles #1 en France (1984-2025) et USA/Billboard (1958-2025).
Génère data/charts-fr.json et data/charts-us.json

Usage: python3 scripts/scrape_charts.py
"""

import json, re, time, urllib.request, os, sys
from datetime import datetime, timedelta

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

MONTHS_FR = {
    "janvier":1,"février":2,"mars":3,"avril":4,"mai":5,"juin":6,
    "juillet":7,"août":8,"septembre":9,"octobre":10,"novembre":11,"décembre":12
}
MONTHS_EN = {
    "january":1,"february":2,"march":3,"april":4,"may":5,"june":6,
    "july":7,"august":8,"september":9,"october":10,"november":11,"december":12
}


def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.read().decode("utf-8")
    except Exception as e:
        print(f"  ERR {url}: {e}", file=sys.stderr)
        return None


def clean(html):
    text = re.sub(r'<[^>]+>', '', html)
    text = re.sub(r'\[\d+\]', '', text)
    text = re.sub(r'\[note[^\]]*\]', '', text)
    text = text.replace('&amp;', '&').replace('&quot;', '"').replace('&#39;', "'")
    text = text.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>')
    text = re.sub(r'&#(\d+);', lambda m: chr(int(m.group(1))), text)
    return ' '.join(text.split()).strip()


def parse_fr_date(text, year):
    """'8 janvier' → datetime(year, 1, 8)"""
    m = re.search(r'(\d{1,2})\s+([a-zéèêùûîô]+)', text.lower().strip())
    if not m: return None
    month = MONTHS_FR.get(m.group(2))
    if not month: return None
    try: return datetime(year, month, int(m.group(1)))
    except: return None


def parse_en_date(text, year):
    """'January 8' or 'Jan. 8' → datetime(year, 1, 8)"""
    m = re.search(r'([a-z]+)\.?\s+(\d{1,2})', text.lower().strip())
    if not m: return None
    month = MONTHS_EN.get(m.group(1)[:8])
    if not month: return None
    try: return datetime(year, month, int(m.group(2)))
    except: return None


def extract_tables(html):
    return re.findall(r'<table[^>]*>(.*?)</table>', html, re.DOTALL|re.IGNORECASE)

def extract_rows(table):
    return re.findall(r'<tr[^>]*>(.*?)</tr>', table, re.DOTALL|re.IGNORECASE)

def extract_cells(row):
    return [clean(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.DOTALL|re.IGNORECASE)]


def scrape_fr_year_en_fallback(year):
    """Fallback: EN Wikipedia France charts (structure différente)."""
    url = f"https://en.wikipedia.org/wiki/List_of_number-one_singles_of_{year}_(France)"
    html = fetch(url)
    if not html: return []
    tables = extract_tables(html)
    results = []
    for table in tables:
        rows = extract_rows(table)
        if len(rows) < 5: continue
        header = extract_cells(rows[0])
        h = ' '.join(header).lower()
        if 'artist' not in h and 'issue' not in h: continue
        # Structure: Week | Issue date | Artist(s) | Title
        date_col = artist_col = title_col = None
        for i, hh in enumerate(header):
            hl = hh.lower()
            if any(k in hl for k in ['date', 'week', 'issue']): date_col = date_col or i
            if 'artist' in hl: artist_col = i
            if any(k in hl for k in ['title', 'song', 'single', 'album']): title_col = i
        if len(header) >= 3 and artist_col is None:
            date_col, artist_col, title_col = 1, 2, 3
        if artist_col is None: continue
        last_artist = last_title = ''
        last_date = None
        for row in rows[1:]:
            cells = extract_cells(row)
            if not cells: continue
            artist = cells[artist_col] if artist_col < len(cells) else ''
            title  = cells[title_col]  if title_col  < len(cells) else ''
            date_s = cells[date_col]   if date_col is not None and date_col < len(cells) else ''
            if not artist: artist = last_artist
            if not title:  title  = last_title
            d = parse_en_date(date_s, year) if date_s else last_date
            if d: last_date = d
            if artist: last_artist = artist
            if title:  last_title  = title
            if last_date and artist and title:
                results.append({"date": last_date.strftime("%Y-%m-%d"), "artist": artist, "title": title})
    return results


def scrape_fr_year(year):
    url = f"https://fr.wikipedia.org/wiki/Liste_des_titres_musicaux_num%C3%A9ro_un_en_France_en_{year}"
    html = fetch(url)
    if not html: return []

    tables = extract_tables(html)
    results = []

    for table in tables:
        rows = extract_rows(table)
        if len(rows) < 5: continue
        header = extract_cells(rows[0])
        h = ' '.join(header).lower()
        # La table FR a: Semaine | Sortie/Date | Artiste | Titre
        if 'artiste' not in h and 'titre' not in h: continue

        # Trouver les bons indices
        date_col = artist_col = title_col = None
        for i, hh in enumerate(header):
            hl = hh.lower()
            # Préférer "Sortie" / "Date" sur "Semaine"
            if any(k in hl for k in ['sortie', 'date', 'début', 'debut', 'période']):
                if date_col is None: date_col = i
            if 'artiste' in hl or 'interprète' in hl: artist_col = i
            if 'titre' in hl or 'chanson' in hl: title_col = i

        # Structure connue FR: Semaine|Sortie|Artiste|Titre → date=1, artist=2, title=3
        if len(header) >= 4 and artist_col is None:
            date_col, artist_col, title_col = 1, 2, 3
        elif len(header) == 3 and artist_col is None:
            date_col, artist_col, title_col = 0, 1, 2
        # Si date pas trouvée mais artist/title oui: prend colonne avant artist
        if date_col is None and artist_col is not None and artist_col > 0:
            date_col = artist_col - 1

        if artist_col is None or title_col is None: continue

        last_artist = last_title = ''
        last_date = None

        for row in rows[1:]:
            cells = extract_cells(row)
            if not cells: continue

            artist = cells[artist_col] if artist_col < len(cells) else ''
            title  = cells[title_col]  if title_col  < len(cells) else ''
            date_s = cells[date_col]   if date_col is not None and date_col < len(cells) else ''

            # Si cellule vide, réutilise la précédente (rowspan Wikipedia)
            if not artist: artist = last_artist
            if not title:  title  = last_title

            d = parse_fr_date(date_s, year) if date_s else last_date
            if d: last_date = d

            if artist: last_artist = artist
            if title:  last_title  = title

            if last_date and artist and title:
                results.append({"date": last_date.strftime("%Y-%m-%d"), "artist": artist, "title": title})

    # Fallback EN si rien trouvé
    if not results:
        results = scrape_fr_year_en_fallback(year)

    return results


def scrape_us_year(year):
    url = f"https://en.wikipedia.org/wiki/List_of_Billboard_Hot_100_number_ones_of_{year}"
    html = fetch(url)
    if not html: return []

    tables = extract_tables(html)
    results = []

    for table in tables:
        rows = extract_rows(table)
        if len(rows) < 5: continue
        header = extract_cells(rows[0])
        h = ' '.join(header).lower()
        if 'artist' not in h and 'title' not in h and 'song' not in h: continue

        date_col = artist_col = title_col = None
        for i, hh in enumerate(header):
            hl = hh.lower()
            if any(k in hl for k in ['date', 'week', 'issue']):
                if date_col is None: date_col = i
            if any(k in hl for k in ['artist', 'performer']): artist_col = i
            if any(k in hl for k in ['title', 'song', 'single']): title_col = i

        if len(header) >= 3 and artist_col is None:
            date_col, artist_col, title_col = 0, 1, 2

        if artist_col is None or title_col is None: continue

        last_artist = last_title = ''
        last_date = None

        for row in rows[1:]:
            cells = extract_cells(row)
            if not cells: continue

            artist = cells[artist_col] if artist_col < len(cells) else ''
            title  = cells[title_col]  if title_col  < len(cells) else ''
            date_s = cells[date_col]   if date_col is not None and date_col < len(cells) else ''

            if not artist: artist = last_artist
            if not title:  title  = last_title

            d = parse_en_date(date_s, year) if date_s else last_date
            if d: last_date = d

            if artist: last_artist = artist
            if title:  last_title  = title

            if last_date and artist and title:
                results.append({"date": last_date.strftime("%Y-%m-%d"), "artist": artist, "title": title})

    return results


def build_daily_index(raw):
    """Génère un dict {YYYY-MM-DD: {artist, title}} pour chaque jour de l'année."""
    if not raw: return {}

    seen = {}
    for e in raw:
        if e['date'] not in seen:
            seen[e['date']] = e

    entries = sorted(seen.values(), key=lambda x: x['date'])
    index = {}

    for i, entry in enumerate(entries):
        start = datetime.strptime(entry['date'], "%Y-%m-%d")
        end   = datetime.strptime(entries[i+1]['date'], "%Y-%m-%d") if i+1 < len(entries) else start + timedelta(days=7)
        d = start
        while d < end:
            index[d.strftime("%Y-%m-%d")] = {"artist": entry['artist'], "title": entry['title']}
            d += timedelta(days=1)

    return index


def main():
    os.makedirs("data", exist_ok=True)

    # ── France (1984–2025) ──────────────────────────────────────────────────
    print("=== FRANCE (1984-2025) ===")
    all_fr = []
    for year in range(1984, 2026):
        entries = scrape_fr_year(year)
        print(f"  {year}: {len(entries)} entrées")
        all_fr.extend(entries)
        time.sleep(0.6)

    idx_fr = build_daily_index(all_fr)
    with open("data/charts-fr.json", "w", encoding="utf-8") as f:
        json.dump(idx_fr, f, ensure_ascii=False, separators=(',', ':'))
    print(f"✅ charts-fr.json : {len(idx_fr)} jours")

    # ── USA Billboard (1958–2025) ───────────────────────────────────────────
    print("\n=== USA BILLBOARD (1958-2025) ===")
    all_us = []
    for year in range(1958, 2026):
        entries = scrape_us_year(year)
        print(f"  {year}: {len(entries)} entrées")
        all_us.extend(entries)
        time.sleep(0.6)

    idx_us = build_daily_index(all_us)
    with open("data/charts-us.json", "w", encoding="utf-8") as f:
        json.dump(idx_us, f, ensure_ascii=False, separators=(',', ':'))
    print(f"✅ charts-us.json : {len(idx_us)} jours")

    print("\n🎉 Terminé !")


if __name__ == "__main__":
    main()

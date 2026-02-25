# Film.Cuts — jednoduchý web

Krátký návod jak upravovat projekt přímo ve Visual Studio Code (doporučené):

1) Otevři projekt ve VS Code:

```bash
code /Users/kamilstencel/Desktop/web
```

2) Struktura pro média:
- Vlož své obrázky a videa do složky `assets/` (např. `assets/photo1.jpg`, `assets/video1.mp4`).

3) Přidání obrázku / videa do portfolia:
- Otevři `index.html` a najdi kartu v sekci `portfolio` (např. `<article class="card" data-key="card-1">`).
- Do elementu `<div class="media" data-media></div>` vlož přímo HTML tag s cestou k souboru. Například:

```html
<div class="media" data-media>
	<!-- obrázek -->
	<img src="assets/photo1.jpg" alt="Projekt 1" />
	<!-- nebo video -->
	<!-- <video src="assets/video1.mp4" controls></video> -->
</div>
```

4) Náhled změn:
- Doporučený způsob: nainstaluj rozšíření Live Server v VS Code a klikni pravým tlačítkem na `index.html` -> "Open with Live Server". Nebo spusť jednoduchý server z terminálu:

```bash
cd /Users/kamilstencel/Desktop/web
python3 -m http.server 8000
# otevři http://localhost:8000
```

5) Doporučení pro videa:
- Pro lepší výkon hostuj velká videa externě (YouTube/Vimeo/S3) a do HTML vkládej pouze odkaz nebo `<iframe>` / `<video>` s URL.

6) Úpravy designu:
- Pro rychlé barevné změny uprav CSS proměnné v `style.css` v sekci `:root`.

7) Zálohy a export:
- Pokud chceš zálohovat obsah, stačí zkopírovat `index.html` a složku `assets/` do zálohy nebo do repozitáře Git.

Poznámka: odstranil jsem dřívější in-browser editor a automatické uploady — teď děláš změny přímo v kódu ve VS Code. Kdybys chtěl, mohu:
- Přidat jednoduchý export/import JSON pro přenos mezi stroji, nebo
- Přidat jednoduchý nástroj (script) pro extrahování dat z localStorage, pokud máš v prohlížeči předchozí nahraná média, která chceš zachránit.

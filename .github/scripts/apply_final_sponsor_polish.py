from pathlib import Path
import base64
import re

idx_path=Path('index.html')
css_path=Path('css/styles-20260829-6.css')
idx=idx_path.read_text(encoding='utf-8')

def replace_once(old,new,label):
    global idx
    if old not in idx:
        raise RuntimeError(f'missing expected {label}')
    idx=idx.replace(old,new,1)

if 'name="description"' not in idx:
    meta='''<meta name="description" content="Mountaineering Club at ASU brings students together through mountain travel, outdoor skills, stewardship, service, adaptive outdoor access, and community.">\n<meta name="theme-color" content="#f3efe7">\n<link rel="canonical" href="https://asumountaineering.org/">\n<link rel="icon" type="image/png" href="/mca-favicon.png?v=3">\n<link rel="apple-touch-icon" href="/mca-favicon.png?v=3">\n<meta property="og:type" content="website">\n<meta property="og:title" content="Mountaineering Club at ASU">\n<meta property="og:description" content="Adventure, outdoor skills, stewardship, service, adaptive outdoor access, and community at Arizona State University.">\n<meta property="og:url" content="https://asumountaineering.org/">\n<meta property="og:image" content="https://asumountaineering.org/assets/images/calendar-club-banner.webp">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="Mountaineering Club at ASU">\n<meta name="twitter:description" content="Adventure, outdoor skills, stewardship, service, adaptive outdoor access, and community at Arizona State University.">\n<meta name="twitter:image" content="https://asumountaineering.org/assets/images/calendar-club-banner.webp">'''
    replace_once('<title>Mountaineering Club at ASU | Mountains, Community, Action</title>','<title>Mountaineering Club at ASU | Mountains, Community, Action</title>\n'+meta,'metadata anchor')

idx=idx.replace('css/styles-20260829-6.css?v=20260829-7','css/styles-20260829-6.css?v=20260830-1')

pat=re.compile(r'<div class="hero-actions"><button id="readMoreBtn".*?</button><button class="btn nav-link" data-page="join">Join MCA</button></div>',re.S)
hero='''<div class="hero-actions"><button id="readMoreBtn" type="button" hidden aria-hidden="true"></button><button class="btn nav-link" data-page="partner" type="button">Partner With MCA</button><button class="btn nav-link" data-page="join" type="button">Join MCA</button></div>'''
idx,n=pat.subn(hero,idx,count=1)
if n!=1: raise RuntimeError('homepage partner CTA anchor not found')

idx=idx.replace('<p>Space for current leaders, advisors, and team members.</p>','')
idx=idx.replace('<p>[Short bio.]</p>','')
idx=idx.replace('<h3>Preccious</h3>','<h3>Precious</h3>')
idx=idx.replace('Sat · Sept 19 · Time TBD','Sat · Sept 19 · Exact time shared with participants')
idx=idx.replace('Saturday, September 19. Time to be announced.','Saturday, September 19. Exact time will be shared directly with participants.')

p1=Path('.github/scripts/poem1.html').read_text(encoding='utf-8')
p2=Path('.github/scripts/poem2.html').read_text(encoding='utf-8')
replace_once('<div class="poem-space wire-box"><h3>Poem Wall</h3><p>[A member poem, journal fragment, or reflection.]</p></div>',p1,'first poem')
replace_once('<div class="poem-space wire-box"><h3>Field Notes</h3><p>[Short poem or expedition fragment.]</p></div>','<div class="between-drawing-slot"><img src="assets/images/between-peaks/dog-flower-line-art.png?v=20260830-1" alt="Line drawing of a three-faced dog holding flowers beside a bricked doorway"></div>','drawing slot')
replace_once('<div class="poem-space wire-box"><h3>Another Voice</h3><p>[A second member poem or quote.]</p></div>',p2,'second poem')
replace_once('<div class="photo-space wire-box"><img class="between-photo-real" src="assets/images/between-peaks/belay-dog.webp?v=20260829-7" alt="Climber belaying beside a dog at a rocky crag" loading="eager" decoding="async"></div>','<div class="between-spacer" aria-hidden="true"></div>','duplicate side photo')
idx=idx.replace('<div class="table-label">Two-Player Hearts</div>','')

idx_path.write_text(idx,encoding='utf-8')

css=css_path.read_text(encoding='utf-8')
marker='/* === Final Between Peaks composition — 2026-08-30 === */'
if marker not in css:
    css += Path('.github/scripts/between-final.css').read_text(encoding='utf-8')
css_path.write_text(css,encoding='utf-8')

b64=''.join(Path(f'.github/scripts/drawing-{i}.b64').read_text().strip() for i in range(3))
out=Path('assets/images/between-peaks/dog-flower-line-art.png')
out.write_bytes(base64.b64decode(b64))
if out.stat().st_size < 8000: raise RuntimeError('drawing decode failed')
print('Sponsor-facing polish applied successfully')

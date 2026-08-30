from pathlib import Path
import base64
import re

INDEX = Path("index.html")
CSS = Path("css/styles-20260829-6.css")
DRAWING = Path("assets/images/between-peaks/dog-flower-line-art.png")

index = INDEX.read_text(encoding="utf-8")

# Production metadata and the original MCA favicon used by the earlier Pages site.
if 'name="description"' not in index:
    index = index.replace(
        '<title>Mountaineering Club at ASU | Mountains, Community, Action</title>',
        '''<title>Mountaineering Club at ASU | Mountains, Community, Action</title>
<meta name="description" content="Mountaineering Club at ASU brings students together through mountain travel, outdoor skills, stewardship, service, adaptive outdoor access, and community.">
<meta name="theme-color" content="#f3efe7">
<link rel="canonical" href="https://asumountaineering.org/">
<link rel="icon" type="image/png" href="/mca-favicon.png?v=3">
<link rel="apple-touch-icon" href="/mca-favicon.png?v=3">
<meta property="og:type" content="website">
<meta property="og:title" content="Mountaineering Club at ASU">
<meta property="og:description" content="Adventure, outdoor skills, stewardship, service, adaptive outdoor access, and community at Arizona State University.">
<meta property="og:url" content="https://asumountaineering.org/">
<meta property="og:image" content="https://asumountaineering.org/assets/images/calendar-club-banner.webp">
<meta property="og:image:alt" content="Mountaineering Club at ASU members outdoors">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Mountaineering Club at ASU">
<meta name="twitter:description" content="Adventure, outdoor skills, stewardship, service, adaptive outdoor access, and community at Arizona State University.">
<meta name="twitter:image" content="https://asumountaineering.org/assets/images/calendar-club-banner.webp">'''
    )

index = index.replace('css/styles-20260829-6.css?v=20260829-7', 'css/styles-20260829-6.css?v=20260830-1')

# Make partnership immediately visible to the sponsor/organization audience from Home.
hero_actions = re.compile(
    r'<div class="hero-actions"><button id="readMoreBtn".*?</button><button class="btn nav-link" data-page="join">Join MCA</button></div>',
    re.S,
)
replacement_actions = '''<div class="hero-actions">
      <button id="readMoreBtn" type="button" hidden aria-hidden="true"></button>
      <button class="btn nav-link" data-page="partner" type="button">Partner With MCA</button>
      <button class="btn nav-link" data-page="join" type="button">Join MCA</button>
    </div>'''
index, action_count = hero_actions.subn(replacement_actions, index, count=1)
if action_count != 1:
    raise RuntimeError("Could not update homepage hero actions")

# Remove visible development placeholders without redesigning the team page yet.
index = index.replace('<p>Space for current leaders, advisors, and team members.</p>', '')
index = index.replace('<p>[Short bio.]</p>', '')
index = index.replace('<h3>Preccious</h3>', '<h3>Precious</h3>')

# Turn an intentionally unresolved event time into finished participant-facing language.
index = index.replace('Sat · Sept 19 · Time TBD', 'Sat · Sept 19 · Exact time shared with participants')
index = index.replace('Saturday, September 19. Time to be announced.', 'Saturday, September 19. Exact time will be shared directly with participants.')

between = r'''<section id="between" class="page">
  <section class="between-layout between-finished" aria-label="Between Peaks">
    <div class="between-collage">
      <figure class="between-media bp-sunset">
        <img src="assets/images/between-peaks/sunset-group.webp?v=20260830-1" alt="MCA members gathered on a rocky overlook at sunset" loading="eager" decoding="async">
      </figure>

      <article class="between-poem bp-poem-one">
        <div class="between-poem-text">
          i can’t live where i’m from<br>
          it hurts too much<br><br>
          so i put my hand up<br>
          and volunteer<br><br>
          to be an eternal sapling.<br><br>
          ready to be transplanted<br>
          at a moment’s notice<br><br>
          into
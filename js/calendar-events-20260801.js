/* Confirmed MCA calendar additions — Fall 2026 */
(()=>{
  if(typeof calendarEvents === 'undefined' || typeof renderCalendar !== 'function') return;

  const additions = [
    {
      date:'2026-09-01',
      title:'Scholarship Workshop',
      time:'6:30 PM',
      description:'Walton Center for Planetary Health. Meet, relax, and work on mountaineering and individual scholarships; desserts provided.',
      category:'community'
    },
    {
      date:'2026-09-05',
      title:'Beginner Belay Workshop',
      time:'6:00 AM',
      description:'Papago Park. Learn harnesses, knots, partner checks, and introductory top-rope belaying with qualified climbing partners.',
      category:'community'
    },
    {
      date:'2026-09-12',
      title:'Papago Park Restoration',
      time:'4:30 AM',
      description:'Trash removal and an approved graffiti-cleanup project at Papago Park with a park ranger.',
      category:'stewardship'
    },
    {
      date:'2026-09-19',
      title:'Adaptive Ascents',
      time:'Time TBD',
      description:'Outdoor and climbing opportunities for children and young adults with disabilities. Volunteer roles and support details are coming soon.',
      category:'adaptive'
    },
    {
      date:'2026-10-02',
      title:'North Kaibab Restoration',
      time:'Oct 2–4',
      description:'Weekend tree planting in wildfire scars, with Grand Canyon hiking groups organized by readiness.',
      category:'stewardship'
    },
    {
      date:'2026-10-03',
      title:'North Kaibab Restoration',
      time:'Oct 2–4',
      description:'Weekend tree planting in wildfire scars, with Grand Canyon hiking groups organized by readiness.',
      category:'stewardship'
    },
    {
      date:'2026-10-04',
      title:'North Kaibab Restoration',
      time:'Oct 2–4',
      description:'Weekend tree planting in wildfire scars, with Grand Canyon hiking groups organized by readiness.',
      category:'stewardship'
    },
    {
      date:'2026-10-10',
      title:'Mt. Baldy — Fall Break',
      time:'Oct 10–13',
      description:'Backpacking and team-building trip in Arizona’s White Mountains. Details are still being finalized.',
      category:'community'
    },
    {
      date:'2026-10-11',
      title:'Mt. Baldy — Fall Break',
      time:'Oct 10–13',
      description:'Backpacking and team-building trip in Arizona’s White Mountains. Details are still being finalized.',
      category:'community'
    },
    {
      date:'2026-10-12',
      title:'Mt. Baldy — Fall Break',
      time:'Oct 10–13',
      description:'Backpacking and team-building trip in Arizona’s White Mountains. Details are still being finalized.',
      category:'community'
    },
    {
      date:'2026-10-13',
      title:'Mt. Baldy — Fall Break',
      time:'Oct 10–13',
      description:'Backpacking and team-building trip in Arizona’s White Mountains. Details are still being finalized.',
      category:'community'
    },
    {date:'2026-10-09',title:'Club Workout',time:'6:00 AM',description:'Morning club workout. Meet location shared with members.',category:'community'},
    {date:'2026-10-12',title:'Joshua Tree',time:'Overnight trip · Day 1',description:'MCA trip to Joshua Tree National Park.',category:'community'},
    {date:'2026-10-13',title:'Joshua Tree',time:'Overnight trip · Day 2',description:'MCA trip to Joshua Tree National Park.',category:'community'},
    {date:'2026-10-31',title:'Four Peaks Traverse',time:'All day',description:'MCA Four Peaks Traverse on Halloween.',category:'community'},
    {date:'2026-11-07',title:'Cactus to Clouds',time:'Overnight trip · Day 1',description:'MCA Cactus to Clouds trip, November 7–8.',category:'community'},
    {date:'2026-11-08',title:'Cactus to Clouds',time:'Overnight trip · Day 2',description:'MCA Cactus to Clouds trip, November 7–8.',category:'community'},
    {date:'2026-10-17',title:'Bouldering',time:'Time TBD',description:'MCA bouldering meetup. Time and location details will be shared with members.',category:'community'},
    {date:'2026-10-25',title:'Papago Park Restoration',time:'Time TBD',description:'Restoration work at Papago Park. Details will be shared with volunteers.',category:'stewardship'},

  ];


  // MCA club dates and outside training opportunities — winter 2026–27.
  // Keep outside courses distinct from MCA-hosted events.
  const addRange=(start,end,title,time,description,category='community')=>{
    const first=new Date(start+'T12:00:00Z'),last=new Date(end+'T12:00:00Z');
    for(let date=new Date(first);date<=last;date.setUTCDate(date.getUTCDate()+1)){
      additions.push({date:date.toISOString().slice(0,10),title,time,description,category});
    }
  };

  additions.push({
    date:'2026-11-14',title:'Four Peaks Saguaro Planting',time:'Time TBD',
    description:'Saguaro planting and desert restoration at Four Peaks, Arizona. Meeting location and schedule will be shared with volunteers.',
    category:'stewardship'
  });

  additions.push({
    date:'2026-11-17',title:'Knot-Tying Workshop',time:'Time TBD',
    description:'Tuesday knot-tying session. Location and exact time will be shared with members.',
    category:'community'
  });

  // Weekly MCA workouts: Friday 6:30 AM, through the end of the spring semester.
  for(let date=new Date('2026-11-06T12:00:00Z');date<=new Date('2027-05-28T12:00:00Z');date.setUTCDate(date.getUTCDate()+7)){
    additions.push({
      date:date.toISOString().slice(0,10),title:'Club Workout',time:'6:30 AM',
      description:'Weekly Friday morning MCA workout. Meeting location shared with members.',
      category:'community'
    });
  }

  // Tentative winter trips — gauging member interest, not yet confirmed.
  addRange('2026-12-13','2026-12-14','Humphreys Trip — Gauging Interest','Dec 13–14 · Time TBD',
    'Potential trip to Humphreys Peak, Arizona, December 13–14. Gauging interest only; itinerary and participation are not yet confirmed.',
    'community');
  addRange('2026-12-15','2026-12-19','Sierras Trip — Gauging Interest','Dec 15–19 · Time TBD',
    'Potential Eastern Sierra trip, December 15–19. Gauging interest only; itinerary, activities, and participation are not yet confirmed.',
    'community');

  addRange('2027-01-09','2027-01-10','WFA Training','Time TBD',
    'Wilderness First Aid training, January 9–10, in Grand Junction, Colorado. Exact times and organizer details to follow.');

  addRange('2027-01-22','2027-01-23','MCA Team Tryouts','Time TBD',
    'MCA team tryouts, January 22–23. Times and location to be announced.');

  addRange('2027-01-28','2027-01-31','Ouray Ice Festival (Official)','Jan 28–31',
    'External event at Ouray Ice Park, Ouray, Colorado. Official festival dates are January 28–31, 2027. Details: ourayicepark.com/festival/about.',
    'training');

  // Kachina Peaks Avalanche Center offerings at Arizona Gondola,
  // Arizona Snowbowl, Flagstaff, AZ (from the published course list).
  const azGondola='Outside training offered by Kachina Peaks Avalanche Center, Arizona Gondola, Flagstaff, AZ. Verify eligibility, registration, and current details with the organizer.';
  addRange('2027-01-09','2027-01-09','Avalanche Level I Refresher','8:00 AM–5:00 PM',azGondola,'training');
  addRange('2027-01-10','2027-01-10','Avalanche Rescue','8:00 AM–5:00 PM',azGondola,'training');
  addRange('2027-01-22','2027-01-24','Avalanche Training Level I (Jan 22–24)','Jan 22–24',
    azGondola+' Friday 6:30 PM kickoff; weekend field days approximately 8 AM–5 PM.','training');
  addRange('2027-01-23','2027-01-23','CCSO SAR Avalanche Rescue','8:00 AM–5:00 PM',
    azGondola+' CCSO SAR-specific course; verify attendee eligibility.','training');
  addRange('2027-01-29','2027-01-31','Avalanche Training Level I (Jan 29–31)','Jan 29–31',azGondola,'training');
  addRange('2027-02-05','2027-02-07','NAU PRM225 Avalanche Training','Feb 5–7',
    azGondola+' NAU PRM225 session; verify eligibility.','training');
  addRange('2027-02-05','2027-02-07','Avalanche Training Level I (Feb 5–7)','Feb 5–7',azGondola,'training');
  addRange('2027-02-10','2027-02-12','Avalanche Training Level I (Feb 10–12)','Feb 10–12',azGondola,'training');
  addRange('2027-02-12','2027-02-15','Avalanche Training Level II (Feb 12–15)','Feb 12–15',azGondola,'training');
  addRange('2027-02-19','2027-02-21','Avalanche Training Level I (Feb 19–21)','Feb 19–21',azGondola,'training');
  addRange('2027-02-26','2027-02-28','Avalanche Training Level I (Feb 26–28)','Feb 26–28',azGondola,'training');
  addRange('2027-02-26','2027-02-28',"Women's Avalanche Training Level I (Feb 26–28)",'Feb 26–28',azGondola,'training');

  additions.forEach(addition=>{
    const alreadyListed = calendarEvents.some(event=>
      event.date === addition.date && event.title === addition.title
    );
    if(!alreadyListed) calendarEvents.push(addition);
  });

  renderCalendar();
})();

/* Past Adventures: keep the mountain names, remove every slide number and description. */
(()=>{
  const numberPattern=/^N\s*[°º]\s*\d+\s*\/\s*\d+$/i;
  let attempts=0;
  const timer=window.setInterval(()=>{
    attempts+=1;
    const shell=document.querySelector('.adventures-flow-shell[data-adventure-kind="past"]');
    const shadow=shell?.shadowRoot;
    if(!shadow){
      if(attempts>=160)window.clearInterval(timer);
      return;
    }

    const scenes=[...shadow.querySelectorAll('.scene')];
    if(!scenes.length){
      if(attempts>=160)window.clearInterval(timer);
      return;
    }

    scenes.forEach(scene=>{
      const heading=scene.querySelector('h1,h2,h3,h4');
      const textLeaves=[...scene.querySelectorAll('*')].filter(node=>
        node.children.length===0 && node.textContent.trim()
      );
      const numberNodes=textLeaves.filter(node=>numberPattern.test(node.textContent.trim()));

      let panel=heading?.parentElement||scene;
      if(heading && numberNodes.length){
        let candidate=heading.parentElement;
        while(candidate && candidate!==scene){
          if(numberNodes.some(node=>candidate.contains(node))){
            panel=candidate;
            break;
          }
          candidate=candidate.parentElement;
        }
      }

      numberNodes.forEach(node=>node.remove());

      panel.querySelectorAll('p').forEach(node=>{
        if(!node.closest('.photo-card'))node.remove();
      });

      [...panel.querySelectorAll('*')].forEach(node=>{
        if(node.children.length!==0 || !node.textContent.trim())return;
        if(heading?.contains(node))return;
        if(node.closest('.photo-card'))return;
        const text=node.textContent.trim();
        if(numberPattern.test(text) || (text.length>18 && /[A-Za-z]/.test(text)))node.remove();
      });
    });

    window.clearInterval(timer);
  },250);
})();

/* Between Peaks: remove the old intro banner and render the four member trip photos directly. */
(()=>{
  const photos=[
    ['assets/images/between-peaks/belay-dog.webp?v=20260829-2','Climber belaying beside a dog at a rocky crag'],
    ['assets/images/between-peaks/sunset-group.webp?v=20260829-2','MCA members gathered on a rocky overlook at sunset'],
    ['assets/images/between-peaks/forest-pack.webp?v=20260829-2','Backpackers hiking through a forest'],
    ['assets/images/between-peaks/snow-camp.webp?v=20260829-2','Tent and climbing gear in snowy mountain conditions']
  ];

  const ensureBetweenPeaks=()=>{
    const page=document.getElementById('between');
    if(!page)return false;

    const oldHero=page.querySelector(':scope > .page-hero');
    if(oldHero)oldHero.remove();

    const existing=[...page.querySelectorAll('.between-photo-real')];
    const placeholders=[...page.querySelectorAll('.photo-placeholder')];

    photos.forEach(([src,alt],index)=>{
      let img=existing[index];
      if(!img && placeholders[index]){
        img=document.createElement('img');
        placeholders[index].replaceWith(img);
      }
      if(!img)return;
      img.src=src;
      img.alt=alt;
      img.decoding='async';
      img.className='between-photo-real';
      img.style.cssText='display:block;width:100%;height:100%;min-height:220px;object-fit:cover;border:0;';
    });

    return page.querySelectorAll('.between-photo-real').length>=4;
  };

  ensureBetweenPeaks();
  let tries=0;
  const timer=window.setInterval(()=>{
    tries+=1;
    const done=ensureBetweenPeaks();
    if(done || tries>=40)window.clearInterval(timer);
  },250);
})();

/* About page: keep the Team section focused on current officers and the faculty advisor. */
(()=>{
  const grid=document.querySelector('#about .team-grid');
  if(!grid)return;

  const leaders=[
    {name:'Tony',role:'President',photo:'assets/images/team/tony-whitney.webp',alt:'Tony holding the Mount Whitney summit sign'},
    {name:'Sienna',role:'Vice President',photo:'assets/images/team/sienna.jpg',alt:'Sienna'},
    {name:'Charlie',role:'Vice President'},
    {name:'Zahrah',role:'Officer',photo:'assets/images/team/zahrah.jpg',alt:'Zahrah'},
    {name:'Tydan',role:'Officer'},
    {name:'David Jacobs',role:'Advisor',photo:'assets/images/team/david-jacobs.jpg',alt:'David Jacobs'}
  ];

  const photoMarkup=leader=>leader.photo
    ? `<div class="team-photo"><img src="${leader.photo}" alt="${leader.alt||leader.name}"></div>`
    : `<div class="team-photo"><img src="assets/images/mca-line-logo-transparent.png" alt="" aria-hidden="true" style="object-fit:contain;padding:14%;background:#f3efe7;"></div>`;

  grid.innerHTML=leaders.map(leader=>`
    <article class="simple-card wire-box team-member-card">
      ${photoMarkup(leader)}
      <h3>${leader.name}</h3>
      <p class="team-role">${leader.role}</p>
    </article>`).join('');
})();

/* Home page: remove the existing Jane Goodall and challenge section backgrounds only. */
(()=>{
  const style=document.createElement('style');
  style.textContent=`
    .home-jane-quote,
    .home-challenge-section{
      background:none !important;
      background-image:none !important;
    }
  `;
  document.head.appendChild(style);
})();


/* Render the home carousel from the same upcoming events shown on the calendar. */
(()=>{
  const track=document.getElementById('homeUpcomingEvents');
  if(!track || typeof calendarEvents==='undefined')return;
  const now=new Date();
  const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  const groups=new Map();
  calendarEvents.filter(event=>event.date>=today).forEach(event=>{
    const key=[event.title,event.category||'community',event.description||''].join('|');
    if(!groups.has(key))groups.set(key,{title:event.title,category:event.category||'community',description:event.description||'',events:[]});
    const group=groups.get(key);
    if(!group.events.some(item=>item.date===event.date))group.events.push(event);
  });
  const date=value=>new Date(value+'T12:00:00');
  const shortDate=value=>date(value).toLocaleDateString('en-US',{month:'short',day:'numeric'}).toUpperCase();
  const scheduleLabel=(events,title)=>{
    if(title==='Farmers Market')return 'FIRST SUNDAY MONTHLY · 8:00–11:00 AM';
    if(title==='Climbing')return 'TUESDAYS · 5:00 PM';
    const dates=events.map(event=>event.date).sort();
    const first=date(dates[0]),last=date(dates[dates.length-1]);
    const time=(events[0].time||'Time TBD').replace(/ · Day \d+$/,'');
    if(dates.length>=3){
      const gaps=dates.slice(1).map((value,index)=>(date(value)-date(dates[index]))/86400000);
      if(gaps.every(gap=>gap===7))return `${first.toLocaleDateString('en-US',{weekday:'long'}).toUpperCase()}S · ${time} · ${shortDate(dates[0])}–${shortDate(dates[dates.length-1])}`;
    }
    if(dates.length>1){
      const firstMonth=first.toLocaleDateString('en-US',{month:'short'}).toUpperCase();
      const lastMonth=last.toLocaleDateString('en-US',{month:'short'}).toUpperCase();
      const range=firstMonth===lastMonth?`${firstMonth} ${first.getDate()}–${last.getDate()}`:`${firstMonth} ${first.getDate()}–${lastMonth} ${last.getDate()}`;
      return `${range} · ${time}`;
    }
    return `${shortDate(dates[0])} · ${time}`;
  };
  const labels={stewardship:'SERVICE',community:'CLUB',adaptive:'ADAPTIVE',club:'CLUB',training:'EXTERNAL'};
  [...groups.values()].sort((a,b)=>a.events[0].date.localeCompare(b.events[0].date)).forEach(group=>{
    group.events.sort((a,b)=>a.date.localeCompare(b.date));
    const card=document.createElement('article');
    card.className='event-card';
    const media=document.createElement('div');
    media.className='event-card-media event-card-logo';
    const logo=document.createElement('img');
    logo.src='assets/images/mca-line-logo-transparent.png';
    logo.alt='Mountaineering Club at ASU logo';
    logo.loading='lazy';
    media.appendChild(logo);
    const copy=document.createElement('div');
    copy.className='event-card-copy';
    const meta=document.createElement('small');
    meta.textContent=`${labels[group.category]||'CLUB'} · ${scheduleLabel(group.events,group.title)}`;
    const title=document.createElement('h3');
    title.textContent=group.title;
    const description=document.createElement('p');
    description.textContent=group.description;
    copy.append(meta,title,description);
    card.append(media,copy);
    track.appendChild(card);
  });
})();

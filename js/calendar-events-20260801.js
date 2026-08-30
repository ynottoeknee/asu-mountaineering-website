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
    }
  ];

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

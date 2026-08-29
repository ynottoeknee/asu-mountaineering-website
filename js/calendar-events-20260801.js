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

/* Past Adventures: remove the first slide's small description/index block. */
(()=>{
  let attempts=0;
  const timer=window.setInterval(()=>{
    attempts+=1;
    const shell=document.querySelector('.adventures-flow-shell[data-adventure-kind="past"]');
    const firstMeta=shell?.shadowRoot?.querySelector('.scene-1 .index-panel');
    if(firstMeta){
      firstMeta.remove();
      window.clearInterval(timer);
      return;
    }
    if(attempts>=120)window.clearInterval(timer);
  },250);
})();

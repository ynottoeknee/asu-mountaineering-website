/* Confirmed MCA calendar additions — August 2026 */
(()=>{
  if(typeof calendarEvents === 'undefined' || typeof renderCalendar !== 'function') return;

  const additions = [
    {
      date:'2026-08-12',
      title:'St. Mary’s Emergency Food Box Packing',
      time:'1:00 PM',
      description:'Volunteer shift packing emergency food boxes.',
      category:'service'
    },
    {
      date:'2026-08-15',
      title:'Belay Workshop',
      time:'Time TBD',
      description:'Learn and practice the foundations of safe belaying with MCA.',
      category:'community'
    },
    {
      date:'2026-08-18',
      title:'Papago Park Stewardship: Graffiti Cleanup',
      time:'5:00 AM',
      description:'Early-morning graffiti cleanup and stewardship at Papago Park.',
      category:'stewardship'
    },
    {
      date:'2026-08-23',
      title:'MCA Tabling at Summerfest',
      time:'7:00 PM',
      description:'Meet MCA and learn about the club at Summerfest.',
      category:'community'
    },
    {
      date:'2026-08-27',
      title:'Scholarship Workshop',
      time:'Time TBD',
      description:'Work together on outdoor and expedition scholarship applications.',
      category:'community'
    },
    {
      date:'2026-09-12',
      title:'Adaptive Ascents Sunrise Walk',
      time:'6:00 AM',
      description:'Introductory small-group walk at Papago Park. Interest form requested by September 5.',
      category:'adaptive'
    },
    {
      date:'2026-09-16',
      title:'Opening Meeting + Journal Making',
      time:'6:00 PM',
      description:'MCA’s opening meeting and a journal-making night. Location to be announced.',
      category:'community'
    },
    {
      date:'2026-10-02',
      title:'North Kaibab Restoration',
      time:'Oct 2–4',
      description:'Day 1 of MCA’s three-day restoration and stewardship project on the North Kaibab.',
      category:'stewardship'
    },
    {
      date:'2026-10-03',
      title:'North Kaibab Restoration',
      time:'Oct 2–4',
      description:'Day 2 of MCA’s three-day restoration and stewardship project on the North Kaibab.',
      category:'stewardship'
    },
    {
      date:'2026-10-04',
      title:'North Kaibab Restoration',
      time:'Oct 2–4',
      description:'Day 3 of MCA’s three-day restoration and stewardship project on the North Kaibab.',
      category:'stewardship'
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

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
      date:'2026-09-12',
      title:'Adaptive Ascents Sunrise Hike',
      time:'6:00 AM',
      description:'Introductory small-group hike at Papago Park. Interest form requested by September 5.',
      category:'adaptive'
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

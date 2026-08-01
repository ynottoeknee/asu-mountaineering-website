/* Adaptive Ascents general-interest workflow */
(()=>{
  const ADAPTIVE_EMAIL='afishe54@asu.edu';
  const form=document.getElementById('adaptiveInterestForm');
  const status=document.getElementById('adaptiveInterestStatus');
  if(!form||!status)return;

  function field(name){
    const value=form.elements.namedItem(name)?.value;
    return typeof value==='string'&&value.trim()?value.trim():'Not provided';
  }

  function checked(name){
    const values=[...form.querySelectorAll(`input[name="${name}"]:checked`)].map(input=>input.value);
    return values.length?values.join(', '):'None selected';
  }

  function validate(){
    if(!form.reportValidity())return false;
    const activities=[...form.querySelectorAll('input[name="activityInterest"]:checked')];
    if(activities.length)return true;
    status.textContent='Please choose at least one activity that interests the participant.';
    status.className='aa-form-status error';
    form.querySelector('input[name="activityInterest"]')?.focus();
    return false;
  }

  function buildSummary(){
    const participant=field('participantName');
    const lines=[
      'ADAPTIVE ASCENTS — GENERAL INTEREST','',
      'STARTING POINT',field('adaptivePath'),'',
      'PARTICIPANT',
      `Preferred name: ${participant}`,
      `Age or age range: ${field('participantAge')}`,
      `Pronouns: ${field('participantPronouns')}`,
      `Participant involvement: ${field('participantInvolvement')}`,'',
      'CONTACT',
      `Contact name: ${field('contactName')}`,
      `Completing as: ${field('contactRole')}`,
      `Relationship: ${field('relationship')}`,
      `Email: ${field('contactEmail')}`,
      `Phone: ${field('contactPhone')}`,
      `Preferred contact: ${field('contactMethod')}`,'',
      'PARTICIPANT INTERESTS AND VOICE',
      `Activities: ${checked('activityInterest')}`,
      `What they want to try, learn, feel, or accomplish: ${field('goals')}`,
      `What makes a good day: ${field('goodDay')}`,
      `What they want us to avoid: ${field('avoid')}`,'',
      'COMMUNICATION AND SUPPORT',
      `Communication approaches: ${checked('communicationSupport')}`,
      `How they communicate choices, discomfort, or breaks: ${field('communicationDetails')}`,
      `Sensory, transition, or emotional supports: ${field('sensorySupports')}`,
      `Pace, mobility, terrain, or rest considerations: ${field('mobilitySupports')}`,
      `Prompting, supervision, or one-on-one support: ${field('supervisionSupports')}`,
      `Familiar support person attending: ${field('supportPerson')}`,'',
      'PLANNING AND LOGISTICS',
      `Relevant experience: ${field('experience')}`,
      `Heat, sun, or early-morning considerations: ${field('weather')}`,
      `Transportation: ${field('transportation')}`,
      `Equipment or access: ${field('equipment')}`,
      `Safety topic requiring follow-up: ${field('safetyFollowup')}`,
      `Preferred first conversation: ${field('meetingFormat')}`,
      `Follow-up availability: ${field('availability')}`,'',
      'ACKNOWLEDGMENTS',
      'The sender confirmed participant voice, interest-only status, follow-up permission, and that no medical records or private documents were included.'
    ];
    return {participant,lines,text:lines.join('\n')};
  }

  function mailto(subject,lines){
    return `mailto:${ADAPTIVE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  }

  document.querySelectorAll('.aa-path-card').forEach(button=>{
    button.addEventListener('click',()=>{
      const choice=[...form.querySelectorAll('input[name="adaptivePath"]')].find(input=>input.value===button.dataset.adaptivePath);
      if(choice)choice.checked=true;
      document.querySelectorAll('.aa-path-card').forEach(card=>card.classList.toggle('selected',card===button));
      document.getElementById('adaptive-interest')?.scrollIntoView({behavior:'smooth',block:'start'});
      window.setTimeout(()=>document.getElementById('aaParticipantName')?.focus(),450);
    });
  });

  document.getElementById('prepareAdaptiveInterestBtn')?.addEventListener('click',()=>{
    if(!validate())return;
    const summary=buildSummary();
    status.textContent='Your email app should open with the completed interest form. Review it, then press Send. If nothing opens, use “Copy my answers instead.”';
    status.className='aa-form-status success';
    window.location.href=mailto(`Adaptive Ascents interest — ${summary.participant}`,summary.lines);
  });

  async function copyAnswers(){
    if(!validate())return;
    const summary=buildSummary();
    try{
      await navigator.clipboard.writeText(summary.text);
    }catch(error){
      const helper=document.createElement('textarea');
      helper.value=summary.text;
      helper.style.position='fixed';
      helper.style.opacity='0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }
    status.textContent=`Your answers were copied. Paste them into an email to ${ADAPTIVE_EMAIL}.`;
    status.className='aa-form-status success';
  }

  document.getElementById('copyAdaptiveInterestBtn')?.addEventListener('click',copyAnswers);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    document.getElementById('prepareAdaptiveInterestBtn')?.click();
  });
})();

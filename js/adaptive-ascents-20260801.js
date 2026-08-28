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
      'OUTING INTEREST',field('adaptivePath'),'',
      'PARTICIPANT',
      `Preferred name: ${participant}`,
      `Age or age range: ${field('participantAge')}`,
      `Pronouns: ${field('participantPronouns')}`,'',
      'CONTACT',
      `Contact name: ${field('contactName')}`,
      `Completing as: ${field('contactRole')}`,
      `Email: ${field('contactEmail')}`,
      `Phone: ${field('contactPhone')}`,
      `Preferred contact: ${field('contactMethod')}`,'',
      'PARTICIPANT INTERESTS AND PREFERENCES',
      `Activities: ${checked('activityInterest')}`,
      `Activities, experiences, or goals that may be meaningful: ${field('goals')}`,
      `What tends to help an activity go well: ${field('goodDay')}`,
      `Activities, environments, or approaches that may be uncomfortable or unhelpful: ${field('avoid')}`,'',
      'COMMUNICATION AND SUPPORT',
      `Communication approaches: ${field('communicationSupport')}`,
      `How they show interest, comfort, discomfort, choice, or a need for a break: ${field('communicationDetails')}`,
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
      `Preferred first way to connect: ${field('meetingFormat')}`,
      `Follow-up availability: ${field('availability')}`,'',
      'ACKNOWLEDGMENTS',
      'The sender confirmed that Adaptive Ascents should seek and respect the participant’s preferences, comfort, and willingness to continue; that this is an interest form only; that follow-up is permitted; and that no medical records or private documents were included.'
    ];
    return {participant,lines,text:lines.join('\n')};
  }

  function mailto(subject,lines){
    return `mailto:${ADAPTIVE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  }

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

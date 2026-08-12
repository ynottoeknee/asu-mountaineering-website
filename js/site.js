/* Mountaineering Club at ASU — navigation, calendar, and Hearts game */

const navLinks=[...document.querySelectorAll('.nav-link')],pages=[...document.querySelectorAll('.page')];
function showPage(id){pages.forEach(p=>p.classList.toggle('active',p.id===id));navLinks.forEach(b=>b.classList.toggle('active',b.dataset.page===id));window.scrollTo({top:0,behavior:'smooth'});window.setTimeout(()=>initializeCalendlyInPage(id),100)}
navLinks.forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
const rm=document.getElementById('readMoreBtn'),pc=document.getElementById('philosophyCopy');rm.addEventListener('click',()=>{const c=pc.classList.toggle('collapsed');pc.style.maxHeight=c?'420px':'none';rm.textContent=c?'Read More':'Read Less'});
const suits=[['S','♠',0],['H','♥',1],['D','♦',1],['C','♣',0]],ranks=[['2',2],['3',3],['4',4],['5',5],['6',6],['7',7],['8',8],['9',9],['10',10],['J',11],['Q',12],['K',13],['A',14]],members=[['Anabelle','Team Member','assets/images/team/anabelle.jpg'],['Zahrah','Team Member','assets/images/team/zahrah.jpg'],['David Jacobs','Advisor','assets/images/team/david-jacobs.jpg'],['Louis','Team Member','assets/images/team/louis.jpg'],['Patt','Team Member','assets/images/team/patt.jpg'],['Ani','Team Member','assets/images/team/ani.jpg'],['Sienna','Vice President','assets/images/team/sienna.jpg'],['Tony','President','assets/images/team/tony.jpg'],['Tydan','Team Member',''],['Preccious','Team Member',''],['Charlie','Team Member',''],['Kira','Team Member',''],['Riley','Team Member',''],['Arnab','Team Member',''],['Sam','Team Member','']];
let g={totalYou:0,totalCpu:0,roundYou:0,roundCpu:0,dealer:'computer',deck:[],player:[],cpu:[],playerCap:[],cpuCap:[],leader:'player',trick:[],phase:'idle',selected:new Set(),forced:false};
const E=id=>document.getElementById(id),el={ph:E('playerHand'),ch:E('computerHand'),ct:E('centerTrick'),st:E('gameStatus'),dc:E('drawCount'),ty:E('totalYou'),tc:E('totalCpu'),ry:E('roundYou'),rc:E('roundCpu'),dl:E('dealerLabel'),yt:E('youTricks'),cp:E('cpuTricks'),po:E('passOverlay'),pc:E('passCount'),cb:E('confirmPassBtn'),ro:E('roundOverlay'),rs:E('roundSummary'),rt:E('roundTitle'),nr:E('nextRoundBtn'),sg:E('startGameBtn'),df:E('drawFollowBtn'),deal:E('dealLayer')};
function deck(){let d=[],i=0;for(const s of suits)for(const r of ranks){const m=members[i++%members.length];d.push({id:s[0]+r[0],suit:s[0],symbol:s[1],red:s[2],rank:r[0],value:r[1],name:m[0],role:m[1],photo:m[2]||''})}return d}function shuffle(a){for(let i=a.length-1;i;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}function pts(c){return c.suit==='H'?1:(c.suit==='S'&&c.rank==='Q'?13:0)}function sort(h){let o={S:0,H:1,D:2,C:3};h.sort((a,b)=>o[a.suit]-o[b.suit]||a.value-b.value)}function sleep(ms){return new Promise(r=>setTimeout(r,ms))}function status(t){el.st.textContent=t}
function card(c,opt={}){
  let d=document.createElement('div');
  d.className='playing-card'+(opt.back?' back':'')+(opt.legal?' legal':'')+(opt.selected?' selected':'')+(opt.anim?' '+opt.anim:'');
  if(!opt.back){
    d.innerHTML=`
      <div class="card-photo-layer" style="background-image:url('${c.photo}')" aria-hidden="true"></div>
      <div class="card-photo-shade" aria-hidden="true"></div>
      <div class="card-corner ${c.red?'red':''}">${c.rank}<span>${c.symbol}</span></div>
      <div class="member-label">${c.name}</div>
      <div class="card-corner bottom ${c.red?'red':''}">${c.rank}<span>${c.symbol}</span></div>`;
    d.setAttribute('aria-label',`${c.rank}${c.symbol}, ${c.name}`);
  }
  return d
}
function score(){el.ty.textContent=g.totalYou;el.tc.textContent=g.totalCpu;el.ry.textContent=g.roundYou;el.rc.textContent=g.roundCpu;el.dc.textContent=g.deck.length;el.dl.textContent=g.dealer==='computer'?'Computer':'You';el.yt.textContent=Math.floor(g.playerCap.length/2);el.cp.textContent=Math.floor(g.cpuCap.length/2)}
function legal(){if(g.phase!=='play'||g.turn!=='player')return[];if(g.trick.length===0)return g.player;let s=g.trick[0].card.suit,m=g.player.filter(c=>c.suit===s);return m.length?m:(g.deck.length===0?g.player:[])}
function render(anim=false){sort(g.player);el.ph.innerHTML='';let L=new Set(legal().map(c=>c.id));g.player.forEach((c,i)=>{let d=card(c,{legal:g.phase==='pass'||L.has(c.id),selected:g.phase==='pass'&&g.selected.has(c.id),anim:anim?'deal-player':''});d.style.animationDelay=`${i*65}ms`;d.onclick=()=>clickCard(c);el.ph.appendChild(d)});el.ch.innerHTML='';g.cpu.forEach((c,i)=>{let d=card(c,{back:true,anim:anim?'deal-cpu':''});d.style.animationDelay=`${i*65+30}ms`;el.ch.appendChild(d)});score()}
function renderTrick(){el.ct.innerHTML='';g.trick.forEach(t=>{let w=document.createElement('div');w.style.textAlign='center';w.appendChild(card(t.card));let s=document.createElement('small');s.textContent=t.who==='player'?'You':'Computer';w.appendChild(s);el.ct.appendChild(w)})}

function relativeRect(node){
  const table=document.getElementById('woodTable').getBoundingClientRect();
  const rect=node.getBoundingClientRect();
  return {
    left:rect.left-table.left,
    top:rect.top-table.top,
    width:rect.width,
    height:rect.height
  };
}
async function slideDealCard(destination){
  const pile=document.querySelector('.draw-pile');
  const target=destination==='player'?el.ph:el.ch;
  const start=relativeRect(pile);
  const end=relativeRect(target);
  const small=window.innerWidth<=700;
  const width=small?84:104;
  const height=small?124:148;

  const moving=document.createElement('div');
  moving.className='deal-card '+(destination==='player'?'player-bound':'cpu-bound');
  moving.style.left=start.left+'px';
  moving.style.top=start.top+'px';
  el.deal.appendChild(moving);
  moving.getBoundingClientRect();

  requestAnimationFrame(()=>{
    moving.style.left=(end.left+(end.width-width)/2)+'px';
    moving.style.top=(end.top+(end.height-height)/2)+'px';
  });

  await sleep(820);
  moving.style.opacity='0';
  await sleep(170);
  moving.remove();
}

async function startRound(){
  g.deck=shuffle(deck());
  g.player=[];g.cpu=[];g.playerCap=[];g.cpuCap=[];
  g.roundYou=0;g.roundCpu=0;g.trick=[];g.selected.clear();g.forced=false;
  g.phase='dealing';g.turn=null;
  el.ro.classList.remove('active');
  el.po.classList.remove('active');
  el.sg.classList.add('hidden');
  el.df.classList.add('hidden');
  el.pc.textContent='0';
  el.cb.disabled=true;
  status('Shuffling the deck…');
  render();
  await sleep(850);
  status('Dealing one card at a time…');

  for(let i=0;i<6;i++){
    const first=g.dealer==='computer'?'player':'cpu';
    const second=g.dealer==='computer'?'cpu':'player';

    await slideDealCard(first==='player'?'player':'cpu');
    if(first==='player')g.player.push(g.deck.pop());else g.cpu.push(g.deck.pop());
    render();
    await sleep(180);

    await slideDealCard(second==='player'?'player':'cpu');
    if(second==='player')g.player.push(g.deck.pop());else g.cpu.push(g.deck.pop());
    render();
    await sleep(240);
  }

  g.phase='pass';
  status('Choose three cards to pass.');
  el.po.classList.add('active');
  render();
}
function clickCard(c){if(g.phase==='pass'){g.selected.has(c.id)?g.selected.delete(c.id):g.selected.size<3&&g.selected.add(c.id);el.pc.textContent=g.selected.size;el.cb.disabled=g.selected.size!==3;status(g.selected.size===3?'Three selected. Press “Pass Cards.”':`Choose ${3-g.selected.size} more card${3-g.selected.size===1?'':'s'} to pass.`);render();return}if(g.phase!=='play'||!legal().some(x=>x.id===c.id))return;playerPlay(c)}
function cpuPass(){return [...g.cpu].sort((a,b)=>(pts(b)*20+b.value+(b.suit==='S'?5:0))-(pts(a)*20+a.value+(a.suit==='S'?5:0))).slice(0,3)}
el.cb.onclick=async()=>{if(g.selected.size!==3)return;let pp=g.player.filter(c=>g.selected.has(c.id)),cp=cpuPass();g.player=g.player.filter(c=>!g.selected.has(c.id));g.cpu=g.cpu.filter(c=>!cp.some(x=>x.id===c.id));await sleep(300);g.player.push(...cp);g.cpu.push(...pp);el.po.classList.remove('active');g.phase='play';g.leader=g.dealer==='computer'?'player':'cpu';g.turn=g.leader;status(g.leader==='player'?'You lead the first trick.':'The computer leads the first trick.');render();if(g.leader==='cpu')setTimeout(cpuLead,650)};
async function playerPlay(c){if(g.turn!=='player')return;g.turn=null;let i=g.player.findIndex(x=>x.id===c.id);if(i<0)return;g.player.splice(i,1);g.trick.push({who:'player',card:c});render();renderTrick();status(`You play ${c.rank}${c.symbol}.`);await sleep(520);if(g.trick.length===1){g.leader='player';cpuFollow()}else resolve()}
function leadChoice(){
  const cards=[...g.cpu];
  const suitCounts=cards.reduce((acc,c)=>(acc[c.suit]=(acc[c.suit]||0)+1,acc),{});
  const heartsBroken=[...g.playerCap,...g.cpuCap,...g.trick].some(x=>(x.card||x).suit==='H');

  // Prefer leading low cards from short suits to create opportunities to discard later.
  let candidates=cards.filter(c=>c.suit!=='H'||heartsBroken);
  if(!candidates.length)candidates=cards;

  // Avoid leading the Queen of Spades unless forced.
  const withoutQS=candidates.filter(c=>!(c.suit==='S'&&c.value===12));
  if(withoutQS.length)candidates=withoutQS;

  return candidates.sort((a,b)=>{
    const shortSuit=(suitCounts[a.suit]-suitCounts[b.suit]);
    if(shortSuit!==0)return shortSuit;
    const riskA=pts(a)*30+a.value;
    const riskB=pts(b)*30+b.value;
    return riskA-riskB;
  })[0];
}async function cpuLead(){if(g.phase!=='play'||!g.cpu.length||g.turn!=='cpu')return;g.turn=null;let c=leadChoice();g.cpu.splice(g.cpu.indexOf(c),1);g.trick.push({who:'cpu',card:c});g.leader='computer';render();renderTrick();status(`Computer leads ${c.rank}${c.symbol}.`);await sleep(450);let m=g.player.filter(x=>x.suit===c.suit);if(m.length){g.turn='player';status(`Follow ${c.symbol}.`);render()}else if(g.deck.length){g.turn='player';status(`You have no ${c.symbol}. Draw until you can follow.`);el.df.classList.remove('hidden');render()}else{g.turn='player';g.forced=true;status('Draw pile empty. Play any card; the computer takes the trick.');render()}}
function followChoice(options,lead){
  const sorted=[...options].sort((a,b)=>a.value-b.value);
  const losing=sorted.filter(c=>c.value<lead.value);

  // If the trick contains points, try to duck under the lead.
  const trickPoints=g.trick.reduce((sum,t)=>sum+pts(t.card),0);
  if(losing.length){
    if(trickPoints>0)return losing[losing.length-1];
    // Even on a clean trick, shed the highest card that still loses.
    return losing[losing.length-1];
  }

  // If forced to win, use the smallest winning card.
  return sorted[0];
}async function cpuFollow(){g.turn='cpu';let lead=g.trick[0].card,m=g.cpu.filter(c=>c.suit===lead.suit);if(!m.length&&g.deck.length){status(`Computer draws for ${lead.symbol}…`);while(g.deck.length){let d=g.deck.pop();g.cpu.push(d);render();await sleep(280);if(d.suit===lead.suit){m=[d];break}}}let c;if(m.length)c=followChoice(m,lead);else{g.forced=true;c=[...g.cpu].sort((a,b)=>{
  const dangerA=pts(a)*100+(a.suit==='S'&&a.value===12?500:0)+a.value;
  const dangerB=pts(b)*100+(b.suit==='S'&&b.value===12?500:0)+b.value;
  return dangerB-dangerA;
})[0]}g.cpu.splice(g.cpu.indexOf(c),1);g.trick.push({who:'cpu',card:c});render();renderTrick();status(`Computer plays ${c.rank}${c.symbol}.`);g.turn=null;await sleep(560);resolve()}
el.df.onclick=async()=>{el.df.classList.add('hidden');let s=g.trick[0].card.suit;while(g.deck.length){let d=g.deck.pop();g.player.push(d);render();await sleep(300);if(d.suit===s){status(`You drew ${d.rank}${d.symbol} and must play it.`);await sleep(380);playerPlay(d);return}}g.forced=true;status('Draw pile empty. Play any card; the leader takes the trick.');render()};
async function resolve(){let lead=g.trick[0],follow=g.trick[1],winner=g.forced?lead.who:((follow.card.suit===lead.card.suit&&follow.card.value>lead.card.value)?follow.who:lead.who),cards=g.trick.map(t=>t.card);(winner==='player'?g.playerCap:g.cpuCap).push(...cards);g.roundYou=g.playerCap.reduce((s,c)=>s+pts(c),0);g.roundCpu=g.cpuCap.reduce((s,c)=>s+pts(c),0);g.turn=null;status(winner==='player'?'You take the trick.':'Computer takes the trick.');score();await sleep(760);g.trick=[];g.forced=false;renderTrick();if(!g.player.length||!g.cpu.length){endRound();return}g.leader=winner;g.turn=winner;if(winner==='cpu'){status('Computer leads the next trick.');render();setTimeout(cpuLead,550)}else{status('You lead the next trick.');render()}}
function endRound(){g.phase='roundOver';g.totalYou+=g.roundYou;g.totalCpu+=g.roundCpu;score();let txt=`You took ${g.roundYou} point${g.roundYou===1?'':'s'}. The computer took ${g.roundCpu} point${g.roundCpu===1?'':'s'}.`,over=(g.totalYou>=50||g.totalCpu>=50)&&g.totalYou!==g.totalCpu;if(over){el.rt.textContent='Final Campfire';txt+=' '+(g.totalYou<g.totalCpu?'You win the game!':'The computer wins the game.');el.nr.textContent='New Game'}else{el.rt.textContent='Campfire';el.nr.textContent='Deal Again'}el.rs.textContent=txt;el.ro.classList.add('active')}
el.nr.onclick=()=>{let over=(g.totalYou>=50||g.totalCpu>=50)&&g.totalYou!==g.totalCpu;if(over){g.totalYou=0;g.totalCpu=0;g.dealer='computer'}else g.dealer=g.dealer==='computer'?'player':'computer';startRound()};el.sg.onclick=startRound;score();


/* Interactive calendar */
const calendarGrid = document.getElementById('calendarGrid');
const calendarMonthLabel = document.getElementById('calendarMonthLabel');
const calendarPrev = document.getElementById('calendarPrev');
const calendarNext = document.getElementById('calendarNext');

const today = new Date();
let calendarView = new Date(today.getFullYear(), today.getMonth(), 1);
const calendarEvents = [
  {
    date:'2026-08-18',
    title:'Volunteering with Valley of the Sun',
    time:'10–11 AM',
    description:'Building heat relief kits for those in need.',
    category:'service'
  }
];

function renderCalendar(){
  if(!calendarGrid) return;

  calendarGrid.querySelectorAll('.calendar-day').forEach(day => day.remove());

  const year = calendarView.getFullYear();
  const month = calendarView.getMonth();
  calendarMonthLabel.textContent = calendarView.toLocaleDateString(undefined, {
    month:'long',
    year:'numeric'
  });

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();

  // Always render six full weeks so the calendar does not jump in height.
  for(let cell = 0; cell < 42; cell++){
    const day = document.createElement('div');
    day.className = 'calendar-day';

    let number;
    let cellMonth = month;
    let cellYear = year;

    if(cell < firstWeekday){
      number = previousMonthDays - firstWeekday + cell + 1;
      cellMonth = month - 1;
      day.classList.add('empty');
    } else if(cell >= firstWeekday + daysInMonth){
      number = cell - firstWeekday - daysInMonth + 1;
      cellMonth = month + 1;
      day.classList.add('empty');
    } else {
      number = cell - firstWeekday + 1;
    }

    const normalized = new Date(cellYear, cellMonth, number);
    const isToday =
      normalized.getFullYear() === today.getFullYear() &&
      normalized.getMonth() === today.getMonth() &&
      normalized.getDate() === today.getDate();

    if(isToday) day.classList.add('today');

    day.innerHTML = `<span class="calendar-day-number">${number}</span>`;

    if(!day.classList.contains('empty')){
      const dateKey = [
        normalized.getFullYear(),
        String(normalized.getMonth() + 1).padStart(2, '0'),
        String(normalized.getDate()).padStart(2, '0')
      ].join('-');

      calendarEvents
        .filter(calendarEvent => calendarEvent.date === dateKey)
        .forEach(calendarEvent => {
          const eventCard = document.createElement('article');
          const eventCategory = calendarEvent.category || 'club';
          eventCard.className = `calendar-event calendar-event-${eventCategory}`;
          eventCard.setAttribute(
            'aria-label',
            `${eventCategory} event: ${calendarEvent.title}, ${calendarEvent.time}. ${calendarEvent.description}`
          );

          const eventTitle = document.createElement('strong');
          eventTitle.textContent = calendarEvent.title;

          const eventTime = document.createElement('span');
          eventTime.textContent = calendarEvent.time;

          const eventDescription = document.createElement('span');
          eventDescription.textContent = calendarEvent.description;

          eventCard.append(eventTitle, eventTime, eventDescription);
          day.appendChild(eventCard);
        });
    }

    calendarGrid.appendChild(day);
  }
}

function changeCalendarMonth(amount){
  calendarView = new Date(
    calendarView.getFullYear(),
    calendarView.getMonth() + amount,
    1
  );
  renderCalendar();
}

calendarPrev?.addEventListener('click', () => changeCalendarMonth(-1));
calendarNext?.addEventListener('click', () => changeCalendarMonth(1));

const calendarShell = document.querySelector('.calendar-scroll-shell');
let calendarTouchStartX = null;

calendarShell?.addEventListener('touchstart', event => {
  calendarTouchStartX = event.changedTouches[0].clientX;
}, {passive:true});

calendarShell?.addEventListener('touchend', event => {
  if(calendarTouchStartX === null) return;
  const movement = event.changedTouches[0].clientX - calendarTouchStartX;
  if(Math.abs(movement) > 55) changeCalendarMonth(movement < 0 ? 1 : -1);
  calendarTouchStartX = null;
}, {passive:true});

calendarShell?.addEventListener('wheel', event => {
  if(Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 20){
    event.preventDefault();
    changeCalendarMonth(event.deltaX > 0 ? 1 : -1);
  }
}, {passive:false});

renderCalendar();



/* MCA Website v1.2 — Community tabs and MCA Field Guide Library */
const MCA_LINKS = {
  partnerWithUs: 'https://docs.google.com/forms/d/e/1FAIpQLSfFo8v3ExGk2biSkB9yuKXN0HSot7lwCsf1ZZ-WeQDTBA3IDw/viewform',
  proposeProject: 'https://docs.google.com/forms/d/e/1FAIpQLScisP8m11F36UPZruDZyJ_ACejUVF4sFChR10qxmw_SZl-qfQ/viewform',
  leadershipInterest: 'https://docs.google.com/forms/d/e/1FAIpQLScwABbJ4oK8ECNFaadgg6wInFrCv6v5L1jAMJK3QoVz_5dLPQ/viewform',
  requestResource: 'https://docs.google.com/forms/d/e/1FAIpQLScisP8m11F36UPZruDZyJ_ACejUVF4sFChR10qxmw_SZl-qfQ/viewform',
  contributeResource: 'https://docs.google.com/forms/d/e/1FAIpQLScisP8m11F36UPZruDZyJ_ACejUVF4sFChR10qxmw_SZl-qfQ/viewform',
  gettingStarted: 'https://docs.google.com/document/d/1iyvPT_0jVQM79v9BW8sLnW0A9tHTIOwPgdrqBTKjN88/edit',
  howTripsWork: 'https://docs.google.com/document/d/1EW-xJA-nhTQKKxnAsnOy6eF-XiBxkkiG7fp7TFDMc7w/edit',
  gearNeeded: 'https://docs.google.com/document/d/1lklmVB1qwZ2LYnj0iWe9TS4PHX5ixKEBt2oKiwQhlTQ/edit',
  dayHikePacking: 'https://docs.google.com/document/d/16d0bjoAbZnyY70-nbCjksgY2r0_vRItu9OFe1aF9_uI/edit',
  overnightPacking: 'https://docs.google.com/document/d/18Fs0I9JtgUpstacpHU8p2y7Aq6rONk3j_PeKbZTABSE/edit',
  coldWeatherPacking: 'https://docs.google.com/document/d/1QiioNCP8PwYVO4g-S3Vta_xKFll-R3eDD0wrlzwrzgo/edit',
  routePlanning: 'https://docs.google.com/document/d/1ZsIwkE0-JpCJqDq5_pZXe69Q0_cojJsvFO-CkbFnNQQ/edit',
  weatherConditions: 'https://docs.google.com/document/d/1wwYA1YKpIbCd41NeeHyJPBuLhlqQcEdhfi6PrEPUqzk/edit',
  foodWaterPlanning: 'https://docs.google.com/document/d/1hloCcERTZgPOVcHE6uoqTgxN3ZF8yS2PiLVr8uGMIWM/edit',
  firstAidKits: 'https://docs.google.com/document/d/1dInPiqbgRtvvkn47O_Rs4YlEq652kL33R_dfTAfqRSI/edit',
  emergencyPlanning: 'https://docs.google.com/document/d/10Ff-PHs2YTKdBE_nF4gASR-Cv0frZsZ3JVMqgbCAUx0/edit',
  altitude: 'https://docs.google.com/document/d/1CS3yIbBsn7h8nKSfZpygZHkSVqy9c8if1oiQ0FsYrhA/edit',
  lightningMonsoon: 'https://docs.google.com/document/d/1ekVatplP6z_ANAyyqUooaFbCkL4e4GwLNoEBLJbLg-4/edit',
  bearsWildlife: 'https://docs.google.com/document/d/1DxxD6_tGOO-1AUI9Lq-puzVG-jmtDVYcvgaxA3aiGz4/edit',
  navigationFundamentals: 'https://docs.google.com/document/d/1PYbjOi406Vhimr0l-2KmM0lSK9XZqD6uwpYzEitaOPc/edit',
  campSystems: 'https://docs.google.com/document/d/1EAA8iH9WX7qY2W-1wyLRcCh5OZ0ITF0qHdVxCR5V8Fg/edit',
  snowTravel: 'https://docs.google.com/document/d/1u24Wd9roSsbO79fvcBSXEp4tGCBHWySGoTSHR0tbDKw/edit',
  knots: 'https://docs.google.com/document/d/1wkILIZyWx062wdCPqbo89Q6xVtkf8ryZKTcAEa-utI8/edit',
  conditioning: 'https://docs.google.com/document/d/1uIcI7ic7a8-_LD0OMCoFA3tqIzyCUyPXbxnLyI4CWWc/edit',
  affordableGear: 'https://docs.google.com/document/d/1YbOAuy8emdMEQjsbYHOYvIrhcH_tI7qxpgjBU84ogrc/edit',
  gearLibrary: 'https://docs.google.com/document/d/19H5Di9ReYR2KANJsRlbXe3HdcbmUhiu-j5vdUPfMOR8/edit',
  scholarshipsAssistance: 'https://docs.google.com/document/d/1MNXwByno4O0LG7DbH0Hg9PjMJKISHVvPFudXrf1PID4/edit',
  partnerDiscounts: 'https://docs.google.com/document/d/1kz_xM5VM10HtKq0nZc0DmXLCT4DvZNT2Y8zY55aw32w/edit',
  arizonaCivicAction: 'https://docs.google.com/document/d/19z_7Q1aKePjMDAfCpwi0muZ5Vj9vtdSLXEz-xR7eDro/edit',
  constitution: 'https://docs.google.com/document/d/1CTrwiLUBKHr0SxZPUCPeQbCh45u8hpWcBWShdq6ydSM/edit',
  waiver: 'https://docs.google.com/forms/d/e/1FAIpQLSd4Gn1_2n7BNehhSDihJeCeeRhdeQPstRWg77FqujOd-I4yVg/viewform',
  tripProposal: 'https://docs.google.com/forms/d/e/1FAIpQLSfa3PwYcBNhHrtHhdyaxgrIhiI9j1WC9Z_GboJ0CpGYczOuQg/viewform',
  incidentReport: 'https://docs.google.com/forms/d/e/1FAIpQLSdgbqslJTZc2p0m4LLWMK3l_jlnk4k8HSR4kEQ3tAP3sirtWg/viewform',
  leadershipDocuments: 'https://docs.google.com/document/d/1nYMEkqNmFcDHtN1hLQNmzkUR9fhEULRBH5ks_-FsvvU/edit'
};

const MCA_FORMS = {
  adaptiveIntake: 'https://docs.google.com/forms/d/e/1FAIpQLSflhhXBluaJpCH7oF0CvyTLfLEFPGu7BVs5WRywqhO6j9ssww/viewform',
  adaptiveRequest: 'https://docs.google.com/forms/d/e/1FAIpQLSdnR2fiO_G0EvS7XL2Y2T6scRDxzQPUWdbLHglYBOfTQVeGCw/viewform',
  partner: 'https://docs.google.com/forms/d/e/1FAIpQLSfFo8v3ExGk2biSkB9yuKXN0HSot7lwCsf1ZZ-WeQDTBA3IDw/viewform',
  leadership: 'https://docs.google.com/forms/d/e/1FAIpQLScwABbJ4oK8ECNFaadgg6wInFrCv6v5L1jAMJK3QoVz_5dLPQ/viewform',
  idea: 'https://docs.google.com/forms/d/e/1FAIpQLScisP8m11F36UPZruDZyJ_ACejUVF4sFChR10qxmw_SZl-qfQ/viewform',
  tripProposal: 'https://docs.google.com/forms/d/e/1FAIpQLSfa3PwYcBNhHrtHhdyaxgrIhiI9j1WC9Z_GboJ0CpGYczOuQg/viewform',
  incidentReport: 'https://docs.google.com/forms/d/e/1FAIpQLSdgbqslJTZc2p0m4LLWMK3l_jlnk4k8HSR4kEQ3tAP3sirtWg/viewform',
  waiver: 'https://docs.google.com/forms/d/e/1FAIpQLSd4Gn1_2n7BNehhSDihJeCeeRhdeQPstRWg77FqujOd-I4yVg/viewform'
};

function wirePlaceholderLinks(){
  document.querySelectorAll('[data-link-key]').forEach(link => {
    const destination=MCA_LINKS[link.dataset.linkKey];
    if(destination && destination !== '#'){
      link.href=destination;
      if(/^https?:\/\//.test(destination)){
        link.target='_blank';
        link.rel='noopener';
      }
    }
    link.addEventListener('click', event => {
      if(!destination || destination === '#'){
        event.preventDefault();
        window.alert('This link is ready for the final Google Doc, PDF, or form URL. Add it in MCA_LINKS near the bottom of js/site.js.');
      }
    });
  });
}

const communityTabs=[...document.querySelectorAll('.community-tab')];
const communityPanels=[...document.querySelectorAll('.community-tabpanel')];
function openCommunityTab(name, shouldScroll=false){
  communityTabs.forEach(tab=>{
    const active=tab.dataset.communityTab===name;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
  });
  communityPanels.forEach(panel=>panel.classList.toggle('active',panel.id===`community-tab-${name}`));
  if(shouldScroll) document.querySelector('.community-detail-section')?.scrollIntoView({behavior:'smooth',block:'start'});
}
communityTabs.forEach(tab=>tab.addEventListener('click',()=>openCommunityTab(tab.dataset.communityTab)));
document.querySelectorAll('.community-open-tab').forEach(button=>button.addEventListener('click',()=>openCommunityTab(button.dataset.communityTab,true)));
document.querySelectorAll('.role-toggle').forEach(button=>button.addEventListener('click',()=>{
  const card=button.closest('.community-role-card');
  const open=card.classList.toggle('open');
  button.textContent=open?'Close':'Learn More';
  button.setAttribute('aria-expanded',String(open));
}));

const resources=[
  {category:'Start Here',title:'Getting Started with MCA',format:'Field Guide',status:'Planned for Fall 2026',description:'A practical introduction to joining the club, attending your first event, preparing for a trip, and knowing what to expect.',included:['Joining and staying informed','Preparing for your first event','Where to ask questions'],button:'Open Guide',link:'gettingStarted'},
  {category:'Start Here',title:'How MCA Trips Work',format:'Website Guide',status:'Planned for Fall 2026',description:'An overview of trip proposals, signups, preparation, Team Leads, training requirements, transportation, and communication.',included:['How trips are proposed','Readiness and signups','Leader and participant responsibilities'],button:'Read Guide',link:'howTripsWork'},
  {category:'Start Here',title:'What Gear You Actually Need',format:'Field Guide',status:'Planned for Fall 2026',description:'A beginner-focused guide separating essential equipment from items that can be borrowed, rented, shared, or purchased later.',included:['Essential beginner equipment','Borrowing and renting','What can wait'],button:'Open Guide',link:'gearNeeded'},
  {category:'Packing Lists',title:'Day Hike Packing List',format:'Checklist',status:'Planned for Fall 2026',description:'A printable checklist for typical MCA day hikes, training days, and local outings.',included:['Core essentials','Weather add-ons','Leader checks'],button:'Open Checklist',link:'dayHikePacking'},
  {category:'Packing Lists',title:'Overnight and Backpacking Packing List',format:'Checklist',status:'Planned for Fall 2026',description:'A flexible checklist for overnight trips, backpacking objectives, and basecamp-style expeditions.',included:['Shelter and sleep','Food and water','Group and technical gear'],button:'Open Checklist',link:'overnightPacking'},
  {category:'Packing Lists',title:'Cold Weather and Snow Packing List',format:'Checklist',status:'Future Resource',description:'A planning checklist for trips involving freezing temperatures, snow travel, or extended exposure to cold conditions.',included:['Layering and insulation','Snow-travel equipment','Cold emergency items'],button:'Open Checklist',link:'coldWeatherPacking'},
  {category:'Plan and Prepare',title:'Route Planning',format:'Field Guide',status:'Planned for Fall 2026',description:'A guide to researching routes, estimating time, identifying hazards, checking access, and communicating a plan.',included:['Maps and route research','Timing and turnarounds','Access and alternates'],button:'Open Guide',link:'routePlanning'},
  {category:'Plan and Prepare',title:'Weather and Conditions',format:'Field Guide',status:'Planned for Fall 2026',description:'How to check forecasts, compare mountain conditions, recognize uncertainty, and decide when a plan should change.',included:['Forecast sources','Condition comparison','Go, modify, or cancel'],button:'Open Guide',link:'weatherConditions'},
  {category:'Plan and Prepare',title:'Food and Water Planning',format:'Field Guide',status:'Future Resource',description:'A practical guide to estimating water needs, choosing treatment methods, and planning food for different trips.',included:['Water estimates','Treatment methods','Trip food planning'],button:'Open Guide',link:'foodWaterPlanning'},
  {category:'Safety',title:'First Aid and Personal Kits',format:'Field Guide',status:'Planned for Fall 2026',description:'An introductory guide to building a useful personal first aid kit and understanding the purpose of each item.',included:['Kit contents','Personal medication','Care and replacement'],button:'Open Guide',link:'firstAidKits'},
  {category:'Safety',title:'Emergency Planning',format:'Field Guide',status:'Planned for Fall 2026',description:'A guide for leaders and participants covering emergency contacts, communication, evacuation thinking, and incident documentation.',included:['Contacts and check-ins','Communication plans','Evacuation and documentation'],button:'Open Guide',link:'emergencyPlanning'},
  {category:'Safety',title:'Altitude and Acclimatization',format:'Field Guide',status:'Future Resource',description:'How altitude affects the body, what warning signs to watch for, and how members can prepare for higher-elevation objectives.',included:['Common symptoms','Acclimatization basics','When to descend'],button:'Open Guide',link:'altitude'},
  {category:'Safety',title:'Lightning and Monsoon Safety',format:'Field Guide',status:'Planned for Fall 2026',description:'Arizona-focused guidance for recognizing thunderstorm risk, planning around timing, and responding when conditions worsen.',included:['Forecast and timing','Warning signs','Response in exposed terrain'],button:'Open Guide',link:'lightningMonsoon'},
  {category:'Safety',title:'Bears and Wildlife',format:'Field Guide',status:'Future Resource',description:'Basic guidance for reducing wildlife conflicts, storing food responsibly, and responding to common encounters.',included:['Food storage','Encounter response','Reducing conflict'],button:'Open Guide',link:'bearsWildlife'},
  {category:'Skills',title:'Navigation Fundamentals',format:'Field Guide',status:'Future Resource',description:'An introduction to maps, digital navigation, route awareness, and the limitations of relying on a phone alone.',included:['Map fundamentals','Digital tools','Route awareness'],button:'Open Guide',link:'navigationFundamentals'},
  {category:'Skills',title:'Camp Systems',format:'Field Guide',status:'Future Resource',description:'A practical overview of shelter, sleep, cooking, water, sanitation, and organizing a group campsite.',included:['Shelter and sleep','Cooking and water','Campsite organization'],button:'Open Guide',link:'campSystems'},
  {category:'Skills',title:'Introduction to Snow Travel',format:'Field Guide',status:'Future Resource',description:'A foundational overview of snow travel equipment, movement, conditions, and the need for qualified instruction.',included:['Equipment overview','Movement fundamentals','Limits of informal training'],button:'Open Guide',link:'snowTravel'},
  {category:'Skills',title:'Knots and Rope Skills',format:'Field Guide',status:'Future Resource',description:'A reference for knots taught during MCA practice sessions, with clear limits on when informal instruction is sufficient.',included:['Core knots','Practice references','Training limitations'],button:'Open Guide',link:'knots'},
  {category:'Skills',title:'Conditioning for Mountain Objectives',format:'Field Guide',status:'Planned for Fall 2026',description:'A flexible training guide for hiking endurance, weighted-pack work, StairMaster sessions, strength, and recovery.',included:['Weekly structure','Pack and stair progression','Recovery'],button:'Open Guide',link:'conditioning'},
  {category:'Gear and Access',title:'Affordable Gear Recommendations',format:'Field Guide',status:'Future Resource',description:'A budget-conscious guide to buying used, renting, borrowing, repairing, and prioritizing outdoor equipment.',included:['What to buy first','Used and rental options','Repair and longevity'],button:'Open Guide',link:'affordableGear'},
  {category:'Gear and Access',title:'MCA Gear Library',format:'Website Guide',status:'Program in Development',description:'A future catalog of club-owned equipment available for members to borrow or reserve.',included:['Available equipment','Reservation process','Care and return'],button:'View Gear Library',link:'gearLibrary'},
  {category:'Gear and Access',title:'Scholarships and Financial Assistance',format:'Website Guide',status:'Program in Development',description:'Information about trip support, gear access, training assistance, and other developing affordability programs.',included:['Trip support','Gear access','Training assistance'],button:'Learn More',link:'scholarshipsAssistance'},
  {category:'Gear and Access',title:'Partner Discounts',format:'Website Guide',status:'Program in Development',description:'A future directory of member discounts, rentals, equipment support, and training opportunities offered by club partners.',included:['Discount directory','Rental support','Partner opportunities'],button:'View Discounts',link:'partnerDiscounts'},
  {category:'Community Action',title:'Arizona Civic Action: Contact Representatives & Verify Petitions',format:'Field Guide',status:'Current Official Links',description:'Official tools for finding Arizona state and federal representatives, contacting public offices, and checking initiative or petition information before signing.',included:['Find state and federal representatives','Contact-message template','Official petition and ballot-measure verification'],button:'Open Guide',link:'arizonaCivicAction'},
  {category:'Club Documents',title:'MCA Constitution',format:'PDF',status:'Current Version',description:'The governing document describing the club’s purpose, leadership structure, responsibilities, membership, elections, and continuity.',included:['Purpose and values','Leadership structure','Membership and governance'],button:'View Constitution',link:'constitution'},
  {category:'Club Documents',title:'Participation and Liability Waiver',format:'Form',status:'Pending Legal Review',description:'The required participation document describing outdoor risks, individual responsibilities, emergency care, and releases.',included:['Risk acknowledgement','Participant responsibilities','Emergency information'],button:'Open Waiver',link:'waiver'},
  {category:'Club Documents',title:'Trip Proposal Form',format:'Form',status:'Planned for Fall 2026',description:'A form for members or leaders proposing an adventure, expedition, training outing, or member-led trip.',included:['Objective and route','Readiness and logistics','Safety plan'],button:'Propose a Trip',link:'tripProposal'},
  {category:'Club Documents',title:'Incident and Near-Miss Report',format:'Form',status:'Planned for Fall 2026',description:'A private form for documenting injuries, emergencies, close calls, equipment issues, and other safety concerns.',included:['Incident details','Response and contributing factors','Follow-up'],button:'Open Form',link:'incidentReport'},
  {category:'Club Documents',title:'Leadership Documents',format:'Website Guide',status:'Restricted Resource',description:'Templates, records, handoff materials, meeting notes, and planning tools used by officers and Team Leads.',included:['Templates and records','Meeting notes','Leadership handoffs'],button:'Open Leadership Library',link:'leadershipDocuments'}
];
const categoryDescriptions={
 'Start Here':'The clearest place for new members to begin.',
 'Packing Lists':'Printable lists that can be adjusted for the specific trip.',
 'Plan and Prepare':'Tools for researching, organizing, and communicating a responsible plan.',
 'Safety':'Foundational risk information and links to trusted instruction.',
 'Skills':'Introductions, references, and preparation materials for club training.',
 'Gear and Access':'Affordable equipment guidance and developing member-support programs.',
 'Community Action':'Official civic tools for contacting representatives and checking public petitions.',
 'Club Documents':'Official policies, forms, governance documents, and internal tools.'
};
const resourceCategories=[...new Set(resources.map(r=>r.category))];
const resourceFiltersRoot=document.getElementById('resourceFilters');
const resourceSections=document.getElementById('resourceSections');
const resourceSearch=document.getElementById('resourceSearch');
const resourceFormat=document.getElementById('resourceFormat');
const resourceCount=document.getElementById('resourceCount');
const resourceEmpty=document.getElementById('resourceEmpty');
const resourceExpandAll=document.getElementById('resourceExpandAll');
let activeResourceCategory='All';
function buildResourceLibrary(){
 if(!resourceFiltersRoot||!resourceSections)return;
 ['All',...resourceCategories].forEach((category,index)=>{const button=document.createElement('button');button.className=`btn resource-filter${index===0?' active':''}`;button.textContent=category;button.dataset.category=category;button.setAttribute('aria-pressed',String(index===0));button.addEventListener('click',()=>{activeResourceCategory=category;resourceFiltersRoot.querySelectorAll('.resource-filter').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});filterResourceLibrary();});resourceFiltersRoot.appendChild(button);});
 resourceCategories.forEach(category=>{const section=document.createElement('section');section.className='resource-category-section';section.dataset.category=category;section.innerHTML=`<div class="resource-category-heading"><h3>${category}</h3><p>${categoryDescriptions[category]||''}</p></div><div class="resource-category-grid"></div>`;const grid=section.querySelector('.resource-category-grid');resources.filter(r=>r.category===category).forEach(resource=>{const card=document.createElement('article');card.className='resource-card';card.dataset.category=resource.category;card.dataset.format=resource.format;card.dataset.search=`${resource.category} ${resource.title} ${resource.format} ${resource.status} ${resource.description} ${resource.included.join(' ')}`.toLowerCase();card.innerHTML=`<div class="resource-meta"><span>${resource.format}</span><span>${resource.status}</span></div><h3>${resource.title}</h3><p>${resource.description}</p><div class="resource-card-actions"><a class="btn placeholder-link" href="#" data-link-key="${resource.link}">${resource.button}</a><details><summary>What’s Included</summary><ul>${resource.included.map(item=>`<li>${item}</li>`).join('')}</ul></details></div>`;grid.appendChild(card);});resourceSections.appendChild(section);});wirePlaceholderLinks();filterResourceLibrary();}
function filterResourceLibrary(){if(!resourceSections)return;const query=(resourceSearch?.value||'').trim().toLowerCase();const format=resourceFormat?.value||'all';let count=0;resourceSections.querySelectorAll('.resource-category-section').forEach(section=>{let local=0;section.querySelectorAll('.resource-card').forEach(card=>{const show=(activeResourceCategory==='All'||card.dataset.category===activeResourceCategory)&&(format==='all'||card.dataset.format===format)&&(!query||card.dataset.search.includes(query));card.classList.toggle('filtered-out',!show);if(show){count++;local++;}});section.classList.toggle('filtered-out',local===0);});if(resourceCount)resourceCount.textContent=`${count} resources shown`;if(resourceEmpty)resourceEmpty.hidden=count!==0;}
resourceSearch?.addEventListener('input',filterResourceLibrary);resourceFormat?.addEventListener('change',filterResourceLibrary);
resourceExpandAll?.addEventListener('click',()=>{const visible=[...document.querySelectorAll('.resource-card:not(.filtered-out) details')];const shouldOpen=visible.some(d=>!d.open);visible.forEach(d=>d.open=shouldOpen);resourceExpandAll.textContent=shouldOpen?'Collapse All':'Expand All';});
wirePlaceholderLinks();buildResourceLibrary();


/* Simplified idea request + Calendly flow */
const MCA_IDEA_EMAIL='afishe54@asu.edu';

const simpleIdeaForm=document.getElementById('simpleIdeaForm');
const simpleIdeaName=document.getElementById('simpleIdeaName');
const simpleIdeaEmail=document.getElementById('simpleIdeaEmail');
const simpleIdeaType=document.getElementById('simpleIdeaType');
const simpleIdeaDetails=document.getElementById('simpleIdeaDetails');
const prepareIdeaRequestBtn=document.getElementById('prepareIdeaRequestBtn');
const simpleIdeaStatus=document.getElementById('simpleIdeaStatus');
const ideaScheduleSection=document.getElementById('ideaScheduleSection');
const editSimpleIdeaBtn=document.getElementById('editSimpleIdeaBtn');
const simpleIdeaSummaryTitle=document.getElementById('simpleIdeaSummaryTitle');
const simpleIdeaSummaryText=document.getElementById('simpleIdeaSummaryText');
const sendIdeaEmailBtn=document.getElementById('sendIdeaEmailBtn');
const ideaFinishSection=document.getElementById('ideaFinishSection');

function buildSimpleIdeaMessage(){
  const name=simpleIdeaName?.value.trim()||'A club member';
  const email=simpleIdeaEmail?.value.trim()||'Not provided';
  const type=simpleIdeaType?.value||'MCA idea';
  const details=simpleIdeaDetails?.value.trim()||'No details provided.';

  return [
    'Hello MCA,',
    '',
    `I would like to meet about a possible ${type.toLowerCase()}.`,
    '',
    'WHAT SHOULD WE KNOW?',
    details,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    'I am scheduling a 30-minute meeting through the MCA website.'
  ].join('\n');
}

function revealIdeaScheduler(){
  if(!simpleIdeaForm?.reportValidity())return;

  const name=simpleIdeaName.value.trim();
  const type=simpleIdeaType.value;
  const details=simpleIdeaDetails.value.trim();
  const message=buildSimpleIdeaMessage();

  simpleIdeaSummaryTitle.textContent=type;
  simpleIdeaSummaryText.textContent=`${name}: ${details}`;

  const subject=encodeURIComponent(`MCA idea meeting — ${type}`);
  const body=encodeURIComponent(message);
  sendIdeaEmailBtn.href=`mailto:${MCA_IDEA_EMAIL}?subject=${subject}&body=${body}`;

  ideaScheduleSection.hidden=false;
  ideaFinishSection.hidden=false;

  simpleIdeaStatus.textContent=MCA_IDEA_EMAIL==='your-email@asu.edu'
    ? 'Your details are ready. Add the club email address in js/site.js before publishing, then send the message and choose a time below.'
    : 'Your details are ready. Send them to MCA, then choose a time below.';

  ideaScheduleSection.scrollIntoView({behavior:'smooth',block:'start'});
}

prepareIdeaRequestBtn?.addEventListener('click',revealIdeaScheduler);

editSimpleIdeaBtn?.addEventListener('click',()=>{
  simpleIdeaForm.scrollIntoView({behavior:'smooth',block:'start'});
  simpleIdeaDetails?.focus();
});

/* Prefill the Calendly form with the member's name and email when possible. */
function refreshCalendlyPrefill(){
  const widget=document.querySelector('.mca-calendly');
  if(!widget || !window.Calendly)return;

  widget.innerHTML='';
  window.Calendly.initInlineWidget({
    url:'https://calendly.com/afishe54-asu/30min?hide_gdpr_banner=1&background_color=ffffff&text_color=111111&primary_color=111111',
    parentElement:widget,
    prefill:{
      name:simpleIdeaName?.value.trim()||'',
      email:simpleIdeaEmail?.value.trim()||''
    }
  });
}

prepareIdeaRequestBtn?.addEventListener('click',()=>{
  window.setTimeout(refreshCalendlyPrefill,250);
});


/* Route trip and service buttons into the shared Calendly idea page. */
document.querySelectorAll('[data-page="launchpad"]').forEach(button=>{
  button.addEventListener('click',()=>{
    const requested=button.dataset.ideaType;
    if(requested && simpleIdeaType){
      const option=[...simpleIdeaType.options].find(item=>item.textContent.trim()===requested);
      if(option)simpleIdeaType.value=option.value;
    }
  });
});


/* Adaptive outdoor access landing page */
const MCA_ADAPTIVE_EMAIL='afishe54@asu.edu';
const byId=id=>document.getElementById(id);

function adaptiveScrollTo(id){
  byId(id)?.scrollIntoView({behavior:'smooth',block:'start'});
}

document.querySelectorAll('.adaptive-jump').forEach(button=>{
  button.addEventListener('click',()=>adaptiveScrollTo(button.dataset.adaptiveTarget));
});

document.querySelectorAll('.adaptive-event-intake').forEach(button=>{
  button.addEventListener('click',()=>{
    const select=byId('adaptiveOpportunity');
    const requested=button.dataset.adaptiveEvent;
    if(select && requested){
      const option=[...select.options].find(item=>item.textContent.trim()===requested);
      if(option)select.value=option.value;
    }
    adaptiveScrollTo('adaptive-intake');
    window.setTimeout(()=>byId('adaptiveContactName')?.focus(),500);
  });
});

function mailtoFor(subject,lines){
  return `mailto:${MCA_ADAPTIVE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

const adaptiveIntakeForm=byId('adaptiveIntakeForm');
const adaptiveIntakeNext=byId('adaptiveIntakeNext');

function refreshAdaptiveCalendly(){
  const widget=document.querySelector('.adaptive-calendly');
  if(!widget || !window.Calendly)return;
  widget.innerHTML='';
  window.Calendly.initInlineWidget({
    url:'https://calendly.com/afishe54-asu/30min?hide_gdpr_banner=1&background_color=ffffff&text_color=111111&primary_color=111111',
    parentElement:widget,
    prefill:{
      name:byId('adaptiveContactName')?.value.trim()||'',
      email:byId('adaptiveContactEmail')?.value.trim()||''
    }
  });
}

byId('prepareAdaptiveIntakeBtn')?.addEventListener('click',()=>{
  if(!adaptiveIntakeForm?.reportValidity())return;
  const contact=byId('adaptiveContactName').value.trim();
  const participant=byId('adaptiveParticipantName').value.trim();
  const opportunity=byId('adaptiveOpportunity').value;
  const lines=[
    'ADAPTIVE PROGRAM INTAKE REQUEST','',
    `Contact: ${contact}`,
    `Email: ${byId('adaptiveContactEmail').value.trim()}`,
    `Phone: ${byId('adaptiveContactPhone').value.trim()}`,
    `Contact role: ${byId('adaptiveContactRole').value}`,
    `Participant: ${participant}`,
    `Age or age range: ${byId('adaptiveParticipantAge').value.trim()}`,
    `Opportunity: ${opportunity}`,
    `Preferred meeting: ${byId('adaptiveMeetingFormat').value}`,'',
    'PARTICIPANT GOALS',byId('adaptiveGoals').value.trim(),'',
    'SUPPORTS OR ACCOMMODATIONS',byId('adaptiveSupports').value.trim(),'',
    'RELEVANT EXPERIENCE',byId('adaptiveExperience').value.trim()||'Not provided','',
    'ADVANCE SAFETY PLANNING',byId('adaptiveSafety').value.trim()||'Not provided','',
    'MEETING AVAILABILITY',byId('adaptiveAvailability').value.trim(),'',
    'The contact acknowledged that the participant must be included in an introductory meeting before a first event is confirmed.'
  ];
  byId('adaptiveIntakeSummaryTitle').textContent=`${participant} — ${opportunity}`;
  byId('adaptiveIntakeSummaryText').textContent=`Submitted by ${contact}. The next step is to email these details and schedule the participant meeting.`;
  byId('sendAdaptiveIntakeEmail').href=mailtoFor(`MCA adaptive intake — ${participant}`,lines);
  byId('adaptiveIntakeStatus').textContent='Your intake is ready. Send it to MCA, then schedule the introductory meeting below.';
  adaptiveIntakeNext.hidden=false;
  adaptiveIntakeNext.scrollIntoView({behavior:'smooth',block:'start'});
  window.setTimeout(refreshAdaptiveCalendly,250);
});

const adaptiveWaiverForm=byId('adaptiveWaiverForm');
byId('prepareAdaptiveWaiverBtn')?.addEventListener('click',()=>{
  if(!adaptiveWaiverForm?.reportValidity())return;
  const participant=byId('waiverParticipant').value.trim();
  const lines=[
    'ADAPTIVE PROGRAM WAIVER WORKFLOW RECORD','',
    `Participant: ${participant}`,
    `Parent or guardian: ${byId('waiverGuardian').value.trim()||'Not applicable / not provided'}`,
    `Emergency contact: ${byId('waiverEmergencyName').value.trim()}`,
    `Emergency phone: ${byId('waiverEmergencyPhone').value.trim()}`,
    `Relationship: ${byId('waiverRelationship').value.trim()}`,
    `Photo permission: ${byId('waiverPhotoPermission').value}`,
    `Typed signature: ${byId('waiverSignature').value.trim()}`,
    `Date: ${byId('waiverDate').value}`,'',
    'All displayed acknowledgments were checked. This record does not replace the final ASU- or partner-approved legal waiver language.'
  ];
  const link=byId('sendAdaptiveWaiverEmail');
  link.href=mailtoFor(`MCA adaptive waiver record — ${participant}`,lines);
  link.hidden=false;
  byId('adaptiveWaiverStatus').textContent='The waiver workflow record is ready. The approved legal waiver language must be added before this is used publicly.';
});

const adaptiveRequestForm=byId('adaptiveRequestForm');
byId('prepareAdaptiveRequestBtn')?.addEventListener('click',()=>{
  if(!adaptiveRequestForm?.reportValidity())return;
  const name=byId('adaptiveRequestName').value.trim();
  const type=byId('adaptiveRequestType').value;
  const lines=[
    'ADAPTIVE PROGRAM REQUEST OR FEEDBACK','',
    `From: ${name}`,
    `Email: ${byId('adaptiveRequestEmail').value.trim()}`,
    `Type: ${type}`,
    `For: ${byId('adaptiveRequestFor').value.trim()}`,'',
    'DETAILS',byId('adaptiveRequestDetails').value.trim(),'',
    'REQUESTED CHANGE, SUPPORT, OR OUTCOME',byId('adaptiveRequestSupport').value.trim(),'',
    `Follow-up permitted: ${byId('adaptiveRequestFollowup').checked?'Yes':'No'}`
  ];
  const link=byId('sendAdaptiveRequestEmail');
  link.href=mailtoFor(`MCA adaptive access — ${type}`,lines);
  link.hidden=false;
  byId('adaptiveRequestStatus').textContent='Your message is ready to send to MCA.';
});

/* When the adaptive page opens, keep the page at its beginning. */
document.querySelectorAll('[data-page="adaptive"]').forEach(button=>{
  button.addEventListener('click',()=>window.setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),30));
});


/* Reliable integrated Calendly widgets */
const MCA_CALENDLY_URL='https://calendly.com/afishe54-asu/30min?hide_gdpr_banner=1&background_color=ffffff&text_color=111111&primary_color=111111';
function waitForCalendly(callback,attempt=0){
  if(window.Calendly){callback();return}
  if(attempt<40)window.setTimeout(()=>waitForCalendly(callback,attempt+1),150);
}
function initializeMcaCalendly(widget,prefill={}){
  if(!widget)return;
  waitForCalendly(()=>{
    widget.innerHTML='';
    window.Calendly.initInlineWidget({url:MCA_CALENDLY_URL,parentElement:widget,prefill});
    widget.dataset.calendlyReady='true';
  });
}
function initializeCalendlyInPage(pageId){
  const page=document.getElementById(pageId);
  if(!page)return;
  page.querySelectorAll('.calendly-inline-widget').forEach(widget=>{
    if(!widget.closest('[hidden]') && widget.dataset.calendlyReady!=='true')initializeMcaCalendly(widget);
  });
}

/* Smooth in-page landing-page navigation */
function wireJumpButtons(selector,dataKey){
  document.querySelectorAll(selector).forEach(button=>button.addEventListener('click',()=>{
    document.getElementById(button.dataset[dataKey])?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
}
wireJumpButtons('.partner-jump','partnerTarget');
wireJumpButtons('.leadership-jump','leadershipTarget');

/* Partnership landing page */
const partnerRequestForm=document.getElementById('partnerRequestForm');
const partnerNextStep=document.getElementById('partnerNextStep');
document.getElementById('preparePartnerRequestBtn')?.addEventListener('click',()=>{
  if(!partnerRequestForm?.reportValidity())return;
  const name=document.getElementById('partnerName').value.trim();
  const email=document.getElementById('partnerEmail').value.trim();
  const organization=document.getElementById('partnerOrganization').value.trim();
  const lines=[
    'MCA PARTNERSHIP REQUEST','',
    `Contact: ${name}`,
    `Email: ${email}`,
    `Phone: ${document.getElementById('partnerPhone').value.trim()||'Not provided'}`,
    `Organization: ${organization}`,
    `Organization type: ${document.getElementById('partnerType').value}`,
    `Preferred meeting: ${document.getElementById('partnerMeetingFormat').value}`,'',
    'NEED, OPPORTUNITY, OR PROJECT',document.getElementById('partnerNeed').value.trim(),'',
    'IMAGINED MCA INVOLVEMENT',document.getElementById('partnerInvolvement').value.trim(),'',
    'WHO WOULD PARTICIPATE OR BENEFIT',document.getElementById('partnerParticipants').value.trim(),'',
    'TIMING OR LOCATION',document.getElementById('partnerTiming').value.trim(),'',
    'SUCCESSFUL FIRST STEP',document.getElementById('partnerSuccess').value.trim(),'',
    'SUPERVISION, ACCESSIBILITY, SAFETY, PERMITS, INSURANCE, TRAINING, OR RESOURCES',document.getElementById('partnerConstraints').value.trim()||'Not provided','',
    'The contact acknowledged that this request begins a planning conversation and does not confirm services, volunteers, funding, or an event.'
  ];
  document.getElementById('partnerSummaryTitle').textContent=organization;
  document.getElementById('partnerSummaryText').textContent=`${name} is requesting a conversation about a possible partnership with ${organization}.`;
  document.getElementById('sendPartnerEmail').href=`mailto:afishe54@asu.edu?subject=${encodeURIComponent(`MCA partnership request — ${organization}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
  document.getElementById('partnerRequestStatus').textContent='Your request is ready. Send it to MCA, then schedule the 30-minute conversation below.';
  partnerNextStep.hidden=false;
  partnerNextStep.scrollIntoView({behavior:'smooth',block:'start'});
  initializeMcaCalendly(document.querySelector('.partner-calendly'),{name,email});
});

/* Leadership landing page */
const leadershipInterestForm=document.getElementById('leadershipInterestForm');
const leadershipNextStep=document.getElementById('leadershipNextStep');

document.querySelectorAll('.leadership-interest-btn').forEach(button=>button.addEventListener('click',()=>{
  const role=button.dataset.role;
  const checkbox=[...document.querySelectorAll('input[name="leadershipRole"]')].find(input=>input.value===role);
  if(checkbox)checkbox.checked=true;
  document.getElementById('leadership-form')?.scrollIntoView({behavior:'smooth',block:'start'});
}));

document.querySelector('.leadership-back')?.addEventListener('click',()=>openCommunityTab('overview'));

document.getElementById('prepareLeadershipRequestBtn')?.addEventListener('click',()=>{
  if(!leadershipInterestForm?.reportValidity())return;
  const name=document.getElementById('leadershipName').value.trim();
  const email=document.getElementById('leadershipEmail').value.trim();
  const roles=[...document.querySelectorAll('input[name="leadershipRole"]:checked')].map(input=>input.value);
  if(!roles.length){document.getElementById('leadershipRequestStatus').textContent='Choose at least one role or select “Other / Not sure yet.”';return}
  const notes=document.getElementById('leadershipGoals').value.trim();
  const lines=[
    'MCA LEADERSHIP INTEREST','',
    `Name: ${name}`,
    `ASU email: ${email}`,
    `Position(s): ${roles.join(', ')}`,'',
    'ANYTHING ELSE TO KNOW',notes||'Not provided'
  ];
  document.getElementById('leadershipSummaryTitle').textContent=roles.join(' · ');
  document.getElementById('leadershipSummaryText').textContent=`${name} is interested in: ${roles.join(', ')}.`;
  document.getElementById('sendLeadershipEmail').href=`mailto:afishe54@asu.edu?subject=${encodeURIComponent(`MCA leadership interest — ${name}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
  document.getElementById('leadershipRequestStatus').textContent='Your interest is ready. Send it to MCA, then schedule a conversation below.';
  leadershipNextStep.hidden=false;
  leadershipNextStep.scrollIntoView({behavior:'smooth',block:'start'});
  initializeMcaCalendly(document.querySelector('.leadership-calendly'),{name,email});
});

/* Reinitialize the existing idea and adaptive widgets reliably after their forms are prepared. */
prepareIdeaRequestBtn?.addEventListener('click',()=>window.setTimeout(()=>initializeMcaCalendly(document.querySelector('.mca-calendly'),{
  name:simpleIdeaName?.value.trim()||'',email:simpleIdeaEmail?.value.trim()||''
}),80));
document.getElementById('prepareAdaptiveIntakeBtn')?.addEventListener('click',()=>window.setTimeout(()=>initializeMcaCalendly(document.querySelector('.adaptive-calendly'),{
  name:document.getElementById('adaptiveContactName')?.value.trim()||'',email:document.getElementById('adaptiveContactEmail')?.value.trim()||''
}),80));

/* Google Forms are embedded in the existing form locations so responses are
   collected in the club's Google account while the surrounding MCA pages,
   context, and scheduling links remain available. */
function embedMcaGoogleForm(formId,url,title,{schedule=false}={}){
  const currentForm=document.getElementById(formId);
  if(!currentForm)return;

  const container=document.createElement('div');
  container.id=formId;
  container.className='google-form-embed';

  const iframe=document.createElement('iframe');
  iframe.className='google-form-frame';
  iframe.src=`${url}?embedded=true`;
  iframe.title=title;
  iframe.loading='lazy';
  iframe.setAttribute('frameborder','0');
  iframe.setAttribute('marginheight','0');
  iframe.setAttribute('marginwidth','0');
  iframe.textContent='Loading form…';

  const actions=document.createElement('div');
  actions.className='google-form-actions';
  actions.innerHTML=`<a class="btn" href="${url}" target="_blank" rel="noopener">Open ${title} in a New Tab</a>`;
  if(schedule){
    actions.insertAdjacentHTML('beforeend','<a class="btn" href="https://calendly.com/afishe54-asu/30min" target="_blank" rel="noopener">Schedule a Conversation</a>');
  }

  container.append(iframe,actions);
  currentForm.replaceWith(container);
}

embedMcaGoogleForm('adaptiveIntakeForm',MCA_FORMS.adaptiveIntake,'Adaptive Opportunities Intake',{schedule:true});
embedMcaGoogleForm('adaptiveWaiverForm',MCA_FORMS.waiver,'Participation and Liability Waiver');
embedMcaGoogleForm('adaptiveRequestForm',MCA_FORMS.adaptiveRequest,'Adaptive Request or Feedback');
embedMcaGoogleForm('simpleIdeaForm',MCA_FORMS.idea,'Bring an Idea or Project',{schedule:true});
embedMcaGoogleForm('partnerRequestForm',MCA_FORMS.partner,'Partner With MCA',{schedule:true});
embedMcaGoogleForm('leadershipInterestForm',MCA_FORMS.leadership,'Leadership Interest',{schedule:true});


/* Past / future adventures */
const adventuresTabs=[...document.querySelectorAll('.adventures-toggle-btn')];
const adventuresPanels={
  past:document.getElementById('pastAdventuresPanel'),
  future:document.getElementById('futureAdventuresPanel')
};
const adventuresViewTitle=document.getElementById('adventuresViewTitle');
const adventuresViewDescription=document.getElementById('adventuresViewDescription');
const adventuresCopy={
  past:{
    title:'Where we have been',
    description:`"I dont need to know where i'm going I just need to know where i've been" - Tow Mator`
  },
  future:{
    title:'Where we are going',
    description:'“The most difficult thing is the decision to act, the rest is merely tenacity. The fears are paper tigers. You can do anything you decide to do. You can act to change and control your life; and the procedure, the process is its own reward.” ― Amelia Earhart'
  }
};

function openAdventuresView(view){
  if(!adventuresPanels[view])return;
  adventuresTabs.forEach(tab=>{
    const active=tab.dataset.adventuresView===view;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex=active?0:-1;
  });
  Object.entries(adventuresPanels).forEach(([name,panel])=>{
    const active=name===view;
    panel.hidden=!active;
    panel.classList.toggle('active',active);
  });
  adventuresViewTitle.textContent=adventuresCopy[view].title;
  adventuresViewDescription.textContent=adventuresCopy[view].description;
}

adventuresTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>openAdventuresView(tab.dataset.adventuresView));
  tab.addEventListener('keydown',event=>{
    if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
    event.preventDefault();
    const direction=event.key==='ArrowRight'?1:-1;
    const next=adventuresTabs[(index+direction+adventuresTabs.length)%adventuresTabs.length];
    openAdventuresView(next.dataset.adventuresView);
    next.focus();
  });
});

document.addEventListener('mca-adventure-interest',event=>{
  if(typeof event.detail?.trip!=='string')return;
  const trip=event.detail.trip.trim();
  const adventureOption=[...simpleIdeaType.options].find(option=>option.textContent.trim()==='Adventure or trip');
  if(adventureOption)simpleIdeaType.value=adventureOption.value;
  simpleIdeaDetails.value=`I’m interested in joining the ${trip} adventure.`;

  showPage('launchpad');
  window.setTimeout(()=>{
    simpleIdeaForm?.scrollIntoView({behavior:'smooth',block:'start'});
    simpleIdeaName?.focus();
  },350);
});

function scopeAdventureStyles(css){
  return css
    .replace(/:root/g,':host')
    .replace(/\bhtml\b(?=\s*\{)/g,':host')
    .replace(/\bbody\b(?=\s*\{)/g,'.adventure-flow-root');
}

function setupPastAdventureFlow(container,shadow){
  const backgrounds=['#F4C6D0','#3FB8AD','#E8558C','#2E5D3B','#7A5236','#2E2E2E','#C63A2E','#3FB8AD','#F4C6D0'];
  const lineColors=['#175E58','#7B2447','#173F2A','#F7C7D4','#B9DDF4','#F4E1BC','#BFE9E2','#7B2447','#175E58'];
  const cards=[...shadow.querySelectorAll('.photo-card')];
  const page=container.closest('.page');
  const hexToRgb=hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];
  const mix=(a,b,fraction)=>{
    const first=hexToRgb(a);
    const second=hexToRgb(b);
    return first.map((value,index)=>Math.round(value+(second[index]-value)*fraction));
  };
  const rgb=value=>`rgb(${value[0]},${value[1]},${value[2]})`;
  const luminance=value=>(.299*value[0]+.587*value[1]+.114*value[2])/255;

  cards.forEach(card=>{
    card.addEventListener('click',()=>{
      const flipped=card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed',String(flipped));
    });
    card.addEventListener('keydown',event=>{
      if(event.key!=='Escape')return;
      card.classList.remove('is-flipped');
      card.setAttribute('aria-pressed','false');
    });
  });

  let ticking=false;
  const update=()=>{
    ticking=false;
    if(!page?.classList.contains('active'))return;
    const viewportHeight=Math.max(1,window.innerHeight);
    const position=Math.min(8,Math.max(0,-container.getBoundingClientRect().top/viewportHeight));
    const index=Math.floor(position);
    const fraction=position-index;
    const nextIndex=Math.min(8,index+1);
    const background=mix(backgrounds[index],backgrounds[nextIndex],fraction);
    const line=mix(lineColors[index],lineColors[nextIndex],fraction);
    container.style.setProperty('--bg',rgb(background));
    container.style.setProperty('--line',rgb(line));
    container.style.setProperty('--text',luminance(background)<.48?'#fffaf0':'#27231f');
  };
  const requestUpdate=()=>{
    if(ticking)return;
    ticking=true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll',requestUpdate,{passive:true});
  window.addEventListener('resize',requestUpdate,{passive:true});
  update();
}

function setupFutureAdventureFlow(container,shadow){
  shadow.querySelectorAll('.interest-button').forEach(button=>{
    button.addEventListener('click',()=>{
      container.dispatchEvent(new CustomEvent('mca-adventure-interest',{
        bubbles:true,
        composed:true,
        detail:{trip:button.dataset.trip||''}
      }));
    });
  });
}

async function mountAdventureFlow(container){
  try{
    const response=await fetch(container.dataset.adventureSource);
    if(!response.ok)throw new Error(`Adventure page returned ${response.status}`);
    const source=await response.text();
    const sourceDocument=new DOMParser().parseFromString(source,'text/html');
    const shadow=container.attachShadow({mode:'open'});
    const style=document.createElement('style');
    const sourceStyles=[...sourceDocument.querySelectorAll('head style')].map(node=>node.textContent).join('\n');
    style.textContent=`${scopeAdventureStyles(sourceStyles)}
      :host{display:block;position:relative;width:100%;overflow:clip}
      .adventure-flow-root{position:relative;width:100%;margin:0;overflow:clip}
      .adventure-flow-root>.background{position:absolute!important;inset:0!important;z-index:0!important}
      .adventure-flow-root>.grain{position:absolute!important;inset:0!important;z-index:3!important}
      .adventure-flow-root>.stage,.adventure-flow-root>main{position:relative;z-index:1}
      .scene{width:100%}
    `;

    const root=document.createElement('div');
    root.className='adventure-flow-root';
    root.innerHTML=sourceDocument.body.innerHTML;
    root.querySelectorAll('script,.site-header,.counter,.scroll-hint').forEach(node=>node.remove());
    shadow.append(style,root);

    if(container.dataset.adventureKind==='past')setupPastAdventureFlow(container,shadow);
    if(container.dataset.adventureKind==='future')setupFutureAdventureFlow(container,shadow);
    container.setAttribute('aria-busy','false');
  }catch(error){
    container.setAttribute('aria-busy','false');
    const message=container.querySelector('.adventure-flow-loading');
    if(message)message.textContent='The adventure index could not load. Please refresh the page and try again.';
    console.error(error);
  }
}

document.querySelectorAll('.adventures-flow-shell').forEach(mountAdventureFlow);

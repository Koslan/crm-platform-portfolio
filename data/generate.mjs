// Deterministic synthetic dataset for Northbeam Engineering.
// Seeded PRNG => same output every run => reviewable diffs.
import { writeFileSync, mkdirSync } from 'node:fs';

let _s = 20260826;
const rnd = () => (_s = (_s * 1664525 + 1013904223) >>> 0) / 4294967296;
const pick = a => a[Math.floor(rnd() * a.length)];
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const chance = p => rnd() < p;
const id = (() => { let n = 6100000000000; return () => String(++n); })();

const BU = ['Industrial Design','Mechanical','Electronics','Firmware','Test & Certification','Packaging'];
const SERVICES = {
  'Industrial Design':['Concept Design','CMF & Surfacing','Design for Manufacture','Human Factors'],
  'Mechanical':['Enclosure Engineering','Thermal Analysis','Tooling Support','Structural Simulation'],
  'Electronics':['Schematic & PCB','Power Design','RF & Antenna','EMC Pre-scan'],
  'Firmware':['Embedded Platform','Connectivity Stack','Device Provisioning','OTA & Diagnostics'],
  'Test & Certification':['Regulatory Certification','Reliability Testing','Environmental Testing','Safety Assessment'],
  'Packaging':['Retail Packaging','Protective Packaging','Sustainability Audit','Print Production']
};
const STAGES = ['0. Prospecting','1. Qualification','2. Proposal','3. Confirmation','4. Won','5. Lost'];
const SUBSTAGE = {'5. Lost':['5.1. Very Bad','5.2. Budget','5.3. Timing','5.4. Competitor']};
const LOSS = ['Budget mismatch','Timeline could not be met','Lost to incumbent vendor','Programme cancelled','No decision','Capacity unavailable'];

const A1 = ['Northwind','Kestrel','Aurora','Vantage','Halcyon','Meridian','Orillia','Brightwater','Cobalt','Fenwick','Ashgrove','Larkspur','Quarry','Stonebridge','Tessellate','Umbra','Vireo','Westmark','Yarrow','Zephyr','Anvil','Beacon','Cairn','Dovetail','Everline','Foxglove','Granite','Hearth','Ironwood','Juniper'];
const A2 = ['Instruments','Devices','Labs','Systems','Technologies','Works','Industries','Dynamics','Controls','Robotics','Medical','Mobility','Audio','Optics','Sensing'];
const CITY = [['Poland','Warsaw'],['Poland','Kraków'],['Germany','Munich'],['Germany','Hamburg'],['Netherlands','Eindhoven'],['Sweden','Gothenburg'],['Denmark','Aarhus'],['Finland','Espoo'],['Spain','Barcelona'],['Ireland','Cork'],['Czechia','Brno'],['Austria','Graz'],['France','Grenoble'],['Italy','Turin'],['Portugal','Porto'],['Estonia','Tallinn']];
const FN = ['Anna','Marek','Ingrid','Tomas','Sofia','Lukas','Elena','Jonas','Marta','Petr','Hanna','Rafal','Nora','Bastian','Iris','Emil','Klara','Viktor','Julia','Adam','Lena','Oskar','Ewa','Niels','Maja','Tobias','Alina','Henrik','Dana','Piotr','Freja','Milan','Zofia','Bo','Selma','Arne','Kaja','Ruben','Nina','Jasper'];
const LN = ['Kowal','Lindqvist','Bergman','Novak','Marchetti','Vandenberg','Haugen','Kaminski','Ferreira','Ostrowski','Jensen','Rossi','Dubois','Aalto','Weber','Lehtinen','Sandberg','Moreau','Bakker','Zielinski','Halvorsen','Costa','Meier','Virtanen','Laurent','Kovac','Nilsson','Barros','Fischer','Rautio'];
const TITLES = [['VP Engineering','C-Level'],['Head of Hardware','Lead'],['Programme Director','Lead'],['Procurement Lead','Senior'],['Mechanical Lead','Senior'],['Firmware Manager','Senior'],['Quality Manager','Senior'],['Product Manager','Middle'],['Design Manager','Middle'],['Test Engineer','Middle'],['Buyer','Middle'],['Sourcing Analyst','Junior'],['CTO','C-Level'],['COO','C-Level'],['Director of Operations','Lead']];
const ROLES = ['Economic Buyer','Technical Buyer','User Buyer','Coach'];
const OWNERS = ['D. Meier','K. Sandberg','P. Novak','L. Ferreira','A. Haugen'];

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const pad = n => String(n).padStart(2,'0');
const dstr = d => `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()}`;
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

/* ---------- users ---------- */
const users = OWNERS.map((n,i)=>({id:id(), full_name:n, email:`${slug(n)}@northbeam.example`, role:i<2?'Sales Lead':'Business Development', status:'active'}));

/* ---------- accounts, with a deliberate parent/child cluster and near-duplicate names ---------- */
const accounts = [];
const usedNames = new Set();
for (let i=0;i<62;i++){
  let nm; do { nm = `${pick(A1)} ${pick(A2)}`; } while (usedNames.has(nm));
  usedNames.add(nm);
  const [country,state] = pick(CITY);
  accounts.push({
    id:id(), Account_Name:nm, Website:`https://www.${slug(nm)}.example`,
    Country:country, State:state, Industry:pick(['Consumer Hardware','Medical Devices','Industrial IoT','Mobility','Audio','Instrumentation']),
    Cooperation_Status:pick(['Prospect','Prospect','Client','Client','Former Client','Restricted']),
    Segment:pick(['Enterprise','Mid-market','Scale-up']),
    Employees:int(40,4200),
    Total_Revenue: chance(.55) ? int(80,5200)*1000 : null,
    Revenue_Last_12M: null, Main_Parent_Account:null,
    Owner:pick(users).full_name, Created_Time:iso(new Date(2023, int(0,11), int(1,28)))
  });
}
// hierarchy: one holding with three subsidiaries
const holding = accounts[0];
for (let i=1;i<=3;i++){ accounts[i].Main_Parent_Account = holding.id; accounts[i].Account_Name = `${holding.Account_Name.split(' ')[0]} ${pick(A2)}`; }
// near-duplicate pair (deliberate defect for dedup screens)
accounts[7].Account_Name = accounts[6].Account_Name + ' GmbH';
accounts.forEach(a => { if (a.Total_Revenue) a.Revenue_Last_12M = Math.round(a.Total_Revenue * (0.15 + rnd()*0.55)); });

/* ---------- contacts; one account deliberately oversized ---------- */
const contacts = [];
const mkContact = (acc, forceFull) => {
  const fn = pick(FN), ln = pick(LN), [title,sen] = pick(TITLES);
  const hasEmail = forceFull || chance(.78);
  return { id:id(), First_Name:fn, Last_Name:ln, Full_Name:`${fn} ${ln}`,
    Title:title, Seniority:sen,
    Email: hasEmail ? `${fn[0].toLowerCase()}.${slug(ln)}@${slug(acc.Account_Name)}.example` : null,
    Linkedin: chance(.62) ? `https://www.linkedin.com/in/${slug(fn+'-'+ln)}-${int(10,99)}` : null,
    Account_Name: acc.id, Contact_Status: pick(['Working','Working','Working','Left the Company','Changed Company']),
    Created_Time: iso(new Date(int(2023,2026), int(0,11), int(1,28))) };
};
accounts.forEach((a,idx) => { const n = idx===2 ? 141 : int(2,7); for (let i=0;i<n;i++) contacts.push(mkContact(a, i===0)); });
// deliberate duplicate person across two records
const dup = contacts[15]; contacts.push({...dup, id:id(), Email:null, Linkedin:dup.Linkedin, Title:dup.Title+' (Interim)'});

/* ---------- programmes and service catalogue ---------- */
const PROG = ['Aurora Thermostat','Kestrel Wearable','Vantage Handheld','Halcyon Hub','Cobalt Sensor Node','Larkspur Monitor','Anvil Controller','Beacon Gateway'];
const programmes = PROG.map((n,i)=>({ id:id(), Name:n, Account_Name:accounts[i].id,
  Release_Date: iso(new Date(2026, int(0,11), int(1,28))),
  Category: pick(['Smart Home','Wearable','Industrial','Medical','Audio']),
  Complexity: pick(['Low','Medium','High']) }));
const catalog = [];
BU.forEach(bu => SERVICES[bu].forEach(s => catalog.push({ id:id(), Name:s, Business_Unit:bu, Status: chance(.9) ? 'Current' : 'Retired' })));

/* ---------- deals ---------- */
const deals = [];
for (const p of programmes){
  const n = int(6,14);
  for (let i=0;i<n;i++){
    const svc = pick(catalog.filter(c=>c.Status==='Current'));
    const stage = pick(STAGES);
    const lost = stage==='5. Lost';
    deals.push({ id:id(),
      Deal_Name:`${p.Name} — ${svc.Name}`, Account_Name:p.Account_Name, Programme:p.id,
      Business_Unit:svc.Business_Unit, Solutions:svc.Name,
      Stage:stage, Substage: lost ? pick(SUBSTAGE['5. Lost']) : null,
      Amount:int(12,480)*1000, Closing_Date: iso(new Date(2026, int(0,11), int(1,28))),
      Owner:pick(users).full_name, Loss_Reason: lost ? pick(LOSS) : null,
      Created_Time: iso(new Date(2025, int(0,11), int(1,28))) });
  }
}
// analytics "potentials" — unworked pipeline surfaced by a report, not by a deal
const potentials = [];
for (const p of programmes) for (const bu of BU) if (chance(.35))
  potentials.push({ id:id(), Programme:p.id, Business_Unit:bu, Solutions:pick(SERVICES[bu]),
    Budget:int(20,300)*1000, Contacts:`${pick(FN)} ${pick(LN)} - ${pick(TITLES)[0]}` });

/* ---------- campaigns, rooms, event contacts ---------- */
const campaigns = [
  { id:id(), Name:'Hardware Summit 2026', Event_Type:'Event', Start:'2026-03-10', End:'2026-03-13',
    Time_Zone_String:'Europe/Berlin',
    rooms:[{name:'Room Alpha',cap:8,from:'09:00',to:'18:00'},{name:'Room Alpha 2',cap:4,from:'09:00',to:'18:00'},{name:'Lounge B',cap:12,from:'10:00',to:'17:00'}],
    spots:['Booth D14','Cafeteria, level 2','Hotel lobby'] },
  { id:id(), Name:'Nordic Roadshow 2026', Event_Type:'Roadshow', Start:'2026-05-04', End:'2026-05-08',
    Time_Zone_String:'Europe/Stockholm', rooms:[{name:'Meeting Room 1',cap:6,from:'09:00',to:'17:00'}],
    spots:['Client office','Restaurant'] }
];
const eventContacts = [];
for (const c of campaigns){
  const pool = contacts.filter(x=>x.Contact_Status==='Working');
  const n = c.Event_Type==='Event' ? 420 : 90;
  for (let i=0;i<n;i++){
    const ct = pool[Math.floor(rnd()*pool.length)];
    eventContacts.push({ id:id(), Campaign:c.id, Origin_Contact:ct.id, Account_Name:ct.Account_Name,
      Attending_Status:pick(['Investigating','Yes','No','Investigating']),
      Meeting_Status:pick(['Open','Open','Contacted','Meeting booked','Meeting held','Meeting declined']),
      Priority:pick(['P1','P2','P3',null]), Source:pick(['Partner Directory','Event App','Manual',null]),
      Is_Target: chance(.42), Met_Last_Year: chance(.24),
      Added_By:pick(users).full_name, BD_Comment: chance(.18) ? 'Follow up after the demo slot.' : null,
      Created_Time: iso(new Date(2026, int(0,4), int(1,28))) });
  }
}

/* ---------- meetings, with five deliberate sync states ---------- */
const SYNC = ['in_sync','in_sync','in_sync','outdated','incorrect','not_in_crm','no_dates'];
const meetings = [];
for (const c of campaigns){
  const days = c.Event_Type==='Event' ? 4 : 5;
  const n = c.Event_Type==='Event' ? 46 : 22;
  for (let i=0;i<n;i++){
    const acc = pick(accounts);
    const day = int(0,days-1);
    const d = new Date(c.Start); d.setDate(d.getDate()+day);
    const h = int(9,16), m = pick([0,15,30,45]);
    const dur = pick([30,30,45,60,60,90]);
    const sync = pick(SYNC);
    const room = chance(.75) ? pick(c.rooms).name : null;
    meetings.push({ id:id(),
      Name:`${c.Name} — ${accounts.find(a=>a.id===acc.id).Account_Name}`,
      Meeting_DateTime_String:`${dstr(d)} ${pad(h)}:${pad(m)}`,
      Meeting_Date: iso(d), Meeting_Duration:dur,
      Meeting_Room: room, Spot: room ? null : pick(c.spots),
      Meeting_Status: pick(['Booked','Booked','Held','Held','Declined']),
      Meeting_Type: pick(['Discovery','Programme Review','Commercial','Relationship']),
      Account_Name: acc.id, Campaign: c.id,
      Deal: chance(.5) ? pick(deals.filter(x=>x.Account_Name===acc.id))?.id ?? null : null,
      External_Event_Id: sync==='not_in_crm' ? null : 'EVT'+id().slice(-9),
      Calendar_UID: chance(.85) ? 'UID'+id().slice(-10) : null,
      Time_Zone: pick(['+01:00','+02:00','Europe/Berlin','Europe/Stockholm']),
      Sync_State: sync,
      External_Modified: sync==='outdated' ? iso(new Date(2026, int(0,4), int(1,28))) : null,
      Recap: chance(.35) ? 'Reviewed the enclosure tolerances and agreed to re-scope the thermal work.' : null,
      Attendees_String: Array.from({length:int(1,4)},()=>pick(users).full_name).join(', '),
      participants: Array.from({length:int(1,4)},()=>{
        const ct = pick(contacts.filter(x=>x.Account_Name===acc.id)) || pick(contacts);
        return { Name1:ct.Full_Name, Position:ct.Title, Type:pick(ROLES), Email:ct.Email, Group:'External' };
      })
    });
  }
}
// deliberate clash + travel pair on day one of the first campaign
if (meetings.length > 4){
  const c = campaigns[0], d0 = dstr(new Date(c.Start));
  meetings[0] = {...meetings[0], Meeting_DateTime_String:`${d0} 11:00`, Meeting_Duration:60, Meeting_Room:'Room Alpha',  Attendees_String:'D. Meier, K. Sandberg', Sync_State:'in_sync', Campaign:c.id};
  meetings[1] = {...meetings[1], Meeting_DateTime_String:`${d0} 11:30`, Meeting_Duration:45, Meeting_Room:'Lounge B',    Attendees_String:'D. Meier',              Sync_State:'incorrect', Campaign:c.id};
  meetings[2] = {...meetings[2], Meeting_DateTime_String:`${d0} 12:20`, Meeting_Duration:30, Meeting_Room:'Room Alpha 2',Attendees_String:'K. Sandberg',           Sync_State:'outdated',  Campaign:c.id};
}

/* ---------- conversation threads ---------- */
const CTX = ['DELIVERY','ACCOUNT','OTHER'];
const messages = [];
for (const dl of deals.filter(d=>d.Stage!=='5. Lost').slice(0,14)){
  const threads = int(2,4);
  for (let t=0;t<threads;t++){
    const rootId = 'MSG'+id().slice(-10);
    const ctx = pick(CTX);
    const topic = pick(['Tolerance review','Certification plan','Sample build schedule','Cost breakdown','Test coverage','Tooling handover']);
    const n = int(2,7);
    for (let i=0;i<n;i++){
      messages.push({ id:id(), Deal:dl.id, Context:ctx, Thread_Topic:topic,
        Is_Root: i===0, Root_Message_Id:rootId, Message_Id: i===0 ? rootId : 'MSG'+id().slice(-10),
        From_Name:pick(users).full_name, Created_DateTime: iso(new Date(2026, int(0,7), int(1,28))),
        Body:['Sharing the updated drawing set for review.','Confirmed with the supplier, lead time is nine weeks.',
              'We need a decision on the connector before Friday or the tooling slips.',
              'Attaching the test report — two channels are outside spec, the rest passed.',
              'Agreed. I will raise it with the programme director this week.'][i%5],
        Has_Attachment: i===0 && chance(.3),
        Needs_Review: chance(.08), In_Tracker: chance(.25),
        Issue_Key: chance(.7) ? 'NBE-'+int(1000,4999) : null });
    }
  }
}

/* ---------- assemble ---------- */
const db = { meta:{ company:'Northbeam Engineering', generated:'deterministic', seed:20260826 },
  Users:users, Accounts:accounts, Contacts:contacts, Programmes:programmes, Service_Catalog:catalog,
  Deals:deals, Potentials:potentials, Campaigns:campaigns, Event_Contacts:eventContacts,
  Meetings:meetings, Messages:messages };

mkdirSync('data',{recursive:true});
writeFileSync('data/dataset.json', JSON.stringify(db));
// slim build for the single-file publish
const slim = { ...db,
  Contacts: contacts.filter((c,i)=> c.Account_Name===accounts[2].id ? i%6===0 : true).slice(0,220),
  Event_Contacts: eventContacts.slice(0,260),
  Messages: messages.slice(0,120) };
writeFileSync('data/dataset.slim.json', JSON.stringify(slim));

const counts = Object.entries(db).filter(([,v])=>Array.isArray(v)).map(([k,v])=>`${k}=${v.length}`).join(' ');
console.log('full :', counts);
console.log('slim :', Object.entries(slim).filter(([,v])=>Array.isArray(v)).map(([k,v])=>`${k}=${v.length}`).join(' '));

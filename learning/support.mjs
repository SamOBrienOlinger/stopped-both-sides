const services=[
 {
  id:'complaints',kind:'Complaints about Garda conduct',name:'Fiosrú',fullName:'Office of the Police Ombudsman',
  description:'Fiosrú receives public complaints about Garda conduct. It replaced GSOC on 2 April 2025. It assesses whether it can deal with a complaint and how it should proceed. This may involve investigation or referral to An Garda Síochána for resolution.',
  action:'How to make a complaint',url:'https://www.fiosru.ie/complaints/submit-a-complaint/'
 },
 {
  id:'oversight',kind:'Independent policing oversight',name:'PCSA',fullName:'Policing and Community Safety Authority',
  description:'The Policing and Community Safety Authority (PCSA) replaced the Policing Authority and Garda Síochána Inspectorate on 2 April 2025. It oversees and assesses Garda policing services, including performance and inspections. For complaints about individual Garda members, use Fiosrú’s complaints service.',
  action:'Explore policing oversight',url:'https://www.pcsaireland.ie/about-us/what-we-do/'
 },
 {
  id:'advice',kind:'Legal information and advice',name:'FLAC',fullName:'Free Legal Advice Centres',
  description:'FLAC offers free, confidential legal information and referrals. Limited phone advice appointments may be available through Citizens Information for people who cannot afford legal advice. These provide once-off, basic advice and depend on suitability and volunteer availability.',
  action:'Find legal information and advice',url:'https://www.flac.ie/help/'
 }
];

export function supportSection(){
 return `<section class="support-section source-topic" id="rights-support" tabindex="-1" aria-labelledby="support-heading">
  <div class="support-heading"><h2 id="support-heading">Advice, complaints and policing oversight</h2><p>Different services can help with legal questions, complaints about Garda conduct, and the wider oversight of policing. Choose the service that matches what you need.</p></div>
  <div class="support-grid">${services.map(service=>`<article class="support-card" data-support="${service.id}">
   <p class="support-kind">${service.kind}</p>
   <h3 lang="en-IE" dir="ltr" data-no-translate>${service.name}<span>${service.fullName}</span></h3>
   <p class="support-description">${service.description}</p>
   <a class="support-link" href="${service.url}" target="_blank" rel="noopener noreferrer"><span>${service.action}</span><span aria-hidden="true">↗</span></a>
  </article>`).join('')}</div>
  <p class="support-checked small-note">Official service links checked on 11 November 2026. Opening a link does not submit a complaint or request advice.</p>
 </section>`;
}

export function supportRecap(siteRole='public'){
 const href=siteRole==='garda'?'../#rights/support':'#rights/support';
 return `<aside class="support-recap" aria-labelledby="support-recap-heading"><div><h2 id="support-recap-heading">Need information or support after a real encounter?</h2><p>Find legal information, Garda complaint guidance and independent policing oversight.</p></div><a class="primary secondary"${siteRole==='garda'?' data-support-crosslink':''} href="${href}">Advice, complaints &amp; oversight</a></aside>`;
}

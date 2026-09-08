# Research and development record

**Review date: 7 September 2026. Audience: Garda learners, educators, independent legal reviewers and community contributors.**

The question was how a mirrored, situation-based digital game could help members of An Garda Síochána examine bias in stop-and-search decisions. Development combined Irish legal and professional sources with academic and community evidence. It did not attempt to use research findings to determine the lawfulness of actual incidents or to measure a learner's implicit attitudes.

## Scope and approach

This is a selected critical evidence review, not an exhaustive systematic review. Searches used public web search and the connected Consensus academic index for discovery, followed by primary publisher, university-repository, PubMed/PMC, legislative and institutional sources. The public library labels what was actually accessible. Discovery summaries were not treated as proof that full texts had been read.

The search covered suspicion formation, cognitive and explicit stereotypes, police culture, geographical deployment, procedural justice, effects of repeated stops, Traveller and racialised-minority experiences, communication and disability, training interventions and educational games. Searches included older foundational work and a targeted update for 2026. Ireland was prioritised; England and Wales, continental European and US studies were retained with explicit jurisdiction limits.

Representative search families:

- Police stop/search racial or ethnic bias; suspicion formation; Quinton, Minhas and Walsh; department culture.
- Irish police culture and ethnic minorities; O’Brien-Olinger; Mulcahy; Travellers' access to justice; Roma and Traveller scoping reviews.
- Stop/search systematic and realist reviews; Carvalho; Petersen; Agnew-Pauley.
- Officer bias and patrol deployment; Vomfell and Stewart; Pierson; Knox, Lowe and Mummolo.
- Implicit-bias training, observed enforcement disparities and field trials; Miller; Worden; Lai and Lisnek; Glaser; Forscher.
- Procedural-justice training and assessment; Weisburd; Tansill and Tankebe (2026).
- Confirmation bias; perceived age and Black children; autism and police communication.
- Serious-game learning and retention; Wouters; structured professional decision interventions; Merla.
- Irish statutory search and identification powers; Garda Decision Making Model and Code of Ethics; FRA unlawful-profiling guidance.

## Inclusion and interpretation

Priority went to direct research, evidence syntheses, original Irish legal sources and public professional guidance. A source needed a clear connection to a design decision. Community research was included for lived experience and priorities without presenting non-representative accounts as national prevalence estimates.

Findings were compared across methods. Null training findings were retained alongside more favourable procedural-justice trials. A local study not supporting an expectation of substantial pre-stop discrimination was included to avoid a one-sided selection. Distinct mechanisms were kept separate: individual associations, explicit group stereotypes, organisational incentives, deployment and incomplete records.

Evidence gaps were resolved with targeted searches where feasible. The review stopped once each scenario's central claim had an appropriate source, important counter-findings had been retained and limitations could be stated. This stopping rule supports a reviewable prototype; it does not establish full literature coverage.

Not included as direct foundations were unrelated police vetting studies, shooting-task findings that would not establish stop/search behaviour, and generic commercial training claims. Relevant 2026 material on pretextual traffic stops and the London commissioned stop/search review was discovered but not developed into claims where the original research had not been sufficiently examined. Those are follow-up reading opportunities, not findings attributed to this game.

## What the research changed in the product

| Evidence issue | Design response |
| --- | --- |
| Awareness and self-reported intentions may not transfer to behaviour | No claim that completing the game reduces bias; later practice, supervisory discussion and evaluation are proposed |
| Suspicions can incorporate familiar social categories | Separate observations from inferences; challenge general descriptions and inherited reputations |
| Police culture and deployment contribute to patterns | Include a colleague-pressure route and a supervisory data-review route |
| New information can be selectively discounted | Branches require reconsideration after a correction and preserve its timing in the debrief |
| Procedural justice and lawful authority answer different questions | Discuss explanation, voice and dignity alongside the separate requirement for a legal basis |
| Community experience and official records capture different information | Include cumulative encounters and community-informed review without treating either source as a complete account |
| Numerical equality or a search find rate does not establish fairness | Use a labelled synthetic dataset with missing information made explicit |
| Similar facts can be evaluated differently when identity changes | Use a controlled reflection comparison, clearly not a validated bias test |
| Game formats can aid learning without proven field transfer | Provide feedback, replay and discussion; leave effectiveness as an empirical question |

## Review access and limitations

The [bibliography](bibliography.md) states source type, jurisdiction and access level. Full text was not available or fully reviewed for every publication. Some browser-protected or paywalled material was limited to indexed abstracts, publisher summaries or university records. No individual article not independently read is represented as having received a full critical appraisal.

Major outstanding work includes a specialist review of current Irish case law and operational policy; additional non-English research; legal and community testing of all fictional variations; accessibility and real-device testing; and independent evaluation. The 2016 monograph by the creator is disclosed as such and should not displace independent evidence.

For an evaluation, first define learning, delayed retention, observed decision quality, treatment and community experience as separate outcomes. Agree an appropriate comparison design and data governance before collecting real operational information. This prototype deliberately accepts no incident data and does not provide personnel assessments.

## Reproducible content records

The canonical source annotations are in `dist/garda/sources.mjs`; the original fictional material is in `dist/garda/data.mjs`. The [scenario map](scenario-evidence-map.md) records the sources linked to every decision. The bibliography contains references rather than reproduced papers. Run `node scripts/research-index.mjs` after changing source metadata or scenario links.

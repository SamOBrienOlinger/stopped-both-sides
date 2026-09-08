# Garda learning experience

**Stopped: Both Sides** includes the Garda perspective within the shared `stopped-both-sides` repository. Its entrypoint is `garda/index.html`, published at `/garda/` beneath the project address.

## The experience

| Situation | Main learning question |
| --- | --- |
| A hunch on the street | What did I observe, and what did I infer? |
| “Matches the description” | Is the information specific, reliable and relevant to this person? |
| Grounds for a drug search | Are the statutory conditions present, and what limits remain? |
| When behaviour is misread | Could communication needs or the encounter itself explain the reaction? |
| A young person, an adult assumption | Am I replacing known age with an assumption about threat? |
| “We know that family” | Is a group association standing in for individual evidence? |
| When the facts change | Will I update a decision I have already announced? |
| What the numbers leave out | What can search records and training results actually demonstrate? |

- Original Garda mode: eight situations, 33 decision points and 630 complete choice sequences.
- Authored branching routes, including opportunities to reconsider a proposed action.
- Source-linked feedback, a reflection question and a recap of the chosen path.
- Same-facts identity comparisons; explicitly not psychological tests.
- An annotated library of 35 sources, including 26 academic publications and nine legal, professional or community sources.
- Source details distinguish findings, limitations, jurisdiction, review access and the design interpretation.
- The current choice survives visits to the evidence or About page in the same open tab.
- Learning scores with browser-local saving; no timer, account, analytics, uploads, incident collection or automated legal judgments.

## Evidence and limits

The literature search informed development rather than being added as decoration. The review includes Irish ethnography and Traveller/community research, international studies of suspicion and institutional patterns, systematic reviews, training evaluations with positive, mixed and null findings, and serious-game learning research. It includes work published in 2026.

This is a **selected critical evidence review**, not an exhaustive or preregistered systematic review of every academic publication. Some sources were accessible only through abstracts, university records or publisher descriptions. Each public source entry states the access level. The bibliography and scenario map make the interpretation reviewable.

Legal examples are anchored in Irish sources. Overseas research is not treated as Irish law or as evidence of a particular Garda's bias. Section 23 examples explicitly distinguish unsupported grounds from a separate variation in which legal sufficiency is stipulated for the exercise. Good manners, search results and completion of training are not substitutes for lawful authority or evidence of effectiveness.

The game has not received independent Irish criminal-law, Garda operational, community or accessibility approval. It has not been shown to reduce bias in practice. Those reviews and an evaluation of learning transfer are opportunities for INAR, ICCL, Garda educators, independent specialists and affected communities to shape the next version. No partnership is asserted.

## Maintaining this experience

Edit the Garda material in `garda/data.mjs` and `garda/sources.mjs`. Both original practice and shared play read that material directly. Keep the counterpart scenes and Irish translations aligned. Run `npm run research:index` after source metadata or scenario citations change, then `npm run check` and `npm test`. One deployment publishes both perspectives together.

See the [project README](../README.md), [research approach](../research/README.md), [bibliography](../research/bibliography.md), [scenario evidence map](../research/scenario-evidence-map.md), and [Pages setup](GITHUB-PAGES.md).

# Follow-Through Agent

A clickable prototype of an agent that helps a dental practice go from an AI diagnosis to a booked treatment. Built for the Allisone Product Builder / Product Manager case study.

Out of 100 lesions detected on an X-ray, only 18 end up treated, and 55 are lost before anyone enters the plan into the practice management software (PMS). This prototype follows one patient, Mrs Martin, from the chair to a booked visit, with the agent doing the admin work and people validating anything clinical or financial.

## The journey

| Step | Who | What happens |
| --- | --- | --- |
| 1. Validate the plan | Dentist | The agent drafts a treatment plan from the X-ray findings and the voice report. The dentist edits any act and validates in one tap. |
| 2. Write to the PMS | Agent | On PMS B (partner API) the agent writes the plan and reads it back. On PMS A (no API) it prepares a copy pack instead. |
| 3. Approve the quote | Assistant | The quote is priced at 2026 French fees, with social security, mutuelle and the patient's share. |
| 4. Patient decides | Patient | A plain language plan on her phone. She can accept, or ask a question, which creates a call back task. |
| 5. Book the visits | Assistant | Slots that respect the treatment sequence (fillings first, crown visits two weeks apart). |
| 6. Practice overview | Team | A live board of every open case, plus the pilot metrics. |

## Roadmap versions, V0 to V4

The bar under the header switches the whole prototype between versions. Each screen shows what that version really does, from the rules in `src/domain/versions.js`.

| Version | When | What it adds | Gate to the next version |
| --- | --- | --- | --- |
| V0 Concierge | Weeks 1 to 4 | No agent. Léa from Allisone ops does the work by hand for 5 PMS B practices. | Plans entered faster, staff time saved |
| V1 Plan, quote, follow up | Weeks 5 to 18 | Agent drafts the plan, writes it to PMS B and E, prices the quote, sends reminders. People approve the plan, quote and slot. | 95% of plans need no edit, 60% of pilots pay |
| V2 Earned autonomy | Months 5 to 8 | Quotes send on their own after 4 clean weeks, patients book themselves, follow up tailored to why they wait, PMS C. | Quote corrections under 2% in auto mode |
| V3 Full follow-through | Months 9 to 12 | Materials check and marketplace reorder, mutuelle pre-approval, recall for monitored teeth, UK and Italy. | Accepted to treated above 90% |
| V4 Groups and voice | Year 2 | Group dashboard and benchmarks, AI voice follow up calls with hand over to a person. | Group retention and seat expansion |

## The patient side

Use the switch at the top to change view:

- **Practice**: the six steps above, as the dentist and assistant see them.
- **Patient**: Mrs Martin's phone, from the SMS link to a booked visit, with a "Behind the scenes" log of what the agent does as she taps.
- **Side by side**: the practice board next to her phone. Everything she does lands on Camille's board live.

On her phone she can:

- Tap a tooth to see what was found, what happens if she waits, and what the treatment involves.
- See what it costs: treatment, social security, mutuelle, and her share.
- Accept and ask for a date. Camille gets a task to confirm it.
- Ask a question. The agent never answers clinical questions; it books a call back.
- Say "Not now" and why. The reason is counted on the practice board under "Why patients wait", which fills a gap in today's data: nobody knows why quotes are not accepted.

## What is real and what is simulated

Real code:
- **Quote engine** (`src/domain/quote.js`): prices each act from the catalogue in `src/domain/acts.js`, with unit tests.
- **Visit sequencing**: derives the visits from whatever plan the dentist validates.
- **PMS adapters** (`src/pms/adapters.js`): one agent brain, a thin adapter per PMS. PMS B writes and reads back; PMS A produces a copy pack.
- **Case state** (`src/domain/cases.js`): one reducer drives every screen, the practice board and the patient's phone, with tests in `cases.test.js`.

Simulated: the PMS writes, SMS and email sending, and the X-ray analysis.

Try it: change tooth 46 to "Metal ceramic crown" in step 1 and the patient's share goes from €0 to €350. Switch the practice software to PMS A to see the no API path.

## Live demo

https://lemming97.github.io/Follow-Through-Agent-prototype/

Every push to `main` runs the tests and rebuilds the site into `docs/` (`.github/workflows/deploy.yml`). Pages serves `main` from the `/docs` folder. Don't edit `docs/` by hand.

## Run it

```bash
npm install
npm run dev          # local dev server
npm test             # quote engine tests
npm run build        # static site in dist/
npm run build:single # one self-contained HTML file in dist-single/
```

Requires Node 18 or later.

## Structure

```
src/
  domain/      acts and fees, quote engine and tests, case state
  domain/versions.js  the V0 to V4 roadmap and which feature arrives when
  pms/         PMS adapters (B and E from V1, C from V2, A copy pack)
  patient/     the patient's phone experience
  components/  journey rail, X-ray
  screens/     one file per journey step
  App.jsx      layout, PMS switch, step routing
```

## Fee sources (2026)

- Fillings and conventional fees: Selectra, from Ameli, https://selectra.info/assurance/mutuelle-sante/remboursement/dentiste
- 100% Santé crown caps and the €120 crown base: JeChange, https://www.jechange.fr/assurance/mutuelle-sante/news/couronne-ceramique-molaire-zircone-0-euro-100-sante

The mutuelle share assumes a standard contrat responsable (up to 250% of the base on free price crowns). Patient, practice and figures shown on the board are fictional.

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

## What is real and what is simulated

Real code:
- **Quote engine** (`src/domain/quote.js`): prices each act from the catalogue in `src/domain/acts.js`, with unit tests.
- **Visit sequencing**: derives the visits from whatever plan the dentist validates.
- **PMS adapters** (`src/pms/adapters.js`): one agent brain, a thin adapter per PMS. PMS B writes and reads back; PMS A produces a copy pack.
- **Case state** (`src/domain/cases.js`): one reducer drives every screen and the practice board.

Simulated: the PMS writes, SMS and email sending, and the X-ray analysis.

Try it: change tooth 46 to "Metal ceramic crown" in step 1 and the patient's share goes from €0 to €350. Switch the practice software to PMS A to see the no API path.

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
  pms/         PMS adapters (B integrated, A copy pack)
  components/  journey rail, X-ray
  screens/     one file per journey step
  App.jsx      layout, PMS switch, step routing
```

## Fee sources (2026)

- Fillings and conventional fees: Selectra, from Ameli, https://selectra.info/assurance/mutuelle-sante/remboursement/dentiste
- 100% Santé crown caps and the €120 crown base: JeChange, https://www.jechange.fr/assurance/mutuelle-sante/news/couronne-ceramique-molaire-zircone-0-euro-100-sante

The mutuelle share assumes a standard contrat responsable (up to 250% of the base on free price crowns). Patient, practice and figures shown on the board are fictional.

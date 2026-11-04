import { visitPlan } from './quote.js';
import { has, VERSIONS } from './versions.js';
import { PMS } from '../pms/adapters.js';

export const STEPS = [
  { title: 'Validate the plan', who: 'dentist', crumb: 'Consultation' },
  { title: 'Write to the PMS', who: 'agent', crumb: 'PMS sync' },
  { title: 'Approve the quote', who: 'assistant', crumb: 'Quotes to approve' },
  { title: 'Patient decides', who: 'patient', crumb: 'Message' },
  { title: 'Book the visits', who: 'assistant', crumb: 'Scheduling' },
  { title: 'Practice overview', who: 'assistant', crumb: 'Treatment follow up' },
];

export const PEOPLE = {
  dentist: { initials: 'DL', name: 'Dr Lefèvre', role: 'Dentist, in the chair' },
  assistant: { initials: 'CA', name: 'Camille', role: 'Dental assistant' },
  patient: { initials: 'MM', name: 'Mrs Martin', role: 'Patient, on her phone' },
  agent: { initials: 'AG', name: 'Agent', role: 'Running in the background' },
  ops: { initials: 'LA', name: 'Léa', role: 'Allisone ops, V0 concierge' },
};

export const BOARD_COLUMNS = [
  { id: 'to_validate', title: 'To validate' },
  { id: 'to_approve', title: 'Quote to approve' },
  { id: 'quote_sent', title: 'Quote sent' },
  { id: 'call_needed', title: 'Call needed' },
  { id: 'accepted', title: 'Accepted' },
  { id: 'booked', title: 'Booked' },
];

const martin = {
  id: 'martin',
  name: 'Mrs Martin',
  pmsName: 'MARTIN, Hélène',
  dentist: 'Dr Lefèvre',
  status: 'to_validate',
  note: 'In the chair now',
  voiceReport: "We'll do the two fillings first, then redo the crown on 46.",
  findings: [
    { tooth: '16', kind: 'caries', text: 'Caries, occlusal and mesial', confidence: 94 },
    { tooth: '36', kind: 'caries', text: 'Caries, occlusal', confidence: 89 },
    { tooth: '46', kind: 'crown', text: 'Defective crown margin', confidence: 91 },
  ],
  plan: [
    { tooth: '16', act: 'comp2', kind: 'caries' },
    { tooth: '36', act: 'comp1', kind: 'caries' },
    { tooth: '46', act: 'crownZr', kind: 'crown' },
  ],
  timeline: [],
  slot: null,
};

const others = [
  { id: 'bernard', name: 'Mr Bernard', status: 'to_validate', note: 'Drafted 10:15' },
  { id: 'dubois', name: 'Ms Dubois', status: 'quote_sent', note: 'Day 2 · opened' },
  { id: 'petit', name: 'Mr Petit', status: 'quote_sent', note: 'Day 9 · not opened', warn: true },
  { id: 'roux', name: 'Mrs Roux', status: 'call_needed', note: 'Day 15 · on call list', warn: true },
  { id: 'garcia', name: 'Mr Garcia', status: 'accepted', note: 'Choosing dates' },
  { id: 'leroy', name: 'Ms Leroy', status: 'booked', note: 'Visit 2 of 2' },
];

export const initialState = {
  step: 0,
  pms: 'B',
  cases: [martin, ...others],
  tasks: [],
  toast: null,
  view: 'practice', // practice | patient | split
  version: 1, // roadmap version shown, V0 to V4
  log: [],
  // Why patients wait, last 30 days. Seeded for the demo; the patient's "Not now" answer adds to it.
  reasons: { cost: 5, think: 3, timing: 2, second: 1 },
};

export const REASONS = {
  cost: 'The cost',
  think: 'I want to think about it',
  timing: 'Not a good time',
  second: 'I want a second opinion',
};

const stamp = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
// In V0 there is no agent: Léa from Allisone ops does the work by hand.
const withLog = (state, text) => ({
  ...state,
  log: [{ id: state.log.length + 1, at: stamp(), text: state.version === 0 ? `Léa (Allisone ops), by hand: ${text[0].toLowerCase()}${text.slice(1)}` : text }, ...state.log],
});

const updateMartin = (state, fn) => ({
  ...state,
  cases: state.cases.map((c) => (c.id === 'martin' ? { ...c, ...fn(c) } : c)),
});

export const getMartin = (state) => state.cases.find((c) => c.id === 'martin');

export function reducer(state, action) {
  switch (action.type) {
    case 'GO':
      return { ...state, step: action.step };
    case 'SET_PMS':
      return {
        ...state,
        pms: action.pms,
        toast: action.pms === 'B'
          ? 'PMS B: the agent writes the plan into the PMS and checks it'
          : 'PMS A: no API, so the agent prepares a copy pack for Camille to paste',
      };
    case 'SET_ACT':
      return updateMartin(state, (c) => ({
        plan: c.plan.map((p) => (p.tooth === action.tooth ? { ...p, act: action.act } : p)),
      }));
    case 'VALIDATE':
      return { ...updateMartin(state, () => ({ status: 'to_approve', note: 'Plan validated 09:41' })), step: 1, toast: 'Plan validated by Dr Lefèvre' };
    case 'PMS_DONE':
      return updateMartin(state, () => ({ note: state.pms === 'B' ? 'Written to PMS B, verified' : 'Copy pack pasted in PMS A' }));
    case 'SET_VERSION': {
      const pms = PMS[state.pms].since <= action.version ? state.pms : 'B';
      const v = VERSIONS[action.version];
      return { ...initialState, view: state.view, version: action.version, pms, toast: `${v.name} · ${v.title}` };
    }
    case 'SET_VIEW':
      return { ...state, view: action.view };
    case 'SEND_QUOTE':
      return withLog({
        ...updateMartin(state, (c) => ({
          status: 'quote_sent',
          note: 'Day 0 · sent',
          timeline: [
            { day: 'Mon', text: 'Plan and quote sent by SMS and email', done: true },
            { day: 'Mon', text: 'Opened the link, viewed the X-ray for 2 min', done: true },
            { day: 'Day 3', text: 'Reminder sent, pre approved template', done: true },
          ],
        })),
        step: action.from === 'patient' ? state.step : 3,
        toast: 'Quote sent to Mrs Martin',
      }, 'Sent the plan and quote to Mrs Martin by SMS and email');
    case 'ASK_QUESTION':
      return withLog({
        ...updateMartin(state, (c) => ({
          status: 'call_needed',
          note: 'Asked a question · call back',
          timeline: [...c.timeline, { day: 'Day 4', text: 'Asked a question. Call back task created for Camille', done: true }],
        })),
        tasks: [...state.tasks, { id: Date.now(), text: `Call Mrs Martin back: question about ${action.topic || 'her treatment plan'}`, due: 'Today, 14:00 to 16:00' }],
        toast: 'Camille will call you back today',
      }, `Question about ${action.topic || 'the plan'}: no clinical answer from the agent, call back task created for Camille`);
    case 'PATIENT_REQUEST_SLOT':
      if (has(state.version, 'selfBooking')) {
        return withLog({
          ...updateMartin(state, (c) => ({
            status: 'booked',
            note: `Visit 1 · ${action.slot}`,
            slot: action.slot,
            requestedSlot: action.slot,
            timeline: [...c.timeline, { day: 'Day 4', text: `Accepted and booked ${action.slot} herself`, done: true }],
          })),
          tasks: state.tasks.filter((t) => !t.text.includes('Mrs Martin')),
          toast: 'Mrs Martin booked her visit herself',
        }, `Quote accepted. She booked ${action.slot} herself, written straight into the ${action.pms} calendar`);
      }
      return withLog({
        ...updateMartin(state, (c) => ({
          status: 'accepted',
          note: `Asked for ${action.slot}`,
          requestedSlot: action.slot,
          timeline: [...c.timeline, { day: 'Day 4', text: `Accepted online and asked for ${action.slot}`, done: true }],
        })),
        tasks: [...state.tasks.filter((t) => !t.text.includes('Mrs Martin')), { id: Date.now(), text: `Confirm Mrs Martin's slot: ${action.slot}`, due: 'Within the hour' }],
        toast: 'Mrs Martin accepted and picked a slot',
      }, `Quote accepted. Reminders stopped, slot request sent to Camille to confirm in ${action.pms}`);
    case 'PATIENT_NOT_NOW':
      return withLog({
        ...updateMartin(state, (c) => ({
          note: `Not now · ${REASONS[action.reason].toLowerCase()}`,
          warn: true,
          timeline: [...c.timeline, { day: 'Day 4', text: `Said not now: ${REASONS[action.reason].toLowerCase()}`, done: true }],
        })),
        reasons: { ...state.reasons, [action.reason]: state.reasons[action.reason] + 1 },
        tasks: has(state.version, 'tailoredFollowUp') && action.reason === 'cost' && !action.patientShare
          ? [...state.tasks, { id: Date.now(), text: 'Call Mrs Martin: she thinks it is too expensive, but her mutuelle covers it all', due: 'Today' }]
          : state.tasks,
        toast: 'Answer recorded',
      }, !has(state.version, 'tailoredFollowUp')
        ? `Reason logged: ${REASONS[action.reason].toLowerCase()}. Standard day 10 reminder kept`
        : action.reason === 'cost'
        ? action.patientShare > 0
          ? 'Reason logged: cost. Day 10 reminder will offer payment in 3 instalments'
          : 'Reason logged: cost, but she has nothing to pay. Call back task: explain her mutuelle covers it'
        : action.reason === 'second'
          ? 'Reason logged: second opinion. Agent will send her X-ray and report so she can share them'
          : `Reason logged: ${REASONS[action.reason].toLowerCase()}. Day 10 reminder kept`);
    case 'ACCEPT':
      return {
        ...updateMartin(state, (c) => ({
          status: 'accepted',
          note: 'Choosing dates',
          timeline: [...c.timeline, { day: 'Day 4', text: 'Quote accepted online', done: true }],
        })),
        tasks: state.tasks.filter((t) => !t.text.includes('Mrs Martin')),
        step: 4,
        toast: 'Mrs Martin accepted the quote',
      };
    case 'BOOK':
      return withLog({
        ...updateMartin(state, () => ({ status: 'booked', note: `Visit 1 · ${action.slot}`, slot: action.slot })),
        tasks: state.tasks.filter((t) => !t.text.includes('Mrs Martin')),
        step: 5,
        toast: `Visit 1 booked for ${action.slot}. Confirmation sent.`,
      }, `Visit 1 confirmed for ${action.slot}. Confirmation SMS sent, reminder set for the day before`);
    case 'TOAST':
      return { ...state, toast: action.text };
    case 'TOAST_CLEAR':
      return { ...state, toast: null };
    case 'RESET':
      return { ...initialState, view: state.view, pms: state.pms };
    default:
      return state;
  }
}

export { visitPlan };

// The roadmap, as code. Each feature says which version it arrives in,
// so every screen can ask has(version, 'feature') and show what that version really does.

export const VERSIONS = [
  {
    id: 0, name: 'V0', title: 'Concierge', when: 'Weeks 1 to 4',
    summary: 'No agent yet. Léa from Allisone ops does the agent\'s job by hand for 5 PMS B practices.',
    gate: 'Treatments per 100 lesions up 30%',
    adds: ['Plans entered, quotes drafted and reminders sent by hand', 'Proves the value before writing code'],
  },
  {
    id: 1, name: 'V1', title: 'Plan, quote, follow up', when: 'Weeks 5 to 18',
    summary: 'The agent drafts and writes. People approve the plan, the quote and the slot.',
    gate: '95% of plans need no edit, 60% of pilots pay',
    adds: ['Agent drafts the plan and writes it to PMS B', 'Quote priced automatically, approved by the assistant', 'Reminders on day 3 and 10, call list on day 14', 'Patient says why when she waits'],
  },
  {
    id: 2, name: 'V2', title: 'Earned autonomy', when: 'Months 5 to 8',
    summary: 'Practices that trust the agent let it send quotes alone. Patients book themselves.',
    gate: 'Quote corrections under 2% in auto mode',
    adds: ['Quotes send on their own after 4 clean weeks', 'Patient books straight into the calendar', 'Follow up tailored to why she waits', 'PMS E and PMS C integrated'],
  },
  {
    id: 3, name: 'V3', title: 'Full follow-through', when: 'Months 9 to 12',
    summary: 'The agent covers the last mile: materials, mutuelle approval, recalls.',
    gate: 'Accepted to treated above 90%',
    adds: ['Materials check and marketplace reorder', 'Mutuelle pre-approval requests', 'Recall for monitored teeth', 'UK and Italy'],
  },
  {
    id: 4, name: 'V4', title: 'Groups and voice', when: 'Year 2',
    summary: 'Dental groups run the agent across practices. A voice agent makes routine follow up calls.',
    gate: 'Group retention and seat expansion',
    adds: ['Group dashboard and benchmarks', 'AI voice follow up calls, handing over to a person when needed'],
  },
];

// Version each feature arrives in.
export const FEATURES = {
  agent: 1, // anything the agent does on its own
  reasons: 1, // patient says why she waits
  autoQuote: 2,
  selfBooking: 2,
  tailoredFollowUp: 2,
  morePms: 2,
  materials: 3,
  preApproval: 3,
  recall: 3,
  groups: 4,
  voice: 4,
};

export const has = (version, feature) => version >= FEATURES[feature];

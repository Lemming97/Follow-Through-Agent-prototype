import { ACTS } from '../domain/acts.js';

// One agent brain, a thin write adapter per PMS.
// Here the writes are simulated; in production each adapter wraps a vendor API or a local connector.

const planLines = (patient) =>
  patient.plan.filter((p) => p.act !== 'monitor').map((p) => `${p.tooth}  ${ACTS[p.act].label}`);

export const PMS = {
  B: {
    id: 'B',
    name: 'PMS B',
    tagline: 'Partner API, write access',
    integrated: true,
    writeSteps: (patient) => [
      `Open ${patient.name}'s patient file`,
      `Write dental chart for teeth ${patient.plan.map((p) => p.tooth).join(', ')}`,
      `Write treatment plan, ${planLines(patient).length} acts`,
      'Attach Allisone report and X-ray',
      'Read back and compare with the validated plan',
    ],
    readBack: (patient) => [
      `PATIENT  ${patient.pmsName}`,
      `PLAN     #2026-1104-03 · ${planLines(patient).length} acts`,
      ...planLines(patient).map((l) => `         ${l}`),
      'DOCS     Allisone report, panoramic 09:31',
      'STATUS   Matches validated plan',
    ],
  },
  A: {
    id: 'A',
    name: 'PMS A',
    tagline: 'No API, copy pack',
    integrated: false,
    copyPack: (patient) =>
      [
        `Treatment plan for ${patient.pmsName}, validated by ${patient.dentist}`,
        ...planLines(patient),
        'Source: Allisone report, panoramic 09:31',
      ].join('\n'),
  },
};

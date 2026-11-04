// Act catalogue with 2026 French fees. All amounts in cents to avoid rounding errors.
// Sources: Selectra (Ameli 2026 fees), JeChange (2026 100% Santé crown caps).

export const SECU_RATE = 0.6; // Assurance Maladie reimburses 60% of the base
export const MUTUELLE_FREE_PRICE_CAP = 2.5; // standard contrat responsable: up to 250% of the base, Sécu included

export const ACTS = {
  comp1: { id: 'comp1', label: 'Composite filling, 1 surface', fee: 2930, pricing: 'regulated', minutes: 30, family: 'filling' },
  comp2: { id: 'comp2', label: 'Composite filling, 2 surfaces', fee: 5000, pricing: 'regulated', minutes: 40, family: 'filling' },
  comp3: { id: 'comp3', label: 'Composite filling, 3 surfaces', fee: 6550, pricing: 'regulated', minutes: 45, family: 'filling' },
  crownZr: { id: 'crownZr', label: 'Zirconia crown (replace)', fee: 45320, base: 12000, pricing: 'sante100', family: 'crown' },
  crownMC: { id: 'crownMC', label: 'Metal ceramic crown (replace)', fee: 65000, base: 12000, pricing: 'free', family: 'crown' },
  monitor: { id: 'monitor', label: 'Monitor, no treatment', fee: 0, pricing: 'none', family: 'none' },
};

// Which acts the dentist can pick for each kind of finding.
export const OPTIONS = {
  caries: ['comp1', 'comp2', 'comp3', 'monitor'],
  crown: ['crownZr', 'crownMC', 'monitor'],
};

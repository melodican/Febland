// The standing routines that run the business — the cron cadence that drips work
// onto the board. Edit freely. Each fires an instruction to the central AI, which
// plans it into jobs; the worker then fulfils them. Times are Europe/London.
// (n8n can own these instead / as well — see engine/n8n/README.md.)

export const routines = [
  {
    name: 'Daily prospecting',
    cron: '0 7 * * *', // every day 07:00
    instruction:
      'Source 20 net-new UK trade prospects that would want the custom velvet range, segmented and fit-scored.',
  },
  {
    name: 'Tuesday email',
    cron: '0 8 * * 1', // Mondays 08:00 — ready for Tuesday
    instruction: "Draft this week's velvet-led trade email, segmented by buyer type, for approval.",
  },
  {
    name: 'Weekly reorder nudges',
    cron: '0 9 * * 1', // Mondays 09:00
    instruction: 'Prepare velvet-led reorder nudges for trade accounts that have gone quiet.',
  },
  {
    name: 'Reply sweep',
    cron: '0 * * * *', // hourly
    enabled: false, // turn on once an inbox/reply source is wired
    instruction: 'Check for new trade replies and draft responses for approval.',
  },
];

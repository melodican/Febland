# The Febland Brain — Airtable base

The factory's memory / single source of truth. Four tables: **Accounts**, **Orders**, **Rules**,
**Jobs** (schema in `SCHEMA.md`). The engine reads/writes these; the dashboard reads from them.

Two ways to build it — pick one.

## Option A · Run the setup script (recommended — proper field types, one command)
1. In Airtable, **create a new empty base** (any workspace). Open it and copy the **base ID** from
   the URL — it starts with `app…`.
2. Create a **personal access token** (airtable.com/create/tokens) with scopes
   `schema.bases:write` and `data.records:write`, and access to that base.
3. From `engine/`:
   ```bash
   AIRTABLE_API_KEY=pat_xxx AIRTABLE_BASE_ID=app_xxx npm run setup:airtable -- --seed
   ```
   (or put both in `engine/.env` and run `npm run setup:airtable -- --seed`)

That creates all four tables with the right field types + select options, and `--seed` loads the
**38 prospects** into Accounts and the **guardrail rules** into Rules. Delete the default "Table 1"
Airtable made. Then add the same `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID` to `engine/.env` and the
engine will persist Jobs/Accounts/Orders here.

## Option B · Import the CSVs by hand (no token needed)
In a new base, for each table use **Add table → Import data → CSV**:
| Table | File |
|-------|------|
| Accounts | `accounts-seed.csv` (38 prospects) |
| Rules | `rules-seed.csv` (guardrails) |
| Orders | `orders-template.csv` (headers only) |
| Jobs | `jobs-template.csv` (headers only) |

Then tidy field types to match `SCHEMA.md` (set the single-selects, the `Revenue` currency field to
£, and the date fields) — CSV import defaults most fields to text.

## After it's built
- Point the engine at it: `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID` in `engine/.env`.
- `curl localhost:8080/health` will then show `airtable: connected`.
- Channel feeds write to **Orders**; the central AI writes to **Jobs**; the dashboard reads both.

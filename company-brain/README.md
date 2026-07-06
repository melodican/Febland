# The Febland Group — Company Brain (source of truth)

This is the **single source of truth** every agent reads before it acts. It's what makes the system
behave like a team of employees who *know the company* — who we are, what each business does, our
policies, our workflows, and who to tell on the ground — rather than a generic bot.

**How the agents use it:** before an agent works a task, the engine loads the group overview
(`00-group.md`) plus the relevant business's doc, so its decisions and its writing reflect the real
Febland Group — the right facts, the right tone, the right rules, the right escalations.

**Keep it current.** This is a living document. When a policy, price, workflow, or person changes,
update it here — the agents pick it up automatically. Out-of-date truth = wrong actions.

## What's inside
| File | What it holds |
|------|---------------|
| `00-group.md` | The group: the four businesses, location, values, and the staff notify-map |
| `febland.md` | Furniture/lighting/artwork/gifts — trade + retail |
| `blackpool-upholstery.md` | Bespoke re-upholstery + custom velvet (contract/hospitality) |
| `blackpool-storage.md` | Self-storage units |
| `rentals.md` | Commercial units let on our land |
| `staff-and-reporting.md` | Who's on the ground + what the AI reports to them, and when |
| `policies-escalation-compliance.md` | Human-approval gates + data/compliance rules, group-wide |

**Legend in every doc:** ✅ = confirmed fact · ❓ = needs your input (only you know it). Fill the ❓s
and the agents get sharper. Detailed Febland *sales* rules also live in `../sales-factory/brain/`.

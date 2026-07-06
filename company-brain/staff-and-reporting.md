# Staff & reporting — how the AI keeps the humans in the loop

The system is a team of employees; like any employee it must **tell the humans what it's doing** and
hand off anything that needs a person. This defines who's told, about what, and when.

## The team on the ground ❓
| Person | Role | Owns / should be told about |
|--------|------|-----------------------------|
| Dexter | MD | Approvals (discount/credit/quote), strategy, big decisions |
| Mark | Sales | New trade leads/replies to close, trade applications |
| Glen | Marketing | Social, brand, campaigns |
| ❓ | Upholstery | Quote requests, measure bookings |
| ❓ | Storage | Enquiries, bookings, move-ins |
| ❓ | Support | Customer support enquiries |
_(Fill in the real names/roles so hand-offs go to the right person.)_

## What the AI reports — the daily briefing
Once a day (default **07:30**), a plain-English digest of what happened across all four businesses:
- New **trade applications** and new prospects sourced
- **Outreach** sent + replies received (and which were handled vs need a human)
- **Support / storage / upholstery enquiries** taken and what was done
- **Orders / revenue** by business + channel
- **Needs-you** list — everything waiting on a human decision

Delivered to: ❓ _(whole team by email? Dexter only? a WhatsApp/Slack group?)_ — say which and we
wire the channel.

## Real-time notifications (don't wait for the briefing)
Fire immediately to the owner in the table above:
- New trade application · customer support enquiry · storage/upholstery enquiry · anything needing
  approval.

## The principle
**Nothing important happens silently.** Agents act on the routine, draft the risky, and escalate the
rest — always leaving a trail on the board (Airtable Jobs) and a line in the briefing, so staff
always know what their "AI colleagues" have been doing.

## Build note
`engine/src/briefing.js` composes the briefing from the board (Jobs), Accounts and Orders — wire it
to email/Slack/WhatsApp via n8n when you choose the channel.

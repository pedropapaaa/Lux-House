# Project memory

## Product intent & audience

- Event ticketing system (ingressos) for parties/nightclub events (e.g. "Lux White").
- Brazilian audience; user communicates in Portuguese (pt-BR).
- Supports ticket **lotes** (batches) and **camarotes** (VIP boxes) as distinct ticket categories sold simultaneously.

## Brand personality & voice

- Tone is direct and operational; user issues concise instructions in Portuguese.
- Responses should be in pt-BR, clear and action-oriented.

## Visual design & UX direction

- Vite + React + Tailwind CSS + Lucide React icons (per `.bolt/prompt`).
- Production-grade, non-cookie-cutter UI.
- Purchase page must show one active lote plus active camarote(s) together at all times.
- Admin panel (painel administrativo) for activating/closing lotes and camarotes.

## Decisions, constraints & rationale

- **Lotes and camarotes operate independently**: activating a lote must never auto-close camarotes, and vice-versa.
- Camarote = multi-ticket-per-unit category; treated as a separate persistence/status track from common lotes.
- Prior bug: admin activation closed all other active lotes including camarotes — fixed so lotes and camarotes have independent active/closed status.
- Event data and lot/camarote status are persisted in a database (banco de dados); the lot selector respects DB status.
- For the current event (Lux White): Lote 3 and Camarote are both active simultaneously.

## Open questions & assumptions

- Assumption: only one common lote should be active at a time, while camarote(s) can coexist with it (user: "tem que ser sempre um lote e os camarotes").
- Unclear whether multiple camarote types exist or only one camarote per event.
- Unknown: exact DB schema and admin auth model (not yet surfaced).
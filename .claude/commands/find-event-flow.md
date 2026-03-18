---
description: Trace the full flow of event creation/editing from Vue form → Django view → DB and back
---

Trace the complete event creation and editing flow in this project. $ARGUMENTS

This is a diagnostic/orientation skill — use it when debugging event save issues or onboarding to the event system.

**Step 1 — Read the Vue form (frontend entry point)**
Read `static/js/custom-vue.js` and find:
- The event form data object (all fields sent on save)
- The save method (fetch/POST call to `/events/save-event-ajax/`)
- How the response `{'message': 'True'}` is handled
- How the form is reset after save

**Step 2 — Read the save view (backend handler)**
Read `events/views.py` → `save_event_ajax_ver2()` and trace:
- How it distinguishes create vs update (checks for `id` in POST)
- Every `request.POST.get(...)` field extraction
- The `Event.objects.create(...)` call
- The update branch
- What it returns on success/failure

**Step 3 — Read the Event model**
Read `events/models.py` and list:
- All required fields (no null/blank)
- All denormalized `_name` fields and which FK they shadow
- Any fields with `default=` values

**Step 4 — Read the event display**
Read `events/templates/events/event_display.html` and `events/views.py` → `get_eventsListDate()` / `fetch_events_ajax()` to understand how events are fetched back after save.

**Step 5 — Produce a flow diagram (text)**
Output a clear step-by-step trace:
```
[Vue] User fills form → eventForm data object
  ↓ POST to /events/save-event-ajax/
[Django] save_event_ajax_ver2() receives POST
  ↓ extracts fields: event_title, event_desc, ...
  ↓ checks id → create or update
  ↓ Event.objects.create(**fields) or event.save()
  ↓ returns JsonResponse({'message': 'True'})
[Vue] checks response.message === 'True'
  ↓ resets form, closes modal, reloads event list
[Django] fetch_events_ajax() called with date params
  ↓ returns filtered events as JSON
[Vue] renders events as pills in the calendar
```

**Step 6 — Flag any mismatches**
- Fields in the Vue form not handled in the view
- Fields in the model not populated by the save view (left at default)
- Fields in the view not present in the model

This helps identify bugs where data silently doesn't save.

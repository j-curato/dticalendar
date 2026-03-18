---
description: Add a new field to the Event model and wire it through the entire stack (model → view → Vue form → display table)
---

Add a new field to the `Event` model and wire it through the full stack. Field description: $ARGUMENTS

The `Event` model is the most complex in the project (60+ fields). This skill handles the full chain.

**Step 1 — Read all affected files before changing anything:**
- `events/models.py`
- `events/views.py`
- `static/js/custom-vue.js` (search for the event form data section)
- `events/templates/events/event_display.html`
- `templates/users/profile.html` (the main New Event modal)

**Step 2 — Add the field to `events/models.py`**
Conventions for Event fields:
- Text fields: `CharField(max_length=..., null=True, blank=True)`
- Date fields: `DateField(default=date.today)` (older style, match existing)
- Boolean flags: `BooleanField(default=False)`
- FK fields: Also add a companion `_name` CharField for denormalization (e.g., `fk_division` + `division_name`)
- Place the field near semantically related fields

**Step 3 — Update `events/views.py` → `save_event_ajax_ver2()`**
This is the main save view. Add:
- `new_field = request.POST.get('new_field', '')` in the POST data extraction
- The field in `Event.objects.create(...)` for new events
- `event.new_field = new_field` + `event.save()` in the update branch

**Step 4 — Update `static/js/custom-vue.js`**
Find the event form data object (look for `eventForm` or the section with `event_title`, `event_desc`, etc.) and:
- Add `new_field: ''` to the data properties
- Add `new_field: this.new_field` (or similar) to the POST payload in the save fetch call
- Add a reset line in the form reset method: `this.new_field = ''`
- Remember: Vue delimiters are `{[ ]}` — NEVER use `{{ }}`

**Step 5 — Update the New Event modal in `templates/users/profile.html`**
Add the form input in the appropriate section of the modal. Match existing input style:
```html
<div class="mb-3">
    <label class="form-label">Label Name</label>
    <input type="text" class="form-control" v-model="new_field">
</div>
```

**Step 6 — Update `events/templates/events/event_display.html`** (if the field should be shown in the events table)
Add to the DataTable column definitions and the row rendering logic.

**Step 7 — Run migrations**
```bash
python manage.py makemigrations events
python manage.py migrate
```

**Step 8 — Verify**
List all files changed and confirm the field is handled in: model definition, save view (create + update), Vue data + payload + reset, form modal HTML, and optionally the display table.

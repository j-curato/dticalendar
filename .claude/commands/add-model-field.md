---
description: Add a new field to an existing model, handle migrations, and update all affected views/serializations
---

Add a new field to an existing model and update everything that touches it. Input: $ARGUMENTS

The input format is: `AppName.ModelName field_name field_type [options]`
Examples:
- `events.Event contact_person CharField max_length=200 blank=True`
- `divisions.Division color_code CharField max_length=7 default=#000000`
- `users.UserProfile phone_number CharField max_length=20 blank=True`

**Step 1 — Read the model file**
Read `{app}/models.py` to understand the existing fields and where the new field fits logically.

**Step 2 — Add the field to the model**
Follow the project's conventions:
- `CharField` for text, with appropriate `max_length`
- Use `null=True, blank=True` for optional fields
- Use `default=` for fields that should always have a value
- Place the field logically near related fields (e.g., a new date field near existing date fields)

**Step 3 — Check views.py for impact**
Read `{app}/views.py` and find:
- The `save_*_ajax` view — add the new field to both the CREATE and UPDATE branches
- The `get_*_details` DataTable view — add the field to the `data` dict if it should be displayed
- The `get_*List` view — add the field to `.values()` if needed for dropdowns

**Step 4 — Check custom-vue.js for impact**
Search `static/js/custom-vue.js` for the existing form data object for this model and add the new field as a Vue data property. Also add it to the save payload in the `fetch`/`axios` POST call.

**Step 5 — Check templates for impact**
If the field should be visible in a form modal or display table, update the relevant template. Remember Vue delimiter is `{[ ]}` not `{{ }}`.

**Step 6 — Run migrations**
```bash
python manage.py makemigrations {app}
python manage.py migrate
```
Report the migration file name created.

**Step 7 — If the Event model was changed**
The `Event` model has 60+ fields. Also check:
- `events/views.py` `save_event_ajax_ver2()` — the main save view
- `static/js/custom-vue.js` event form data object
- `events/templates/events/event_display.html` if it's a displayable field
- Whether it should be a denormalized `_name` companion field (if it's a FK)

**After all changes**, summarize:
- Files modified
- Migration name created
- Any places that still need manual attention (e.g., template display formatting)

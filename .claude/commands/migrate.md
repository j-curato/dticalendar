---
description: Make migrations and apply them, with optional app name scoping
---

Run Django migrations for this project. $ARGUMENTS

If an app name was provided, scope the makemigrations to that app. Otherwise run for all apps.

**Step 1 — Check for unapplied migrations**
```bash
python manage.py showmigrations
```
Show which migrations are pending (marked with `[ ]`).

**Step 2 — Make new migrations** (if model changes were made)
```bash
# If app name provided:
python manage.py makemigrations {app_name}

# Otherwise:
python manage.py makemigrations
```

Report the name of any new migration files created. If "No changes detected", say so clearly.

**Step 3 — Apply migrations**
```bash
python manage.py migrate
```

**Step 4 — Verify**
Run `python manage.py showmigrations` again and confirm all migrations now show `[X]`.

**Common issues to watch for in this project:**
- If a new non-nullable field was added without a default, Django will prompt for one. Suggest `null=True, blank=True` or a sensible default based on the field type.
- The `Office` model uses `db_table = 'tbl_offices'` — if renaming fields on this model, check for raw SQL or direct table references.
- After adding `is_office_admin` or changes to `UserProfile`, verify existing users still work by checking `user.profile` access won't break.

---
description: Audit all URL patterns for duplicates, missing includes, and naming conflicts
---

Audit the URL configuration of this Django project. $ARGUMENTS

**Step 1 — Read `dticalendar/urls.py`** (the root URL config)

**Step 2 — Read every app's `urls.py`:**
`users/urls.py`, `events/urls.py`, `offices/urls.py`, `divisions/urls.py`, `units/urls.py`, `orgoutcomes/urls.py`, `paps/urls.py`, `provinces/urls.py`, `lgus/urls.py`, `barangays/urls.py`, `calendars/urls.py`, `employees/urls.py`

**Step 3 — Check for these known issues and any new ones:**

**Duplicate includes** (known issue): `dticalendar/urls.py` includes `calendars.urls` and `divisions.urls` twice under different prefixes. List all duplicate includes with their prefixes.

**Missing app_name namespacing**: Check if any `urls.py` is missing `app_name = '...'`. This project doesn't use namespacing currently — note if it should be added.

**URL name conflicts**: List any `name=` values that appear in more than one app, which could cause `reverse()` ambiguity.

**Unreachable patterns**: Any URL pattern that is shadowed by a more general pattern defined before it.

**Inconsistent API URL format**: The project convention is `/app/api/get-{model}List/` for read endpoints and `/app/save-{model}-ajax/` for write. Flag any endpoints that deviate.

**Missing URL registrations**: For each app in `INSTALLED_APPS` that has a `urls.py`, verify it's included in the root `urls.py`. Report any that are missing.

**Step 4 — Output a clean URL map** listing every registered URL in the format:
```
METHOD  /full/path/here/    → app.views.view_name    [name='url_name']
```

**Step 5 — Prioritized fix list** — ordered by impact.

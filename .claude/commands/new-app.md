---
description: Scaffold a new Django app following this project's FBV + AJAX patterns
---

Scaffold a complete new Django app for this project. The app name is: $ARGUMENTS

Follow these exact conventions from CLAUDE.md and the existing codebase:

**Step 1 — Run `python manage.py startapp $ARGUMENTS`**

**Step 2 — models.py**
Create a model following this project's conventions:
- Use `BigAutoField` PK (project default)
- Include `created_at` and `updated_at` as `DateTimeField(auto_now_add=True)` / `DateTimeField(auto_now=True)` (newer model style)
- Use `CharField` for names/descriptions
- Add a `__str__` method returning the main name field
- If it needs an office/division/unit FK, follow the existing nullable SET_NULL pattern

**Step 3 — views.py**
Generate all 4 standard AJAX views this project uses:

```python
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db.models.functions import Lower
from .models import ModelName

def _is_authorized(user):
    if user.is_superuser:
        return True
    try:
        return user.profile.is_office_admin
    except Exception:
        return False

@login_required
@csrf_exempt
def save_{app}_ajax(request):
    if request.method == 'POST':
        if not _is_authorized(request.user):
            return JsonResponse({'message': 'False', 'error': 'Unauthorized'})
        # save logic
        return JsonResponse({'message': 'True'})
    return JsonResponse({'message': 'False'})

@login_required
@csrf_exempt
def delete_{app}_ajax(request):
    ...

def get_{app}List(request):
    # returns JSON list for Vue dropdowns
    ...

def get_{app}_details(request):
    # DataTable server-side processing
    # handles: draw, start, length, search[value], order[0][column], order[0][dir]
    # returns: {draw, recordsTotal, recordsFiltered, data}
    # sort with Lower() for case-insensitive ordering
    ...
```

**Step 4 — urls.py**
Follow the URL naming pattern:
- `/app/save-{app}-ajax/`
- `/app/delete-{app}-ajax/`
- `/app/api/get-{app}List/`
- `/app/get-{app}-details/`

**Step 5 — admin.py**
Register the model with Django admin.

**Step 6 — apps.py**
Standard AppConfig, ensure `name = '{app}'`.

**Step 7 — Update root files**
- Add `'{app}'` to `INSTALLED_APPS` in `dticalendar/settings.py`
- Add `path('{app}/', include('{app}.urls'))` to `dticalendar/urls.py`

**Step 8 — Migrations**
Run `python manage.py makemigrations {app}` and report the result.

After scaffolding, summarize what was created and what the developer needs to fill in (field definitions, save logic, etc.).

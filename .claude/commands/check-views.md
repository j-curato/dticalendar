---
description: Audit all views.py files for missing auth, wrong permission patterns, and response format issues
---

Audit all `views.py` files in this Django project for security and consistency issues. $ARGUMENTS

Read every `views.py` file in these apps: `users`, `events`, `offices`, `divisions`, `units`, `orgoutcomes`, `paps`, `calendars`, `employees`, `provinces`, `lgus`, `barangays`.

Check for the following issues and report each one with the file path and line number:

**1. Missing `@login_required` on write views**
Any view that accepts POST and modifies data (save, delete, update, mark) but does NOT have `@login_required`. Read-only list/get views do not need it.

**2. Missing permission check on write views**
Any POST view that has `@login_required` but does NOT call `_can_manage()`, `_is_authorized()`, or check `request.user.is_superuser`. These views would let any logged-in user modify data.

**3. Wrong JsonResponse boolean format**
Any `JsonResponse` that uses Python `True`/`False` booleans instead of string `'True'`/`'False'`. The frontend checks `response.message === 'True'` (string), so using real booleans silently breaks things.
```python
# WRONG:
return JsonResponse({'message': True})
# CORRECT:
return JsonResponse({'message': 'True'})
```

**4. Unprotected `user.profile` access**
Any view that accesses `user.profile` or `request.user.profile` without a try/except. New users without a UserProfile will cause a `RelatedObjectDoesNotExist` exception.

**5. Missing `@csrf_exempt` on AJAX POST views**
AJAX views that accept POST but are missing `@csrf_exempt` (the project pattern uses `@csrf_exempt` on all AJAX endpoints instead of CSRF tokens in JS).

**6. `get_object_or_404` vs raw `.get()`**
Views that use `Model.objects.get(pk=...)` in a try/except instead of `get_object_or_404`. Flag these for consistency.

**Output format:**
For each issue found, output:
```
[SEVERITY] file_path:line_number — description of issue
```

Severity levels: `[CRITICAL]` = auth bypass, `[WARNING]` = inconsistency/pattern mismatch, `[INFO]` = minor style issue.

At the end, give a summary count per severity level and a prioritized fix list.

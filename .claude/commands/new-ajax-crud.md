---
description: Generate the 4 standard AJAX CRUD views for an existing model in this project
---

Generate the complete AJAX CRUD views for an existing model in this project. Input: $ARGUMENTS

The input format is: `AppName ModelName` (e.g., `divisions Division` or `offices Office field1 field2 field3`)

Follow this project's exact patterns from CLAUDE.md:

**1. Read the target app's models.py first** to understand the model's fields.

**2. Generate all 4 views in views.py following the exact pattern used in this codebase:**

```python
# Save (create + update in one view)
@login_required
@csrf_exempt
def save_{model}_ajax(request):
    if request.method == 'POST':
        if not _is_authorized(request.user):
            return JsonResponse({'message': 'False', 'error': 'Unauthorized'})
        record_id = request.POST.get('id')
        # get all POST fields
        if record_id:
            # update
            obj = get_object_or_404(Model, pk=record_id)
            obj.field = value
            obj.save()
        else:
            # create
            Model.objects.create(...)
        return JsonResponse({'message': 'True'})
    return JsonResponse({'message': 'False'})

# Delete
@login_required
@csrf_exempt
def delete_{model}_ajax(request):
    if request.method == 'POST':
        if not _is_authorized(request.user):
            return JsonResponse({'message': 'False', 'error': 'Unauthorized'})
        record_id = request.POST.get('id')
        Model.objects.filter(pk=record_id).delete()
        return JsonResponse({'message': 'True'})
    return JsonResponse({'message': 'False'})

# List (for Vue dropdowns)
def get_{model}List(request):
    items = Model.objects.all().values('id', 'name_field')
    return JsonResponse({'data': list(items)})

# DataTable server-side processing
def get_{model}_details(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')
    order_col = int(request.GET.get('order[0][column]', 0))
    order_dir = request.GET.get('order[0][dir]', 'asc')

    columns = ['field1', 'field2', ...]  # match DataTable column order

    qs = Model.objects.annotate(lower_field=Lower('field1'))
    if search_value:
        qs = qs.filter(field1__icontains=search_value)

    total = Model.objects.count()
    filtered = qs.count()

    sort_field = columns[order_col] if order_col < len(columns) else columns[0]
    if order_dir == 'desc':
        sort_field = f'-{sort_field}'
    qs = qs.order_by(sort_field)[start:start+length]

    data = [{'id': obj.id, 'field1': obj.field1, ...} for obj in qs]

    return JsonResponse({'draw': draw, 'recordsTotal': total, 'recordsFiltered': filtered, 'data': data})
```

**3. Generate urls.py entries:**
```python
path('save-{model}-ajax/', views.save_{model}_ajax, name='save_{model}_ajax'),
path('delete-{model}-ajax/', views.delete_{model}_ajax, name='delete_{model}_ajax'),
path('api/get-{model}List/', views.get_{model}List, name='get_{model}List'),
path('get-{model}-details/', views.get_{model}_details, name='get_{model}_details'),
```

**4. Check if the app already has a `_can_manage` or `_is_authorized` helper.** If not, add the appropriate one at the top of views.py using the pattern from `orgoutcomes/views.py` or `divisions/views.py`.

**5. Response format reminder:**
- Always use string `'True'`/`'False'` in JsonResponse — NOT Python booleans. This matches the frontend check `response.message === 'True'`.

After generating, tell the developer which DataTable column array they need to update in `custom-vue.js` if a new list endpoint is needed.

---
description: Add a new server-side DataTable view for a model (view + URL + HTML table template)
---

Add a complete server-side DataTable view for a model. Input: $ARGUMENTS

Format: `AppName ModelName col1 col2 col3 ...` (columns to display, in order)
Example: `events Event event_title event_desc whole_date_start division_name`

**Step 1 — Read the target app's `models.py` and `views.py`** to understand the model and existing patterns.

**Step 2 — Add the DataTable view to `views.py`** following the exact server-side processing pattern this project uses:

```python
def get_{model}_details(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '').strip()
    order_col_idx = int(request.GET.get('order[0][column]', 0))
    order_dir = request.GET.get('order[0][dir]', 'asc')

    columns = ['col1', 'col2', ...]  # must match DataTable column order exactly

    qs = Model.objects.all()

    if search_value:
        qs = qs.filter(
            Q(col1__icontains=search_value) |
            Q(col2__icontains=search_value)
        )

    total = Model.objects.count()
    filtered = qs.count()

    # Case-insensitive sort (project standard)
    sort_col = columns[order_col_idx] if order_col_idx < len(columns) else columns[0]
    qs = qs.annotate(sort_key=Lower(sort_col))
    if order_dir == 'desc':
        qs = qs.order_by('-sort_key')
    else:
        qs = qs.order_by('sort_key')

    qs = qs[start:start + length]

    data = []
    for obj in qs:
        data.append({
            'id': obj.id,
            'col1': obj.col1,
            'col2': obj.col2,
            # include action buttons if needed
            'actions': f'<button class="btn btn-sm btn-primary" onclick="editRecord({obj.id})">Edit</button>'
                       f'<button class="btn btn-sm btn-danger ms-1" onclick="deleteRecord({obj.id})">Delete</button>',
        })

    return JsonResponse({
        'draw': draw,
        'recordsTotal': total,
        'recordsFiltered': filtered,
        'data': data,
    })
```

**Step 3 — Add the URL** to `{app}/urls.py`:
```python
path('get-{model}-details/', views.get_{model}_details, name='get_{model}_details'),
```

**Step 4 — Generate the HTML table snippet** to be placed in a template:
```html
<table id="{model}Table" class="table table-striped table-bordered" style="width:100%">
    <thead>
        <tr>
            <th>Col1 Label</th>
            <th>Col2 Label</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

**Step 5 — Generate the DataTables JS initialization** to be placed in the template or `custom-vue.js`:
```javascript
$('#{}Table').DataTable({
    processing: true,
    serverSide: true,
    ajax: {
        url: '/app/get-{model}-details/',
        type: 'GET',
    },
    columns: [
        { data: 'col1' },
        { data: 'col2' },
        { data: 'actions', orderable: false },
    ],
    order: [[0, 'asc']],
});
```

**Step 6 — Remind** the developer to:
- Add `from django.db.models import Q` if using multi-field search
- Add `from django.db.models.functions import Lower` for case-insensitive sort
- Refresh the DataTable after save/delete operations with `table.ajax.reload()`

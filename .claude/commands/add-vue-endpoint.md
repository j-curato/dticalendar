---
description: Wire up a new Django API endpoint into custom-vue.js (data property + fetch method + dropdown/list)
---

Wire up a new API endpoint into the Vue frontend. Input: $ARGUMENTS

The input format is: `endpoint_url data_property_name` (e.g., `/offices/api/get-offices-list/ officesList` or just a description of what needs to be wired up)

**Step 1 — Read `static/js/custom-vue.js`** to understand the existing patterns before making any changes.

**Step 2 — Add the data property** to the Vue app's `data()` return object, following the existing list naming convention:
```js
// e.g., existing: divisionsList: [], unitsList: [], officesList: []
newModelList: [],
```

**Step 3 — Add the fetch method** following the exact pattern used in this file:
```js
fetchNewModelList() {
    fetch('/app/api/get-newModelList/')
        .then(response => response.json())
        .then(data => {
            this.newModelList = data.data;  // or data.list — match what the view returns
        })
        .catch(error => console.error('Error fetching newModel list:', error));
},
```

**Step 4 — Call the fetch in `mounted()`** alongside existing fetch calls.

**Step 5 — If a dropdown is needed**, add the `<select>` or `<option v-for>` block following the existing dropdown pattern in the template. Remember:
- Vue delimiters in this project are `{[ ]}` NOT `{{ }}` — this is CRITICAL
- Use `v-model` for two-way binding
- Use `@change` if a cascading fetch is needed (e.g., selecting a province loads LGUs)

**Step 6 — If it's a cascading dropdown** (like province → LGU → barangay), add a watcher or `@change` handler that resets dependent fields and fetches the next level, matching the pattern used for the province/LGU/barangay chain in the existing code.

**Step 7 — Check `custom-events-vue.js`** if the new data also needs to be reflected in the events display table. If so, apply the same wiring pattern there.

After making changes, summarize:
- What data property was added
- What fetch method was added
- Where it's called from
- Any template changes made

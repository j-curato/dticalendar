from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.template import loader
from .models import OrgOutcome
from django.db.models import Q
from django.db.models.functions import Lower
from django.contrib.auth.decorators import login_required


def _is_authorized(user):
    """True if user is superuser or office admin."""
    if user.is_superuser:
        return True
    try:
        return user.profile.is_office_admin
    except Exception:
        return False


# Create your views here.
# Save org outcome using ajax
@login_required
@csrf_exempt
def save_orgOutcome(request):
    if request.method == 'POST':
        if not _is_authorized(request.user):
            return JsonResponse({'message': 'Unauthorized'}, status=403)

        if request.POST['oobtntxt'] == 'Update':
            # Fetch existing org outcome based on id
            ooPrimaryID = request.POST['id']
            existing_oo = OrgOutcome.objects.filter(id=ooPrimaryID).first()

            if existing_oo:

                if existing_oo.org_outcome != request.POST['org_outcome'].upper():
                    existing_oo.org_outcome = request.POST['org_outcome'].upper()

                if existing_oo.description != request.POST['description'].upper():
                    existing_oo.description = request.POST['description'].upper()

                    # Save the updated org outcome
                existing_oo.save()

                return JsonResponse({'message': 'True'})
            else:
                return JsonResponse({'message': 'Org Outcome not found'})

        elif request.POST['oobtntxt'] == 'Save':
            name = request.POST['org_outcome'].strip()
            # Duplicate detection (case-insensitive)
            if OrgOutcome.objects.filter(org_outcome__iexact=name).exists():
                existing = OrgOutcome.objects.filter(org_outcome__iexact=name).first()
                return JsonResponse({'message': 'Duplicate', 'existing_name': existing.org_outcome}, status=400)

            oo = OrgOutcome()
            oo.org_outcome = name.upper()
            oo.description = request.POST['description'].upper()

            # Save the new org outcome
            oo.save()
            return JsonResponse({'message': 'True'})

    return JsonResponse({'message': 'False'})


@login_required
@csrf_exempt
def delete_oo_ajax(request):
    if request.method == 'POST':
        if not _is_authorized(request.user):
            return JsonResponse({'message': 'Unauthorized'}, status=403)

        oo_id = request.POST.get('id')
        oo = OrgOutcome.objects.filter(id=oo_id).first()
        if oo:
            oo.delete()
            return JsonResponse({'message': 'True'})
        return JsonResponse({'message': 'OrgOutcome not found'})
    return JsonResponse({'message': 'False'})

# get org outcome list using ajax and return json response and save to data variable
def get_ooList(request):
    ooList = OrgOutcome.objects.all()
    data = [{'id': oo.id, 'org_outcome': oo.org_outcome} for oo in ooList]
    return JsonResponse(data, safe=False)

# get oo details and return json response to be displayed using server-side datatables
def get_oo_details(request):
    try:
        draw = int(request.GET.get('draw', 1))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search_value = request.GET.get('search[value]', '')
        order_column_index = int(request.GET.get('order[0][column]', 0))
        order_direction = request.GET.get('order[0][dir]', 'asc')

        print("order_column_index:", order_column_index)
        print("order_direction:", order_direction)

         # Define the columns you want to search on
        columns = ['id', 'org_outcome', 'description']

        #Create a Q object for filtering based on the search_value in all columns
        search_filter = Q()
        for col in columns:
            search_filter |= Q(**{f'{col}__icontains': search_value})

        # Filter based on the search_value
        ooList = OrgOutcome.objects.filter(search_filter)

        # Get the total count (before filtering)
        total_records = OrgOutcome.objects.count()

        # Apply sorting
        if order_direction == 'asc':
            if columns[order_column_index] in ['org_outcome', 'description']:
                ooList = ooList.order_by(Lower(columns[order_column_index]))
            else:
                ooList = ooList.order_by(columns[order_column_index])
        else:
            if columns[order_column_index] in ['org_outcome', 'description']:
                ooList = ooList.order_by(Lower(columns[order_column_index])).reverse()
            else:
                ooList = ooList.order_by(f'-{columns[order_column_index]}')

        # Count of records after filtering
        filtered_records = ooList.count()

        # Slice based on DataTables pagination
        ooList = ooList[start:start + length]

        # Format the data for DataTables
        data = []
        for oo in ooList:
            data.append({
                'id': oo.id,
                'org_outcome': oo.org_outcome,
                'description': oo.description,
        })

        response_data = {
            'draw': draw,
            'recordsTotal': total_records,
            'recordsFiltered': filtered_records,
            'data': data
        }

        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

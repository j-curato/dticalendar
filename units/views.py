from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Unit
from .models import Division
from django.db.models import Q
from django.db.models.functions import Lower
from django.contrib.auth.decorators import login_required


def _can_manage(user, office_id=None):
    """True if user is superuser OR (office_admin AND office matches or shared resource)."""
    if user.is_superuser:
        return True
    try:
        if user.profile.is_office_admin:
            if office_id is None:
                return True  # shared resources
            return str(user.profile.fk_office_id) == str(office_id)
    except Exception:
        return False
    return False


# Create your views here.
@login_required
@csrf_exempt
def save_unit_ajax(request):

    if request.method == 'POST':
        if request.POST['bntUnitText'] == 'Update':
            # Fetch existing unit based on id
            unitPrimaryID = request.POST['id']
            existing_unit = Unit.objects.filter(id=unitPrimaryID).first()

            if existing_unit:
                # Determine office_id from the unit's division
                office_id = existing_unit.division.fk_office_id if existing_unit.division else None
                if not _can_manage(request.user, office_id):
                    return JsonResponse({'message': 'Unauthorized'}, status=403)

                if existing_unit.unit_name != request.POST['unit_name'].upper():
                    existing_unit.unit_name = request.POST['unit_name'].upper()

                if existing_unit.description != request.POST['description'].upper():
                    existing_unit.description = request.POST['description'].upper()

                if existing_unit.division_name != request.POST['division_name'].upper():
                    existing_unit.division_name = request.POST['division_name'].upper()

                if existing_unit.division_id != request.POST['division_id']:
                    existing_unit.division_id = request.POST['division_id']

                    # Save the updated unit
                existing_unit.save()

                return JsonResponse({'message': 'True'})
            else:
                return JsonResponse({'message': 'Unit not found'})

        elif request.POST['bntUnitText'] == 'Save':

            # assign division_id to db division_id
            div_id = request.POST.get('division_id')
            division = get_object_or_404(Division, pk=div_id)

            if not _can_manage(request.user, division.fk_office_id):
                return JsonResponse({'message': 'Unauthorized'}, status=403)

            unit = Unit()
            unit.unit_name = request.POST['unit_name'].upper()
            unit.description = request.POST['description'].upper()
            unit.division = division
            unit.division_name = request.POST['division_name'].upper()

            # Save the new unit
            unit.save()
            return JsonResponse({'message': 'True'})

    return JsonResponse({'message': 'False'})


@login_required
@csrf_exempt
def delete_unit_ajax(request):
    if request.method == 'POST':
        unit_id = request.POST.get('id')
        unit = Unit.objects.filter(id=unit_id).first()
        if unit:
            office_id = unit.division.fk_office_id if unit.division else None
            if not _can_manage(request.user, office_id):
                return JsonResponse({'message': 'Unauthorized'}, status=403)
            unit.delete()
            return JsonResponse({'message': 'True'})
        return JsonResponse({'message': 'Unit not found'})
    return JsonResponse({'message': 'False'})


def get_unitList(request):
    unitList = Unit.objects.all().order_by('unit_name')
    data = [{'id': unit.id, 'unitList': unit.unit_name, 'division_id': unit.division_id} for unit in unitList]
    return JsonResponse(data, safe=False)


# method to display unit details using datatable server side processing
def get_unit_details(request):
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
        columns = ['id', 'unit_name', 'description', 'division_name']

        #Create a Q object for filtering based on the search_value in all columns
        search_filter = Q()
        for col in columns:
            search_filter |= Q(**{f'{col}__icontains': search_value})

        for col in columns:
            if col == 'division_name':  # Handle division name separately
                search_filter |= Q(**{'division__division_name__icontains': search_value})
            else:
                search_filter |= Q(**{f'{col}__icontains': search_value})

        # Filter based on the search_value
        unitList = Unit.objects.filter(search_filter)

        # Get the total count (before filtering)
        total_records = Unit.objects.count()

        # Apply sorting
        if order_direction == 'asc':
            if columns[order_column_index] in ['unit_name', 'description', 'division_name']:
                unitList = unitList.order_by(Lower(columns[order_column_index]))
            else:
                unitList = unitList.order_by(columns[order_column_index])
        else:
            if columns[order_column_index] in ['unit_name', 'description', 'division_name']:
                unitList = unitList.order_by(Lower(columns[order_column_index])).reverse()
            else:
                unitList = unitList.order_by(f'-{columns[order_column_index]}')

        # Count of records after filtering
        filtered_records = unitList.count()

        # Slice based on DataTables pagination
        unitList = unitList[start:start + length]

        # Format the data for DataTables
        data = []
        for unit in unitList:
            data.append({
                'id': unit.id,
                'unit_name': unit.unit_name,
                'description': unit.description,
                'division_name': unit.division.division_name if unit.division else '',
                'division_id': unit.division_id,
                'fk_office_id': unit.division.fk_office_id if unit.division else None,
                'office_initials': unit.division.fk_office.office_initials if unit.division and unit.division.fk_office else '-',
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

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Unit
from .models import Division
from django.db.models import Q
from django.db.models.functions import Lower

# Create your views here.
# Save unit using ajax
# @csrf_exempt
# def save_unit_ajax(request):
     
#     if request.method == 'POST':
#         # assign division_id to db division_id
#         div_id = request.POST.get('division_id')
#         division = get_object_or_404(Division, pk=div_id)

#         unit = Unit()
#         unit.unit_name = request.POST['unit_name'].upper()
#         unit.description = request.POST['description'].upper()
#         unit.division = division
#         unit.division_name = request.POST['division_name'].upper()
#         # if unit.save() is true, return json response, else return false
#         if unit.save():
#             return JsonResponse({'message': 'True'})
#         else:
#             return JsonResponse({'message': 'False'})
        
@csrf_exempt       
def save_unit_ajax(request):

    if request.method == 'POST':
        if request.POST['bntUnitText'] == 'Update':
            # Fetch existing division based on id
            unitPrimaryID = request.POST['id']
            existing_unit = Unit.objects.filter(id=unitPrimaryID).first()

            if existing_unit:

                if existing_unit.unit_name != request.POST['unit_name'].upper():
                    existing_unit.unit_name = request.POST['unit_name'].upper()

                if existing_unit.description != request.POST['description'].upper():
                    existing_unit.description = request.POST['description'].upper()

                if existing_unit.division_name != request.POST['division_name'].upper():
                    existing_unit.division_name = request.POST['division_name'].upper()

                if existing_unit.division_id != request.POST['division_id']:
                    existing_unit.division_id = request.POST['division_id']

                    # Save the updated division
                existing_unit.save()

                return JsonResponse({'message': 'True'})
            else:
                return JsonResponse({'message': 'Unit not found'})
                
        elif request.POST['bntUnitText'] == 'Save':

            # assign division_id to db division_id
            div_id = request.POST.get('division_id')
            division = get_object_or_404(Division, pk=div_id)

            unit = Unit()
            unit.unit_name = request.POST['unit_name'].upper()
            unit.description = request.POST['description'].upper()
            unit.division = division
            unit.division_name = request.POST['division_name'].upper()
            
            # Save the new division
            unit.save()
            return JsonResponse({'message': 'True'})

    return JsonResponse({'message': 'False'})
        

def get_unitList(request):
    unitList = Unit.objects.all().order_by('unit_name')
    data = [{'id': unit.id, 'unitList': unit.unit_name, 'division_id': unit.division_id} for unit in unitList]
    return JsonResponse(data, safe=False)


# method to display division details using datatable server side processing
def get_unit_details(request):
    try:
        # Filter the events based on DataTables parameters
        # This includes pagination and filtering based on search
        # term, if provided by DataTables.
        draw = int(request.GET.get('draw', 1))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search_value = request.GET.get('search[value]', '')
        # Declare variables to be used for datatables sorting
        order_column_index = int(request.GET.get('order[0][column]', 0))
        order_direction = request.GET.get('order[0][dir]', 'asc')

        # Print the values for debugging
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

        # Filter the events based on the search_value
        unitList = Unit.objects.filter(search_filter)
        
        #events = Event.objects.filter(search_filter)

        # Get the total count of events (before filtering)
        total_records = Unit.objects.count()

        # Apply sorting based on the column index and direction
       # Apply sorting based on the column index and direction
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
        
        # Slice the events based on DataTables pagination
        unitList = unitList[start:start + length]

        # Format the data for DataTables
        data = []
        for unit in unitList:
            data.append({
                'id': unit.id,
                'unit_name': unit.unit_name,
                'description': unit.description,
                'division_name': unit.division.division_name if unit.division else '',  # Access division name if division exists,
                'division_id': unit.division_id
        })

        # Prepare the JSON response
        response_data = {
            'draw': draw,
            'recordsTotal': total_records,
            'recordsFiltered': filtered_records,
            'data': data
        }

        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.http import HttpResponse
from django.template import loader
from .models import Division
from django.db.models import Q
from django.db.models.functions import Lower

# Create your views here.
def save_division(request):
    if request.method == 'POST':
        division = Division()
        division.division_name = request.POST['division_name'].upper()
        division.division_desc = request.POST['division_desc'].upper()
        division.save()
        return HttpResponse('Division saved successfully')
    else:
        return HttpResponse('Invalid method')
    
# get org outcome list using ajax and return json response and save to data variable
def get_divList(request):
    divList = Division.objects.all()
    data = [{'id': div.id, 'div_name': div.division_name} for div in divList]
    return JsonResponse(data, safe=False)

@csrf_exempt
def save_div_ajax(request):
    if request.method == 'POST':
        if request.POST['buttonDivTxt'] == 'Update':
            # Fetch existing division based on id
            divPrimaryID = request.POST['id']
            existing_division = Division.objects.filter(id=divPrimaryID).first()

            if existing_division:

                if existing_division.division_name != request.POST['division_name'].upper():
                    existing_division.division_name = request.POST['division_name'].upper()

                if existing_division.division_desc != request.POST['division_desc'].upper():
                    existing_division.division_desc = request.POST['division_desc'].upper()

                fk_office_id = request.POST.get('fk_office_id')
                if fk_office_id:
                    existing_division.fk_office_id = fk_office_id

                    # Save the updated division
                existing_division.save()

                return JsonResponse({'message': 'True'})
            else:
                return JsonResponse({'message': 'Division not found'})
                
        elif request.POST['buttonDivTxt'] == 'Save':
            div = Division()
            div.division_name = request.POST['division_name'].upper()
            div.division_desc = request.POST['division_desc'].upper()
            fk_office_id = request.POST.get('fk_office_id')
            if fk_office_id:
                div.fk_office_id = fk_office_id
            # Save the new division
            div.save()
            return JsonResponse({'message': 'True'})

    return JsonResponse({'message': 'False'})


@csrf_exempt
def delete_div_ajax(request):
    if request.method == 'POST':
        div_id = request.POST.get('id')
        division = Division.objects.filter(id=div_id).first()
        if division:
            division.delete()
            return JsonResponse({'message': 'True'})
        return JsonResponse({'message': 'Division not found'})
    return JsonResponse({'message': 'False'})

# method to display division details using datatable server side processing
def get_division_details(request):
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
        columns = ['id', 'division_name', 'division_desc', 'fk_office__office_initials']

        #Create a Q object for filtering based on the search_value in all columns
        search_filter = Q()
        for col in columns: 
            search_filter |= Q(**{f'{col}__icontains': search_value})

        # Filter the events based on the search_value
        divisionList = Division.objects.filter(search_filter)
        
        #events = Event.objects.filter(search_filter)

        # Get the total count of events (before filtering)
        total_records = Division.objects.count()

        # Apply sorting based on the column index and direction
        sortable_columns = ['id', 'division_name', 'division_desc']
        sort_col = columns[order_column_index] if order_column_index < len(sortable_columns) else 'id'
        if order_direction == 'asc':
            if sort_col in ['division_name', 'division_desc']:
                divisionList = divisionList.order_by(Lower(sort_col))
            else:
                divisionList = divisionList.order_by(sort_col)
        else:
            if sort_col in ['division_name', 'division_desc']:
                divisionList = divisionList.order_by(Lower(sort_col)).reverse()
            else:
                divisionList = divisionList.order_by(f'-{sort_col}')

        # Count of records after filtering 
        filtered_records = divisionList.count()
        
        # Slice the events based on DataTables pagination
        divisionList = divisionList[start:start + length]

        # Format the data for DataTables
        data = []
        for div in divisionList:
            data.append({
                'id': div.id,
                'division_name': div.division_name,
                'division_desc': div.division_desc,
                'fk_office_id': div.fk_office_id,
                'office_initials': div.fk_office.office_initials if div.fk_office else '-',
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
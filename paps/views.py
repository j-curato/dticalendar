from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.template import loader
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from orgoutcomes.models import OrgOutcome
from .models import Pap
from django.db.models import Q
from django.db.models.functions import Lower


# save pap using ajax and return json response
@csrf_exempt
def save_paps_ajax(request):
     
    if request.method == 'POST':
        if request.POST['papBtnTxt'] == 'Update':
            # Fetch existing division based on id
            papPrimaryID = request.POST['id']
            existing_pap = Pap.objects.filter(id=papPrimaryID).first()

            if existing_pap:

                if existing_pap.pap != request.POST['pap'].upper():
                    existing_pap.pap = request.POST['pap'].upper()

                if existing_pap.description != request.POST['description'].upper():
                    existing_pap.description = request.POST['description'].upper()

                if existing_pap.oo_name != request.POST['oo_name'].upper():
                    existing_pap.oo_name = request.POST['oo_name'].upper()

                if existing_pap.org_outcome_id != request.POST['org_outcome_id']:
                    existing_pap.org_outcome_id = request.POST['org_outcome_id']

                    # Save the updated division
                existing_pap.save()

                return JsonResponse({'message': 'True'})
            else:
                return JsonResponse({'message': 'Unit not found'})
                
        elif request.POST['papBtnTxt'] == 'Save':

            # assign oo_id to org_outcome_id
            oo_id = request.POST.get('org_outcome_id')
            org_outcome = get_object_or_404(OrgOutcome, pk=oo_id)

            pap = Pap()
            pap.pap = request.POST['pap'].upper()
            pap.description = request.POST['description'].upper()
            pap.org_outcome = org_outcome
            pap.oo_name = request.POST['oo_name'].upper()

            # Save the new division
            pap.save()
            return JsonResponse({'message': 'True'})

    return JsonResponse({'message': 'False'})
        
# get paps list using ajax and return json response and save to data variable
def get_papsList(request):
    papsList = Pap.objects.all()
    data = [{'id': pap.id, 'pap': pap.pap, 'org_outcome_id': pap.org_outcome_id} for pap in papsList]
    return JsonResponse(data, safe=False)

def get_paps_details(request):
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
        columns = ['id', 'pap', 'description', 'oo_name']

        #Create a Q object for filtering based on the search_value in all columns
        search_filter = Q()
        for col in columns: 
            search_filter |= Q(**{f'{col}__icontains': search_value})

        # Filter the events based on the search_value
        papList = Pap.objects.filter(search_filter)
        
        #events = Event.objects.filter(search_filter)

        # Get the total count of events (before filtering)
        total_records = Pap.objects.count()

        # Apply sorting based on the column index and direction
       # Apply sorting based on the column index and direction
        if order_direction == 'asc':
            if columns[order_column_index] in ['pap', 'description', 'oo_name']:
                papList = papList.order_by(Lower(columns[order_column_index]))
            else:
                papList = papList.order_by(columns[order_column_index])
        else:
            if columns[order_column_index] in ['pap', 'description', 'oo_name']:
                papList = papList.order_by(Lower(columns[order_column_index])).reverse()
            else:
                papList = papList.order_by(f'-{columns[order_column_index]}')

        # Count of records after filtering 
        filtered_records = papList.count()
        
        # Slice the events based on DataTables pagination
        papList = papList[start:start + length]

        # Format the data for DataTables
        data = []
        for papval in papList:
            data.append({
                'id': papval.id,
                'pap': papval.pap,
                'description': papval.description,
                'oo_name': papval.oo_name,
                'org_outcome_id': papval.org_outcome_id
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


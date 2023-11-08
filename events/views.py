# from rest_framework.response import Response
# from rest_framework.decorators import api_view
# from .serializers import EventSerializer
from django.http import HttpResponse
from django.http import JsonResponse
from django.db import connection
from calendars.models import Calendar
from divisions.models import Division
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from .models import Event

# @api_view(['GET'])
# def get_events(request):
#     events = Event.objects.all()
#     serializer = EventSerializer(events, many=True)
#     return Response(serializer.data)

# save using ajax
@csrf_exempt
def save_event_ajax(request):
    
    if request.method == 'POST':
        calendar_id = request.POST.get('calendar_id')
        division_id = request.POST.get('division_id')

        if request.user:
             calendar = get_object_or_404(Calendar, pk=calendar_id)
             division = get_object_or_404(Division, pk=division_id)

        event = Event()
        # assign to event.user the current logged-in user id
        event.user = request.user
        event.event_title = request.POST['event_title'].upper()
        event.event_desc = request.POST['event_desc'].upper()
        event.participants = request.POST['participants'].upper()
        event.event_location = request.POST['event_location'].upper()
        event.event_day_start = request.POST['event_day_start']
        event.event_month_start = request.POST['event_month_start']
        event.event_year_start = request.POST['event_year_start']
        event.event_time_start = request.POST['event_time_start']
        event.event_day_end = request.POST['event_day_end']
        event.event_month_end = request.POST['event_month_end']
        event.event_year_end = request.POST['event_year_end']
        event.event_time_end = request.POST['event_time_end']
        event.whole_date_start = timezone.datetime.strptime(request.POST['whole_date_start'], "%Y-%m-%dT%H:%M")
        event.whole_date_end = timezone.datetime.strptime(request.POST['whole_date_end'], "%Y-%m-%dT%H:%M")
        event.calendar = calendar
        event.division = division
        event.file_attachment = request.FILES['file_attachment']
        #event.file_attachment = request.FILES.get('file_attachment')
        event.whole_date_start_searchable = request.POST['whole_date_start_searchable']
        event.whole_date_end_searchable = request.POST['whole_date_end_searchable']
        event.office = request.POST['office'].upper()
        event.org_outcome = request.POST['org_outcome'].upper()
        event.paps = request.POST['paps'].upper()
        event.unit = request.POST['unit'].upper()
        event.division_name = request.POST['division_name'].upper()
        event.whole_dateStart_with_time = timezone.datetime.strptime(request.POST['whole_date_start'], "%Y-%m-%dT%H:%M")
        event.whole_dateEnd_with_time = timezone.datetime.strptime(request.POST['whole_date_end'], "%Y-%m-%dT%H:%M")
        event.actual_outcome = "PENDING".upper()
        event.calendar_name = request.POST['calendar_name'].upper()
        event.event_location_district = request.POST['event_location_district'].upper()
        event.event_location_lgu = request.POST['event_location_lgu'].upper()
        event.event_location_barangay = request.POST['event_location_barangay'].upper()
        event.event_status = "PENDING".upper()
        event.expected_outcome = "PENDING".upper()
        event.save()
        return JsonResponse({'message': 'True'})
    else:
        return JsonResponse({'message': 'False'})
    
    # method to fetch the event table data and display it in the following field order - whole_date_start_searchable, event_title, office.
    # but the office data is divided into 5 fields that is based on its values. Namely: RO, ADN, ADS, SDN, SDS and PDI
    # display the data in event_display.html

def get_eventsList(request):
    events = Event.objects.all()
    return render(request, 'events/event_display.html', {'events': events})


# method to display event details using datatable server side processing
def fetch_events_ajax(request):
    try:
        draw = int(request.GET.get('draw', 1))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search_value = request.GET.get('search[value]', '')

        # Define the columns you want to search on
        columns = ['whole_date_start_searchable']

        query = """
        SELECT *
        FROM crosstab(
          'SELECT whole_date_start, whole_date_start_searchable, office, COUNT(event_title) AS event_count
           FROM events_event
           GROUP BY whole_date_start, whole_date_start_searchable, office
           ORDER BY 1,2,3',
           'SELECT unnest(ARRAY[''RO'', ''ADN'', ''ADS'', ''SDN'', ''SDS'', ''PDI''])'
        ) AS ct (whole_date_start date, whole_date_start_searchable text, RO int, ADN int, ADS int, SDN int, SDS int, PDI int);
        """

        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchall()

        # Convert the result into a list of dictionaries
        data = []
        for row in result:
            data.append({
                'whole_date_start': row[0].strftime('%Y-%m-%d'),  # Format as needed
                'whole_date_start_searchable': row[1],
                'RO': row[2],
                'ADN': row[3],
                'ADS': row[4],
                'SDN': row[5],
                'SDS': row[6],
                'PDI': row[7],
                # Add more fields as needed
            })

        # Apply the search filter to the data
        filtered_data = [entry for entry in data if any(search_value.lower() in entry[col].lower() for col in columns)]

        response_data = {
            'draw': draw,
            'recordsTotal': len(data),
            'recordsFiltered': len(filtered_data),
            'data': filtered_data[start:start + length]
        }

        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)





    


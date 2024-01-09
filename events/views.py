# from rest_framework.response import Response
# from rest_framework.decorators import api_view
# from .serializers import EventSerializer
from django.http import HttpResponse
from django.http import JsonResponse

from django.db import connection
from calendars.models import Calendar
from divisions.models import Division
from orgoutcomes.models import OrgOutcome
from paps.models import Pap
from provinces.models import Province
from lgus.models import Lgu
from barangays.models import Barangay
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import FileResponse
from mimetypes import guess_type
from .models import Event
import os
import json
# make_random_password is a method from django.contrib.auth.models

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
        orgoutcome_id = request.POST.get('orgoutcome_id')
        pap_id = request.POST.get('pap_id')
        province_id = request.POST.get('province_id')
        lgu_id = request.POST.get('lgu_id')
        barangay_id = request.POST.get('barangay_id')

        # check if the user is logged in
        if request.user:
             calendar = get_object_or_404(Calendar, pk=calendar_id)
             division = get_object_or_404(Division, pk=division_id)
             orgoutcome = get_object_or_404(OrgOutcome, pk=orgoutcome_id)
             pap = get_object_or_404(Pap, pk=pap_id)
             province = get_object_or_404(Province, pk=province_id)
             lgu = get_object_or_404(Lgu, pk=lgu_id)
             barangay = get_object_or_404(Barangay, pk=barangay_id)

        # set variables to use for multiple records to be saved if the event is recurring
        start_date = timezone.datetime.strptime(request.POST['whole_date_start'], "%Y-%m-%dT%H:%M")
        end_date = timezone.datetime.strptime(request.POST['whole_date_end'], "%Y-%m-%dT%H:%M")
        day_duration = timezone.timedelta(days=1)

        # use while loop to save multiple records if the event is recurring
        while start_date <= end_date:
            event = Event()
            # assign to event.user the current logged-in user id
            event.user = request.user
            event.event_title = request.POST['event_title'].upper()
            event.event_desc = request.POST['event_desc'].upper()
            event.participants = request.POST['participants'].upper()
            event.event_location = request.POST['event_location'].upper()
            event.event_day_start = start_date.day
            event.event_month_start = start_date.month
            event.event_year_start = start_date.year
            event.event_time_start = request.POST['event_time_start']
            event.event_day_end = request.POST['event_day_end']
            event.event_month_end = request.POST['event_month_end']
            event.event_year_end = request.POST['event_year_end']
            event.event_time_end = request.POST['event_time_end']
            event.whole_date_start = start_date
            event.whole_date_end = end_date
            event.calendar = calendar
            event.division = division
            event.orgoutcome = orgoutcome
            event.pap = pap
            event.province = province
            event.lgu = lgu
            event.barangay = barangay
            # check if the file_attachment field is not empty
            if request.FILES.get('file_attachment') != None:
                event.file_attachment = request.FILES.get('file_attachment')
            else:
                event.file_attachment = 'NONE'
            
            #event.file_attachment = request.FILES.get('file_attachment')
            event.whole_date_start_searchable = start_date.strftime("%B %d, %Y")
            event.whole_date_end_searchable = request.POST['whole_date_end_searchable']
            event.office = request.POST['office'].upper()
            event.org_outcome = request.POST['org_outcome'].upper()
            event.paps = request.POST['paps'].upper()
            event.unit = request.POST['unit'].upper()
            event.division_name = request.POST['division_name'].upper()
            #event.whole_dateStart_with_time = timezone.datetime.strptime(request.POST['whole_date_start'], "%Y-%m-%dT%H:%M")
            event.whole_dateStart_with_time = timezone.datetime.strptime(start_date.strftime("%Y-%m-%dT%H:%M"), "%Y-%m-%dT%H:%M")
            event.whole_dateEnd_with_time = timezone.datetime.strptime(request.POST['whole_date_end'], "%Y-%m-%dT%H:%M")
            event.actual_outcome = "PENDING".upper()
            event.calendar_name = request.POST['calendar_name'].upper()
            event.event_location_district = request.POST['event_location_district'].upper()
            event.event_location_lgu = request.POST['event_location_lgu'].upper()
            event.event_location_barangay = request.POST['event_location_barangay'].upper()
            event.event_status = "PENDING".upper()
            event.expected_outcome = "PENDING".upper()
            event.event_code = request.POST['event_code']
            # save a boolean value to event_all_day field
            if request.POST['event_all_day'] == 'true':
                event.event_all_day = True
            else:
                event.event_all_day = False
            
            event.save()
            start_date = start_date + day_duration

        return JsonResponse({'message': 'True'})
    else:
        return JsonResponse({'message': 'False'})
    
    # method to fetch the event table data and display it in the following field order - whole_date_start_searchable, event_title, office.
    # but the office data is divided into 5 fields that is based on its values. Namely: RO, ADN, ADS, SDN, SDS and PDI
    # display the data in event_display.html

def get_eventsList(request):
    txturl = 'events'
    events = Event.objects.all()
    return render(request, 'events/event_display.html', {'events': events, 'txturl': txturl})

@csrf_exempt
def get_eventsListDate(request):
    # check request method
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required.'}, status=400)
    # Extract start_date and end_date from request body
    try:
        request_data = json.loads(request.body)
        start_date = request_data.get('start_date')
        end_date = request_data.get('end_date')
    except:
        return JsonResponse({'error': 'Invalid request body.'}, status=400)
    
    # define the desired fields to include in the JSON response
    fields_to_include = ['id','event_title', 'event_desc', 'participants', 'event_location', 'whole_date_start_searchable', 'whole_date_end_searchable', 'event_time_start', 'event_time_end', 'office', 'org_outcome', 'paps', 'unit', 'division_name', 'actual_outcome', 'event_location_lgu', 'event_location_barangay', 'event_status', 'expected_outcome','event_all_day']
    # Filter events based on start_date and end_date
    events = Event.objects.filter(Q(whole_date_start__gte=start_date) & Q(whole_date_start__lte=end_date))
    events_json = []
    # Loop through each event and extract the desired fields
    for event in events:
        event_json = {}
        for field in fields_to_include:
            event_json[field] = getattr(event, field)
        events_json.append(event_json)
    # Return the JSON response
    return JsonResponse(events_json, safe=False)

@csrf_exempt
def get_event_details(request):
    # check request method
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required.'}, status=400)
    # extract id from the request body
    try:
        request_data = json.loads(request.body)
        id = request_data.get('event_id')
    except:
        return JsonResponse({'error': 'Invalid request body.'}, status=400)
    
    # filter event based on id
    event = Event.objects.filter(id=id)
    # return the JSON response
    return JsonResponse(list(event.values()), safe=False)

# method to display event details using datatable server side processing
def fetch_events_ajax(request):
    try:
        draw = int(request.GET.get('draw', 1))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search_value = request.GET.get('search[value]', '')

        # Define the columns you want to search on
        # columns = ['whole_date_start_searchable']
        columns = ['whole_date_start_searchable', 'RO', 'ADN', 'ADS', 'SDN', 'SDS', 'PDI']


        query = """
        SELECT whole_date_start,
            whole_date_start_searchable,
            MAX(CASE WHEN office = 'RO' THEN event_titles END) AS RO,
            MAX(CASE WHEN office = 'ADN' THEN event_titles END) AS ADN,
            MAX(CASE WHEN office = 'ADS' THEN event_titles END) AS ADS,
            MAX(CASE WHEN office = 'SDN' THEN event_titles END) AS SDN,
            MAX(CASE WHEN office = 'SDS' THEN event_titles END) AS SDS,
            MAX(CASE WHEN office = 'PDI' THEN event_titles END) AS PDI
        FROM (
            SELECT whole_date_start,
                whole_date_start_searchable,
                office,
                STRING_AGG(CONCAT(event_title, '*', id, '*', division_name, '*', unit, '*', event_time_start, '*', event_time_end), ', ') AS event_titles
            FROM (
                SELECT whole_date_start,
                    whole_date_start_searchable,
                    office,
                    event_title,
                    id,
                    division_name,
                    unit,
                    event_time_start,
                    event_time_end
                FROM events_event
            ) AS sub
            GROUP BY whole_date_start, whole_date_start_searchable, office
        ) AS subquery
        GROUP BY whole_date_start, whole_date_start_searchable
        ORDER BY 1, 2;
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
        # filtered_data = [entry for entry in data if any(search_value.lower() in entry[col].lower() for col in columns)]
        filtered_data = [
            entry for entry in data if any(
                search_value.lower() in (str(entry[col]).lower() if entry[col] is not None else '') for col in columns
            )
        ]

        response_data = {
            'draw': draw,
            'recordsTotal': len(data),
            'recordsFiltered': len(filtered_data),
            'data': filtered_data[start:start + length]
        }

        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
    # load division datatables html page - events_display_div.html
def load_div_datatbl_html(request):
    txturl = 'events'
    officetxt = request.GET.get('dtioffice')
    divisions = Division.objects.all()
    return render(request, 'events/events_display_div.html', {'divisions': divisions, 'txturl': txturl, 'officetxt': officetxt})

def load_unit_datatbl_html(request):
    txturl = 'events'
    officetxt = request.GET.get('dtiofficeparam')
    divtxt = request.GET.get('dtidivision')
    divisions = Division.objects.all()
    return render(request, 'events/events_display_unit.html', {'divisions': divisions, 'txturl': txturl, 'officetxt': officetxt, 'divtxt': divtxt})

def fetch_events_by_div_ajax(request):
    try:
        draw = int(request.GET.get('draw', 1))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search_value = request.GET.get('search[value]', '')
        #office_txt = request.GET.get('office', '')

        # Define the columns you want to search on
        # columns = ['whole_date_start_searchable']
        columns = ['whole_date_start_searchable', 'ORD', 'OARD', 'SDD', 'IDD', 'CPD', 'FAD', 'MSSD']

        query = """
        SELECT whole_date_start,
            whole_date_start_searchable,
            MAX(CASE WHEN division_name = 'ORD' THEN event_titles END) AS ORD,
            MAX(CASE WHEN division_name = 'OARD' THEN event_titles END) AS OARD,
            MAX(CASE WHEN division_name = 'SDD' THEN event_titles END) AS SDD,
            MAX(CASE WHEN division_name = 'IDD' THEN event_titles END) AS IDD,
            MAX(CASE WHEN division_name = 'CPD' THEN event_titles END) AS CPD,
            MAX(CASE WHEN division_name = 'FAD' THEN event_titles END) AS FAD,
            MAX(CASE WHEN division_name = 'MSSD' THEN event_titles END) AS MSSD
        FROM (
            SELECT whole_date_start,
                whole_date_start_searchable,
                division_name,
                STRING_AGG(event_title, ', ') AS event_titles, office
            FROM events_event
            WHERE office = %s
            GROUP BY whole_date_start, whole_date_start_searchable, division_name, office
        ) AS subquery
        GROUP BY whole_date_start, whole_date_start_searchable
        ORDER BY 1;
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [request.GET.get('office')])
            result = cursor.fetchall()

        # Convert the result into a list of dictionaries
        data = []
        for row in result:
            data.append({
                'whole_date_start': row[0].strftime('%Y-%m-%d'),  # Format as needed
                'whole_date_start_searchable': row[1],
                'ORD': row[2],
                'OARD': row[3],
                'SDD': row[4],
                'IDD': row[5],
                'CPD': row[6],
                'FAD': row[7],
                'MSSD': row[8]
                # Add more fields as needed
            })

        # Apply the search filter to the data
        # filtered_data = [entry for entry in data if any(search_value.lower() in entry[col].lower() for col in columns)]
        filtered_data = [
            entry for entry in data if any(
                search_value.lower() in (str(entry[col]).lower() if entry[col] is not None else '') for col in columns
            )
        ]

        response_data = {
            'draw': draw,
            'recordsTotal': len(data),
            'recordsFiltered': len(filtered_data),
            'data': filtered_data[start:start + length]
        }

        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
    # get events by unit
def fetch_events_by_unit_ajax(request):
    try:
        draw = int(request.GET.get('draw', 1))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search_value = request.GET.get('search[value]', '')
        #office_txt = request.GET.get('office', '')

        # Define the columns you want to search on
        # columns = ['whole_date_start_searchable']
        columns = ['whole_date_start_searchable', 'NC', 'EDU', 'TPU', 'CARP', 'GAD', 'PLANNING']

        query = """
        SELECT whole_date_start,
            whole_date_start_searchable, 
            MAX(CASE WHEN unit = 'NC' THEN event_titles END) AS NC,
            MAX(CASE WHEN unit = 'EDU' THEN event_titles END) AS EDU,
            MAX(CASE WHEN unit = 'TPU' THEN event_titles END) AS TPU,
            MAX(CASE WHEN unit = 'CARP' THEN event_titles END) AS CARP,
            MAX(CASE WHEN unit = 'GAD' THEN event_titles END) AS GAD,
            MAX(CASE WHEN unit = 'PLANNING' THEN event_titles END) AS PLANNING
        FROM (
            SELECT whole_date_start,
                whole_date_start_searchable,
                unit,
                STRING_AGG(event_title, ', ') AS event_titles, division_name, office
            FROM events_event
            WHERE division_name = %s AND office = %s
            GROUP BY whole_date_start, whole_date_start_searchable, unit, division_name, office
        ) AS subquery
        GROUP BY whole_date_start, whole_date_start_searchable
        ORDER BY 1;
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [request.GET.get('division'), request.GET.get('office')])
            result = cursor.fetchall()

        # Convert the result into a list of dictionaries
        data = []
        for row in result:
            data.append({
                'whole_date_start': row[0].strftime('%Y-%m-%d'),  # Format as needed
                'whole_date_start_searchable': row[1],
                'NC': row[2],
                'EDU': row[3],
                'TPU': row[4],
                'CARP': row[5],
                'GAD': row[6],
                'PLANNING': row[7]
                # Add more fields as needed
            })
            
        # Apply the search filter to the data
        # filtered_data = [entry for entry in data if any(search_value.lower() in entry[col].lower() for col in columns)]
        filtered_data = [
            entry for entry in data if any(
                search_value.lower() in (str(entry[col]).lower() if entry[col] is not None else '') for col in columns
            )
        ]

        response_data = {
            'draw': draw,
            'recordsTotal': len(data),
            'recordsFiltered': len(filtered_data),
            'data': filtered_data[start:start + length]
        }

        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
    # method to download files from the media folder
def download_file(request, id):
    event = get_object_or_404(Event, pk=id)
    file_path = event.file_attachment.path

    # Check if the file_path exists before attempting to download
    if os.path.exists(file_path):
        try:
            return FileResponse(open(file_path, 'rb'), content_type='application/octet-stream')
        except FileNotFoundError:
            return HttpResponse('File not found', status=404)
    else:
        return HttpResponse('No file associated', status=404)
    

# method to display tooltips
def tooltips(request):
    return render(request, 'events/tooltip.html')


    


        






    


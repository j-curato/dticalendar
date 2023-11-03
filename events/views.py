# from rest_framework.response import Response
# from rest_framework.decorators import api_view
# from .serializers import EventSerializer
from django.http import HttpResponse
from django.http import JsonResponse
from calendars.models import Calendar
from divisions.models import Division
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
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
        #event.file_attachment = request.FILES['file_attachment']
        event.file_attachment = request.FILES.get('file_attachment')
        event.whole_date_start_searchable = request.POST['whole_date_start_searchable']
        event.whole_date_end_searchable = request.POST['whole_date_end_searchable']
        event.office = request.POST['office']
        event.org_outcome = request.POST['org_outcome']
        event.paps = request.POST['paps']
        event.unit = request.POST['unit']
        event.division_name = request.POST['division_name']
        event.whole_dateStart_with_time = timezone.datetime.strptime(request.POST['whole_date_start'], "%Y-%m-%dT%H:%M")
        event.whole_dateEnd_with_time = timezone.datetime.strptime(request.POST['whole_date_end'], "%Y-%m-%dT%H:%M")
        event.actual_outcome = "PENDING"
        event.calendar_name = request.POST['calendar_name']
        event.event_location_district = request.POST['event_location_district']
        event.event_location_lgu = request.POST['event_location_lgu']
        event.event_status = "PENDING"
        event.expected_outcome = "PENDING"
        event.save()
        return JsonResponse({'message': 'True'})
    else:
        return JsonResponse({'message': 'False'})


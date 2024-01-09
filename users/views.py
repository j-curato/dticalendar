from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.http import HttpRequest
from events.models import Event
from django.db.models import Q
from calendars.models import Calendar
from divisions.models import Division
from orgoutcomes.models import OrgOutcome
from provinces.models import Province
from django.shortcuts import get_object_or_404
from django.db.models import OuterRef, Subquery
from django.db.models import F, Min
from django.utils import timezone
from django.shortcuts import redirect
from django.contrib import messages


from .forms import UserRegisterForm

# Create your views here.
def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save() # save the user to the database
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            messages.success(request, f'Account created for {username}!')
            login(request, user)
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'users/register.html', {'form': form})

def login_request(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST) # create a form instance and populate it with data from the request:
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username = username,password = password)   
            if user is not None:
                login(request, user)
                return redirect('profile')
            else:
                print("Invalid username or password.")
    else:
        form = AuthenticationForm()
    return render(request, 'users/login.html', {'form': form})

def profile(request):
    txturl = 'users'
    # Check if the user is authenticated
    if not request.user.is_authenticated:
        return redirect('login')
    else:
        if request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest":
            q = request.GET.get('term', '')
            events = Event.objects.filter(event_title__icontains=q).values('event_title').distinct()[:20]
            results = []
            for event in events:
                event_json = {
                    #'id': event.id,
                    #'label': event.event_title,
                    #'value': event.event_title,
                    'lable': event['event_title'],
                    'value': event['event_title'],
                }
                results.append(event_json)
            return JsonResponse(results, safe=False)

    if request.method == 'POST':
        # Get the selected calendar's ID from the POST data
        calendar_id = request.POST.get('calendar_id')
        division_id = request.POST.get('division_id')

        if request.user:
             calendar = get_object_or_404(Calendar, pk=calendar_id)
             division = get_object_or_404(Division, pk=division_id)
             
        event = Event()
        event.user = request.user
        event.calendar = calendar
        event.division = division
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
        event.file_attachment = request.FILES['file_attachment']
        event.whole_date_start_searchable = request.POST['whole_date_start_searchable']
        event.whole_date_end_searchable = request.POST['whole_date_end_searchable']
        event.office = request.POST['office'].upper()
        event.org_outcome = request.POST['org_outcome'].upper()
        event.paps = request.POST['paps'].upper()
        event.unit = request.POST['unit'].upper()
        event.save()

        messages.success(request, 'Event saved successfully.')
        msgvar = 1
        
    else:
        messages.warning(request, 'No event added.')
        msgvar = 0
   

    # Handle regular HTML request
    events = Event.objects.all()
    ooList = OrgOutcome.objects.all()
    papsList = Event.objects.all()
    # load Province object from the database into provinceList variable sorted in ascending order
    provinceList = Province.objects.all().order_by('province_name')
    #calList = Calendar.objects.all()
    #divList = Division.objects.all()
    

    return render(request, 'users/profile.html', {'eventsList': events, 'ooList': ooList, 'papList': papsList, 'provinceList': provinceList, 'msgvar': msgvar, 'txturl': txturl})


# method to display event details using datatable server side processing
def get_events(request):
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
        columns = ['id', 'event_title', 'event_desc', 'office', 'division_name', 'unit', 'whole_date_start_searchable', 'whole_date_end_searchable']

        #Create a Q object for filtering based on the search_value in all columns
        search_filter = Q()
        for col in columns:
            search_filter |= Q(**{f'{col}__icontains': search_value})


        # Filter the events based on the search_value and user id
        events = Event.objects.filter(search_filter, user=request.user)
        
        #events = Event.objects.filter(search_filter)

        # Get the total count of events (before filtering)
        total_records = Event.objects.count()

        # Apply sorting based on the column index and direction
        if order_direction == 'asc':
            events = events.order_by(columns[order_column_index])
        else:
            events = events.order_by(f'-{columns[order_column_index]}')

        # Count of records after filtering
        filtered_records = events.count()
        
        # Apply distinct on 'event_code' and fetch the record with the smallest ID
        subquery = Event.objects.filter(user=request.user).values('event_code').annotate(min_id=Min('id')).values('min_id')
        events = events.filter(id__in=subquery)

        # Slice the events based on DataTables pagination
        events = events[start:start + length]

        # Format the data for DataTables
        data = []
        for event in events:
            data.append({
                'id': event.id,
                'whole_date_start_searchable': event.whole_date_start_searchable,
                'whole_date_end_searchable': event.whole_date_end_searchable,
                'event_title': event.event_title,
                'event_desc': event.event_desc,
                'office': event.office,
                'division_name': event.division_name,
                'unit': event.unit,
                # get the file_attachment download url
                'file_attachment': event.file_attachment.url,
                # whole date start format should be like January 01, 2023
                # Add more fields as needed
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
    
    # method to get the event details and return it as JSON and display it in the modal #editEventModal
def get_event_details_to_edit(request):
    try:
        # Get the event ID from the GET parameters
        event_id = request.GET.get('event_id')

        # Get the event details from the database
        event = Event.objects.get(pk=event_id)

        # Prepare the JSON response returning all the daabase fields
        response_data = {

            'id': event.id,
            'office': event.office,
            'division_name': event.division_name,
            'division_id': event.division_id,
            'orgoutcome_id': event.orgoutcome_id,
            'pap_id': event.pap_id,
            'province_id': event.province_id,
            'lgu_id': event.lgu_id,
            'barangay_id': event.barangay_id,
            'unit': event.unit,
            'org_outcome': event.org_outcome,
            'paps': event.paps,
            'event_title': event.event_title,
            'event_location': event.event_location,
            'event_location_lgu': event.event_location_lgu,
            'event_location_barangay': event.event_location_barangay,
            'event_location_district': event.event_location_district,
            'whole_dateEnd_with_time': event.whole_dateEnd_with_time,
            'whole_dateStart_with_time': event.whole_dateStart_with_time,
            'event_all_day': event.event_all_day,
            'event_desc': event.event_desc,
            'participants': event.participants,
            'file_attachment': event.file_attachment.url,
            'event_code': event.event_code,

        }
 
        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)  
        
# save event to the database
# def save_event(request):
#     if request.method == 'POST':
#         # Get the selected calendar's ID from the POST data
#         calendar_id = request.POST.get('calendar_id')
#         division_id = request.POST.get('division_id')

#         if request.user:
#              calendar = get_object_or_404(Calendar, pk=calendar_id)
#              division = get_object_or_404(Division, pk=division_id)
             
#         event = Event()
#         event.user = request.user
#         event.calendar = calendar
#         event.division = division
#         event.event_title = request.POST['event_title'].upper()
#         event.event_desc = request.POST['event_desc'].upper()
#         event.participants = request.POST['participants'].upper()
#         event.event_location = request.POST['event_location'].upper()
#         event.event_day_start = request.POST['event_day_start']
#         event.event_month_start = request.POST['event_month_start']
#         event.event_year_start = request.POST['event_year_start']
#         event.event_time_start = request.POST['event_time_start']
#         event.event_day_end = request.POST['event_day_end']
#         event.event_month_end = request.POST['event_month_end']
#         event.event_year_end = request.POST['event_year_end']
#         event.event_time_end = request.POST['event_time_end']
#         event.whole_date_start = timezone.datetime.strptime(request.POST['whole_date_start'], "%Y-%m-%dT%H:%M")
#         event.whole_date_end = timezone.datetime.strptime(request.POST['whole_date_end'], "%Y-%m-%dT%H:%M")
#         event.file_attachment = request.FILES['file_attachment']
#         event.save()
#         # Render the profile template and pass a variable that an event was added
#         return redirect('profile_with_event', eventAdded=True)
#     else:
#         return redirect('profile_with_event', eventAdded=False)
    
    
    # function to auto suggest event title
# @require_GET
# def suggest_event_title(request):
#     if request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
#         q = request.GET.get('term', '')
#         events = Event.objects.filter(event_title__icontains=q)[:20]
#         results = []
#         for event in events:
#             event_json = {
#                 'id': event.id,
#                 'label': event.event_title,
#                 'value': event.event_title,
#             }
#             results.append(event_json)
#         return JsonResponse(results, safe=False)

#     return JsonResponse([], safe=False)

@require_GET
def suggest_event_title_auto(request):
    if request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        q = request.GET.get('term', '')
        events = Event.objects.filter(event_title__icontains=q)[:20]
        results = []
        for event in events:
            event_json = {
                'id': event.id,
                'label': event.event_title,
                'value': event.event_title,
            }
            results.append(event_json)
        return JsonResponse(results, safe=False)

    return JsonResponse([], safe=False)


def autocomplete(request):
    return render(request, 'users/autocomplete.html')

# function to get the list of divisions
def get_divisions(request):
    divisions = Division.objects.all()
    data = [{'id': division.id, 'division_name': division.division_name} for division in divisions]
    return JsonResponse(data, safe=False)
   

# function to get the list of calendars
def get_calendars(request):
    calendars = Calendar.objects.all()
    data = [{'id': calendar.id, 'calendar_name': calendar.calendar_name} for calendar in calendars]
    return JsonResponse(data, safe=False)




    

        


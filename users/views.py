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
from django.shortcuts import get_object_or_404
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

    if request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest":
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
        event.save()

        messages.success(request, 'Event saved successfully.')
        msgvar = 1
        
    else:
        messages.warning(request, 'No added event.')
        msgvar = 0
   

    # Handle regular HTML request
    events = Event.objects.all()
    calList = Calendar.objects.all()
    divList = Division.objects.all()

    return render(request, 'users/profile.html', {'eventsList': events, 'calendarList': calList, 'divisionList': divList, 'msgvar': msgvar})


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

         # Define the columns you want to search on
        columns = ['event_title', 'event_desc', 'whole_date_start_searchable', 'whole_date_end_searchable']

        #Create a Q object for filtering based on the search_value in all columns
        search_filter = Q()
        for col in columns:
            search_filter |= Q(**{f'{col}__icontains': search_value})


        # Filter the events based on the search_value
        events = Event.objects.filter(search_filter)

        # Get the total count of events (before filtering)
        total_records = Event.objects.count()

        # Count of records after filtering
        filtered_records = events.count()

        # Slice the events based on DataTables pagination
        events = events[start:start + length]

        # Format the data for DataTables
        data = []
        for event in events:
            data.append({
                'id': event.id,
                'event_title': event.event_title,
                'event_desc': event.event_desc,
                # whole date start format should be like January 01, 2023
                'whole_date_start_searchable': event.whole_date_start_searchable,
                'whole_date_end_searchable': event.whole_date_end_searchable
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


    

        


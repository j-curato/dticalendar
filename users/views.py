from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, redirect
from events.models import Event
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

def profile(request, eventAdded=False):

    if eventAdded == "True":
        messages.success(request, 'Event saved successfully.')
        msgvar = 1
    else:
        messages.warning(request, 'No added event.')
        msgvar = 0

    # List events for the logged-in user
    events = Event.objects.all()
    calList = Calendar.objects.all()
    divList = Division.objects.all()
            
    # Render the profile template
    return render(request, 'users/profile.html', {'eventsList': events, 'calendarList': calList, 'divisionList': divList, 'msgvar': msgvar})


# save event to the database
def save_event(request):
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
        event.save()
        # Render the profile template and pass a variable that an event was added
        return redirect('profile_with_event', eventAdded=True)
    else:
        return redirect('profile_with_event', eventAdded=True)

        


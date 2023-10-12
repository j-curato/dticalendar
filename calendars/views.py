#from django.shortcuts import render
from django.http import HttpResponse
from .models import Calendar

# Create your views here.
def save_calendar(request):
    if request.method == 'POST':
        calendar = Calendar()
        calendar.calendar_name = request.POST['calendar_name'].upper()
        calendar.calendar_desc = request.POST['calendar_desc'].upper()
        calendar.save()
        return HttpResponse('Calendar saved successfully')
    else:
        return HttpResponse('Invalid method')
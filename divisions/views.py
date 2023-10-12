from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import Division

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
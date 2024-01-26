from django.shortcuts import render
from django.http import JsonResponse
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
    
# get org outcome list using ajax and return json response and save to data variable
def get_divList(request):
    divList = Division.objects.all()
    data = [{'id': div.id, 'div_name': div.division_name} for div in divList]
    return JsonResponse(data, safe=False)
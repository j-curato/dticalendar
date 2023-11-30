from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from .models import Province


# Create your views here.
def get_provincesList(request):
    provincesList = Province.objects.all().order_by('province_name')
    data = [{'id': province.id, 'province': province.province_name} for province in provincesList]
    return JsonResponse(data, safe=False)
   
 
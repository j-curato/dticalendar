from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from .models import Lgu

# Create your views here.
def get_lguList(request):
    lguList = Lgu.objects.all()
    data = [{'id': lgu.id, 'lgu': lgu.lgu_name, 'province_id': lgu.province_id} for lgu in lguList]
    return JsonResponse(data, safe=False)

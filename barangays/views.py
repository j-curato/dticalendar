from django.shortcuts import render
from django.http import JsonResponse
from .models import Barangay

# Create your views here.
def get_barangayList(request):
    # get barangay list from Barangay model
    barangay_list = Barangay.objects.all().order_by('barangay_name')
    data = [{'id': barangay.id, 'barangay': barangay.barangay_name, 'city_mun': barangay.city_mun, 'lgu_id': barangay.lgu_id, 'province_id': barangay.province_id} for barangay in barangay_list]
    # return the response
    return JsonResponse(data, safe=False)

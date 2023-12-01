from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Lgu

# Create your views here.
def get_lguList(request):
    lguList = Lgu.objects.all()
    data = [{'id': lgu.id, 'lgu': lgu.lgu_name, 'province_id': lgu.province_id} for lgu in lguList]
    return JsonResponse(data, safe=False)

# ajax call to fetch the districts data where lgu_id = lgu_id
@csrf_exempt
def get_districtsList(request):
    if request.method == 'POST':
        # Get the POST data
        lgu_id = request.body.decode('utf-8')
        # Assuming lgu_id is a valid ID, query your Lgu model for the specific lgu_id
        districtList = Lgu.objects.filter(id=lgu_id)
        data = [{'id': district.id, 'district': district.district} for district in districtList]
        return JsonResponse(data, safe=False)
    
    # Handle invalid requests or other HTTP methods
    return HttpResponse(status=400)
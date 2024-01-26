from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Unit
from .models import Division

# Create your views here.
# Save unit using ajax
@csrf_exempt
def save_unit_ajax(request):
     
    if request.method == 'POST':
        # assign division_id to db division_id
        div_id = request.POST.get('division_id')
        division = get_object_or_404(Division, pk=div_id)

        unit = Unit()
        unit.unit_name = request.POST['unit_name'].upper()
        unit.description = request.POST['description'].upper()
        unit.division = division
        unit.division_name = request.POST['division_name'].upper()
        # if unit.save() is true, return json response, else return false
        if unit.save():
            return JsonResponse({'message': 'True'})
        else:
            return JsonResponse({'message': 'False'})
        

def get_unitList(request):
    unitList = Unit.objects.all().order_by('unit_name')
    data = [{'id': unit.id, 'unitList': unit.unit_name, 'division_id': unit.division_id} for unit in unitList]
    return JsonResponse(data, safe=False)
    
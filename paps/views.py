from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.template import loader
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from orgoutcomes.models import OrgOutcome
from .models import Pap


# save pap using ajax and return json response
@csrf_exempt
def save_paps_ajax(request):
     
     if request.method == 'POST':
        # assign oo_id to org_outcome_id
        oo_id = request.POST.get('org_outcome_id')
        org_outcome = get_object_or_404(OrgOutcome, pk=oo_id)

        pap = Pap()
        pap.pap = request.POST['pap'].upper()
        pap.description = request.POST['description'].upper()
        pap.org_outcome = org_outcome
        pap.oo_name = request.POST['oo_name'].upper()
        # if pap.save() is true, return json response, else return false
        if pap.save():
            return JsonResponse({'message': 'True'})
        else:
            return JsonResponse({'message': 'False'})
        
# get paps list using ajax and return json response and save to data variable
def get_papsList(request):
    papsList = Pap.objects.all()
    data = [{'id': pap.id, 'pap': pap.pap, 'org_outcome_id': pap.org_outcome_id} for pap in papsList]
    return JsonResponse(data, safe=False)

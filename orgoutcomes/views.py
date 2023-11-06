from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.template import loader
from .models import OrgOutcome

# Create your views here.
# Save org outcome using ajax
@csrf_exempt
def save_orgOutcome(request):
    
    if request.method == 'POST':
        org_outcome = OrgOutcome()
        org_outcome.org_outcome = request.POST['org_outcome'].upper()
        org_outcome.description = request.POST['description'].upper()
        org_outcome.save()
        return JsonResponse({'message': 'True'})
    else:
        return JsonResponse({'message': 'False'})
    
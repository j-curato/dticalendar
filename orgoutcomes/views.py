from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import OrgOutcome

# Create your views here.
def save_orgOutcome(request):
    if request.method == 'POST':
        orgOutcome = OrgOutcome()
        orgOutcome.orgOutcome = request.POST['orgOutcome'].upper()
        orgOutcome.description = request.POST['description'].upper()
        orgOutcome.save()
        return HttpResponse('Org Outcome saved successfully')
    else:
        return HttpResponse('Invalid method')
    
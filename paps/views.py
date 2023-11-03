from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import Pap

# Create your views here.
def save_paps(request):
    if request.method == 'POST':
        pap = Pap()
        pap.pap = request.POST['pap'].upper()
        pap.description = request.POST['description'].upper()
        pap.save()
        return HttpResponse('PAP saved successfully')
    else:
        return HttpResponse('Invalid method')

from django.urls import path
from . import views

urlpatterns = [
    path('save-orgoutcome/', views.save_orgOutcome, name='save-orgoutcome'),
]

from django.urls import path
from . import views

urlpatterns = [
    path('save-org-outcome-ajax/', views.save_orgOutcome, name='save-org-outcome-ajax/'),
]

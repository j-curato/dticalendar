from django.urls import path
from . import views

urlpatterns = [
    path('save-paps-ajax/', views.save_paps_ajax, name='save-paps-ajax//'),
]
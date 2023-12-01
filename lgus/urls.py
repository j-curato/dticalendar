from django.urls import path
from . import views

urlpatterns = [
    path('api/get-lguList/', views.get_lguList, name='get_lguList'),
    path('api/get-districtsList/', views.get_districtsList, name='get_districtsList'),
]

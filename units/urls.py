from django.urls import path
from . import views

urlpatterns = [
    
    path('save-unit-ajax/', views.save_unit_ajax, name='save-unit-ajax/'),
    path('api/get-unitList/', views.get_unitList, name='get_unitList'),
    path('get-unit-details/', views.get_unit_details, name="get-unit-details/")

]
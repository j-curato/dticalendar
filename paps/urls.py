from django.urls import path
from . import views

urlpatterns = [
    path('save-paps-ajax/', views.save_paps_ajax, name='save-paps-ajax/'),
    # path for ajax call to get paps data using this path - /get-papsList/
    path('api/get-papsList/', views.get_papsList, name='get_papsList'),
    path('get-paps-details/', views.get_paps_details, name='get-paps-details'),
    path('delete-pap-ajax/', views.delete_pap_ajax, name='delete-pap-ajax'),

]
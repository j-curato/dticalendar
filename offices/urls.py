from django.urls import path
from . import views

urlpatterns = [
    path('api/get-offices-list/', views.get_offices_list, name='get_offices_list'),
    path('get-office-details/', views.get_office_details, name='get-office-details'),
    path('save-office-ajax/', views.save_office_ajax, name='save-office-ajax'),
    path('delete-office-ajax/', views.delete_office_ajax, name='delete-office-ajax'),
]

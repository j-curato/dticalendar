from django.urls import path
from . import views

urlpatterns = [
    path('save-org-outcome-ajax/', views.save_orgOutcome, name='save-org-outcome-ajax/'),
    #path for ajax call to get org outcomes using this path - /get-ooList/
    path('api/get-ooList/', views.get_ooList, name='get_ooList'),
    path('get-oo-details/', views.get_oo_details, name="get-oo-details"),
    path('delete-oo-ajax/', views.delete_oo_ajax, name='delete-oo-ajax'),

]

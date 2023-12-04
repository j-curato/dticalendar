from django.urls import path
from . import views

urlpatterns = [
    path('api/get-barangayList/', views.get_barangayList, name='get_barangayList')
]

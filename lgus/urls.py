from django.urls import path
from . import views

urlpatterns = [
    path('api/get-lguList/', views.get_lguList, name='get_lguList'),
]

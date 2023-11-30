from django.urls import path
from . import views

urlpatterns = [
    path('api/get-provincesList/', views.get_provincesList, name='get_provincesList'),
]

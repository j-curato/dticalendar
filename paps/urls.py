from django.urls import path
from . import views

urlpatterns = [
    path('save-paps/', views.save_paps, name='save-paps/'),
]
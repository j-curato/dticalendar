from django.urls import path
from . import views

urlpatterns = [
    path('api/events/', views.get_events, name='events-api'),
]
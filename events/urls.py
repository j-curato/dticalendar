from django.urls import path
from . import views

urlpatterns = [
    #path('api/events/', views.get_events, name='events-api'),
    # save-event-ajax
    path('save-event-ajax/', views.save_event_ajax, name='save-event-ajax/'),
]
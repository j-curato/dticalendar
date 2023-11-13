from django.urls import path
from . import views

urlpatterns = [
    #path('api/events/', views.get_events, name='events-api'),
    # save-event-ajax
    path('save-event-ajax/', views.save_event_ajax, name='save-event-ajax/'),
    path('get_eventsList/', views.get_eventsList, name='get_eventsList'),
    path('fetch-events-ajax/', views.fetch_events_ajax, name='fetch-events-ajax'),
    path('load-div-datatbl-html/', views.load_div_datatbl_html, name='load-div-datatbl-html'),
    path('fetch-events-by-div-ajax/', views.fetch_events_by_div_ajax, name='fetch-events-by-div-ajax'),
]
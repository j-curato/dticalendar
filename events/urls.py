from django.urls import path
from . import views

urlpatterns = [
    #path('api/events/', views.get_events, name='events-api'),
    # save-event-ajax
    path('save-event-ajax/', views.save_event_ajax_ver2, name='save-event-ajax/'),
    path('get_eventsList/', views.get_eventsList, name='get_eventsList'),
    path('api/get-eventsList/', views.get_eventsListDate, name='get_eventsListDate'),
    path('api/get-event-details/', views.get_event_details, name='get_event_details'),
    path('fetch-events-ajax/', views.fetch_events_ajax, name='fetch-events-ajax'),
    path('load-div-datatbl-html/', views.load_div_datatbl_html, name='load-div-datatbl-html'),
    path('load-unit-datatbl-html/', views.load_unit_datatbl_html, name='load-unit-datatbl-html'),
    path('fetch-events-by-div-ajax/', views.fetch_events_by_div_ajax, name='fetch-events-by-div-ajax'),
    path('fetch-events-by-unit-ajax/', views.fetch_events_by_unit_ajax, name='fetch-events-by-unit-ajax'),
    # path to download files from the media folder
    path('download/<int:id>/', views.download_file, name='download_file'),
    path('tooltips/', views.tooltips, name='tooltips'),
    path('remove-event-ajax/', views.remove_event_ajax, name="remove-event-ajax")
]
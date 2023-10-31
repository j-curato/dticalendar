from django.contrib.auth import views as auth_views
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_request, name='login'), 
    path('profile/', views.profile, name='profile'),
    #path('profile/<str:eventAdded>/', views.profile, name='profile_with_event'),
    #path('save-event/', views.profile, name='save-event'),
    path('autocomplete/', views.autocomplete, name='autocomplete'),
    path('autocomplete/suggest_event_titless/', views.suggest_event_title_auto, name='suggest_event_titless'),
    path('profile/suggest_event_titles/', views.profile, name='suggest_event_titles'),
    #path('get_events/', views.get_events, name='get_events'),
    #path('get_event_details/', views.get_event_details, name='get_event_details'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('api/divisions/', views.get_divisions, name='get_divisions'),
    path('api/calendars/', views.get_calendars, name='get_calendars'),
]
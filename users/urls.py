from django.contrib.auth import views as auth_views
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_request, name='login'), 
    path('profile/', views.profile, name='profile'),
    path('profile/<str:eventAdded>/', views.profile, name='profile_with_event'),
    path('save-event/', views.save_event, name='save-event'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
]
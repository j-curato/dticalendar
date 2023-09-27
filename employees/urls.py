from django.urls import path
from . import views

urlpatterns = [
	#path('employees/', views.employees, name='employees'),
	path('create_employee/', views.create_employee, name='create_employee'),
	path('emp_list/', views.emp_list, name='emp_list'),
]
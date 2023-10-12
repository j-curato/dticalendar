from django.db import models
from employees.models import Employee
from calendars.models import Calendar
from divisions.models import Division
from django.contrib.auth.models import User
from datetime import date

# Create your models here.
class Event(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
	calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
	division = models.ForeignKey(Division, on_delete=models.CASCADE)
	event_title = models.CharField(max_length=500)
	event_desc = models.CharField(max_length=1000)
	participants = models.CharField(max_length=500)
	event_location = models.CharField(max_length=255)
	event_day_start = models.CharField(max_length=10)
	event_month_start = models.CharField(max_length=10)
	event_year_start = models.CharField(max_length=10)
	event_time_start = models.CharField(max_length=50)
	event_day_end = models.CharField(max_length=10)
	event_month_end = models.CharField(max_length=10)
	event_year_end = models.CharField(max_length=10) 
	event_time_end = models.CharField(max_length=50)
	whole_date_start = models.DateField(default=date.today)
	whole_date_end = models.DateField(default=date.today)
	file_attachment = models.FileField(upload_to='media/', null=True, blank=True)
	created_at = models.DateField(default=date.today)
	updated_at = models.DateField(default=date.today)
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
	office = models.CharField(max_length=500, null=True, blank=True)
	division = models.ForeignKey(Division, on_delete=models.CASCADE)
	unit = models.CharField(max_length=500, null=True, blank=True)
	paps = models.CharField(max_length=500, null=True, blank=True)
	org_outcome = models.CharField(max_length=500, null=True, blank=True)
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
	whole_date_start_searchable = models.CharField(max_length=20, blank=True, null=True)
	whole_date_end = models.DateField(default=date.today)
	whole_date_end_searchable = models.CharField(max_length=20, blank=True, null=True)
	file_attachment = models.FileField(upload_to='media/', null=True, blank=True)
	created_at = models.DateField(default=date.today)
	updated_at = models.DateField(default=date.today)

	def serialize(self):
		# define how you serialized the Event Object
		return {
			'id': self.id,
			'event_title': self.event_title,
		}
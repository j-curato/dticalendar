from django.db import models
from employees.models import Employee
from calendars.models import Calendar
from divisions.models import Division
from units.models import Unit
from orgoutcomes.models import OrgOutcome
from paps.models import Pap
from provinces.models import Province
from lgus.models import Lgu
from barangays.models import Barangay
from django.contrib.auth.models import User
from datetime import date

# Create your models here.
class Event(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
	calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
	calendar_name = models.CharField(max_length=500, null=True, blank=True)
	office = models.CharField(max_length=500, null=True, blank=True)
	fk_office = models.ForeignKey('offices.Office', on_delete=models.SET_NULL, null=True, blank=True, db_column='fk_office_id')
	division = models.ForeignKey(Division, on_delete=models.CASCADE)
	division_name = models.CharField(max_length=500, null=True, blank=True)
	unit_name = models.CharField(max_length=500, null=True, blank=True)
	unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
	paps = models.CharField(max_length=500, null=True, blank=True)
	orgoutcome = models.ForeignKey(OrgOutcome, on_delete=models.CASCADE, default=0)
	pap = models.ForeignKey(Pap, on_delete=models.CASCADE, default=0)
	org_outcome = models.CharField(max_length=500, null=True, blank=True)
	event_title = models.CharField(max_length=500)
	event_desc = models.CharField(max_length=1000)
	participants = models.CharField(max_length=500)
	event_location = models.CharField(max_length=255,blank=True, null=True)
	event_location_lgu = models.CharField(max_length=255,blank=True, null=True)
	event_location_district = models.CharField(max_length=255,blank=True, null=True)
	event_location_barangay = models.CharField(max_length=255,blank=True, null=True)
	province = models.ForeignKey(Province, on_delete=models.CASCADE, default=0)
	lgu = models.ForeignKey(Lgu, on_delete=models.CASCADE, default=0)
	barangay = models.ForeignKey(Barangay, on_delete=models.CASCADE, default=0)
	event_day_start = models.IntegerField() 
	event_month_start = models.IntegerField()
	event_year_start = models.IntegerField()
	event_time_start = models.CharField(max_length=50)
	event_day_end = models.IntegerField()
	event_month_end = models.IntegerField()
	event_year_end = models.IntegerField()
	event_time_end = models.CharField(max_length=50)
	whole_date_start = models.DateField(default=date.today)   
	whole_dateStart_with_time = models.DateTimeField(default=date.today, null=True)
	whole_dateEnd_with_time = models.DateTimeField(default=date.today, null=True)
	whole_date_start_searchable = models.CharField(max_length=20, blank=True, null=True)
	whole_date_end = models.DateField(default=date.today)
	whole_date_end_searchable = models.CharField(max_length=20, null=True)
	file_attachment = models.FileField(upload_to='media/', default='NONE')
	expected_outcome = models.CharField(max_length=500,blank=True, null=True)
	actual_outcome = models.CharField(max_length=500,blank=True, null=True)
	event_status = models.CharField(max_length=500,blank=True, null=True)
	created_at = models.DateField(default=date.today)
	updated_at = models.DateField(default=date.today)
	event_code = models.CharField(max_length=500,blank=True, null=True)
	event_all_day = models.BooleanField(default=False)
	display_status = models.BooleanField(default=True)

	def serialize(self):
		# define how you serialized the Event Object
		return {
			'id': self.id,
			'event_title': self.event_title,
		}
	
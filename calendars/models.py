from django.db import models
from datetime import date

# Create your models here.
class Calendar(models.Model):
	calendar_name = models.CharField(max_length=255)
	calendar_desc = models.CharField(max_length=255)
	created_at = models.DateField(default=date.today)
	updated_at = models.DateField(default=date.today)
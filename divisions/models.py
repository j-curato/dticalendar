from django.db import models
from datetime import date

# Create your models here.
class Division(models.Model):
	division_name = models.CharField(max_length=255)
	division_desc = models.CharField(max_length=255)
	created_at = models.DateField(default=date.today)
	updated_at = models.DateField(default=date.today)
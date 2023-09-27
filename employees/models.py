from django.db import models
from datetime import date

# Create your models here.
class Employee(models.Model):
	first_name = models.CharField(max_length=255)
	middle_name = models.CharField(max_length=255)
	last_name = models.CharField(max_length=255)
	sex = models.CharField(max_length=20)
	position = models.CharField(max_length=100)
	division = models.CharField(max_length=50)
	created_at = models.DateField(default=date.today)
	updated_at = models.DateField(default=date.today)





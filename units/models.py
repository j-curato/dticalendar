from django.db import models
from divisions.models import Division

# Create your models here.
class Unit(models.Model):
    division = models.ForeignKey(Division, on_delete=models.CASCADE)
    unit_name = models.CharField(max_length=500)
    description = models.CharField(max_length=500, null=True, blank=True)
    division_name = models.CharField(max_length=500, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def serialize(self):
        # define how you serialized the Event Object
        return {
            'id': self.id, 
            'unit': self.unit,
        }
    
    def __str__(self):
        return self.unit
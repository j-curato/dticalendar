from django.db import models

# Create your models here.
class Region(models.Model):
    region_name = models.CharField(max_length=500)
    slug_name = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    
    def serialize(self):
        # define how you serialized the Event Object
        return {
            'id': self.id,
            'region': self.region,
            
        }
    
    def __str__(self):
        return self.region

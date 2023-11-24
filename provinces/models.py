from django.db import models
from regions.models import Region

# Create your models here.
class Province(models.Model):
    province_name = models.CharField(max_length=500)
    slug_name = models.CharField(max_length=500, null=True, blank=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    
    def serialize(self):
        # define how you serialized the Event Object
        return {
            'id': self.id,
            'province': self.province,
        }
    
    def __str__(self):
        return self.province

from django.db import models
from provinces.models import Province

# Create your models here.
class Lgu(models.Model):
    lgu_name = models.CharField(max_length=500)
    slug_name = models.CharField(max_length=500, null=True, blank=True)
    classification = models.CharField(max_length=500, null=True, blank=True)
    lgu_type = models.CharField(max_length=500, null=True, blank=True)
    district = models.CharField(max_length=500, null=True, blank=True)
    zip_code = models.CharField(max_length=500, null=True, blank=True)
    province = models.ForeignKey(Province, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)
    
    def serialize(self):
        # define how you serialized the Event Object
        return {
            'id': self.id,
            'lgu': self.lgu,
            
        }
    
    def __str__(self):
        return self.lgu
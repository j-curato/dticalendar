from django.db import models
from lgus.models import Lgu
from provinces.models import Province

class Barangay(models.Model):
    barangay_name = models.CharField(max_length=500)
    city_mun = models.CharField(max_length=500, null=True, blank=True)
    lgu = models.ForeignKey(Lgu, on_delete=models.CASCADE)
    province = models.ForeignKey(Province, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)
    
    def serialize(self):
        # define how you serialized the Event Object
        return {
            'id': self.id,
            'barangay': self.barangay,
            
        }
    
    def __str__(self):
        return self.barangay


from django.db import models
#import orgoutcomes.models
from orgoutcomes.models import OrgOutcome

# Create your models here.
class Pap(models.Model):
    pap = models.CharField(max_length=500)
    description = models.CharField(max_length=500, null=True, blank=True)
    org_outcome = models.ForeignKey(OrgOutcome, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def serialize(self):
        # define how you serialized the Event Object
        return {
            'id': self.id,
            'pap': self.pap,
        }
    
    def __str__(self):
        return self.pap

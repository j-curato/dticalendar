from django.db import models

# Create your models here.
class OrgOutcome(models.Model):
    org_outcome = models.CharField(max_length=500)
    description = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def serialize(self):
        # define how you serialized the Event Object
        return {
            'id': self.id,
            'org_outcome': self.org_outcome,
        }
    
    def __str__(self):
        return self.org_outcome


from django.db import models

class Office(models.Model):
    office_initials = models.CharField(max_length=255)
    office_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_offices'

    def __str__(self):
        return self.office_initials

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    fk_office = models.ForeignKey(
        'offices.Office',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='fk_office_id'
    )
    is_office_admin = models.BooleanField(default=False)

    class Meta:
        db_table = 'users_userprofile'

    def __str__(self):
        return f"{self.user.username} Profile"

from django.urls import path
from . import views

urlpatterns = [
    path('save-calendar', views.save_calendar, name='save-calendar')
    # path('list', views.list, name='list'),
    # path('edit/<int:id>', views.edit, name='edit'),
    # path('update/<int:id>', views.update, name='update'),
    # path('delete/<int:id>', views.delete, name='delete'),
]
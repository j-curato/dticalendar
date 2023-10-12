from django.urls import path
from . import views 

urlpatterns = [
    path('save-division', views.save_division, name='save-division')
    # path('list', views.list, name='list'),
    # path('edit/<int:id>', views.edit, name='edit'),
    # path('update/<int:id>', views.update, name='update'),
    # path('delete/<int:id>', views.delete, name='delete'),
]
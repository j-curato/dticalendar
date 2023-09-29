from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from schedule.models import Event
from django.contrib.auth import password_validation

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField()
    username = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'maxlength': '30'}),
        help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.',
        )
    email = forms.EmailField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'maxlength': '30'}),
        help_text='Required. Inform a valid email address.',
        )
    password1 = forms.CharField(
        label='Password',
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text=password_validation.password_validators_help_text_html(),
        )   
    password2 = forms.CharField(
        label='Password confirmation',
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text='Enter the same password as before, for verification.',
        )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']


# Event Form
class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = ['title', 'description', 'start', 'end']


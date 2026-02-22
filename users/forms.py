from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth import password_validation
from offices.models import Office

class UserRegisterForm(UserCreationForm):
    first_name = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'maxlength': '30'}),
        help_text='Optional. Your first name.',
        required=False,
    )
    last_name = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'maxlength': '30'}),
        help_text='Optional. Your last name.',
        required=False,
    )
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
    fk_office = forms.ModelChoiceField(
        queryset=Office.objects.all().order_by('id'),
        label='Office',
        widget=forms.Select(attrs={'class': 'form-control form-select'}),
        help_text='Select the office you belong to.',
        required=False,
        empty_label='Select Office',
    )

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'fk_office', 'password1', 'password2']



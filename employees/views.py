from django.shortcuts import render, redirect
from .forms import EmployeeForm
from django.http import HttpResponse
from django.template import loader
from .models import Employee

def create_employee(request):
    if request.method == 'POST':
        form = EmployeeForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('emp_list')  # Redirect to a list view or another appropriate page
    else:
        form = EmployeeForm()
    return render(request, 'employees/employee_form.html', {'form': form})


def emp_list(request):
	employees = Employee.objects.all()
	template = loader.get_template('employees/all_employees.html')
	emplist = {
		'allemp': employees
	}
	return HttpResponse(template.render(emplist, request))







    
     
     

 
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.db.models.functions import Lower
from .models import Office


def _can_manage_office(user, office_id=None):
    """True if superuser, or office_admin updating their own office."""
    if user.is_superuser:
        return True
    try:
        if user.profile.is_office_admin and office_id is not None:
            return str(user.profile.fk_office_id) == str(office_id)
    except Exception:
        return False
    return False


def get_offices_list(request):
    """Return all offices as JSON for dropdowns."""
    offices = Office.objects.all().order_by('office_initials')
    data = [{'id': o.id, 'office_initials': o.office_initials, 'office_name': o.office_name} for o in offices]
    return JsonResponse(data, safe=False)


@login_required
@login_required
def get_office_details(request):
    """Server-side DataTable for offices - all logged-in users can view."""
    try:
        draw = int(request.GET.get('draw', 1))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search_value = request.GET.get('search[value]', '')
        order_column_index = int(request.GET.get('order[0][column]', 0))
        order_direction = request.GET.get('order[0][dir]', 'asc')

        columns = ['id', 'office_initials', 'office_name']

        search_filter = Q()
        for col in columns:
            search_filter |= Q(**{f'{col}__icontains': search_value})

        office_list = Office.objects.filter(search_filter)
        total_records = Office.objects.count()

        if order_direction == 'asc':
            if columns[order_column_index] in ['office_initials', 'office_name']:
                office_list = office_list.order_by(Lower(columns[order_column_index]))
            else:
                office_list = office_list.order_by(columns[order_column_index])
        else:
            if columns[order_column_index] in ['office_initials', 'office_name']:
                office_list = office_list.order_by(Lower(columns[order_column_index])).reverse()
            else:
                office_list = office_list.order_by(f'-{columns[order_column_index]}')

        filtered_records = office_list.count()
        office_list = office_list[start:start + length]

        data = [{'id': o.id, 'office_initials': o.office_initials, 'office_name': o.office_name} for o in office_list]

        return JsonResponse({
            'draw': draw,
            'recordsTotal': total_records,
            'recordsFiltered': filtered_records,
            'data': data,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@csrf_exempt
def save_office_ajax(request):
    """Save or update an office."""
    if request.method == 'POST':
        btn_txt = request.POST.get('officeBtnTxt', '')

        if btn_txt == 'Save':
            # Only superusers can create new offices
            if not request.user.is_superuser:
                return JsonResponse({'message': 'Unauthorized'}, status=403)
            office = Office()
            office.office_initials = request.POST.get('office_initials', '').upper()
            office.office_name = request.POST.get('office_name', '').upper()
            office.save()
            return JsonResponse({'message': 'True'})

        elif btn_txt == 'Update':
            office_id = request.POST.get('id')
            office = Office.objects.filter(id=office_id).first()
            if office:
                if not _can_manage_office(request.user, office.id):
                    return JsonResponse({'message': 'Unauthorized'}, status=403)
                office.office_initials = request.POST.get('office_initials', '').upper()
                office.office_name = request.POST.get('office_name', '').upper()
                office.save()
                return JsonResponse({'message': 'True'})
            return JsonResponse({'message': 'Office not found'})

    return JsonResponse({'message': 'False'})


@login_required
@csrf_exempt
def delete_office_ajax(request):
    """Delete an office - superusers only."""
    if not request.user.is_superuser:
        return JsonResponse({'message': 'Unauthorized'}, status=403)

    if request.method == 'POST':
        office_id = request.POST.get('id')
        office = Office.objects.filter(id=office_id).first()
        if office:
            office.delete()
            return JsonResponse({'message': 'True'})
        return JsonResponse({'message': 'Office not found'})

    return JsonResponse({'message': 'False'})

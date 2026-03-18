"""
Shared test factories for DTI Calendar test suite.
Import from any app's tests.py:
    from testutils import make_office, make_superuser, make_office_admin, ...
"""
from django.contrib.auth.models import User
from offices.models import Office
from divisions.models import Division
from units.models import Unit
from orgoutcomes.models import OrgOutcome
from paps.models import Pap
from users.models import UserProfile


def make_office(initials='TST', name='Test Office'):
    return Office.objects.create(office_initials=initials, office_name=name)


def make_superuser(username='superuser', password='SuperPass123'):
    return User.objects.create_superuser(username=username, password=password)


def make_user(username='regularuser', password='RegPass123', office=None):
    """Regular user with a UserProfile but no admin rights."""
    user = User.objects.create_user(username=username, password=password)
    UserProfile.objects.create(user=user, fk_office=office, is_office_admin=False)
    return user


def make_office_admin(username='officeadmin', password='AdminPass123', office=None):
    """User with is_office_admin=True tied to the given office."""
    user = User.objects.create_user(username=username, password=password)
    UserProfile.objects.create(user=user, fk_office=office, is_office_admin=True)
    return user


def make_division(name='Test Division', desc='Test Desc', office=None):
    return Division.objects.create(
        division_name=name,
        division_desc=desc,
        fk_office=office,
    )


def make_unit(division, name='Test Unit', desc='Test Unit Desc'):
    return Unit.objects.create(
        unit_name=name,
        description=desc,
        division=division,
        division_name=division.division_name,
    )


def make_orgoutcome(name='Test Org Outcome', desc='Test OO Desc'):
    return OrgOutcome.objects.create(org_outcome=name, description=desc)


def make_pap(org_outcome, name='Test PAP', desc='Test PAP Desc'):
    return Pap.objects.create(
        pap=name,
        description=desc,
        org_outcome=org_outcome,
        oo_name=org_outcome.org_outcome,
    )

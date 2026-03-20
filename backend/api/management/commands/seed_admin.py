"""
Management command to create/reset the admin user.
Run: python manage.py seed_admin
"""
from django.core.management.base import BaseCommand
from api.models import AppUser


class Command(BaseCommand):
    help = 'Create or reset the admin user (admin@gmail.com / Admin@123)'

    def handle(self, *args, **options):
        email    = 'admin@gmail.com'
        password = 'Admin@123'
        name     = 'Admin'

        user, created = AppUser.objects.get_or_create(
            email=email,
            defaults={'name': name, 'is_admin': True}
        )

        # Always update password and ensure admin flag
        user.set_password(password)
        user.is_admin = True
        user.name = name
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(
                f'✅ Admin user CREATED: {email} / {password}'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'✅ Admin user UPDATED: {email} / {password}'
            ))

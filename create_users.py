from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from your_app.models import UserProfile
import os

class Command(BaseCommand):
    help = 'Creates admin and staff users'
    
    def handle(self, *args, **kwargs):
        # Create Admin
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@clicktoeat.com',
                password=os.getenv('ADMIN_PASSWORD', 'Admin@123')
            )
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            
            UserProfile.objects.create(
                user=admin_user,
                role='admin',
                full_name='System Administrator'
            )
            self.stdout.write(self.style.SUCCESS('✅ Admin created'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ Admin already exists'))
        
        # Create Food Partners Staff
        partners = [
            ('theatery_owner', 'Theatery Food Hub', 'theatery@clicktoeat.com'),
            ('potatocorner_owner', 'Potato Corner', 'potatocorner@clicktoeat.com'),
            ('chowking_owner', 'Chowking', 'chowking@clicktoeat.com'),
            ('spotg_owner', 'SpotG', 'spotg@clicktoeat.com'),
            ('julies_owner', 'Julies Bake Shop', 'julies@clicktoeat.com'),
            ('waffletime_owner', 'Waffle Time', 'waffletime@clicktoeat.com'),
            ('takoyaki_owner', 'Takoyaki', 'takoyaki@clicktoeat.com'),
            ('shawarma_owner', 'Shawarma', 'shawarma@clicktoeat.com'),
            ('bukobar_owner', 'Buko Bar', 'bukobar@clicktoeat.com'),
            ('juicehub_owner', 'Juice Hub', 'juicehub@clicktoeat.com'),
            ('other_owner', 'Other', 'other@clicktoeat.com'),
        ]
        
        for username, partner_name, email in partners:
            if not User.objects.filter(username=username).exists():
                staff_user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=f'{partner_name.replace(" ", "")}@123'
                )
                staff_user.is_staff = True
                staff_user.save()
                
                UserProfile.objects.create(
                    user=staff_user,
                    role='staff',
                    food_partner=partner_name,
                    full_name=f'{partner_name} Manager'
                )
                self.stdout.write(self.style.SUCCESS(f'✅ {partner_name} staff created'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️ {username} already exists'))
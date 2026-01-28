"""
Management command to seed initial data.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.doctors.models import Specialty, DoctorProfile, DoctorSchedule

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with initial data'
    
    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create specialties
        self.create_specialties()
        
        # Create admin user
        self.create_admin_user()
        
        # Create demo users
        self.create_demo_users()
        
        # Create sample doctors
        self.create_sample_doctors()
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
    
    def create_specialties(self):
        specialties = [
            {'name': 'General Practitioner', 'slug': 'general-practitioner', 'description': 'Provide general healthcare and treat a wide range of conditions.', 'icon': '🩺'},
            {'name': 'Pediatrician', 'slug': 'pediatrician', 'description': 'Specialize in the care and treatment of infants, children, and adolescents.', 'icon': '👶'},
            {'name': 'Cardiologist', 'slug': 'cardiologist', 'description': 'Focus on diagnosing and treating heart and blood vessel conditions.', 'icon': '❤️'},
            {'name': 'Neurologist', 'slug': 'neurologist', 'description': 'Specialize in treating disorders of the nervous system.', 'icon': '🧠'},
            {'name': 'Orthopedic Surgeon', 'slug': 'orthopedic-surgeon', 'description': 'Focus on the musculoskeletal system.', 'icon': '🦴'},
            {'name': 'Dermatologist', 'slug': 'dermatologist', 'description': 'Treat conditions related to the skin, hair, and nails.', 'icon': '🧴'},
            {'name': 'Oncologist', 'slug': 'oncologist', 'description': 'Specialize in diagnosing and treating cancer.', 'icon': '🎗️'},
            {'name': 'Psychiatrist', 'slug': 'psychiatrist', 'description': 'Diagnose and treat mental health conditions.', 'icon': '🧘'},
            {'name': 'Gynecologist', 'slug': 'gynecologist', 'description': 'Specialize in women\'s reproductive health.', 'icon': '👩‍⚕️'},
            {'name': 'Ophthalmologist', 'slug': 'ophthalmologist', 'description': 'Treat eye conditions and perform eye surgeries.', 'icon': '👁️'},
        ]
        
        for spec in specialties:
            Specialty.objects.get_or_create(
                slug=spec['slug'],
                defaults=spec
            )
        
        self.stdout.write(f'Created {len(specialties)} specialties')
    
    def create_admin_user(self):
        admin_email = 'admin@chikitsa.com'
        
        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(
                email=admin_email,
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(f'Created admin user: {admin_email}')
    
    def create_demo_users(self):
        """Create demo patient and doctor users for testing."""
        
        # Demo Patient
        patient_email = 'patient@demo.com'
        if not User.objects.filter(email=patient_email).exists():
            User.objects.create_user(
                email=patient_email,
                password='demo123456',
                first_name='Demo',
                last_name='Patient',
                role=User.Role.PATIENT,
                phone='+91 9876543210'
            )
            self.stdout.write(f'Created demo patient: {patient_email}')
        
        # Demo Doctor
        doctor_email = 'doctor@demo.com'
        if not User.objects.filter(email=doctor_email).exists():
            gp_specialty = Specialty.objects.get(slug='general-practitioner')
            
            doctor_user = User.objects.create_user(
                email=doctor_email,
                password='demo123456',
                first_name='Demo',
                last_name='Doctor',
                role=User.Role.DOCTOR,
                phone='+91 9876543211'
            )
            
            doctor = DoctorProfile.objects.create(
                user=doctor_user,
                specialty=gp_specialty,
                license_number='DEMO-LIC-001',
                education='MBBS, MD - Demo Medical University',
                clinic_name='Demo Health Clinic',
                clinic_address='123 Demo Street, Demo City',
                clinic_city='Mumbai',
                clinic_state='Maharashtra',
                clinic_zip='400001',
                clinic_phone='+91 22-12345678',
                consultation_fee=500,
                years_of_experience=10,
                bio='Experienced general practitioner with 10+ years of practice. Specialized in preventive care and chronic disease management.',
                is_verified=True,
                average_rating=4.8,
                total_reviews=50,
                total_patients=200,
            )
            
            # Create weekly schedule for demo doctor
            for day in range(6):  # Monday to Saturday
                DoctorSchedule.objects.create(
                    doctor=doctor,
                    day_of_week=day,
                    start_time='09:00',
                    end_time='18:00',
                    break_start='13:00',
                    break_end='14:00'
                )
            
            self.stdout.write(f'Created demo doctor: {doctor_email}')
    
    def create_sample_doctors(self):
        gp_specialty = Specialty.objects.get(slug='general-practitioner')
        
        doctors_data = [
            {
                'email': 'john.smith@chikitsa.com',
                'first_name': 'John',
                'last_name': 'Smith',
                'specialty': gp_specialty,
                'clinic_name': 'HealthFirst Clinic',
                'clinic_address': '123 Health Street',
                'clinic_city': 'New York',
                'clinic_state': 'NY',
                'clinic_zip': '10001',
                'consultation_fee': 100,
                'years_of_experience': 15,
            },
            {
                'email': 'sarah.johnson@chikitsa.com',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'specialty': gp_specialty,
                'clinic_name': 'Wellness Medical Center',
                'clinic_address': '456 Wellness Avenue',
                'clinic_city': 'Los Angeles',
                'clinic_state': 'CA',
                'clinic_zip': '90001',
                'consultation_fee': 110,
                'years_of_experience': 12,
            },
            {
                'email': 'michael.brown@chikitsa.com',
                'first_name': 'Michael',
                'last_name': 'Brown',
                'specialty': gp_specialty,
                'clinic_name': 'Family Care Clinic',
                'clinic_address': '789 Healing Lane',
                'clinic_city': 'Chicago',
                'clinic_state': 'IL',
                'clinic_zip': '60601',
                'consultation_fee': 95,
                'years_of_experience': 10,
            },
            {
                'email': 'emily.davis@chikitsa.com',
                'first_name': 'Emily',
                'last_name': 'Davis',
                'specialty': gp_specialty,
                'clinic_name': 'Community Health Center',
                'clinic_address': '321 Vitality Road',
                'clinic_city': 'Houston',
                'clinic_state': 'TX',
                'clinic_zip': '77001',
                'consultation_fee': 105,
                'years_of_experience': 8,
            },
        ]
        
        for doc_data in doctors_data:
            email = doc_data.pop('email')
            specialty = doc_data.pop('specialty')
            
            if not User.objects.filter(email=email).exists():
                user = User.objects.create_user(
                    email=email,
                    password='doctor123',
                    first_name=doc_data.pop('first_name'),
                    last_name=doc_data.pop('last_name'),
                    role=User.Role.DOCTOR
                )
                
                doctor = DoctorProfile.objects.create(
                    user=user,
                    specialty=specialty,
                    license_number=f'LIC-{str(user.id).zfill(8)}',
                    education='MD - Medical University',
                    clinic_phone='555-0100',
                    is_verified=True,
                    average_rating=4.5,
                    **doc_data
                )
                
                # Create schedule (Monday to Friday, 9 AM to 5 PM)
                for day in range(5):  # Monday to Friday
                    DoctorSchedule.objects.create(
                        doctor=doctor,
                        day_of_week=day,
                        start_time='09:00',
                        end_time='17:00',
                        break_start='12:00',
                        break_end='13:00'
                    )
                
                self.stdout.write(f'Created doctor: {email}')

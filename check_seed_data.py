#!/usr/bin/env python
"""Check seeded doctor data"""
import os
import sys
import django

sys.path.insert(0, '/Users/geetansh/Desktop/CHIKITSA/chikitsa_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.doctors.models import DoctorProfile, Specialty
from apps.users.models import User

print("=" * 60)
print("DATABASE SEED DATA - SUMMARY")
print("=" * 60)

# Users
print(f"\n📊 Total Users: {User.objects.count()}")
print(f"   - Admins: {User.objects.filter(role='ADMIN').count()}")
print(f"   - Doctors: {User.objects.filter(role='DOCTOR').count()}")
print(f"   - Patients: {User.objects.filter(role='PATIENT').count()}")

# Specialties
print(f"\n🏥 Total Specialties: {Specialty.objects.count()}")
for spec in Specialty.objects.all():
    print(f"   {spec.icon} {spec.name}")

# Doctors
print(f"\n👨‍⚕️ Seeded Doctors ({DoctorProfile.objects.count()}):")
print("-" * 60)

for doctor in DoctorProfile.objects.select_related('user', 'specialty').all():
    print(f"\n👤 {doctor.user.full_name}")
    print(f"   📧 Email: {doctor.user.email}")
    print(f"   🏥 Specialty: {doctor.specialty.name}")
    print(f"   🏢 Clinic: {doctor.clinic_name}")
    print(f"   📍 Location: {doctor.clinic_city}, {doctor.clinic_state}")
    print(f"   💰 Fee: ${doctor.consultation_fee}")
    print(f"   ⭐ Rating: {doctor.average_rating}/5.0")
    print(f"   ✅ Verified: {'Yes' if doctor.is_verified else 'No'}")
    print(f"   📅 Schedule: {doctor.schedules.count()} days")

print("\n" + "=" * 60)
print("✅ Database seeded successfully!")
print("=" * 60)

print("\n🔑 Demo Login Credentials:")
print("-" * 60)
print("Admin:")
print("  Email: admin@chikitsa.com")
print("  Password: admin123")
print("\nDemo Doctor:")
print("  Email: doctor@demo.com")
print("  Password: demo123456")
print("\nDemo Patient:")
print("  Email: patient@demo.com")
print("  Password: demo123456")
print("\nOther Doctors:")
print("  Email: [firstname.lastname]@chikitsa.com")
print("  Password: doctor123")
print("=" * 60)

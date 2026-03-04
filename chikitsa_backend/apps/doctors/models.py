"""
Doctor models for Chikitsa.
Comprehensive doctor management system.
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

from apps.core.models import BaseModel, TimeStampedModel, ActiveManager, AllObjectsManager


class Specialty(TimeStampedModel):
    """
    Medical specialty/category.
    Examples: Cardiology, Dermatology, Pediatrics, etc.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Icon class or emoji')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('specialty')
        verbose_name_plural = _('specialties')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class DoctorProfile(BaseModel):
    """
    Extended profile for doctors.
    Contains professional information and availability.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_profile'
    )
    
    # Professional Information
    specialty = models.ForeignKey(
        Specialty,
        on_delete=models.PROTECT,
        related_name='doctors'
    )
    license_number = models.CharField(max_length=50, unique=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    education = models.TextField(help_text='Degrees and certifications')
    bio = models.TextField(blank=True, help_text='Professional biography')
    
    # Clinic Information
    clinic_name = models.CharField(max_length=200)
    clinic_address = models.TextField()
    clinic_city = models.CharField(max_length=100)
    clinic_state = models.CharField(max_length=100)
    clinic_zip = models.CharField(max_length=20)
    clinic_phone = models.CharField(max_length=20)
    
    # Consultation Details
    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    video_consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )
    consultation_duration = models.PositiveIntegerField(
        default=30,
        help_text='Default consultation duration in minutes'
    )
    
    # Availability
    is_accepting_patients = models.BooleanField(default=True)
    max_patients_per_day = models.PositiveIntegerField(default=20)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Ratings
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    total_reviews = models.PositiveIntegerField(default=0)
    total_patients = models.PositiveIntegerField(default=0)
    
    # Languages
    languages = models.CharField(
        max_length=200,
        default='English',
        help_text='Comma-separated list of languages'
    )
    
    # Managers
    objects = ActiveManager()
    all_objects = AllObjectsManager()
    
    class Meta:
        verbose_name = _('doctor profile')
        verbose_name_plural = _('doctor profiles')
        ordering = ['-average_rating', '-total_reviews']
    
    def __str__(self):
        return f'Dr. {self.user.full_name} - {self.specialty}'
    
    @property
    def full_address(self):
        """Return full clinic address."""
        return f'{self.clinic_address}, {self.clinic_city}, {self.clinic_state} {self.clinic_zip}'
    
    def update_rating(self, new_rating: float):
        """Update average rating when new review is added."""
        total = self.average_rating * self.total_reviews + new_rating
        self.total_reviews += 1
        self.average_rating = total / self.total_reviews
        self.save(update_fields=['average_rating', 'total_reviews'])


class DoctorSchedule(TimeStampedModel):
    """
    Weekly schedule for a doctor.
    Defines working days and hours.
    """
    
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, _('Monday')
        TUESDAY = 1, _('Tuesday')
        WEDNESDAY = 2, _('Wednesday')
        THURSDAY = 3, _('Thursday')
        FRIDAY = 4, _('Friday')
        SATURDAY = 5, _('Saturday')
        SUNDAY = 6, _('Sunday')
    
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration = models.PositiveIntegerField(
        default=30,
        help_text='Duration of each appointment slot in minutes'
    )
    is_available = models.BooleanField(default=True)
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('doctor schedule')
        verbose_name_plural = _('doctor schedules')
        unique_together = ['doctor', 'day_of_week']
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f'{self.doctor} - {self.get_day_of_week_display()}'


class DoctorLeave(TimeStampedModel):
    """
    Leave/unavailability periods for doctors.
    """
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name='leaves'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=200, blank=True)
    is_full_day = models.BooleanField(default=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('doctor leave')
        verbose_name_plural = _('doctor leaves')
        ordering = ['start_date']
    
    def __str__(self):
        return f'{self.doctor} - {self.start_date} to {self.end_date}'


class DoctorReview(BaseModel):
    """
    Patient reviews for doctors.
    Each review is tied to a specific completed appointment.
    """
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_reviews'
    )
    appointment = models.OneToOneField(
        'appointments.Appointment',
        on_delete=models.CASCADE,
        related_name='review',
        null=True,
        blank=True,
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField()
    is_verified = models.BooleanField(default=False)
    is_anonymous = models.BooleanField(default=False)
    
    # Managers
    objects = ActiveManager()
    all_objects = AllObjectsManager()
    
    class Meta:
        verbose_name = _('doctor review')
        verbose_name_plural = _('doctor reviews')
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Review for {self.doctor} by {self.patient}'
    
    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            self.doctor.update_rating(self.rating)

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    
    ROLE_CHOICES = [
        ('homeowner', 'Homeowner'),
        ('renter', 'Renter'),
        ('admin', 'Admin'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='renter')
    phone_number = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class HomeownerProfile(models.Model):
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='homeowner_profile')
    bio = models.TextField(blank=True)
    company_name = models.CharField(max_length=100, blank=True)
    license_number = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    is_verified_landlord = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.full_name} - Homeowner Profile"


class RenterProfile(models.Model):
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='renter_profile')
    bio = models.TextField(blank=True)
    employment_status = models.CharField(max_length=50, blank=True)
    annual_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    credit_score = models.IntegerField(null=True, blank=True)
    references = models.TextField(blank=True)
    preferred_location = models.CharField(max_length=100, blank=True)
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.full_name} - Renter Profile"

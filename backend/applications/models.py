from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class RentalApplication(models.Model):
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rental_applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True)
    move_in_date = models.DateField()
    lease_duration_months = models.PositiveIntegerField(default=12)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    employment_status = models.CharField(max_length=50, blank=True)
    employer_name = models.CharField(max_length=100, blank=True)
    employer_phone = models.CharField(max_length=20, blank=True)
    reference1_name = models.CharField(max_length=100, blank=True)
    reference1_phone = models.CharField(max_length=20, blank=True)
    reference1_relationship = models.CharField(max_length=50, blank=True)
    reference2_name = models.CharField(max_length=100, blank=True)
    reference2_phone = models.CharField(max_length=20, blank=True)
    reference2_relationship = models.CharField(max_length=50, blank=True)
    has_pets = models.BooleanField(default=False)
    pet_details = models.TextField(blank=True)
    additional_notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    
    class Meta:
        ordering = ['-submitted_at']
        unique_together = ['property', 'applicant']
    
    def __str__(self):
        return f"{self.applicant.full_name} - {self.property.title}"
    
    def is_pending(self):
        return self.status == 'pending'
    
    def is_approved(self):
        return self.status == 'approved'
    
    def is_rejected(self):
        return self.status == 'rejected'


class ApplicationDocument(models.Model):
    
    DOCUMENT_TYPES = [
        ('id', 'Government ID'),
        ('pay_stub', 'Pay Stub'),
        ('bank_statement', 'Bank Statement'),
        ('employment_letter', 'Employment Letter'),
        ('reference_letter', 'Reference Letter'),
        ('other', 'Other'),
    ]
    
    application = models.ForeignKey(RentalApplication, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='application_documents/')
    description = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.application} - {self.get_document_type_display()}"


class ApplicationMessage(models.Model):
    
    application = models.ForeignKey(RentalApplication, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_from_owner = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender.full_name} - {self.application.property.title}"

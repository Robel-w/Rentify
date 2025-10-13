from django.contrib import admin
from .models import Property, PropertyImage, PropertyAmenity

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'city', 'state', 'monthly_rent', 'is_approved', 'status')
    list_filter = ('is_approved', 'status', 'property_type')
    list_editable = ('is_approved', 'status')  # Allow quick editing
    search_fields = ('title', 'city', 'state')

@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('property', 'image', 'is_primary')

@admin.register(PropertyAmenity)
class PropertyAmenityAdmin(admin.ModelAdmin):
    list_display = ('property', 'name')
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from properties.models import Property
from .models import RentalApplication, ApplicationDocument, ApplicationMessage
from .serializers import (
    RentalApplicationListSerializer, RentalApplicationDetailSerializer,
    RentalApplicationCreateSerializer, RentalApplicationUpdateSerializer,
    ApplicationMessageSerializer, ApplicationMessageCreateSerializer,
    ApplicationDocumentSerializer
)


class RentalApplicationListView(generics.ListAPIView):
    
    serializer_class = RentalApplicationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'homeowner':
            return RentalApplication.objects.filter(property__owner=user).select_related('property', 'applicant', 'reviewed_by')
        elif user.role == 'renter':
            return RentalApplication.objects.filter(applicant=user).select_related('property', 'applicant', 'reviewed_by')
        else:
            return RentalApplication.objects.all().select_related('property', 'applicant', 'reviewed_by')


class RentalApplicationDetailView(generics.RetrieveAPIView):
    
    serializer_class = RentalApplicationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'homeowner':
            return RentalApplication.objects.filter(property__owner=user)
        elif user.role == 'renter':
            return RentalApplication.objects.filter(applicant=user)
        else:
            return RentalApplication.objects.all()


class RentalApplicationCreateView(generics.CreateAPIView):
    
    serializer_class = RentalApplicationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        if self.request.user.role != 'renter':
            raise permissions.PermissionDenied("Only renters can create rental applications")
        serializer.save(applicant=self.request.user)


class RentalApplicationUpdateView(generics.UpdateAPIView):
    
    serializer_class = RentalApplicationUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'homeowner':
            return RentalApplication.objects.filter(property__owner=user)
        elif user.role == 'admin':
            return RentalApplication.objects.all()
        else:
            return RentalApplication.objects.none()
    
    def perform_update(self, serializer):
        serializer.save(reviewed_by=self.request.user)


class PropertyApplicationsView(generics.ListAPIView):
    
    serializer_class = RentalApplicationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        property_id = self.kwargs['property_id']
        property_obj = get_object_or_404(Property, id=property_id, owner=self.request.user)
        return RentalApplication.objects.filter(property=property_obj).select_related('applicant', 'reviewed_by')


class ApplicationMessagesView(generics.ListCreateAPIView):
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ApplicationMessageCreateSerializer
        return ApplicationMessageSerializer
    
    def get_queryset(self):
        application_id = self.kwargs['application_id']
        application = get_object_or_404(RentalApplication, id=application_id)
        
        user = self.request.user
        if not (user == application.applicant or user == application.property.owner or user.role == 'admin'):
            raise permissions.PermissionDenied("You don't have permission to view this application")
        
        return ApplicationMessage.objects.filter(application=application).select_related('sender')
    
    def perform_create(self, serializer):
        application_id = self.kwargs['application_id']
        application = get_object_or_404(RentalApplication, id=application_id)
        
        user = self.request.user
        if not (user == application.applicant or user == application.property.owner):
            raise permissions.PermissionDenied("You don't have permission to send messages for this application")
        
        serializer.save(application=application)


class ApplicationDocumentsView(generics.ListCreateAPIView):
    
    serializer_class = ApplicationDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        application_id = self.kwargs['application_id']
        application = get_object_or_404(RentalApplication, id=application_id)
        
        user = self.request.user
        if not (user == application.applicant or user == application.property.owner or user.role == 'admin'):
            raise permissions.PermissionDenied("You don't have permission to view this application")
        
        return ApplicationDocument.objects.filter(application=application)
    
    def perform_create(self, serializer):
        application_id = self.kwargs['application_id']
        application = get_object_or_404(RentalApplication, id=application_id)
        
        if self.request.user != application.applicant:
            raise permissions.PermissionDenied("Only the applicant can upload documents")
        
        serializer.save(application=application)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def application_stats_view(request):
    
    user = request.user
    
    if user.role == 'homeowner':
        total_applications = RentalApplication.objects.filter(property__owner=user).count()
        pending_applications = RentalApplication.objects.filter(property__owner=user, status='pending').count()
        approved_applications = RentalApplication.objects.filter(property__owner=user, status='approved').count()
        rejected_applications = RentalApplication.objects.filter(property__owner=user, status='rejected').count()
        
        return Response({
            'total_applications': total_applications,
            'pending_applications': pending_applications,
            'approved_applications': approved_applications,
            'rejected_applications': rejected_applications,
        })
    
    elif user.role == 'renter':
        total_applications = RentalApplication.objects.filter(applicant=user).count()
        pending_applications = RentalApplication.objects.filter(applicant=user, status='pending').count()
        approved_applications = RentalApplication.objects.filter(applicant=user, status='approved').count()
        rejected_applications = RentalApplication.objects.filter(applicant=user, status='rejected').count()
        
        return Response({
            'total_applications': total_applications,
            'pending_applications': pending_applications,
            'approved_applications': approved_applications,
            'rejected_applications': rejected_applications,
        })
    
    else:
        total_applications = RentalApplication.objects.count()
        pending_applications = RentalApplication.objects.filter(status='pending').count()
        approved_applications = RentalApplication.objects.filter(status='approved').count()
        rejected_applications = RentalApplication.objects.filter(status='rejected').count()
        
        return Response({
            'total_applications': total_applications,
            'pending_applications': pending_applications,
            'approved_applications': approved_applications,
            'rejected_applications': rejected_applications,
        })
from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Min, Max, Count
from django.db import models
from django.shortcuts import get_object_or_404
from .models import Property, PropertyImage, PropertyAmenity
from .serializers import (
    PropertyListSerializer, PropertyDetailSerializer, PropertyCreateUpdateSerializer,
    PropertySearchSerializer, PropertyImageSerializer
)


class PropertyListView(generics.ListAPIView):
    
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'state', 'property_type', 'furnishing', 'bedrooms', 'bathrooms']
    search_fields = ['title', 'description', 'city', 'state', 'address']
    ordering_fields = ['created_at', 'monthly_rent', 'is_featured']
    ordering = ['-is_featured', '-created_at']
    
    def get_queryset(self):
        queryset = Property.objects.filter(is_approved=True, status='available')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        min_bedrooms = self.request.query_params.get('min_bedrooms')
        max_bedrooms = self.request.query_params.get('max_bedrooms')
        min_bathrooms = self.request.query_params.get('min_bathrooms')
        max_bathrooms = self.request.query_params.get('max_bathrooms')
        
        if min_price:
            queryset = queryset.filter(monthly_rent__gte=min_price)
        if max_price:
            queryset = queryset.filter(monthly_rent__lte=max_price)
        if min_bedrooms:
            queryset = queryset.filter(bedrooms__gte=min_bedrooms)
        if max_bedrooms:
            queryset = queryset.filter(bedrooms__lte=max_bedrooms)
        if min_bathrooms:
            queryset = queryset.filter(bathrooms__gte=min_bathrooms)
        if max_bathrooms:
            queryset = queryset.filter(bathrooms__lte=max_bathrooms)
        
        boolean_filters = [
            'has_parking', 'has_balcony', 'has_garden', 'has_pool', 'has_gym',
            'has_elevator', 'has_air_conditioning', 'has_heating', 'has_washer_dryer',
            'pet_friendly', 'utilities_included'
        ]
        
        for filter_name in boolean_filters:
            value = self.request.query_params.get(filter_name)
            if value is not None:
                queryset = queryset.filter(**{filter_name: value.lower() == 'true'})
        
        return queryset.select_related('owner').prefetch_related('images')


class PropertyDetailView(generics.RetrieveAPIView):
    
    serializer_class = PropertyDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Property.objects.filter(is_approved=True).select_related('owner').prefetch_related('images', 'amenities')


class PropertyCreateView(generics.CreateAPIView):
    
    serializer_class = PropertyCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        if self.request.user.role != 'homeowner':
            raise permissions.PermissionDenied("Only homeowners can create properties")
        serializer.save(owner=self.request.user)


class PropertyUpdateView(generics.UpdateAPIView):
    
    serializer_class = PropertyCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Property.objects.filter(owner=self.request.user)


class PropertyDeleteView(generics.DestroyAPIView):
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Property.objects.filter(owner=self.request.user)


class UserPropertiesView(generics.ListAPIView):
    
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Property.objects.filter(owner=self.request.user).select_related('owner').prefetch_related('images')


class PropertyApplicationsView(generics.ListAPIView):
    
    from applications.serializers import RentalApplicationListSerializer
    
    serializer_class = RentalApplicationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        property_id = self.kwargs['property_id']
        property_obj = get_object_or_404(Property, id=property_id, owner=self.request.user)
        from applications.models import RentalApplication
        return RentalApplication.objects.filter(property=property_obj).select_related('applicant', 'reviewed_by')


class PropertySearchView(generics.ListAPIView):
    
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Property.objects.filter(is_approved=True, status='available')
        search = self.request.query_params.get('search', '')
        city = self.request.query_params.get('city', '')
        state = self.request.query_params.get('state', '')
        property_type = self.request.query_params.get('property_type', '')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        min_bedrooms = self.request.query_params.get('min_bedrooms')
        max_bedrooms = self.request.query_params.get('max_bedrooms')
        min_bathrooms = self.request.query_params.get('min_bathrooms')
        max_bathrooms = self.request.query_params.get('max_bathrooms')
        furnishing = self.request.query_params.get('furnishing', '')
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(city__icontains=search) |
                Q(state__icontains=search) |
                Q(address__icontains=search)
            )
        
        if city:
            queryset = queryset.filter(city__icontains=city)
        if state:
            queryset = queryset.filter(state__icontains=state)
        if property_type:
            queryset = queryset.filter(property_type=property_type)
        if furnishing:
            queryset = queryset.filter(furnishing=furnishing)
        
        if min_price:
            queryset = queryset.filter(monthly_rent__gte=min_price)
        if max_price:
            queryset = queryset.filter(monthly_rent__lte=max_price)
        
        if min_bedrooms:
            queryset = queryset.filter(bedrooms__gte=min_bedrooms)
        if max_bedrooms:
            queryset = queryset.filter(bedrooms__lte=max_bedrooms)
        
        if min_bathrooms:
            queryset = queryset.filter(bathrooms__gte=min_bathrooms)
        if max_bathrooms:
            queryset = queryset.filter(bathrooms__lte=max_bathrooms)
        
        boolean_filters = [
            'has_parking', 'has_balcony', 'has_garden', 'has_pool', 'has_gym',
            'has_elevator', 'has_air_conditioning', 'has_heating', 'has_washer_dryer',
            'pet_friendly', 'utilities_included'
        ]
        
        for filter_name in boolean_filters:
            value = self.request.query_params.get(filter_name)
            if value is not None:
                queryset = queryset.filter(**{filter_name: value.lower() == 'true'})
        
        ordering = self.request.query_params.get('ordering', '-is_featured,-created_at')
        if ordering:
            queryset = queryset.order_by(*ordering.split(','))
        
        return queryset.select_related('owner').prefetch_related('images')


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def property_stats_view(request):
    
    total_properties = Property.objects.filter(is_approved=True, status='available').count()
    
    properties = Property.objects.filter(is_approved=True, status='available')
    if properties.exists():
        avg_price = properties.aggregate(avg_price=models.Avg('monthly_rent'))['avg_price']
        min_price = properties.aggregate(min_price=models.Min('monthly_rent'))['min_price']
        max_price = properties.aggregate(max_price=models.Max('monthly_rent'))['max_price']
    else:
        avg_price = min_price = max_price = 0
    
    property_types = Property.objects.filter(is_approved=True, status='available').values('property_type').annotate(count=models.Count('id'))
    
    cities = Property.objects.filter(is_approved=True, status='available').values('city').annotate(count=models.Count('id')).order_by('-count')[:10]
    
    return Response({
        'total_properties': total_properties,
        'price_stats': {
            'average': float(avg_price) if avg_price else 0,
            'minimum': float(min_price) if min_price else 0,
            'maximum': float(max_price) if max_price else 0,
        },
        'property_types': list(property_types),
        'top_cities': list(cities),
    })


class PropertyImageUploadView(generics.CreateAPIView):
    
    serializer_class = PropertyImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        property_id = self.kwargs['property_id']
        return Property.objects.filter(id=property_id, owner=self.request.user)
    
    def perform_create(self, serializer):
        property_id = self.kwargs['property_id']
        property_obj = get_object_or_404(Property, id=property_id, owner=self.request.user)
        serializer.save(property=property_obj)


class PropertyImageListView(generics.ListAPIView):
    
    serializer_class = PropertyImageSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        property_id = self.kwargs['property_id']
        property_obj = get_object_or_404(Property, id=property_id)
        return PropertyImage.objects.filter(property=property_obj)


class PropertyImageDeleteView(generics.DestroyAPIView):
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        property_id = self.kwargs['property_id']
        return PropertyImage.objects.filter(property__id=property_id, property__owner=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_primary_image_view(request, property_id, image_id):
    
    property_obj = get_object_or_404(Property, id=property_id, owner=request.user)
    image = get_object_or_404(PropertyImage, id=image_id, property=property_obj)
    
    PropertyImage.objects.filter(property=property_obj).update(is_primary=False)
    image.is_primary = True
    image.save()
    
    return Response({'message': 'Primary image updated successfully'}, status=status.HTTP_200_OK)
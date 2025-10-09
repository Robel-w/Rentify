from rest_framework import serializers
from .models import Property, PropertyImage, PropertyAmenity
from accounts.serializers import UserSerializer


class PropertyImageSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PropertyImage
        fields = ('id', 'image', 'caption', 'is_primary', 'order')


class PropertyAmenitySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PropertyAmenity
        fields = ('id', 'name', 'description')


class PropertyListSerializer(serializers.ModelSerializer):
    
    owner = UserSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    image_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = ('id', 'title', 'property_type', 'city', 'state', 'bedrooms', 'bathrooms',
                 'monthly_rent', 'available_from', 'status', 'is_featured', 'is_approved',
                 'owner', 'primary_image', 'image_count', 'created_at')
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        return None
    
    def get_image_count(self, obj):
        return obj.images.count()


class PropertyDetailSerializer(serializers.ModelSerializer):
    
    owner = UserSerializer(read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    amenities = PropertyAmenitySerializer(many=True, read_only=True)
    full_address = serializers.ReadOnlyField()
    application_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at', 'is_approved')
    
    def get_application_count(self, obj):
        return obj.applications.count()


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    
    images = PropertyImageSerializer(many=True, required=False)
    amenities = PropertyAmenitySerializer(many=True, required=False)
    
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at', 'is_approved')
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        amenities_data = validated_data.pop('amenities', [])
        
        property_obj = Property.objects.create(**validated_data)
        
        for image_data in images_data:
            PropertyImage.objects.create(property=property_obj, **image_data)
        
        for amenity_data in amenities_data:
            PropertyAmenity.objects.create(property=property_obj, **amenity_data)
        
        return property_obj
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', [])
        amenities_data = validated_data.pop('amenities', [])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if images_data:
            instance.images.all().delete()
            for image_data in images_data:
                PropertyImage.objects.create(property=instance, **image_data)
        
        if amenities_data:
            instance.amenities.all().delete()
            for amenity_data in amenities_data:
                PropertyAmenity.objects.create(property=instance, **amenity_data)
        
        return instance


class PropertySearchSerializer(serializers.Serializer):
    
    search = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    state = serializers.CharField(required=False)
    property_type = serializers.ChoiceField(choices=Property.PROPERTY_TYPES, required=False)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    min_bedrooms = serializers.IntegerField(required=False)
    max_bedrooms = serializers.IntegerField(required=False)
    min_bathrooms = serializers.DecimalField(max_digits=3, decimal_places=1, required=False)
    max_bathrooms = serializers.DecimalField(max_digits=3, decimal_places=1, required=False)
    furnishing = serializers.ChoiceField(choices=Property.FURNISHING_CHOICES, required=False)
    has_parking = serializers.BooleanField(required=False)
    has_balcony = serializers.BooleanField(required=False)
    has_garden = serializers.BooleanField(required=False)
    has_pool = serializers.BooleanField(required=False)
    has_gym = serializers.BooleanField(required=False)
    has_elevator = serializers.BooleanField(required=False)
    has_air_conditioning = serializers.BooleanField(required=False)
    has_heating = serializers.BooleanField(required=False)
    has_washer_dryer = serializers.BooleanField(required=False)
    pet_friendly = serializers.BooleanField(required=False)
    utilities_included = serializers.BooleanField(required=False)
    available_from = serializers.DateField(required=False)
    ordering = serializers.ChoiceField(choices=[
        ('-created_at', 'Newest First'),
        ('created_at', 'Oldest First'),
        ('monthly_rent', 'Price Low to High'),
        ('-monthly_rent', 'Price High to Low'),
        ('-is_featured', 'Featured First'),
    ], required=False)

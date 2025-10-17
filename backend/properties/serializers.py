from rest_framework import serializers
from .models import Property, PropertyImage, PropertyAmenity
from accounts.serializers import UserSerializer
from .utils.geocoding import geocode_address

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
    property_images = serializers.ListField(
        child=serializers.ImageField(max_length=100000, allow_empty_file=False),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Property
        exclude = ['owner']  # Remove is_approved from exclude
        read_only_fields = ('created_at', 'updated_at', 'is_approved')  # Add is_approved here
    
    def create(self, validated_data):
        images_data = validated_data.pop('property_images', [])
        validated_data['owner'] = self.context['request'].user
        
        # AUTO-APPROVE FOR DEVELOPMENT
        validated_data['is_approved'] = True

        full_address = f"{validated_data.get('address', '')}, {validated_data.get('city', '')}, {validated_data.get('state', '')}"
        lat, lon = geocode_address(full_address)
          # 🌍 Geocode address before creating
        full_address = f"{validated_data.get('address', '')}, {validated_data.get('city', '')}, {validated_data.get('state', '')}"
        lat, lon = geocode_address(full_address)

        # 🪄 Debug print (you’ll see this in your terminal)
        print(f"[🛰️ GEOCODING CREATE] Address: {full_address} → lat: {lat}, lon: {lon}")


        validated_data['latitude'] = lat
        validated_data['longitude'] = lon


        property_obj = Property.objects.create(**validated_data)
        
        for i, image_data in enumerate(images_data):
            PropertyImage.objects.create(
                property=property_obj,
                image=image_data,
                order=i,
                is_primary=(i == 0)
            )
        
        return property_obj
    
    def update(self, instance, validated_data):
        new_address = validated_data.get('address', instance.address)
        new_city = validated_data.get('city', instance.city)
        new_state = validated_data.get('state', instance.state)

        if (new_address != instance.address) or (new_city != instance.city) or (new_state != instance.state):
            full_address = f"{new_address}, {new_city}, {new_state}"
            lat, lon = geocode_address(full_address)
            validated_data['latitude'] = lat
            validated_data['longitude'] = lon

        return super().update(instance, validated_data)
    

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

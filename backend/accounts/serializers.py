from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, HomeownerProfile, RenterProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'role', 'phone_number', 'password', 'password_confirm')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password')


class UserSerializer(serializers.ModelSerializer):
    
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'full_name', 'role', 
                 'phone_number', 'profile_picture', 'is_verified', 'created_at', 'updated_at')
        read_only_fields = ('id', 'email', 'role', 'is_verified', 'created_at', 'updated_at')


class UserUpdateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone_number', 'profile_picture')


class PasswordChangeSerializer(serializers.Serializer):
    
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class HomeownerProfileSerializer(serializers.ModelSerializer):
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = HomeownerProfile
        fields = '__all__'


class HomeownerProfileUpdateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = HomeownerProfile
        fields = ('bio', 'company_name', 'license_number', 'address', 'is_verified_landlord')


class RenterProfileSerializer(serializers.ModelSerializer):
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = RenterProfile
        fields = '__all__'


class RenterProfileUpdateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = RenterProfile
        fields = ('bio', 'employment_status', 'annual_income', 'credit_score', 'references',
                 'preferred_location', 'budget_min', 'budget_max')

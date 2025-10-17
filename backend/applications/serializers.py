from rest_framework import serializers
from .models import RentalApplication, ApplicationDocument, ApplicationMessage
from properties.serializers import PropertyListSerializer
from accounts.serializers import UserSerializer


class ApplicationDocumentSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ApplicationDocument
        fields = ('id', 'document_type', 'file', 'description', 'uploaded_at')
        read_only_fields = ('uploaded_at',)


class ApplicationMessageSerializer(serializers.ModelSerializer):
    
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = ApplicationMessage
        fields = ('id', 'sender', 'message', 'is_from_owner', 'created_at')
        read_only_fields = ('sender', 'is_from_owner', 'created_at')


class RentalApplicationListSerializer(serializers.ModelSerializer):
    
    property = PropertyListSerializer(read_only=True)
    applicant = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = RentalApplication
        fields = ('id', 'property', 'applicant', 'status', 'move_in_date', 
                 'lease_duration_months', 'submitted_at', 'reviewed_at', 'reviewed_by')


class RentalApplicationDetailSerializer(serializers.ModelSerializer):
    
    property = PropertyListSerializer(read_only=True)
    applicant = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    documents = ApplicationDocumentSerializer(many=True, read_only=True)
    messages = ApplicationMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = RentalApplication
        fields = '__all__'
        read_only_fields = ('applicant', 'submitted_at', 'reviewed_at', 'reviewed_by')


class RentalApplicationCreateSerializer(serializers.ModelSerializer):
    
    documents = ApplicationDocumentSerializer(many=True, required=False)
    move_in_date = serializers.DateField(required=False)
    message = serializers.CharField(required=False, allow_blank=True)
    lease_duration_months = serializers.IntegerField(required=False, default=12)
    monthly_income = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    employment_status = serializers.CharField(required=False, allow_blank=True)
    employer_name = serializers.CharField(required=False, allow_blank=True)
    employer_phone = serializers.CharField(required=False, allow_blank=True)
    reference1_name = serializers.CharField(required=False, allow_blank=True)
    reference1_phone = serializers.CharField(required=False, allow_blank=True)
    reference1_relationship = serializers.CharField(required=False, allow_blank=True)
    reference2_name = serializers.CharField(required=False, allow_blank=True)
    reference2_phone = serializers.CharField(required=False, allow_blank=True)
    reference2_relationship = serializers.CharField(required=False, allow_blank=True)
    has_pets = serializers.BooleanField(required=False, default=False)
    pet_details = serializers.CharField(required=False, allow_blank=True)
    additional_notes = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = RentalApplication
        fields = ('property', 'message', 'move_in_date', 'lease_duration_months',
                 'monthly_income', 'employment_status', 'employer_name', 'employer_phone',
                 'reference1_name', 'reference1_phone', 'reference1_relationship',
                 'reference2_name', 'reference2_phone', 'reference2_relationship',
                 'has_pets', 'pet_details', 'additional_notes', 'documents')
    
    def create(self, validated_data):
        documents_data = validated_data.pop('documents', [])
        application = RentalApplication.objects.create(**validated_data)
        
        for document_data in documents_data:
            ApplicationDocument.objects.create(application=application, **document_data)
        
        return application


class RentalApplicationUpdateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = RentalApplication
        fields = ('status',)
    
    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance


class ApplicationMessageCreateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ApplicationMessage
        fields = ('message',)
    
    def create(self, validated_data):
        application = self.context['application']
        sender = self.context['request'].user
        is_from_owner = sender == application.property.owner
        
        return ApplicationMessage.objects.create(
            application=application,
            sender=sender,
            is_from_owner=is_from_owner,
            **validated_data
        )

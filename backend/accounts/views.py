from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.contrib.auth import login
from .models import User, HomeownerProfile, RenterProfile
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer, 
    UserUpdateSerializer, PasswordChangeSerializer,
    HomeownerProfileSerializer, HomeownerProfileUpdateSerializer,
    RenterProfileSerializer, RenterProfileUpdateSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        if user.role == 'homeowner':
            HomeownerProfile.objects.create(user=user)
        elif user.role == 'renter':
            RenterProfile.objects.create(user=user)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        login(request, user)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserUpdateView(generics.UpdateAPIView):
    
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        # Return the updated user data using UserSerializer for consistency
        from .serializers import UserSerializer
        user_serializer = UserSerializer(instance, context={'request': request})
        return Response(user_serializer.data)


class PasswordChangeView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


class HomeownerProfileView(generics.RetrieveUpdateAPIView):
    
    serializer_class = HomeownerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        try:
            return self.request.user.homeowner_profile
        except HomeownerProfile.DoesNotExist:
            return None
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return HomeownerProfileUpdateSerializer
        return HomeownerProfileSerializer


class RenterProfileView(generics.RetrieveUpdateAPIView):
    
    serializer_class = RenterProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        try:
            return self.request.user.renter_profile
        except RenterProfile.DoesNotExist:
            return None
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return RenterProfileUpdateSerializer
        return RenterProfileSerializer


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileImageUploadView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        if 'profile_picture' not in request.FILES:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        user.profile_picture = request.FILES['profile_picture']
        user.save()
        
        serializer = UserSerializer(user, context={'request': request})
        return Response({
            'message': 'Profile picture updated successfully',
            'user': serializer.data
        }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_profile_image_view(request):
    
    user = request.user
    if user.profile_picture:
        user.profile_picture.delete()
        user.profile_picture = None
        user.save()
        
        serializer = UserSerializer(user, context={'request': request})
        return Response({
            'message': 'Profile picture deleted successfully',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'No profile picture to delete'}, status=status.HTTP_400_BAD_REQUEST)
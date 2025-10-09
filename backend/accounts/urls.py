from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='user_register'),
    path('login/', views.UserLoginView.as_view(), name='user_login'),
    path('logout/', views.logout_view, name='user_logout'),
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('profile/update/', views.UserUpdateView.as_view(), name='user_update'),
    path('password/change/', views.PasswordChangeView.as_view(), name='password_change'),
    path('profile/image/upload/', views.ProfileImageUploadView.as_view(), name='profile_image_upload'),
    path('profile/image/delete/', views.delete_profile_image_view, name='delete_profile_image'),
    path('homeowner/profile/', views.HomeownerProfileView.as_view(), name='homeowner_profile'),
    path('renter/profile/', views.RenterProfileView.as_view(), name='renter_profile'),
]

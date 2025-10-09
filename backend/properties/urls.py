from django.urls import path
from . import views

urlpatterns = [
    path('', views.PropertyListView.as_view(), name='property_list'),
    path('search/', views.PropertySearchView.as_view(), name='property_search'),
    path('stats/', views.property_stats_view, name='property_stats'),
    path('create/', views.PropertyCreateView.as_view(), name='property_create'),
    path('my-properties/', views.UserPropertiesView.as_view(), name='user_properties'),
    path('<int:pk>/', views.PropertyDetailView.as_view(), name='property_detail'),
    path('<int:pk>/update/', views.PropertyUpdateView.as_view(), name='property_update'),
    path('<int:pk>/delete/', views.PropertyDeleteView.as_view(), name='property_delete'),
    path('<int:property_id>/applications/', views.PropertyApplicationsView.as_view(), name='property_applications'),
    path('<int:property_id>/images/', views.PropertyImageListView.as_view(), name='property_images'),
    path('<int:property_id>/images/upload/', views.PropertyImageUploadView.as_view(), name='property_image_upload'),
    path('<int:property_id>/images/<int:pk>/delete/', views.PropertyImageDeleteView.as_view(), name='property_image_delete'),
    path('<int:property_id>/images/<int:image_id>/set-primary/', views.set_primary_image_view, name='set_primary_image'),
]

from django.urls import path
from . import views

urlpatterns = [
    # Application CRUD
    path('', views.RentalApplicationListView.as_view(), name='application_list'),
    path('create/', views.RentalApplicationCreateView.as_view(), name='application_create'),
    path('stats/', views.application_stats_view, name='application_stats'),
    path('<int:pk>/', views.RentalApplicationDetailView.as_view(), name='application_detail'),
    path('<int:pk>/update/', views.RentalApplicationUpdateView.as_view(), name='application_update'),
    
    # Application messages and documents
    path('<int:application_id>/messages/', views.ApplicationMessagesView.as_view(), name='application_messages'),
    path('<int:application_id>/documents/', views.ApplicationDocumentsView.as_view(), name='application_documents'),
]

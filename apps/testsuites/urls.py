from django.urls import path
from . import views

urlpatterns = [
    path('', views.TestSuiteListCreateView.as_view(), name='testsuite-list'),
    path('<int:pk>/', views.TestSuiteDetailView.as_view(), name='testsuite-detail'),
]
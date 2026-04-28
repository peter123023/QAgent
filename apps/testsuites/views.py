from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db import models
from .models import TestSuite, TestSuiteCase
from .serializers import (
    TestSuiteSerializer,
    TestSuiteListSerializer,
    TestSuiteCreateUpdateSerializer,
    TestSuiteCaseSerializer
)


class TestSuiteListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'name']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TestSuiteCreateUpdateSerializer
        return TestSuiteListSerializer
    
    def get_queryset(self):
        user = self.request.user
        return TestSuite.objects.filter(
            models.Q(project__owner=user) | models.Q(project__members=user)
        ).distinct()
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class TestSuiteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TestSuite.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TestSuiteCreateUpdateSerializer
        return TestSuiteSerializer
    
    def get_queryset(self):
        user = self.request.user
        return TestSuite.objects.filter(
            models.Q(project__owner=user) | models.Q(project__members=user)
        ).distinct()

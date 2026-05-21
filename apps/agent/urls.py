from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.SessionListCreateView.as_view(), name='agent-session-list'),
    path('sessions/<str:session_id>/', views.SessionDetailView.as_view(), name='agent-session-detail'),
    path('sessions/<str:session_id>/messages/', views.MessageListView.as_view(), name='agent-message-list'),
    path('chat/', views.ChatView.as_view(), name='agent-chat'),
]

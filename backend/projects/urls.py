from django.urls import path
from .views import (
    ProjectListView, ProjectDetailView,
    MilestoneListView, MilestoneDetailView,
    ProjectFileUploadView,
    TaskListView, TaskDetailView,
    IssueListView, IssueDetailView,
    ProjectMemberView,
)

urlpatterns = [
    path('', ProjectListView.as_view()),
    path('<int:pk>/', ProjectDetailView.as_view()),
    path('<int:project_id>/milestones/', MilestoneListView.as_view()),
    path('<int:project_id>/milestones/<int:pk>/', MilestoneDetailView.as_view()),
    path('<int:project_id>/files/', ProjectFileUploadView.as_view()),
    path('<int:project_id>/tasks/', TaskListView.as_view()),
    path('<int:project_id>/tasks/<int:pk>/', TaskDetailView.as_view()),
    path('<int:project_id>/issues/', IssueListView.as_view()),
    path('<int:project_id>/issues/<int:pk>/', IssueDetailView.as_view()),
    path('<int:project_id>/members/', ProjectMemberView.as_view()),
]

from django.urls import path
from .views import (
    TeamListView, TeamDetailView, TeamMemberView,
    TeamTaskListView, TeamTaskDetailView,
    TeamIssueListView, TeamIssueDetailView,
    TeamFileListView, TeamFileDetailView,
)

urlpatterns = [
    path('', TeamListView.as_view()),
    path('<int:pk>/', TeamDetailView.as_view()),
    path('<int:team_id>/members/', TeamMemberView.as_view()),
    path('<int:team_id>/tasks/', TeamTaskListView.as_view()),
    path('<int:team_id>/tasks/<int:pk>/', TeamTaskDetailView.as_view()),
    path('<int:team_id>/issues/', TeamIssueListView.as_view()),
    path('<int:team_id>/issues/<int:pk>/', TeamIssueDetailView.as_view()),
    path('<int:team_id>/files/', TeamFileListView.as_view()),
    path('<int:team_id>/files/<int:pk>/', TeamFileDetailView.as_view()),
]

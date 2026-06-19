from django.urls import path

from .views import (
    GitHubSyncView,
    RepositoryListView
)

urlpatterns = [

    path(
        "sync/",
        GitHubSyncView.as_view(),
        name="github-sync"
    ),

    path(
        "repositories/",
        RepositoryListView.as_view()
    ),

]
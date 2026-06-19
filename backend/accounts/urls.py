from django.urls import path
from .views import (
    RegisterView, ProfileView, PublicProfileView,
    FollowView, UserSearchView, FollowersListView,
    FollowingListView, ThemeView
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('profile/<str:username>/', PublicProfileView.as_view()),
    path('follow/<str:username>/', FollowView.as_view()),
    path('search/', UserSearchView.as_view()),
    path('followers/', FollowersListView.as_view()),
    path('following/', FollowingListView.as_view()),
    path('theme/', ThemeView.as_view()),
]

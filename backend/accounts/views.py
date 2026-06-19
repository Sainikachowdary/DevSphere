from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Profile
from .serializers import RegisterSerializer, ProfileSerializer, UserSearchSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


class PublicProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]
    lookup_field = 'username'

    def get_object(self):
        username = self.kwargs['username']
        user = User.objects.get(username=username)
        return Profile.objects.get(user=user)


class FollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        try:
            target_user = User.objects.get(username=username)
            target_profile = Profile.objects.get(user=target_user)
            if request.user == target_user:
                return Response({'error': 'Cannot follow yourself'}, status=400)
            if target_profile.followers.filter(id=request.user.id).exists():
                target_profile.followers.remove(request.user)
                return Response({'following': False})
            else:
                target_profile.followers.add(request.user)
                return Response({'following': True})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class UserSearchView(generics.ListAPIView):
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        q = self.request.query_params.get('q', '')
        skill = self.request.query_params.get('skill', '')
        qs = User.objects.select_related('profile').all()
        if q:
            qs = qs.filter(username__icontains=q)
        if skill:
            qs = qs.filter(profile__skills__icontains=skill)
        return qs.exclude(id=self.request.user.id)


class FollowersListView(generics.ListAPIView):
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = Profile.objects.get(user=self.request.user)
        return profile.followers.all()


class FollowingListView(generics.ListAPIView):
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        following_profiles = Profile.objects.filter(followers=self.request.user)
        return User.objects.filter(profile__in=following_profiles)


class ThemeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        theme = request.data.get('theme', 'dark')
        Profile.objects.filter(user=request.user).update(theme=theme)
        return Response({'theme': theme})

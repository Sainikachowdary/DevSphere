from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status

from accounts.models import Profile
from .models import Repository
from .serializers import RepositorySerializer
from .github_service import fetch_repositories


class GitHubSyncView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not profile.github_username:
            return Response(
                {'error': 'No GitHub username set. Add it in your Profile settings.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        token = getattr(profile, 'github_token', None) or None
        repos, error = fetch_repositories(profile.github_username, token=token)

        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        for repo in repos:
            Repository.objects.update_or_create(
                profile=profile,
                name=repo['name'],
                defaults={
                    'description': repo.get('description') or '',
                    'language': repo.get('language') or '',
                    'stars': repo.get('stargazers_count', 0),
                    'forks': repo.get('forks_count', 0),
                    'github_url': repo.get('html_url', ''),
                }
            )

        count = len(repos)
        return Response({'message': f'{count} repositories synced successfully.', 'count': count})


class RepositoryListView(generics.ListAPIView):
    serializer_class = RepositorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            profile = Profile.objects.get(user=self.request.user)
            return Repository.objects.filter(profile=profile).order_by('-stars')
        except Profile.DoesNotExist:
            return Repository.objects.none()

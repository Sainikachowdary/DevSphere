from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.models import Profile
from githubapp.models import Repository
from projects.models import Project


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)

        repos = Repository.objects.filter(profile=profile).count()
        projects = Project.objects.filter(owner=user).count()
        team_projects = Project.objects.filter(members=user).count()
        skills_count = len([s for s in profile.skills.split(',') if s.strip()]) if profile.skills else 0
        certs = user.certificates.count() if hasattr(user, 'certificates') else 0

        # Developer score formula
        score = min(100, (
            repos * 2 +
            projects * 5 +
            skills_count * 2 +
            certs * 3 +
            profile.streak +
            team_projects * 3
        ))

        Profile.objects.filter(user=user).update(developer_score=score)

        recent_projects = Project.objects.filter(owner=user).order_by('-updated_at')[:5]
        from projects.serializers import ProjectSerializer
        projects_data = ProjectSerializer(recent_projects, many=True, context={'request': request}).data

        return Response({
            'username': user.username,
            'repositories': repos,
            'projects': projects,
            'skills': skills_count,
            'certificates': certs,
            'streak': profile.streak,
            'developer_score': score,
            'recent_projects': projects_data,
        })

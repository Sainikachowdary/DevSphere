from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.models import User

from .models import Team, TeamTask, TeamIssue, TeamFile
from .serializers import TeamSerializer, TeamTaskSerializer, TeamIssueSerializer, TeamFileSerializer


class TeamListView(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(members=self.request.user).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(members=self.request.user)


class TeamMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, team_id):
        try:
            team = Team.objects.get(id=team_id, created_by=request.user)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found or you are not the owner.'}, status=404)
        username = request.data.get('username', '').strip()
        if not username:
            return Response({'error': 'Username is required.'}, status=400)
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': f'User "{username}" not found.'}, status=404)
        team.members.add(user)
        return Response({'id': user.id, 'username': user.username})

    def delete(self, request, team_id):
        try:
            team = Team.objects.get(id=team_id, created_by=request.user)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found or you are not the owner.'}, status=404)
        user_id = request.data.get('user_id')
        team.members.remove(user_id)
        return Response(status=204)


class TeamTaskListView(generics.ListCreateAPIView):
    serializer_class = TeamTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TeamTask.objects.filter(team_id=self.kwargs['team_id'])

    def perform_create(self, serializer):
        serializer.save(team_id=self.kwargs['team_id'])


class TeamTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeamTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TeamTask.objects.filter(team_id=self.kwargs['team_id'])


class TeamIssueListView(generics.ListCreateAPIView):
    serializer_class = TeamIssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TeamIssue.objects.filter(team_id=self.kwargs['team_id'])

    def perform_create(self, serializer):
        serializer.save(team_id=self.kwargs['team_id'], reported_by=self.request.user)


class TeamIssueDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeamIssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TeamIssue.objects.filter(team_id=self.kwargs['team_id'])


class TeamFileListView(generics.ListCreateAPIView):
    serializer_class = TeamFileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return TeamFile.objects.filter(team_id=self.kwargs['team_id'])

    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        serializer.save(team_id=self.kwargs['team_id'], uploaded_by=self.request.user, filename=file.name if file else 'file')


class TeamFileDetailView(generics.DestroyAPIView):
    serializer_class = TeamFileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TeamFile.objects.filter(team_id=self.kwargs['team_id'])

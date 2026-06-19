from django.utils import timezone
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from django.contrib.auth.models import User
from .models import Project, Milestone, ProjectFile, Task, Issue
from .serializers import (
    ProjectSerializer, MilestoneSerializer,
    ProjectFileSerializer, TaskSerializer, IssueSerializer
)


class ProjectListView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Project.objects.filter(owner=self.request.user) | \
             Project.objects.filter(members=self.request.user)
        return qs.distinct().prefetch_related('milestones', 'members')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)


class MilestoneListView(generics.ListCreateAPIView):
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Milestone.objects.filter(project_id=self.kwargs['project_id'])

    def perform_create(self, serializer):
        serializer.save(project_id=self.kwargs['project_id'])


class MilestoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Milestone.objects.filter(project_id=self.kwargs['project_id'])

    def perform_update(self, serializer):
        instance = serializer.instance
        new_status = self.request.data.get('status')
        if new_status == 'completed' and instance.status != 'completed':
            serializer.save(completed_at=timezone.now())
        else:
            serializer.save()


class ProjectFileUploadView(generics.ListCreateAPIView):
    serializer_class = ProjectFileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return ProjectFile.objects.filter(project_id=self.kwargs['project_id'])

    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        filename = file.name if file else 'unknown'
        serializer.save(
            project_id=self.kwargs['project_id'],
            uploaded_by=self.request.user,
            filename=filename
        )


class TaskListView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(project_id=self.kwargs['project_id'])

    def perform_create(self, serializer):
        serializer.save(project_id=self.kwargs['project_id'])


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(project_id=self.kwargs['project_id'])


class IssueListView(generics.ListCreateAPIView):
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(project_id=self.kwargs['project_id'])

    def perform_create(self, serializer):
        serializer.save(
            project_id=self.kwargs['project_id'],
            reported_by=self.request.user
        )


class IssueDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(project_id=self.kwargs['project_id'])


class ProjectMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def get_project(self, project_id, user):
        from django.shortcuts import get_object_or_404
        return get_object_or_404(Project, id=project_id, owner=user)

    def post(self, request, project_id):
        project = self.get_project(project_id, request.user)
        username = request.data.get('username', '').strip()
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': f'User "{username}" not found.'}, status=status.HTTP_404_NOT_FOUND)
        if user == request.user:
            return Response({'error': 'You are already the owner.'}, status=status.HTTP_400_BAD_REQUEST)
        project.members.add(user)
        return Response({'id': user.id, 'username': user.username}, status=status.HTTP_200_OK)

    def delete(self, request, project_id):
        project = self.get_project(project_id, request.user)
        user_id = request.data.get('user_id')
        project.members.remove(user_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

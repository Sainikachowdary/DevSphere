from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project, Milestone, ProjectFile, Task, Issue, Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class MilestoneSerializer(serializers.ModelSerializer):
    files_count = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = Milestone
        fields = '__all__'
        read_only_fields = ['completed_at', 'project']

    def get_files_count(self, obj):
        return obj.files.count()

    def get_tasks_count(self, obj):
        return obj.tasks.count()


class ProjectFileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectFile
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'filename', 'project']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None


class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.username', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'


class IssueSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.username', read_only=True)
    assignee_name = serializers.CharField(source='assignee.username', read_only=True)

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ['reported_by']


class ProjectSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    members_data = serializers.SerializerMethodField()
    milestones = MilestoneSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()
    files_count = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    open_issues = serializers.SerializerMethodField()
    member_usernames = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = Project
        fields = [
            'id', 'owner_name', 'title', 'description', 'github_link',
            'demo_link', 'tech_stack', 'status', 'is_team_project',
            'thumbnail', 'members_data', 'milestones', 'progress',
            'files_count', 'tasks_count', 'open_issues',
            'member_usernames', 'created_at', 'updated_at'
        ]
        read_only_fields = ['owner_name']

    def get_members_data(self, obj):
        return [{'id': m.id, 'username': m.username} for m in obj.members.all()]

    def get_progress(self, obj):
        return obj.progress_percent()

    def get_files_count(self, obj):
        return obj.files.count()

    def get_tasks_count(self, obj):
        return obj.tasks.count()

    def get_open_issues(self, obj):
        return obj.issues.filter(status='open').count()

    def create(self, validated_data):
        member_usernames = validated_data.pop('member_usernames', [])
        project = Project.objects.create(**validated_data)
        for uname in member_usernames:
            try:
                project.members.add(User.objects.get(username=uname))
            except User.DoesNotExist:
                pass
        return project

    def update(self, instance, validated_data):
        member_usernames = validated_data.pop('member_usernames', None)
        instance = super().update(instance, validated_data)
        if member_usernames is not None:
            instance.members.clear()
            for uname in member_usernames:
                try:
                    instance.members.add(User.objects.get(username=uname))
                except User.DoesNotExist:
                    pass
        return instance

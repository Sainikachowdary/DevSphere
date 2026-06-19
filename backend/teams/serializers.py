from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Team, TeamTask, TeamIssue, TeamFile


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class TeamTaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.username', read_only=True)

    class Meta:
        model = TeamTask
        fields = '__all__'
        read_only_fields = ['team']


class TeamIssueSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.username', read_only=True)
    assignee_name = serializers.CharField(source='assignee.username', read_only=True)

    class Meta:
        model = TeamIssue
        fields = '__all__'
        read_only_fields = ['reported_by', 'team']


class TeamFileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = TeamFile
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'filename', 'team']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None


class TeamSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    members_data = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    member_usernames = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)

    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'created_by_name', 'members_data', 'tasks_count', 'member_usernames', 'created_at']
        read_only_fields = ['created_by_name']

    def get_members_data(self, obj):
        return [{'id': m.id, 'username': m.username} for m in obj.members.all()]

    def get_tasks_count(self, obj):
        return obj.tasks.count()

    def create(self, validated_data):
        member_usernames = validated_data.pop('member_usernames', [])
        creator = self.context['request'].user
        team = Team.objects.create(**validated_data)
        team.members.add(creator)
        for uname in member_usernames:
            try:
                user = User.objects.get(username=uname)
                if user != creator:
                    team.members.add(user)
            except User.DoesNotExist:
                pass
        return team

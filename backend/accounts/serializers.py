from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):
    college = serializers.CharField(write_only=True, required=False, default='')
    branch = serializers.CharField(write_only=True, required=False, default='')
    year = serializers.IntegerField(write_only=True, required=False, default=1)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'college', 'branch', 'year']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        college = validated_data.pop('college', '')
        branch = validated_data.pop('branch', '')
        year = validated_data.pop('year', 1)
        user = User.objects.create_user(**validated_data)
        Profile.objects.filter(user=user).update(college=college, branch=branch, year=year)
        return user


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'avatar', 'bio', 'college', 'branch',
            'year', 'github_username', 'linkedin_url', 'website', 'location',
            'skills', 'theme', 'portfolio_published', 'developer_score',
            'streak', 'followers_count', 'following_count', 'is_following', 'created_at'
        ]
        read_only_fields = ['developer_score', 'streak', 'created_at']

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return Profile.objects.filter(followers=obj.user).count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(id=request.user.id).exists()
        return False


class UserSearchSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

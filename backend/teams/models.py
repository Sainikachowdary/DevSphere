from django.db import models
from django.contrib.auth.models import User


class Team(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_teams')
    members = models.ManyToManyField(User, related_name='teams', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class TeamTask(models.Model):
    STATUS = [('pending','Pending'),('in_progress','In Progress'),('completed','Completed')]
    PRIORITY = [('low','Low'),('medium','Medium'),('high','High')]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY, default='medium')
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class TeamIssue(models.Model):
    STATUS = [('open','Open'),('in_progress','In Progress'),('closed','Closed')]
    PRIORITY = [('low','Low'),('medium','Medium'),('high','High')]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='issues')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_issues')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_team_issues')
    status = models.CharField(max_length=20, choices=STATUS, default='open')
    priority = models.CharField(max_length=10, choices=PRIORITY, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)


class TeamFile(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='files')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='team_files/')
    filename = models.CharField(max_length=255)
    note = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

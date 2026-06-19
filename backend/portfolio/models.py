from django.db import models
from django.contrib.auth.models import User


class Portfolio(models.Model):
    THEME_CHOICES = [
        ('minimal', 'Minimal'),
        ('developer', 'Developer'),
        ('creative', 'Creative'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='portfolio')
    slug = models.SlugField(max_length=100, unique=True)
    headline = models.CharField(max_length=200, blank=True)
    theme = models.CharField(max_length=20, choices=THEME_CHOICES, default='developer')
    is_published = models.BooleanField(default=False)
    show_projects = models.BooleanField(default=True)
    show_skills = models.BooleanField(default=True)
    show_certificates = models.BooleanField(default=True)
    show_experience = models.BooleanField(default=True)
    custom_css = models.TextField(blank=True)
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Portfolio"

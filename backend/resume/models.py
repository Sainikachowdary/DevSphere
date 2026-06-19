from django.db import models
from django.contrib.auth.models import User


class Certificate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200)
    issue_date = models.CharField(max_length=50, blank=True)
    credential_url = models.URLField(blank=True)
    file = models.FileField(upload_to='certificates/', blank=True, null=True)
    icon = models.CharField(max_length=10, default='🏆')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Experience(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='experiences')
    role = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    duration = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.role} at {self.company}"


class ResumeTemplate(models.Model):
    TEMPLATE_CHOICES = [
        ('classic',   'Classic Professional'),
        ('modern',    'Modern Creative'),
        ('minimal',   'Clean Minimal'),
        ('tech',      'Tech / Dev'),
        ('academic',  'Academic Style'),
        ('creative',  'Creative'),
        ('executive', 'Executive'),
        ('compact',   'Compact'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='resume_template')
    template_type = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, default='classic')
    color_scheme = models.CharField(max_length=20, default='blue')
    show_photo = models.BooleanField(default=False)
    show_skills_bar = models.BooleanField(default=True)
    show_projects = models.BooleanField(default=True)
    show_certifications = models.BooleanField(default=True)
    font_style = models.CharField(max_length=20, default='inter')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.template_type}"
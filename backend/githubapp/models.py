from django.db import models
from accounts.models import Profile


class Repository(models.Model):

    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    language = models.CharField(
        max_length=100,
        blank=True
    )

    stars = models.IntegerField(default=0)

    forks = models.IntegerField(default=0)

    github_url = models.URLField()

    def __str__(self):
        return self.name
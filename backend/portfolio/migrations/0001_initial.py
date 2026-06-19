from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Portfolio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField(max_length=100, unique=True)),
                ('headline', models.CharField(blank=True, max_length=200)),
                ('theme', models.CharField(
                    choices=[('minimal','Minimal'),('developer','Developer'),('creative','Creative')],
                    default='developer', max_length=20
                )),
                ('is_published', models.BooleanField(default=False)),
                ('show_projects', models.BooleanField(default=True)),
                ('show_skills', models.BooleanField(default=True)),
                ('show_certificates', models.BooleanField(default=True)),
                ('show_experience', models.BooleanField(default=True)),
                ('custom_css', models.TextField(blank=True)),
                ('views', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='portfolio', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]

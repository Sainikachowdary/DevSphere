from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Drop old Project model fields / relations and rebuild
        migrations.RemoveField(model_name='project', name='skills'),
        migrations.RemoveField(model_name='project', name='user'),
        migrations.AddField(
            model_name='project',
            name='owner',
            field=models.ForeignKey(
                default=1, on_delete=django.db.models.deletion.CASCADE,
                related_name='owned_projects', to=settings.AUTH_USER_MODEL
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='project',
            name='tech_stack',
            field=models.TextField(blank=True, help_text='Comma separated'),
        ),
        migrations.AddField(
            model_name='project',
            name='status',
            field=models.CharField(
                choices=[('planning','Planning'),('in_progress','In Progress'),('completed','Completed'),('on_hold','On Hold')],
                default='planning', max_length=20
            ),
        ),
        migrations.AddField(
            model_name='project',
            name='is_team_project',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='project',
            name='thumbnail',
            field=models.ImageField(blank=True, null=True, upload_to='project_thumbnails/'),
        ),
        migrations.AddField(
            model_name='project',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='project',
            name='members',
            field=models.ManyToManyField(blank=True, related_name='team_projects', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='project',
            name='description',
            field=models.TextField(blank=True),
        ),
        # Create Milestone
        migrations.CreateModel(
            name='Milestone',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('status', models.CharField(
                    choices=[('pending','Pending'),('in_progress','In Progress'),('completed','Completed')],
                    default='pending', max_length=20
                )),
                ('due_date', models.DateField(blank=True, null=True)),
                ('order', models.IntegerField(default=0)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='milestones', to='projects.project')),
            ],
            options={'ordering': ['order']},
        ),
        # Create ProjectFile
        migrations.CreateModel(
            name='ProjectFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='project_files/')),
                ('filename', models.CharField(max_length=255)),
                ('file_type', models.CharField(
                    choices=[('screenshot','Screenshot'),('document','Document'),('code','Code Archive'),('other','Other')],
                    default='other', max_length=20
                )),
                ('note', models.TextField(blank=True)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('milestone', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='files', to='projects.milestone')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='projects.project')),
                ('uploaded_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        # Create Task
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('status', models.CharField(
                    choices=[('pending','Pending'),('in_progress','In Progress'),('completed','Completed')],
                    default='pending', max_length=20
                )),
                ('priority', models.CharField(
                    choices=[('low','Low'),('medium','Medium'),('high','High')],
                    default='medium', max_length=10
                )),
                ('deadline', models.DateField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('assignee', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('milestone', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tasks', to='projects.milestone')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to='projects.project')),
            ],
        ),
        # Create Issue
        migrations.CreateModel(
            name='Issue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('status', models.CharField(
                    choices=[('open','Open'),('in_progress','In Progress'),('closed','Closed')],
                    default='open', max_length=20
                )),
                ('priority', models.CharField(
                    choices=[('low','Low'),('medium','Medium'),('high','High')],
                    default='medium', max_length=10
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('assignee', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_issues', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='issues', to='projects.project')),
                ('reported_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reported_issues', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]

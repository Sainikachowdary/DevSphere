from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import FileResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
import os

def serve_inline(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if not os.path.exists(file_path):
        from django.http import Http404
        raise Http404
    ext = os.path.splitext(file_path)[1].lower()
    content_types = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
    }
    content_type = content_types.get(ext, 'application/octet-stream')
    response = FileResponse(open(file_path, 'rb'), content_type=content_type)
    response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
    response['Access-Control-Allow-Origin'] = '*'
    response['X-Frame-Options'] = 'SAMEORIGIN'
    return response

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/github/', include('githubapp.urls')),
    path('api/login/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/projects/', include('projects.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/resume/', include('resume.urls')),
    path('api/portfolio/', include('portfolio.urls')),
    path('api/teams/', include('teams.urls')),
    re_path(r'^media/(?P<path>.*)$', serve_inline),
]

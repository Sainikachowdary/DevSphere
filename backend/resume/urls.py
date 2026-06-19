from django.urls import path
from .views import (
    ResumePDFView, ResumeTemplateView,
    CertificateListView, CertificateDetailView,
    ExperienceListView, ExperienceDetailView,
)

urlpatterns = [
    path('generate/', ResumePDFView.as_view()),
    path('template/', ResumeTemplateView.as_view()),
    path('certificates/', CertificateListView.as_view()),
    path('certificates/<int:pk>/', CertificateDetailView.as_view()),
    path('experience/', ExperienceListView.as_view()),
    path('experience/<int:pk>/', ExperienceDetailView.as_view()),
]

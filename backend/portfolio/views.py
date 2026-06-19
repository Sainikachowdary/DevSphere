from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User

from accounts.models import Profile
from projects.models import Project
from resume.models import Certificate, Experience
from .models import Portfolio
from .serializers import PortfolioSerializer, PublicPortfolioSerializer


class PortfolioView(generics.RetrieveUpdateAPIView):
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        portfolio, _ = Portfolio.objects.get_or_create(
            user=self.request.user,
            defaults={'slug': self.request.user.username.lower()}
        )
        return portfolio

    def patch(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PublicPortfolioView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            portfolio = Portfolio.objects.get(slug=slug, is_published=True)
        except Portfolio.DoesNotExist:
            return Response({'error': 'Portfolio not found or not published'}, status=404)

        portfolio.views += 1
        portfolio.save(update_fields=['views'])

        user = portfolio.user
        profile = Profile.objects.get(user=user)
        projects = Project.objects.filter(owner=user) if portfolio.show_projects else []
        certificates = Certificate.objects.filter(user=user) if portfolio.show_certificates else []
        experiences = Experience.objects.filter(user=user) if portfolio.show_experience else []

        from accounts.serializers import ProfileSerializer
        from projects.serializers import ProjectSerializer
        from resume.serializers import CertificateSerializer, ExperienceSerializer

        return Response({
            'portfolio': PortfolioSerializer(portfolio).data,
            'profile': ProfileSerializer(profile, context={'request': request}).data,
            'projects': ProjectSerializer(projects, many=True, context={'request': request}).data,
            'certificates': CertificateSerializer(certificates, many=True, context={'request': request}).data,
            'experiences': ExperienceSerializer(experiences, many=True).data,
        })

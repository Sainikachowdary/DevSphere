from django.urls import path
from .views import PortfolioView, PublicPortfolioView

urlpatterns = [
    path('', PortfolioView.as_view()),
    path('<slug:slug>/', PublicPortfolioView.as_view()),
]

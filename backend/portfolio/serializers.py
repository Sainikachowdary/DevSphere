from rest_framework import serializers
from .models import Portfolio


class PortfolioSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    public_url = serializers.SerializerMethodField()

    class Meta:
        model = Portfolio
        fields = '__all__'
        read_only_fields = ['user', 'views', 'created_at', 'updated_at']

    def get_public_url(self, obj):
        return f'/portfolio/{obj.slug}'


class PublicPortfolioSerializer(PortfolioSerializer):
    pass

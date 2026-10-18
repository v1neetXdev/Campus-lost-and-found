from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Item, Claim


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def create(self, data):
        return User.objects.create_user(**data)


class ItemSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source="reporter.username", read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = "__all__"
        read_only_fields = ("reporter", "status", "created_at")

    def get_is_owner(self, obj):
        req = self.context.get("request")
        return bool(req and req.user.is_authenticated and obj.reporter_id == req.user.id)


class ClaimSerializer(serializers.ModelSerializer):
    claimant_name = serializers.CharField(source="claimant.username", read_only=True)
    item_title = serializers.CharField(source="item.title", read_only=True)

    class Meta:
        model = Claim
        fields = ("id", "item", "item_title", "claimant_name", "message", "status", "created_at")
        read_only_fields = ("status",)

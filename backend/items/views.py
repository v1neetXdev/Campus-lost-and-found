from django.db.models import Q
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Claim, Item
from .serializers import ClaimSerializer, ItemSerializer, RegisterSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.method in permissions.SAFE_METHODS or obj.reporter == request.user


class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        qs = Item.objects.select_related("reporter")
        p = self.request.query_params
        if p.get("type"):
            qs = qs.filter(item_type=p["type"])
        if p.get("category"):
            qs = qs.filter(category=p["category"])
        if p.get("status"):
            qs = qs.filter(status=p["status"])
        if p.get("mine") and self.request.user.is_authenticated:
            qs = qs.filter(reporter=self.request.user)
        if p.get("q"):
            qs = qs.filter(Q(title__icontains=p["q"]) | Q(description__icontains=p["q"]) | Q(location__icontains=p["q"]))
        return qs

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        item = self.get_object()
        item.status = "resolved"
        item.save()
        return Response(self.get_serializer(item).data)


class ClaimViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = Claim.objects.filter(Q(claimant=u) | Q(item__reporter=u)).select_related("item", "claimant")
        if self.request.query_params.get("item"):
            qs = qs.filter(item_id=self.request.query_params["item"])
        return qs

    def perform_create(self, serializer):
        item = serializer.validated_data["item"]
        if item.reporter == self.request.user:
            raise ValidationError("You cannot claim your own post.")
        serializer.save(claimant=self.request.user)

    @action(detail=True, methods=["post"])
    def decide(self, request, pk=None):
        claim = self.get_object()
        if claim.item.reporter != request.user:
            return Response({"detail": "Only the poster can decide."}, status=403)
        decision = request.data.get("decision")
        if decision not in ("approved", "rejected"):
            raise ValidationError("decision must be approved or rejected")
        claim.status = decision
        claim.save()
        if decision == "approved":
            claim.item.status = "claimed"
            claim.item.save()
        return Response(ClaimSerializer(claim).data)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register(request):
    s = RegisterSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    user = s.save()
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username}, status=status.HTTP_201_CREATED)

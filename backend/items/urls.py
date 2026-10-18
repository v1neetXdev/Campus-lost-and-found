from django.urls import include, path
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("items", views.ItemViewSet, basename="item")
router.register("claims", views.ClaimViewSet, basename="claim")

urlpatterns = [
    path("auth/register/", views.register),
    path("auth/login/", ObtainAuthToken.as_view()),
    path("", include(router.urls)),
]

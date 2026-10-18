from django.conf import settings
from django.db import models


class Item(models.Model):
    TYPES = [("lost", "Lost"), ("found", "Found")]
    CATEGORIES = [("electronics", "Electronics"), ("documents", "Documents / ID"),
                  ("books", "Books"), ("clothing", "Clothing"), ("accessories", "Accessories"),
                  ("keys", "Keys"), ("other", "Other")]
    STATUS = [("open", "Open"), ("claimed", "Claimed"), ("resolved", "Resolved")]

    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    item_type = models.CharField(max_length=10, choices=TYPES)
    category = models.CharField(max_length=20, choices=CATEGORIES, default="other")
    location = models.CharField(max_length=150)
    date = models.DateField()
    image = models.ImageField(upload_to="items/", blank=True, null=True)
    contact = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=10, choices=STATUS, default="open")
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="items")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.item_type}] {self.title}"


class Claim(models.Model):
    STATUS = [("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")]
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="claims")
    claimant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="claims")
    message = models.TextField(help_text="Proof / identifying details")
    status = models.CharField(max_length=10, choices=STATUS, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

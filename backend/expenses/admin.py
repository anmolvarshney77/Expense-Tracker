from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ["amount", "currency", "category", "date", "merchant", "created_at"]
    list_filter = ["category", "currency"]
    search_fields = ["description", "merchant"]

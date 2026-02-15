from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, coerce_to_string=True
    )
    currency = serializers.ChoiceField(choices=Expense.CURRENCY_CHOICES)

    class Meta:
        model = Expense
        fields = [
            "id",
            "amount",
            "currency",
            "category",
            "date",
            "description",
            "merchant",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

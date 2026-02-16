from decimal import Decimal
from datetime import date, datetime

from rest_framework import serializers
from .models import Expense


def _to_json_value(val):
    """Ensure value is JSON-serializable (avoids 500 with PostgreSQL timezone-aware datetimes, etc.)."""
    if val is None:
        return None
    if isinstance(val, (datetime, date)):
        return val.isoformat()
    if isinstance(val, Decimal):
        return str(val)
    return val


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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {k: _to_json_value(v) for k, v in data.items()}

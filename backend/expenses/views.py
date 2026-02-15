from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Expense
from .serializers import ExpenseSerializer
from .services import get_exchange_rate


@method_decorator(csrf_exempt, name="dispatch")
class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        """Aggregates for dashboard. Optional ?to_currency=USD returns all amounts converted to that currency."""
        to_currency = (request.query_params.get("to_currency") or "").strip().upper()[:3]
        qs = Expense.objects.all()

        by_category_currency = (
            qs.values("category", "currency")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("category", "-total")
        )
        by_month_currency = (
            qs.annotate(month=TruncMonth("date"))
            .values("month", "currency")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("month", "currency")
        )

        if to_currency:
            cat_curr_list = list(by_category_currency)
            month_curr_list = list(by_month_currency)
            currencies = list({r["currency"] for r in cat_curr_list} | {r["currency"] for r in month_curr_list})
            rates = {}
            for c in currencies:
                if c == to_currency:
                    rates[c] = 1.0
                else:
                    res = get_exchange_rate(c, to_currency)
                    rates[c] = float(res["rate"]) if res else 1.0

            cat_converted = {}
            for r in cat_curr_list:
                key = r["category"]
                rate = rates.get(r["currency"], 1.0)
                converted = float(r["total"] or 0) * rate
                if key not in cat_converted:
                    cat_converted[key] = {"total": 0.0, "count": 0}
                cat_converted[key]["total"] += converted
                cat_converted[key]["count"] += r["count"]

            month_converted = {}
            for r in month_curr_list:
                key = str(r["month"])
                rate = rates.get(r["currency"], 1.0)
                converted = float(r["total"] or 0) * rate
                if key not in month_converted:
                    month_converted[key] = {"total": 0.0, "count": 0}
                month_converted[key]["total"] += converted
                month_converted[key]["count"] += r["count"]

            by_category = [
                {"category": k, "total": v["total"], "count": v["count"]}
                for k, v in sorted(cat_converted.items(), key=lambda x: -x[1]["total"])
            ]
            by_month = [
                {"month": k, "total": v["total"], "count": v["count"]}
                for k, v in sorted(month_converted.items(), key=lambda x: x[0])
            ]
            grand_total = sum(v["total"] for v in cat_converted.values())
            total_count = sum(v["count"] for v in cat_converted.values())
            totals = {
                "total": grand_total,
                "count": total_count,
                "average": grand_total / total_count if total_count else 0,
            }
            return Response({
                "by_category": by_category,
                "by_month": by_month,
                "totals": totals,
                "display_currency": to_currency,
            })

        by_category = (
            qs.values("category")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("-total")
        )
        by_month = (
            qs.annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("month")
        )
        by_currency = (
            qs.values("currency")
            .annotate(total=Sum("amount"), count=Count("id"), average=Avg("amount"))
            .order_by("-total")
        )
        totals = qs.aggregate(
            total=Sum("amount"),
            count=Count("id"),
            average=Avg("amount"),
        )
        return Response({
            "by_category": [
                {"category": c["category"], "total": float(c["total"] or 0), "count": c["count"]}
                for c in by_category
            ],
            "by_month": [
                {"month": str(m["month"]), "total": float(m["total"] or 0), "count": m["count"]}
                for m in by_month
            ],
            "by_currency": [
                {
                    "currency": c["currency"],
                    "total": float(c["total"] or 0),
                    "count": c["count"],
                    "average": float(c["average"] or 0),
                }
                for c in by_currency
            ],
            "by_category_currency": [
                {
                    "category": r["category"],
                    "currency": r["currency"],
                    "total": float(r["total"] or 0),
                    "count": r["count"],
                }
                for r in by_category_currency
            ],
            "by_month_currency": [
                {
                    "month": str(r["month"]),
                    "currency": r["currency"],
                    "total": float(r["total"] or 0),
                    "count": r["count"],
                }
                for r in by_month_currency
            ],
            "totals": {
                "total": float(totals["total"] or 0),
                "count": totals["count"] or 0,
                "average": float(totals["average"] or 0),
            },
        })


from rest_framework.views import APIView


@method_decorator(csrf_exempt, name="dispatch")
class RatesView(APIView):
    def get(self, request):
        from_cur = request.query_params.get("from", "USD")
        to_cur = request.query_params.get("to", "EUR")
        result = get_exchange_rate(from_cur, to_cur)
        if result is None:
            return Response(
                {"error": "Could not fetch exchange rate"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return Response(result)

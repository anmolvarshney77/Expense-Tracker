"""
Third-party API integration: Frankfurter exchange rates.
"""
from typing import Optional
import requests

FRANKFURTER_BASE = "https://api.frankfurter.app"


def get_exchange_rate(from_currency: str, to_currency: str) -> Optional[dict]:
    """
    Fetch latest exchange rate from Frankfurter API.
    Returns {"rate": float, "from": str, "to": str} or None on error.
    """
    from_currency = (from_currency or "USD").upper()[:3]
    to_currency = (to_currency or "USD").upper()[:3]
    if from_currency == to_currency:
        return {"rate": 1.0, "from": from_currency, "to": to_currency}
    try:
        r = requests.get(
            f"{FRANKFURTER_BASE}/latest",
            params={"from": from_currency, "to": to_currency},
            timeout=5,
        )
        r.raise_for_status()
        data = r.json()
        rate = float(data.get("rates", {}).get(to_currency, 0))
        return {"rate": rate, "from": from_currency, "to": to_currency}
    except Exception:
        return None

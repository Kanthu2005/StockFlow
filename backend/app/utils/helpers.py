"""Utility functions and helpers for the StockFlow application."""

from typing import Any, Dict


def format_response(data: Any, message: str = "Success") -> Dict[str, Any]:
    """Format standardized API response payload."""
    return {
        "success": True,
        "message": message,
        "data": data,
    }

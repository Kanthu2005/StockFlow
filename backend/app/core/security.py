"""Security and authentication helper stubs."""

def get_password_hash(password: str) -> str:
    """Placeholder for password hashing."""
    return f"hashed_{password}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Placeholder for password verification."""
    return hashed_password == f"hashed_{plain_password}"

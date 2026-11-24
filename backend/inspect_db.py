"""Helper script to inspect StockFlow database tables and data.

Usage:
    python inspect_db.py              # Shows summary of all tables and row counts
    python inspect_db.py products     # Shows data in the products table
    python inspect_db.py users        # Shows data in the users table
    python inspect_db.py organizations# Shows data in the organizations table
"""

import sys
import logging
from sqlalchemy import text
from app.database.session import SessionLocal

# Suppress noisy SQL engine log lines for clean table presentation
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def print_table(title, rows, columns):
    print(f"\n=== {title} ({len(rows)} rows) ===")
    if not rows:
        print("  (Table is empty)")
        return

    # Calculate column widths
    widths = {col: len(col) for col in columns}
    for row in rows:
        for col in columns:
            val = str(row.get(col, ""))
            if len(val) > widths[col]:
                widths[col] = min(max(widths[col], len(val)), 40)

    header = " | ".join(col.ljust(widths[col]) for col in columns)
    separator = "-+-".join("-" * widths[col] for col in columns)
    print(header)
    print(separator)

    for row in rows:
        line = []
        for col in columns:
            val = str(row.get(col, ""))
            if len(val) > 40:
                val = val[:37] + "..."
            line.append(val.ljust(widths[col]))
        print(" | ".join(line))


def inspect_database():
    target_table = sys.argv[1].lower() if len(sys.argv) > 1 else None
    tables = ["organizations", "users", "products", "alembic_version"]

    with SessionLocal() as db:
        if target_table:
            if target_table not in tables:
                print(f"Unknown table '{target_table}'. Available tables: {', '.join(tables)}")
                return
            result = db.execute(text(f"SELECT * FROM {target_table} ORDER BY 1 LIMIT 50"))
            columns = list(result.keys())
            rows = [dict(zip(columns, row)) for row in result.fetchall()]
            # Hide password hashes for security
            if target_table == "users" and "hashed_password" in columns:
                for r in rows:
                    r["hashed_password"] = r["hashed_password"][:15] + "..."
            print_table(target_table.upper(), rows, columns)
        else:
            print("\n" + "=" * 60)
            print("STOCKFLOW DATABASE OVERVIEW (stockflow_db)")
            print("=" * 60)
            for tbl in tables:
                cnt = db.execute(text(f"SELECT COUNT(*) FROM {tbl}")).scalar()
                print(f" Table: {tbl.ljust(20)} Total Rows: {cnt}")

            print("\nPreviewing first 5 rows of each table:")
            for tbl in ["organizations", "users", "products"]:
                result = db.execute(text(f"SELECT * FROM {tbl} ORDER BY 1 LIMIT 5"))
                columns = list(result.keys())
                rows = [dict(zip(columns, row)) for row in result.fetchall()]
                if tbl == "users" and "hashed_password" in columns:
                    for r in rows:
                        r["hashed_password"] = r["hashed_password"][:15] + "..."
                print_table(tbl.upper(), rows, columns)

            print("\nTip: Run `python inspect_db.py <table_name>` to view specific tables.")


if __name__ == "__main__":
    inspect_database()

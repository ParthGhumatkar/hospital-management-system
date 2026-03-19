import psycopg2
from psycopg2.extras import RealDictCursor

SOURCE_URL = "postgresql://neondb_owner:npg_vW3OHeLNbE7A@ep-nameless-surf-a1smlgfq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DEST_URL   = "postgresql://neondb_owner:npg_f5LkVv3RNUrx@ep-autumn-moon-a1o9rmsg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Order matters for INSERT (FK dependencies)
TABLES = [
    "doctors",
    "hod",
    "receptionists",
    "pharmacists",
    "beds",
    "patients",
    "patient_accounts",
    "medicines",
    "appointments",
    "patient_medicines",
    "patient_vitals",
    "doctor_performance",
    "medicine_orders",
]

def migrate():
    print("Connecting to source (dad's DB)...")
    src = psycopg2.connect(SOURCE_URL)
    src_cur = src.cursor(cursor_factory=RealDictCursor)

    print("Connecting to destination (your DB)...")
    dst = psycopg2.connect(DEST_URL)
    dst_cur = dst.cursor()

    # Step 1: Truncate ALL tables at once with CASCADE (handles FK order automatically)
    print("\n→ Clearing destination tables with TRUNCATE CASCADE...")
    tables_str = ", ".join(TABLES)
    dst_cur.execute(f"TRUNCATE {tables_str} RESTART IDENTITY CASCADE")
    print("  ✅ All tables cleared and sequences reset")

    # Step 2: Insert data in FK-safe order
    for table in TABLES:
        print(f"\n→ Migrating `{table}`...")

        src_cur.execute(f"SELECT * FROM {table}")
        rows = src_cur.fetchall()

        if not rows:
            print(f"  ⚠ No data in `{table}`, skipping.")
            continue

        columns = list(rows[0].keys())
        col_str = ", ".join(columns)
        placeholders = ", ".join(["%s"] * len(columns))
        insert_sql = f"INSERT INTO {table} ({col_str}) VALUES ({placeholders})"

        values = [tuple(row[col] for col in columns) for row in rows]
        dst_cur.executemany(insert_sql, values)
        print(f"  ✅ {len(rows)} rows inserted into `{table}`")

    # Step 3: Fix sequences to match max ids from source
    print("\n→ Fixing sequences...")
    for table in TABLES:
        try:
            dst_cur.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), (SELECT MAX(id) FROM {table}))")
            print(f"  ✅ Sequence reset for `{table}`")
        except Exception as e:
            print(f"  ⚠ Skipping sequence for `{table}`: {e}")
            dst.rollback()

    dst.commit()
    src.close()
    dst.close()
    print("\n🎉 Migration complete! All tables correctly copied to your Neon DB.")

if __name__ == "__main__":
    migrate()

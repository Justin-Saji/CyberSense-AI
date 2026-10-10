from sqlalchemy import inspect
from app import app, db

with app.app_context():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()

    print("\nConnected database:", db.engine.url.database)
    print("\nTables visible to Flask:")

    for table in sorted(tables):
        print("-", table)

    print(f"\nTotal tables found: {len(tables)}")
from sqlalchemy import text
from app import app, db

with app.app_context():
    with db.engine.connect() as connection:
        result = connection.execute(
            text("SELECT DATABASE(), VERSION()")
        )
        print(result.fetchone())
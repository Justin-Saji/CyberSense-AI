"""
Database Migration Script for Admin Module
This script adds the role field to the users table and creates admin-specific tables.
Run this script to update your database schema.
"""

import os
import sys
from datetime import datetime

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User
from sqlalchemy import text

def migrate():
    """Run the database migration"""
    with app.app_context():
        print("Starting database migration...")
        
        # Add role, is_active, and last_login columns to users table
        print("\n1. Adding role, is_active, and last_login columns to users table...")
        try:
            # Check if columns exist
            inspector = db.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('users')]
            
            if 'role' not in columns:
                db.session.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL"))
                print("   - Added 'role' column")
            else:
                print("   - 'role' column already exists")
            
            if 'is_active' not in columns:
                db.session.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL"))
                print("   - Added 'is_active' column")
            else:
                print("   - 'is_active' column already exists")
            
            if 'last_login' not in columns:
                db.session.execute(text("ALTER TABLE users ADD COLUMN last_login DATETIME"))
                print("   - Added 'last_login' column")
            else:
                print("   - 'last_login' column already exists")
            
            db.session.commit()
        except Exception as e:
            print(f"   Error adding columns to users table: {e}")
            db.session.rollback()
        
        # Create admin-specific tables
        print("\n2. Creating admin-specific tables...")
        
        # Create audit_logs table
        print("   - Creating audit_logs table...")
        try:
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    admin_id INTEGER NOT NULL,
                    action VARCHAR(100) NOT NULL,
                    target_type VARCHAR(50),
                    target_id INTEGER,
                    details TEXT,
                    ip_address VARCHAR(45),
                    user_agent VARCHAR(255),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (admin_id) REFERENCES users (id)
                )
            """))
            db.session.commit()
            print("     audit_logs table created successfully")
        except Exception as e:
            print(f"     Error creating audit_logs table: {e}")
            db.session.rollback()
        
        # Create system_logs table
        print("   - Creating system_logs table...")
        try:
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS system_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level VARCHAR(20) NOT NULL,
                    module VARCHAR(50),
                    message TEXT NOT NULL,
                    details TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            db.session.commit()
            print("     system_logs table created successfully")
        except Exception as e:
            print(f"     Error creating system_logs table: {e}")
            db.session.rollback()
        
        # Create feedback table
        print("   - Creating feedback table...")
        try:
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    name VARCHAR(100),
                    email VARCHAR(120),
                    subject VARCHAR(200) NOT NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    is_archived BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """))
            db.session.commit()
            print("     feedback table created successfully")
        except Exception as e:
            print(f"     Error creating feedback table: {e}")
            db.session.rollback()
        
        # Create system_settings table
        print("   - Creating system_settings table...")
        try:
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS system_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key VARCHAR(100) UNIQUE NOT NULL,
                    value TEXT,
                    category VARCHAR(50) NOT NULL,
                    description VARCHAR(255),
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            db.session.commit()
            print("     system_settings table created successfully")
        except Exception as e:
            print(f"     Error creating system_settings table: {e}")
            db.session.rollback()
        
        # Create ai_models table
        print("   - Creating ai_models table...")
        try:
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS ai_models (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL,
                    module VARCHAR(50) NOT NULL,
                    version VARCHAR(50),
                    is_enabled BOOLEAN DEFAULT TRUE,
                    accuracy FLOAT,
                    predictions_count INTEGER DEFAULT 0,
                    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                    error_logs TEXT
                )
            """))
            db.session.commit()
            print("     ai_models table created successfully")
        except Exception as e:
            print(f"     Error creating ai_models table: {e}")
            db.session.rollback()
        
        # Create admin_notifications table
        print("   - Creating admin_notifications table...")
        try:
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS admin_notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type VARCHAR(50) NOT NULL,
                    title VARCHAR(200) NOT NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    priority VARCHAR(20) DEFAULT 'medium',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            db.session.commit()
            print("     admin_notifications table created successfully")
        except Exception as e:
            print(f"     Error creating admin_notifications table: {e}")
            db.session.rollback()
        
        # Insert default AI models
        print("\n3. Inserting default AI models...")
        try:
            existing_models = db.session.execute(text("SELECT COUNT(*) FROM ai_models")).scalar()
            if existing_models == 0:
                db.session.execute(text("""
                    INSERT INTO ai_models (name, module, version, is_enabled, accuracy, predictions_count)
                    VALUES 
                    ('SMS Phishing Detector', 'sms', '1.0.0', TRUE, 85.5, 0),
                    ('Email Phishing Detector', 'email', '1.0.0', TRUE, 88.2, 0),
                    ('Malicious URL Scanner', 'url', '1.0.0', TRUE, 82.7, 0),
                    ('Authentication Behavior Analyzer', 'auth_behavior', '1.0.0', TRUE, 79.3, 0),
                    ('Behavior Drift Detector', 'behavior_drift', '1.0.0', TRUE, 76.8, 0),
                    ('Risk Prediction Model', 'risk_prediction', '1.0.0', TRUE, 81.5, 0),
                    ('Explainable AI Engine', 'xai', '1.0.0', TRUE, 90.0, 0),
                    ('AI Cyber Coach', 'coaching', '1.0.0', TRUE, 87.4, 0)
                """))
                db.session.commit()
                print("   - Default AI models inserted successfully")
            else:
                print("   - AI models already exist, skipping insertion")
        except Exception as e:
            print(f"   Error inserting default AI models: {e}")
            db.session.rollback()
        
        # Insert default system settings
        print("\n4. Inserting default system settings...")
        try:
            existing_settings = db.session.execute(text("SELECT COUNT(*) FROM system_settings")).scalar()
            if existing_settings == 0:
                db.session.execute(text("""
                    INSERT INTO system_settings (key, value, category, description)
                    VALUES 
                    ('website_name', 'CyberSense AI', 'application', 'Website name'),
                    ('contact_email', 'admin@cybersense.ai', 'application', 'Contact email'),
                    ('jwt_expiry_hours', '24', 'security', 'JWT token expiry in hours'),
                    ('session_timeout_minutes', '60', 'security', 'Session timeout in minutes'),
                    ('max_login_attempts', '5', 'security', 'Maximum login attempts before lockout'),
                    ('password_min_length', '8', 'security', 'Minimum password length'),
                    ('enable_google_oauth', 'true', 'security', 'Enable Google OAuth'),
                    ('ai_confidence_threshold', '0.7', 'ai', 'AI confidence threshold'),
                    ('behavior_risk_threshold', '0.6', 'ai', 'Behavior risk threshold'),
                    ('enable_explainable_ai', 'true', 'ai', 'Enable explainable AI features')
                """))
                db.session.commit()
                print("   - Default system settings inserted successfully")
            else:
                print("   - System settings already exist, skipping insertion")
        except Exception as e:
            print(f"   Error inserting default system settings: {e}")
            db.session.rollback()
        
        print("\n✅ Migration completed successfully!")
        print("\nNext steps:")
        print("1. Create an admin user by running: python create_admin.py")
        print("2. Start the Flask server: python app.py")
        print("3. Access the admin panel at: http://localhost:5173/admin")

if __name__ == "__main__":
    migrate()

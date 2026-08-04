"""
Create Admin User Script
This script creates an initial admin user for the CyberSense AI Admin Module.
Run this script after running the migration script to create your first admin account.
"""

import os
import sys
import getpass

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User, bcrypt

def create_admin_user():
    """Create an admin user"""
    with app.app_context():
        print("=" * 60)
        print("CyberSense AI - Admin User Creation")
        print("=" * 60)
        
        # Get admin user details
        print("\nPlease enter the admin user details:")
        name = input("Full Name: ").strip()
        
        while not name or len(name) < 3:
            print("Name must be at least 3 characters.")
            name = input("Full Name: ").strip()
        
        email = input("Email: ").strip().lower()
        
        # Simple email validation
        while '@' not in email or '.' not in email.split('@')[1]:
            print("Please enter a valid email address.")
            email = input("Email: ").strip().lower()
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"\n⚠️  A user with email '{email}' already exists.")
            if existing_user.role == 'admin':
                print("   This user is already an admin.")
                choice = input("Do you want to update their password? (y/n): ").strip().lower()
                if choice == 'y':
                    password = getpass.getpass("New Password: ")
                    while len(password) < 8:
                        print("Password must be at least 8 characters.")
                        password = getpass.getpass("New Password: ")
                    
                    existing_user.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
                    db.session.commit()
                    print("\n✅ Admin password updated successfully!")
                    print(f"   Email: {email}")
                    print(f"   Name: {existing_user.name}")
                else:
                    print("No changes made.")
            else:
                print("   This user exists but is not an admin.")
                choice = input("Do you want to promote them to admin? (y/n): ").strip().lower()
                if choice == 'y':
                    password = getpass.getpass("New Password (leave blank to keep existing): ")
                    if password:
                        existing_user.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
                    
                    existing_user.role = 'admin'
                    db.session.commit()
                    print("\n✅ User promoted to admin successfully!")
                    print(f"   Email: {email}")
                    print(f"   Name: {existing_user.name}")
                else:
                    print("No changes made.")
            return
        
        password = getpass.getpass("Password: ")
        while len(password) < 8:
            print("Password must be at least 8 characters.")
            password = getpass.getpass("Password: ")
        
        confirm_password = getpass.getpass("Confirm Password: ")
        while password != confirm_password:
            print("Passwords do not match. Please try again.")
            password = getpass.getpass("Password: ")
            while len(password) < 8:
                print("Password must be at least 8 characters.")
                password = getpass.getpass("Password: ")
            confirm_password = getpass.getpass("Confirm Password: ")
        
        # Create admin user
        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        admin_user = User(
            name=name,
            email=email,
            password_hash=hashed_password,
            role='admin',
            is_active=True,
            avatar=f"https://api.dicebear.com/7.x/bottts/svg?seed={email}"
        )
        
        db.session.add(admin_user)
        db.session.commit()
        
        print("\n" + "=" * 60)
        print("✅ Admin user created successfully!")
        print("=" * 60)
        print(f"   Name: {name}")
        print(f"   Email: {email}")
        print(f"   Role: admin")
        print("\nYou can now log in to the admin panel using these credentials.")
        print("Admin Login URL: http://localhost:5173/admin/login")
        print("=" * 60)

if __name__ == "__main__":
    try:
        create_admin_user()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error creating admin user: {e}")
        sys.exit(1)

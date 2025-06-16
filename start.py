#!/usr/bin/env python3
"""
AI Trading Platform Startup Script
This script starts both the backend Flask server and frontend React development server.
"""

import os
import sys
import subprocess
import time
import signal
import threading
from pathlib import Path

def run_backend():
    """Start the Flask backend server"""
    print("🚀 Starting Flask backend server...")
    os.chdir("backend")
    
    # Install Python dependencies if requirements.txt exists
    if os.path.exists("requirements.txt"):
        print("📦 Installing Python dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
    
    # Start Flask server
    subprocess.run([sys.executable, "app.py"])

def run_frontend():
    """Start the React frontend development server"""
    print("🌐 Starting React frontend server...")
    os.chdir("frontend")
    
    # Install Node.js dependencies if package.json exists
    if os.path.exists("package.json"):
        print("📦 Installing Node.js dependencies...")
        subprocess.run(["npm", "install"], check=True)
    
    # Start React development server
    subprocess.run(["npm", "start"])

def main():
    """Main function to start both servers"""
    print("🤖 AI Trading Platform")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("backend") or not os.path.exists("frontend"):
        print("❌ Error: Please run this script from the project root directory")
        print("   Make sure 'backend' and 'frontend' directories exist")
        sys.exit(1)
    
    # Store original directory
    original_dir = os.getcwd()
    
    try:
        # Start backend in a separate thread
        backend_thread = threading.Thread(target=run_backend, daemon=True)
        backend_thread.start()
        
        # Wait a moment for backend to start
        time.sleep(3)
        
        # Start frontend
        run_frontend()
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        # Return to original directory
        os.chdir(original_dir)

if __name__ == "__main__":
    main() 
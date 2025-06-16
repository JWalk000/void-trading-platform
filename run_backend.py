#!/usr/bin/env python3
"""
Simple backend startup script for AI Trading Platform
"""

import os
import sys
import subprocess

def main():
    print("🤖 Starting AI Trading Platform Backend...")
    
    # Change to backend directory
    os.chdir("backend")
    
    # Install dependencies
    print("📦 Installing Python dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
    
    # Start Flask server
    print("🚀 Starting Flask server...")
    subprocess.run([sys.executable, "app.py"])

if __name__ == "__main__":
    main() 
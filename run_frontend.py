#!/usr/bin/env python3
"""
Simple frontend startup script for AI Trading Platform
"""

import os
import subprocess

def main():
    print("🌐 Starting AI Trading Platform Frontend...")
    
    # Change to frontend directory
    os.chdir("frontend")
    
    # Install dependencies
    print("📦 Installing Node.js dependencies...")
    subprocess.run(["npm", "install"], check=True)
    
    # Start React development server
    print("🚀 Starting React development server...")
    subprocess.run(["npm", "start"])

if __name__ == "__main__":
    main() 
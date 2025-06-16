# PowerShell script to start the frontend development server
# This script will automatically open the browser

# Set environment variable to open browser automatically
$env:BROWSER = "chrome"

# Navigate to frontend directory
Set-Location -Path "frontend"

# Start the development server
Write-Host "Starting React development server..." -ForegroundColor Green
Write-Host "The browser should open automatically to http://localhost:3000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan

npm start 
$ErrorActionPreference = "Stop"

Write-Host "Starting test..."

# 1. Start the server in the background (we will just test if it's up, assuming it's running)
# Let's seed the db first
Write-Host "Seeding Master Admin..."
node seed.js

Write-Host "Testing Master Admin Login..."
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"master","password":"masterpassword"}'
$masterToken = $loginResponse.token
Write-Host "Master Login Successful. Token: $masterToken"

Write-Host "Creating Sub-Admin..."
$subAdminBody = @{
    username = "subadmin1"
    password = "subpassword"
    role = "sub_admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/create" -Method Post -Headers @{Authorization="Bearer $masterToken"} -ContentType "application/json" -Body $subAdminBody
Write-Host "Sub-Admin created successfully."

Write-Host "Testing Sub-Admin Login..."
$subLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"subadmin1","password":"subpassword"}'
$subToken = $subLogin.token
Write-Host "Sub-Admin Login Successful. Token: $subToken"

Write-Host "Adding Technician..."
$techBody = @{
    name = "Tech John"
    compensationType = "percentage"
    compensationValue = 40
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/technicians/add" -Method Post -Headers @{Authorization="Bearer $subToken"} -ContentType "application/json" -Body $techBody
Write-Host "Technician added successfully."

Write-Host "Creating Accountant..."
$accBody = @{
    username = "accountant1"
    password = "accpassword"
    role = "accountant"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/create" -Method Post -Headers @{Authorization="Bearer $masterToken"} -ContentType "application/json" -Body $accBody
Write-Host "Accountant created successfully."

Write-Host "Testing Accountant Login..."
$accLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"accountant1","password":"accpassword"}'
$accToken = $accLogin.token
Write-Host "Accountant Login Successful. Token: $accToken"

Write-Host "Fetching Metrics as Accountant..."
$metrics = Invoke-RestMethod -Uri "http://localhost:5000/api/accountant/metrics" -Method Get -Headers @{Authorization="Bearer $accToken"}
Write-Host "Metrics Fetched:"
$metrics | Out-String | Write-Host

Write-Host "All tests passed successfully!"

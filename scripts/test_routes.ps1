$endpoints = @(
  "http://localhost:3000/",
  "http://localhost:3000/dashboard",
  "http://localhost:3000/landing",
  "http://localhost:3000/admin/teams",
  "http://localhost:3000/admin/employees",
  "http://localhost:3000/admin/reviews",
  "http://localhost:3000/admin/deliveries",
  "http://localhost:3000/reports",
  "http://localhost:3000/updates",
  "http://localhost:3000/tasks",
  "http://localhost:3000/notifications",
  "http://localhost:3000/api/health",
  "http://localhost:3000/api/teams",
  "http://localhost:3000/api/projects",
  "http://localhost:3000/api/reviews",
  "http://localhost:3000/api/deliveries"
)

foreach ($url in $endpoints) {
  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15
    Write-Host "$($response.StatusCode) : $url"
  } catch {
    Write-Host "FAILED : $url : $($_.Exception.Message)"
  }
}

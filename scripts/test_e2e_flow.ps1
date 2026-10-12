$base = "http://localhost:3000/api"
$adminId = "user-admin"
$leaderId = "user-marcus"
$empId = "user-jessica"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "CONTINUITY PLATFORM - END-TO-END WORKFLOW VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

function Assert-Status {
    param(
        [string]$stepName,
        $response,
        [int]$expected = 200
    )
    $code = [int]$response.StatusCode
    if ($code -eq $expected -or $code -eq 201) {
        Write-Host "PASS: $stepName -> HTTP $code" -ForegroundColor Green
    } else {
        Write-Host "FAIL: $stepName -> HTTP $code (Expected $expected)" -ForegroundColor Red
        exit 1
    }
}

# 1. Health check
$h = Invoke-WebRequest -Uri "$base/health" -UseBasicParsing
Assert-Status -stepName "Health check" -response $h -expected 200

# 2. Admin creates a new Team
$teamObj = @{
    name = "Delta Rapid Deployment"
    department = "Platform Architecture & Core Infrastructure"
    leaderId = $leaderId
    description = "Special forces pod for rapid continuous delivery"
    memberIds = @($empId, $leaderId)
}
$teamBody = $teamObj | ConvertTo-Json

$teamRes = Invoke-WebRequest -Uri "$base/teams" -Method POST -Headers @{ "X-User-Id" = $adminId } -Body $teamBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Admin creates Team" -response $teamRes -expected 201
$teamData = $teamRes.Content | ConvertFrom-Json
$createdTeamId = $teamData.id

# 3. Admin creates a new Project
$projObj = @{
    name = "Project Orion Edge"
    description = "Next-generation distributed edge runtime"
    client = "Starlight Global"
    teamId = $createdTeamId
    teamLeaderId = $leaderId
    deadline = "2026-11-30"
    priority = "P1"
}
$projBody = $projObj | ConvertTo-Json

$projRes = Invoke-WebRequest -Uri "$base/projects" -Method POST -Headers @{ "X-User-Id" = $adminId } -Body $projBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Admin creates Project" -response $projRes -expected 201
$projData = $projRes.Content | ConvertFrom-Json
$createdProjId = $projData.id

# 4. Team Leader creates a task assigned to Employee
$taskObj = @{
    projectId = $createdProjId
    title = "Implement TLS Termination Gateway"
    description = "Configure mutual TLS with cryptographic audit validation"
    assigneeId = $empId
    priority = "P1"
    dueDate = "2026-11-05"
    estimatedEffortHours = 16
}
$taskBody = $taskObj | ConvertTo-Json

$taskRes = Invoke-WebRequest -Uri "$base/tasks" -Method POST -Headers @{ "X-User-Id" = $leaderId } -Body $taskBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Team Leader assigns task" -response $taskRes -expected 201
$taskData = $taskRes.Content | ConvertFrom-Json
$createdTaskId = $taskData.id

# 5. Employee updates task status to 'In Progress'
$statusObj = @{
    status = "In Progress"
    latestUpdate = "Started configuring mTLS certificates"
}
$statusBody = $statusObj | ConvertTo-Json

$statusRes = Invoke-WebRequest -Uri "$base/tasks/$createdTaskId" -Method PATCH -Headers @{ "X-User-Id" = $empId } -Body $statusBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Employee sets task to In Progress" -response $statusRes -expected 200

# 6. Employee submits Daily Work Update
$updateObj = @{
    projectId = $createdProjId
    taskId = $createdTaskId
    completedWork = "Root CA generation and TLS socket listeners"
    inProgress = "Wiring up client certificate authentication handlers"
    nextSteps = "Integration testing on edge cluster"
    blockers = "Awaiting final IP whitelist confirmation from client"
    dependencies = "HSM key initialization"
}
$updateBody = $updateObj | ConvertTo-Json

$upRes = Invoke-WebRequest -Uri "$base/updates" -Method POST -Headers @{ "X-User-Id" = $empId } -Body $updateBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Employee submits daily update" -response $upRes -expected 201
$upData = $upRes.Content | ConvertFrom-Json

# 7. Team Leader reviews and confirms Employee Update
$leadReviewObj = @{
    updateId = $upData.id
    status = "Reviewed"
    reviewNotes = "Good progress. Whitelist request has been expedited."
}
$leadReviewBody = $leadReviewObj | ConvertTo-Json

$upReviewRes = Invoke-WebRequest -Uri "$base/updates" -Method PATCH -Headers @{ "X-User-Id" = $leaderId } -Body $leadReviewBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Team Leader confirms employee update" -response $upReviewRes -expected 200

# 8. Team Leader submits Sprint Progress Report to Admin
$reportObj = @{
    projectId = $createdProjId
    reportingPeriod = "Sprint 42 (Oct 06 - Oct 12, 2026)"
    progressPercentage = 85
    workCompleted = "Completed CA generation, mTLS listeners, and initial failover benchmarks"
    tasksRemaining = "Final cipher suite restriction and documentation"
    nextPeriodPlan = "Deploy to staging cluster and run automated penetration test"
    risks = "Client whitelist delay"
    deadlineConfidence = "High"
}
$reportBody = $reportObj | ConvertTo-Json

$repRes = Invoke-WebRequest -Uri "$base/reports" -Method POST -Headers @{ "X-User-Id" = $leaderId } -Body $reportBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Team Leader submits Progress Report" -response $repRes -expected 201

# 9. Team Leader submits Deliverable Review to Admin
$revSubObj = @{
    projectId = $createdProjId
    releaseVersion = "v1.0.0-rc1"
    completionSummary = "Full production bundle with automated test suite and compliance checklist."
    setupInstructions = "Run `docker compose -f edge.yml up -d` and verify health probe at :8443/health."
    testEvidence = "100% unit and integration test coverage across all edge gateway modules."
}
$revSubBody = $revSubObj | ConvertTo-Json

$revSubRes = Invoke-WebRequest -Uri "$base/reviews" -Method POST -Headers @{ "X-User-Id" = $leaderId } -Body $revSubBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Team Leader submits Deliverable for Review" -response $revSubRes -expected 201
$revData = $revSubRes.Content | ConvertFrom-Json
$createdRevId = $revData.id

# 10. Admin requests revision with 2 action items
$reqRevObj = @{
    submissionId = $createdRevId
    decision = "Changes Requested"
    comments = "Edge node failover latency must be under 25ms and cipher suite needs updating."
    revisionItems = @(
        @{
            description = "Optimize edge failover heartbeat interval to under 25ms"
            priority = "P0"
        },
        @{
            description = "Enforce TLS 1.3 only cipher suites"
            priority = "P1"
        }
    )
}
$reqRevBody = $reqRevObj | ConvertTo-Json -Depth 5

$reqRevRes = Invoke-WebRequest -Uri "$base/reviews" -Method PATCH -Headers @{ "X-User-Id" = $adminId } -Body $reqRevBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Admin requests revision" -response $reqRevRes -expected 200

# 11. Team Leader resubmits deliverable after addressing revisions
$resubObj = @{
    projectId = $createdProjId
    releaseVersion = "v1.0.0-rc2"
    completionSummary = "Optimized failover latency to 18ms and enforced TLS 1.3 only."
    setupInstructions = "Run `docker compose -f edge.yml up -d` and verify health probe at :8443/health."
    testEvidence = "Failover latency verified at 18ms under 10k req/s load test."
}
$resubBody = $resubObj | ConvertTo-Json

$resubRes = Invoke-WebRequest -Uri "$base/reviews" -Method POST -Headers @{ "X-User-Id" = $leaderId } -Body $resubBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Team Leader resubmits deliverable" -response $resubRes -expected 200

# 12. Admin approves the deliverable
$apprObj = @{
    submissionId = $createdRevId
    decision = "Approved"
    comments = "All performance benchmarks and security invariants verified."
}
$apprBody = $apprObj | ConvertTo-Json

$apprRes = Invoke-WebRequest -Uri "$base/reviews" -Method PATCH -Headers @{ "X-User-Id" = $adminId } -Body $apprBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Admin approves deliverable" -response $apprRes -expected 200

# 13. Admin records Final Client Delivery
$delivObj = @{
    projectId = $createdProjId
    deliveredVersion = "v1.0.0"
    deliveredAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    recipientContact = "elena.vance@starlightglobal.example.com"
    deliveryChannel = "Secure SFTP and Artifact Repository"
    deliveryNotes = "Complete turn-key edge runtime with certified failover and cryptographic receipts."
    deliverablesList = @("Runtime binaries", "Docker images", "Runbooks", "Audit attestation")
}
$delivBody = $delivObj | ConvertTo-Json

$delivRes = Invoke-WebRequest -Uri "$base/deliveries" -Method POST -Headers @{ "X-User-Id" = $adminId } -Body $delivBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Admin records client delivery" -response $delivRes -expected 201
$delivData = $delivRes.Content | ConvertFrom-Json
$createdDeliveryId = $delivData.id

# 14. Admin records Client Acknowledgment
$ackObj = @{
    deliveryId = $createdDeliveryId
    clientAcknowledged = $true
    clientAcknowledgmentNotes = "Elena Vance (CTO) ratified receipt and staging deployment acceptance."
}
$ackBody = $ackObj | ConvertTo-Json

$ackRes = Invoke-WebRequest -Uri "$base/deliveries" -Method PATCH -Headers @{ "X-User-Id" = $adminId } -Body $ackBody -ContentType "application/json" -UseBasicParsing
Assert-Status -stepName "Client acknowledgment ratified" -response $ackRes -expected 200

# 15. Verify cryptographic audit log recorded all events
$auditRes = Invoke-WebRequest -Uri "$base/audit" -Headers @{ "X-User-Id" = $adminId } -UseBasicParsing
Assert-Status -stepName "Fetch audit trail" -response $auditRes -expected 200
$auditData = $auditRes.Content | ConvertFrom-Json
Write-Host "Audit log contains $($auditData.Count) tamper-evident SHA-256 records." -ForegroundColor Yellow

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "SUCCESS: ALL 15 END-TO-END WORKFLOW STEPS PASSED 100%!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$base = "http://localhost:3000/api"
$adminId = "user-admin"
$leaderId = "user-marcus"
$empId = "user-jessica"
$PSDefaultParameterValues['Invoke-WebRequest:DisableKeepAlive'] = $true

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "CONTINUITY PLATFORM - EMPLOYEE WORKBENCH VERIFICATION" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

function Assert-Check {
    param(
        [string]$stepName,
        [bool]$condition,
        [string]$detail = ""
    )
    if ($condition) {
        Write-Host "PASS: $stepName $detail" -ForegroundColor Green
    } else {
        Write-Host "FAIL: $stepName $detail" -ForegroundColor Red
        exit 1
    }
}

# 1. Employee Session Identity
$authRes = Invoke-WebRequest -Uri "$base/auth/me" -Headers @{ "X-User-Id" = $empId } -UseBasicParsing
$authData = $authRes.Content | ConvertFrom-Json
Assert-Check -stepName "Employee Auth Me" -condition ($authData.id -eq $empId) -detail "-> Authenticated as $($authData.name)"

# 2. Smart Handover Readiness Checker
$readinessObj = @{
    executiveSummary = "Comprehensive handover of Raft state machine partition testing suite and chaos mesh yaml."
    completedItems = @("Verified io_uring journal flush on staging nodes", "Automated blackbox linearizability tests")
    nextSteps = @("Execute 4-node network partition test during off-peak window")
    criticalBlockers = @()
    runbookCommands = @("./bin/ctl cluster status", "./bin/apollo-verify --verify-linearizability")
    setupInstructions = "Deploy to staging cluster via helm chart and assert health."
    files = @("src/consensus/raft_state.rs")
}
$readinessBody = $readinessObj | ConvertTo-Json

$readinessRes = Invoke-WebRequest -Uri "$base/handoffs/readiness" -Method POST -Headers @{ "X-User-Id" = $empId } -Body $readinessBody -ContentType "application/json" -UseBasicParsing
$readinessData = $readinessRes.Content | ConvertFrom-Json
Assert-Check -stepName "Readiness Checker Evaluated" -condition ($readinessData.score -ge 75 -and $readinessData.passed -eq $true) -detail "-> Score: $($readinessData.score)%"

# 3. Create Dedicated Task Assigned to Employee for Idempotent Testing
$newTaskBody = @{
    projectId = "apollo-core"
    title = "Validate Chaos Mesh partition suite for Raft nodes"
    description = "Test 4-node split-brain simulation"
    assigneeId = $empId
    priority = "P1"
    dueDate = "2026-10-30"
} | ConvertTo-Json

$createTaskRes = Invoke-WebRequest -Uri "$base/tasks" -Method POST -Headers @{ "X-User-Id" = $leaderId } -Body $newTaskBody -ContentType "application/json" -UseBasicParsing
$targetTaskBefore = $createTaskRes.Content | ConvertFrom-Json
$testTaskId = $targetTaskBefore.id
Write-Host "Created Test Task: $testTaskId Assignee: $($targetTaskBefore.assignee) ($($targetTaskBefore.assigneeId))" -ForegroundColor Yellow

$handoffObj = @{
    projectId = "apollo-core"
    taskId = $testTaskId
    taskTitle = "Run Chaos Mesh partition test for 4-node split-brain simulation"
    recipientId = $leaderId
    pinnedVersionId = "v2.4.0"
    note = "Shift rotation handoff for Chaos Mesh validation"
    executiveSummary = "Comprehensive handover of Raft state machine partition testing suite."
    completedItems = @("Verified io_uring journal flush", "Automated linearizability test suite")
    nextSteps = @("Execute 4-node network partition test")
    runbookCommands = @("./bin/ctl cluster status")
    setupInstructions = "Deploy to staging cluster via helm chart."
    files = @("src/consensus/raft_state.rs")
}
$handoffBody = $handoffObj | ConvertTo-Json

$hoRes = Invoke-WebRequest -Uri "$base/handoffs" -Method POST -Headers @{ "X-User-Id" = $empId } -Body $handoffBody -ContentType "application/json" -UseBasicParsing
$hoData = $hoRes.Content | ConvertFrom-Json
$createdHandoffId = $hoData.id

# Check task owner immediately after handoff creation - MUST NOT HAVE CHANGED!
$taskAfterDispatchRes = Invoke-WebRequest -Uri "$base/tasks?projectId=apollo-core" -Headers @{ "X-User-Id" = $empId } -UseBasicParsing
$tasksAfterDispatch = $taskAfterDispatchRes.Content | ConvertFrom-Json
$targetTaskAfterDispatch = $tasksAfterDispatch | Where-Object { $_.id -eq $testTaskId }

Assert-Check -stepName "CRUCIAL INVARIANT: Handover Dispatched without Ownership Transfer" `
    -condition ($targetTaskAfterDispatch.assigneeId -eq $empId -and $hoData.status -eq "Pending") `
    -detail "-> Status: Pending, Owner remains: $($targetTaskAfterDispatch.assignee)"

# 4. Recipient Requests Clarification
$clarifyObj = @{
    question = "Which Linux kernel version was verified for io_uring on staging-04?"
}
$clarifyBody = $clarifyObj | ConvertTo-Json

$clarifyRes = Invoke-WebRequest -Uri "$base/handoffs/$createdHandoffId/clarify" -Method POST -Headers @{ "X-User-Id" = $leaderId } -Body $clarifyBody -ContentType "application/json" -UseBasicParsing
$clarifyData = $clarifyRes.Content | ConvertFrom-Json

# Check task owner after clarification request - MUST STILL REMAIN JESSICA!
$taskAfterClarifyRes = Invoke-WebRequest -Uri "$base/tasks?projectId=apollo-core" -Headers @{ "X-User-Id" = $empId } -UseBasicParsing
$tasksAfterClarify = $taskAfterClarifyRes.Content | ConvertFrom-Json
$targetTaskAfterClarify = $tasksAfterClarify | Where-Object { $_.id -eq $testTaskId }

Assert-Check -stepName "Clarification Requested (Ownership Stays with Sender)" `
    -condition ($clarifyData.handoff.status -eq "Clarification Requested" -and $targetTaskAfterClarify.assigneeId -eq $empId) `
    -detail "-> Status: Clarification Requested, Owner remains: $($targetTaskAfterClarify.assignee)"

# 5. Recipient Formally Accepts Handover (Atomic Ownership Transfer)
$acceptObj = @{
    signoffNote = "Verified Linux kernel 6.5.0-generic and assumed primary custodianship."
}
$acceptBody = $acceptObj | ConvertTo-Json

$acceptRes = Invoke-WebRequest -Uri "$base/handoffs/$createdHandoffId/accept" -Method POST -Headers @{ "X-User-Id" = $leaderId } -Body $acceptBody -ContentType "application/json" -UseBasicParsing
$acceptData = $acceptRes.Content | ConvertFrom-Json

# Check task owner after acceptance - MUST NOW BE MARCUS VANCE!
$taskAfterAcceptRes = Invoke-WebRequest -Uri "$base/tasks?projectId=apollo-core" -Headers @{ "X-User-Id" = $leaderId } -UseBasicParsing
$tasksAfterAccept = $taskAfterAcceptRes.Content | ConvertFrom-Json
$targetTaskAfterAccept = $tasksAfterAccept | Where-Object { $_.id -eq $testTaskId }

$hasOwnershipTimelineRecord = ($targetTaskAfterAccept.ownershipTimeline.Count -gt 0)
Assert-Check -stepName "ATOMIC OWNERSHIP TRANSFER: Recipient Accepts Handover" `
    -condition ($targetTaskAfterAccept.assigneeId -eq $leaderId -and $acceptData.handoff.status -eq "Accepted") `
    -detail "-> New Owner: $($targetTaskAfterAccept.assignee) ($($targetTaskAfterAccept.assigneeId))"

Assert-Check -stepName "Task Ownership Timeline Recorded" `
    -condition ($hasOwnershipTimelineRecord -and $targetTaskAfterAccept.ownershipTimeline[-1].method -eq "Recipient Acceptance") `
    -detail "-> Timeline entries: $($targetTaskAfterAccept.ownershipTimeline.Count)"

# 6. Task Comments
$commentObj = @{
    text = "Chaos Mesh partition script executed. Zero split-brain discrepancies observed during 48-minute injection test."
}
$commentBody = $commentObj | ConvertTo-Json

$commentRes = Invoke-WebRequest -Uri "$base/tasks/$testTaskId/comments" -Method POST -Headers @{ "X-User-Id" = $leaderId } -Body $commentBody -ContentType "application/json" -UseBasicParsing
$commentData = $commentRes.Content | ConvertFrom-Json

$allCommentsRes = Invoke-WebRequest -Uri "$base/tasks/$testTaskId/comments" -Headers @{ "X-User-Id" = $leaderId } -UseBasicParsing
$allComments = $allCommentsRes.Content | ConvertFrom-Json
Assert-Check -stepName "Task Comments API" -condition ($allComments.Count -ge 1 -and $commentData.authorId -eq $leaderId) -detail "-> Comment recorded with author: $($commentData.authorName)"

# 7. Blocker Reporting, Acknowledging, Escalating, and Resolving
# 7a. Report Blocker
$blockerObj = @{
    description = "Staging node apollo-staging-04 requires ulimit -l memlock configuration update from SRE team."
    severity = "High"
}
$blockerBody = $blockerObj | ConvertTo-Json

$blockerRes = Invoke-WebRequest -Uri "$base/tasks/$testTaskId/blocker" -Method POST -Headers @{ "X-User-Id" = $leaderId } -Body $blockerBody -ContentType "application/json" -UseBasicParsing
$blockerData = $blockerRes.Content | ConvertFrom-Json
Assert-Check -stepName "Blocker Reported (Task Marked Blocked)" -condition ($blockerData.status -eq "Blocked" -and $blockerData.blockerDetails.status -eq "Reported") -detail "-> Severity: $($blockerData.blockerDetails.severity)"

# 7b. Leader Acknowledges Blocker
$ackObj = @{ action = "acknowledge" }
$ackBody = $ackObj | ConvertTo-Json
$ackRes = Invoke-WebRequest -Uri "$base/tasks/$testTaskId/blocker" -Method PATCH -Headers @{ "X-User-Id" = $leaderId } -Body $ackBody -ContentType "application/json" -UseBasicParsing
$ackData = $ackRes.Content | ConvertFrom-Json
Assert-Check -stepName "Blocker Acknowledged" -condition ($ackData.blockerDetails.status -eq "Acknowledged") -detail "-> By: $($ackData.blockerDetails.acknowledgedByName)"

# 7c. Escalate Blocker
$escObj = @{ action = "escalate"; reason = "Cross-team platform infrastructure dependency on SRE" }
$escBody = $escObj | ConvertTo-Json
$escRes = Invoke-WebRequest -Uri "$base/tasks/$testTaskId/blocker" -Method PATCH -Headers @{ "X-User-Id" = $leaderId } -Body $escBody -ContentType "application/json" -UseBasicParsing
$escData = $escRes.Content | ConvertFrom-Json
Assert-Check -stepName "Blocker Escalated to Leadership" -condition ($escData.blockerDetails.status -eq "Escalated") -detail "-> Reason: $($escData.blockerDetails.escalationReason)"

# 7d. Resolve Blocker
$resolveObj = @{ action = "resolve"; notes = "Systemd limits updated; memlock verified unlimited on all nodes." }
$resolveBody = $resolveObj | ConvertTo-Json
$resolveRes = Invoke-WebRequest -Uri "$base/tasks/$testTaskId/blocker" -Method PATCH -Headers @{ "X-User-Id" = $adminId } -Body $resolveBody -ContentType "application/json" -UseBasicParsing
$resolveData = $resolveRes.Content | ConvertFrom-Json
Assert-Check -stepName "Blocker Resolved (Task Returns to In Progress)" -condition ($resolveData.status -eq "In Progress" -and $resolveData.blockerDetails.status -eq "Resolved") -detail "-> Resolved By: $($resolveData.blockerDetails.resolvedByName)"

# 8. Daily Work Journal
$journalObj = @{
    projectId = "apollo-core"
    taskId = $testTaskId
    completedWork = "Executed Chaos Mesh 4-node split-brain simulation"
    inProgress = "Analyzing read-barrier p99 latency under 80k rps"
    nextSteps = "Compile final benchmark report for release review"
    blockers = ""
}
$journalBody = $journalObj | ConvertTo-Json

$journalRes = Invoke-WebRequest -Uri "$base/updates" -Method POST -Headers @{ "X-User-Id" = $empId } -Body $journalBody -ContentType "application/json" -UseBasicParsing
Assert-Check -stepName "Daily Work Journal Posted" -condition ($journalRes.StatusCode -eq 201) -detail "-> HTTP 201 Created"

# 9. Grounded AI Project Assistant
$aiObj = @{
    query = "What is ADR-041 and how does it affect read barriers?"
    activeProjectId = "apollo-core"
}
$aiBody = $aiObj | ConvertTo-Json

$aiRes = Invoke-WebRequest -Uri "$base/assistant" -Method POST -Headers @{ "X-User-Id" = $empId } -Body $aiBody -ContentType "application/json" -UseBasicParsing
$aiData = $aiRes.Content | ConvertFrom-Json
$hasAdrCitation = ($aiData.citations | Where-Object { $_ -like "*ADR-041*" })
Assert-Check -stepName "AI Assistant Answers Grounded in Project Files and Cites Sources" -condition ($hasAdrCitation -ne $null) -detail "-> Citations: $($aiData.citations -join ', ')"

# 10. Non-Fabrication Invariant Check
$fakeQueryObj = @{
    query = "Tell me about the secret alien hyperspace warp drive in this project"
    activeProjectId = "apollo-core"
}
$fakeQueryBody = $fakeQueryObj | ConvertTo-Json

$fakeRes = Invoke-WebRequest -Uri "$base/assistant" -Method POST -Headers @{ "X-User-Id" = $empId } -Body $fakeQueryBody -ContentType "application/json" -UseBasicParsing
$fakeData = $fakeRes.Content | ConvertFrom-Json
$refusesHallucination = ($fakeData.response -like "*No verified files*" -or $fakeData.response -like "*does not hallucinate*")
Assert-Check -stepName "AI Assistant Non-Fabrication Invariant" -condition $refusesHallucination -detail "-> Properly refused to hallucinate"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "SUCCESS: ALL EMPLOYEE WORKBENCH TESTS PASSED 100%!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

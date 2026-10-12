package com.continuity.controller;

import com.continuity.dto.TrustFabricIncidentRequest;
import com.continuity.dto.TrustFabricIncidentResponse;
import com.continuity.service.TrustFabricConvergenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/convergence")
@Tag(name = "Convergence (Trust Fabric x CONTINUITY)", description = "Cross-system endpoints connecting Trust Fabric Anti-Counterfeit with CONTINUITY Handoffs")
public class ConvergenceController {

    private final TrustFabricConvergenceService convergenceService;

    public ConvergenceController(TrustFabricConvergenceService convergenceService) {
        this.convergenceService = convergenceService;
    }

    @GetMapping("/actor-map")
    @Operation(summary = "Get confirmed DID-to-User mapping (did:maker1, did:transporter1, did:retailer1)")
    public ResponseEntity<Map<String, Object>> getActorMap() {
        return ResponseEntity.ok(convergenceService.getActorMapping());
    }

    @GetMapping("/status")
    @Operation(summary = "Check cross-ledger bridge health (FastAPI :8000 and Besu EVM :8545)")
    public ResponseEntity<Map<String, Object>> getConvergenceStatus() {
        return ResponseEntity.ok(convergenceService.checkConvergenceStatus());
    }

    @PostMapping("/anchor")
    @Operation(summary = "Anchor a document hash onto Besu EVM Chain via Trust Fabric")
    public ResponseEntity<Map<String, String>> anchorDocument(@RequestBody Map<String, String> body) {
        String docHash = body.getOrDefault("doc_hash", body.get("hash"));
        if (docHash == null || docHash.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "doc_hash is required"));
        }
        return ResponseEntity.ok(convergenceService.anchorDocumentOnBesu(docHash));
    }

    @PostMapping("/incidents")
    @Operation(summary = "Ingest Trust Fabric counterfeit incident verdict, generate handoff, and fan out recall tasks")
    public ResponseEntity<TrustFabricIncidentResponse> ingestIncident(@RequestBody TrustFabricIncidentRequest request) {
        TrustFabricIncidentResponse response = convergenceService.handleIncident(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/simulate-clone")
    @Operation(summary = "One-click demo simulator for Clone QR attack on LOT-A-000123 (Flow 1 in Convergence Brief)")
    public ResponseEntity<TrustFabricIncidentResponse> simulateCloneIncident() {
        return ResponseEntity.status(HttpStatus.CREATED).body(convergenceService.simulateCloneIncident());
    }

    @GetMapping("/blast-radius/{lotId}")
    @Operation(summary = "Query lot recall blast radius scope with per-custodian breakdowns")
    public ResponseEntity<Map<String, Object>> getBlastRadius(@PathVariable String lotId) {
        return ResponseEntity.ok(convergenceService.getBlastRadius(lotId));
    }
}

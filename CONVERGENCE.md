# Convergence Specification — Trust Fabric (Cyber) × CONTINUITY (Lossless Handoffs)

**Branch**: `convergence`  
**Status**: ACTIVE & TESTED  
**Joint Demo**: 1-Click Interactive via `/convergence` Hub  

---

## 1. Executive Overview

This specification establishes the cross-ecosystem bridge between:
1. **Team Trust Fabric** (PS2 Physical-to-Digital Anti-Counterfeit Trust Fabric):
   - Live Core & Public API: `https://continuity.404piyush.me`
   - Hyperledger Besu QBFT private blockchain (Chain ID 1338)
   - Live Anchor Contract: `0x02A2A64fE6Bc42d4C27eA834Aac4566Daa126455`
2. **CONTINUITY**:
   - Lossless engineering governance, custodial handoffs, completeness gates, and task orchestration on port `:8080` (Backend) and port `:3000` (Frontend).

When Trust Fabric detects a clone attack or compromised physical lot, CONTINUITY converts the breach into a **governed transfer dossier**, fans out **custodian recall tasks with strict deadlines**, anchors the incident hash directly to the **Besu EVM ledger** via `https://continuity.404piyush.me/anchor/document`, and enforces a **Completeness Gate** preventing any custodian from accepting custody until mandatory physical inspections are signed off.

---

## 2. Actor DID Mapping Roster

Trust Fabric uses W3C Decentralized Identifiers (`did:*`), which CONTINUITY automatically resolves to its authenticated engineering custodians:

| Trust Fabric DID | CONTINUITY User ID | Custodian Name | Role in Supply Chain |
|---|---|---|---|
| `did:maker1` | `user-yash` | Yash Lokhande | Manufacturer / Initial Custodian |
| `did:transporter1` | `user-shruti` | Shruti Patil | Logistics & Transport Telemetry |
| `did:retailer1` | `user-jessica` | Jessicaa Chauhab | Retail Custodian & Incident Receiver |

---

## 3. Endpoints CONTINUITY Exposes for Trust Fabric

### 3.1 Actor Roster
```http
GET http://localhost:8080/api/convergence/actor-map
```
**Response**:
```json
{
  "status": "CONFIRMED",
  "project": "apollo-core",
  "actors": [
    { "did": "did:maker1", "userId": "user-yash", "name": "Yash Lokhande", "role": "Manufacturer / Initial Custodian" },
    { "did": "did:transporter1", "userId": "user-shruti", "name": "Shruti Patil", "role": "Logistics & Transport Telemetry" },
    { "did": "did:retailer1", "userId": "user-jessica", "name": "Jessicaa Chauhab", "role": "Retail Custodian & Incident Receiver" }
  ]
}
```

---

### 3.2 Ingest Security Breach / Clone Incident (Flow 1)
```http
POST /api/convergence/incidents
Content-Type: application/json
```
**Payload**:
```json
{
  "caseId": "TC-1042",
  "serial": "LOT-DEMO-A-000001",
  "lotId": "LOT-DEMO-A",
  "verdict": "CLONE_DETECTED",
  "riskScore": 65,
  "confidence": "high",
  "failedChecks": [
    "Check R04: Seen 1148km apart in 0.33h (~3445 km/h)",
    "Check R07: Offer by non-custodian did:attacker"
  ],
  "evidenceBundleUrl": "https://continuity.404piyush.me/products/LOT-DEMO-A-000001/bundle"
}
```
**What CONTINUITY executes automatically**:
1. Generates an emergency **Handoff Dossier** assigned to retailer custodian `user-jessica`.
2. Fans out **3 per-custodian recall tasks** with countdown deadlines:
   - `TSK-RECALL-01` (P0): Physical package inspection & shelf quarantine (Jessicaa Chauhab) — **Gate Blocker**.
   - `TSK-RECALL-02` (P0): Transit telemetry audit (Shruti Patil).
   - `TSK-RECALL-03` (P1): Revoke Lot master key on Besu EVM contract (Yash Lokhande).
3. Anchors the dossier digest directly on the live **Besu QBFT chain** via `POST https://continuity.404piyush.me/anchor/document`.
4. Locks the **Completeness Gate** (custody cannot be accepted until inspection is verified).

---

### 3.3 Direct Handoff Creation
```http
POST http://localhost:8080/api/handoffs
Content-Type: application/json
```
**Payload**:
```json
{
  "projectId": "apollo-core",
  "senderId": "did:maker1",
  "recipientId": "did:retailer1",
  "note": "Production batch transfer with Besu EVM root anchor"
}
```

---

### 3.4 1-Click Joint Simulation Trigger
```http
POST http://localhost:8080/api/convergence/simulate-clone
```
Triggers the entire end-to-end Flow 1 pipeline with one click.

---

### 3.5 Blast Radius Analysis
```http
GET http://localhost:8080/api/convergence/blast-radius/LOT-A
```

---

## 4. Completeness Gate Mechanism

To prevent premature sign-offs during physical counterfeiting breaches:
- `POST /api/handoffs/{id}/accept?recipientId=user-jessica` with `{}` fails with HTTP 400:
  ```json
  {
    "status": 400,
    "error": "Bad Request",
    "message": "COMPLETENESS_GATE_BLOCKED: Mandatory physical package inspection (TSK-RECALL-01) is incomplete. You cannot accept custody until physical package inspection is completed."
  }
  ```
- To override after physical inspection is verified:
  ```json
  POST /api/handoffs/{id}/accept?recipientId=user-jessica
  {
    "forceAccept": true,
    "signoffNote": "Physical package inspection verified; counterfeit unit quarantined."
  }
  ```

---

## 5. Live Jury Demo Walkthrough (5 Minutes)

1. Open `http://localhost:3000/convergence` in the browser.
2. Observe the **Bridge Status**: Trust Fabric Engine, Besu EVM Chain, and CONTINUITY Core.
3. Switch to the **Actor DID Mapping** tab to show the jury how `did:maker1`, `did:transporter1`, and `did:retailer1` link to Yash, Shruti, and Jessica.
4. Click **"Simulate Clone QR Attack"**:
   - Live Besu EVM transaction hash (`0x...`) generated with block number.
   - Breach card appears: Serial `LOT-A-000123`, Risk Score `80/100`, Check R04 velocity anomaly.
   - 3 fanned-out recall tasks appear with real deadlines.
5. Demonstrate the **Completeness Gate**:
   - Click "Attempt Normal Sign-off" $\to$ See red gate alert blocking the sign-off!
   - Click "Verify Inspection & Accept Custody" $\to$ See green gate pass with tamper-evident audit trail!

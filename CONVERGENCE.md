# 🤝 Convergence: Trust Fabric (Blockchain) × CONTINUITY (Handoffs)

> **In Simple Words:**  
> Trust Fabric built a **blockchain surveillance system** that catches fake products. But a blockchain cannot physically go to the store and pull a counterfeit box off the shelf.  
> **CONTINUITY** is the **operational team**. We turn their blockchain alarms into assigned tasks with deadlines, stop employees from blindly signing off on fake goods, and record everything back onto the blockchain forever.

---

## 🌟 The Big Picture: What Did We Exchange?

This partnership connects two completely separate platforms to create an unbreakable safety loop:

```
[ Trust Fabric: Blockchain ]                           [ CONTINUITY: Operations ]
 • Detects clone QR scan                                • Creates Case TC-1042
 • Proves fake via Merkle roots   ──────( ALERTS )─────> • Assigns tasks with timers
 • Besu Smart Contract (1338)     <───( ANCHORS )──────  • Locks Completeness Gate
                                                        • Holds real humans accountable
```

### 1. What We GAVE to Them (Our Handoff Engine)
Trust Fabric had no way to organize human responses when their blockchain raised an alarm. We gave them our **Handoff & Accountability Engine**:
* **Automated Case Dossier (`TC-1042`):** When they detect a fake item, we convert the alert into a full digital case file.
* **Custodian Responsibility Chain:** Clearly divides the crisis among real people: **Manufacturer $\to$ Logistics $\to$ Retailer**.
* **The "Completeness Gate" (The Digital Bouncer):** Our signature feature. It physically blocks the store manager from signing off or accepting delivery until they inspect the physical package.
* **Deadline Timers & Alerts:** Adds urgent countdown timers to recall tasks so nothing sits forgotten on a shelf.

### 2. What We TOOK from Them (Their Blockchain Security)
We needed mathematical, tamper-proof security so nobody could alter our handoff history. We connected to their **Blockchain Endpoints**:
* **On-Chain Document Anchoring (`POST /anchor/document`):** Every handoff dossier's digital fingerprint is permanently stamped onto their **Hyperledger Besu Ethereum blockchain**.
* **Cryptographic Merkle Proofs (`GET /products/{serial}/bundle`):** Mathematical proofs that confirm whether a serial was genuinely manufactured or cloned.
* **Sequential Event Hash Chains (`POST /events/sign`):** Every scan and handover links cryptographically to the previous one (`prev_hash` $\to$ `event_hash`).
* **Audit Integrity (`GET /audit/integrity`):** Instant verification that our database matches the blockchain ledger with zero tampering.

---

## 🎭 The Real-Life Story: The "Clone QR Attack"

Here is how the combined system works during a live security breach:

1. **The Crime:** A scammer copies the QR code of an authentic medicine or electronics box.
2. **The Detection:** The genuine box is scanned in **Mumbai at 10:00 AM**. The fake box is scanned in **Delhi at 10:20 AM**. Trust Fabric calculates that traveling 1,148 km in 20 minutes requires **3,450 km/h** (impossible velocity) and flags: `CLONE_DETECTED`.
3. **The CONTINUITY Handoff:**
   - CONTINUITY automatically opens **Case TC-1042**.
   - Notifies **Jessica (Retailer)**: *"Inspect box on shelf #4 immediately."*
   - Notifies **Shruti (Logistics)**: *"Audit GPS route between Mumbai and Delhi."*
   - Notifies **Yash (Manufacturer)**: *"Revoke batch master signature on the blockchain."*
4. **The Gate Enforced:** Jessica tries to click "Sign Off", but the **Completeness Gate blocks her**. She cannot accept the handoff until the physical box is verified authentic.
5. **The Resolution:** Once Jessica isolates the fake unit and verifies inspection, the handoff is accepted, and the proof receipt is permanently written to the Besu ledger.

---

## 👥 Actor DID Mapping Roster

Trust Fabric uses decentralized cryptographic IDs (`did:*`). CONTINUITY automatically translates them into real team members:

| Trust Fabric DID | CONTINUITY User ID | Custodian Name | Real-World Role |
|---|---|---|---|
| `did:maker1` | `user-yash` | Yash Lokhande | Manufacturer / Initial Custodian |
| `did:transporter1` | `user-shruti` | Shruti Patil | Logistics & Transit Telemetry Lead |
| `did:retailer1` | `user-jessica` | Jessicaa Chauhab | Retail Store Manager & Case Receiver |
| `did:attacker` | `user-shruti` | Shruti Patil | Flagged Non-Custodian Probe (Simulated) |
| `did:attacker2` | `user-jessica` | Jessicaa Chauhab | Secondary Probe (Simulated) |

---

## 🌐 Live Production Endpoints (Zero Localhost)

Both systems are live and connected over encrypted HTTPS:

* **CONTINUITY Web Hub & UI:** [https://converge.yugc.in/convergence](https://converge.yugc.in/convergence)
* **CONTINUITY API Base:** `https://converge.yugc.in`
* **Trust Fabric API Base:** `https://continuity.404piyush.me`
* **Besu QBFT Private Chain ID:** `1338`
* **Anchor Smart Contract:** `0x02A2A64fE6Bc42d4C27eA834Aac4566Daa126455`

---

## 📡 API Reference & cURL Guide

### 1. Ingest Security Incident (Trust Fabric Callback)
Called by Trust Fabric when an anomaly or duplicate QR code is detected:
```bash
curl -X POST https://converge.yugc.in/api/convergence/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": "TC-1042",
    "serial": "LOT-DEMO-A-000001",
    "lotId": "LOT-DEMO-A",
    "verdict": "CLONE_DETECTED",
    "riskScore": 65,
    "confidence": "high",
    "failedChecks": ["Check R04: Seen 1148km apart in 0.33h (≈3445 km/h)"],
    "evidenceBundleUrl": "https://continuity.404piyush.me/products/LOT-DEMO-A-000001/bundle"
  }'
```

### 2. Check Live Cross-Ecosystem Bridge Status
Returns real-time health, live Besu block height, and connected contract:
```bash
curl -s https://converge.yugc.in/api/convergence/status
```

### 3. Retrieve Live Actor DID Roster
```bash
curl -s https://converge.yugc.in/api/convergence/actor-map
```

### 4. Inspect On-Chain Cryptographic Proofs & Merkle Tree
```bash
curl -s https://converge.yugc.in/api/convergence/proofs/bundle?serial=LOT-DEMO-A-000001
```

### 5. Check Ledger Database Integrity (Zero Tampering Check)
```bash
curl -s https://converge.yugc.in/api/convergence/audit/integrity
```

### 6. Sign Custody Handover Directly on Besu Hash Chain
```bash
curl -X POST https://converge.yugc.in/api/convergence/events/sign \
  -H "Content-Type: application/json" \
  -d '{"serial":"LOT-DEMO-A-000003","type":"HANDOVER_OFFER","actor":"did:maker1","to_actor":"did:transporter1"}'
```

---

## ⏱️ 3-Minute Live Jury Demo Walkthrough

1. **Open the Live Hub:** Visit **[https://converge.yugc.in/convergence](https://converge.yugc.in/convergence)**.
2. **Show the Bridge:** Point out the 3 nodes at the top:
   - **Trust Fabric Engine** (Live at `continuity.404piyush.me`)
   - **Besu QBFT Chain** (Live Block Height, Contract `0x02A2...`)
   - **CONTINUITY Core** (Live at `converge.yugc.in`)
3. **Trigger the 1-Click Attack Simulation:**
   - Click the red **"Simulate Clone QR Attack"** button.
   - Show the breach card: **Risk 65/100**, Check R04 speed anomaly (~3,445 km/h).
   - Show the 3 fanned-out tasks assigned to Jessica, Shruti, and Yash with real deadlines.
4. **Demonstrate the Completeness Gate:**
   - Click **"Attempt Normal Sign-off"** $\to$ Watch the red banner block the sign-off! (Explaining: *"The system refuses to let employees sign off blindly on fake goods."*)
   - Click **"Verify Inspection & Accept Custody"** $\to$ Watch the green verification pass with an immutable audit hash!
5. **Show the Blockchain Explorer:**
   - Click the **"Blockchain Proofs & Explorer"** tab.
   - Show the **Sequential Hash Chain** and **Merkle Tree Proofs**.
   - Click **"2. Handover Offer"** to show a live event committing to the blockchain in real time (`seq +1`).

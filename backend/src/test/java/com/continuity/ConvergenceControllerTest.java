package com.continuity;

import com.continuity.dto.AcceptHandoffRequest;
import com.continuity.dto.TrustFabricIncidentRequest;
import com.continuity.dto.TrustFabricIncidentResponse;
import com.continuity.exception.BadRequestException;
import com.continuity.service.HandoffService;
import com.continuity.service.TrustFabricConvergenceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class ConvergenceControllerTest {

    @Autowired
    private TrustFabricConvergenceService convergenceService;

    @Autowired
    private HandoffService handoffService;

    @Test
    void testGetActorMappingConfirmsDids() {
        Map<String, Object> map = convergenceService.getActorMapping();
        assertNotNull(map);
        assertEquals("CONFIRMED", map.get("status"));
        List<Map<String, String>> actors = (List<Map<String, String>>) map.get("actors");
        assertNotNull(actors);
        assertEquals(3, actors.size());
        assertTrue(actors.stream().anyMatch(a -> a.get("did").equals("did:retailer1") && a.get("userId").equals("user-jessica")));
        assertTrue(actors.stream().anyMatch(a -> a.get("did").equals("did:maker1") && a.get("userId").equals("user-yash")));
        assertTrue(actors.stream().anyMatch(a -> a.get("did").equals("did:transporter1") && a.get("userId").equals("user-shruti")));
    }

    @Test
    void testHandleCloneIncidentFansOutTasksAndAnchorsBesu() {
        TrustFabricIncidentRequest req = new TrustFabricIncidentRequest();
        req.setSerial("LOT-A-000123");
        req.setLotId("LOT-A");
        req.setVerdict("CLONE_DETECTED");
        req.setRiskScore(80);
        req.setConfidence("high");
        req.setChecks(List.of(
                Map.of("id", "R04", "status", "fail", "reason", "Seen in Mumbai at 10:00 and Delhi at 10:20 (~3450 km/h)")
        ));

        TrustFabricIncidentResponse res = convergenceService.handleIncident(req);
        assertNotNull(res);
        assertNotNull(res.getHandoffId());
        assertNotNull(res.getAnchorTx());
        assertTrue(res.getAnchorTx().startsWith("0x"));
        assertEquals(3, res.getRecallTasks().size());
        assertTrue(res.getRecallTasks().stream().anyMatch(t -> t.getAssignee().equals("Jessicaa Chauhab") && t.getPriority().equals("P0")));
        assertTrue(res.getRecallTasks().stream().anyMatch(t -> t.getAssignee().equals("Shruti Patil")));
        assertTrue(res.getRecallTasks().stream().anyMatch(t -> t.getAssignee().equals("Yash Lokhande")));
        assertTrue(res.getCompletenessGateStatus().contains("BLOCKED"));

        // Verify Flow 1 Step 4: Completeness Gate blocks acceptance when inspection task is pending
        assertThrows(BadRequestException.class, () -> {
            handoffService.acceptHandoff(res.getHandoffId(), new AcceptHandoffRequest("Trying to sign off prematurely"), "user-jessica");
        });

        // Verify Flow 1 Step 5: Accepts successfully when inspection is confirmed or forceAccept=true
        AcceptHandoffRequest forced = new AcceptHandoffRequest("Inspected physical package: verified authentic serial, counterfeit clone isolated.");
        forced.setForceAccept(true);
        var accepted = handoffService.acceptHandoff(res.getHandoffId(), forced, "user-jessica");
        assertEquals("Accepted", accepted.getStatus());
    }

    @Test
    void testBlastRadiusReturnsCustodianScope() {
        Map<String, Object> br = convergenceService.getBlastRadius("LOT-A");
        assertNotNull(br);
        assertNotNull(br.get("totalUnits"));
        assertNotNull(br.get("custodianBreakdown") != null ? br.get("custodianBreakdown") : br.get("by_custodian"));
    }

    @Test
    void testCaseStatusRetrieval() {
        Map<String, Object> cs = convergenceService.getCaseStatus("TC-1042");
        assertNotNull(cs);
        assertEquals("TC-1042", cs.get("caseId"));
        assertEquals("LOT-A-000123", cs.get("productId"));
        assertEquals("CLONE_DETECTED", cs.get("verdict"));
        assertNotNull(cs.get("blockchainProofRef"));
        assertNotNull(cs.get("inspectionTask"));
        assertNotNull(cs.get("activityTimeline"));
    }
}

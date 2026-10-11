package com.continuity.repository;

import com.continuity.entity.HandoffAuditTrailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HandoffAuditTrailRepository extends JpaRepository<HandoffAuditTrailEntity, String> {
    List<HandoffAuditTrailEntity> findByHandoffIdOrderByTimestampAsc(String handoffId);
}

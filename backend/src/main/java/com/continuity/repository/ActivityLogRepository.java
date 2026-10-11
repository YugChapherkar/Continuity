package com.continuity.repository;

import com.continuity.entity.ActivityLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLogEntity, String> {
    List<ActivityLogEntity> findAllByOrderByTimestampDesc();
    List<ActivityLogEntity> findByProjectIdOrderByTimestampDesc(String projectId);
    Optional<ActivityLogEntity> findFirstByOrderByTimestampDesc();
}

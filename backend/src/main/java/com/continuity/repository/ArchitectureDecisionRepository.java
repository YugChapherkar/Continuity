package com.continuity.repository;

import com.continuity.entity.ArchitectureDecisionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArchitectureDecisionRepository extends JpaRepository<ArchitectureDecisionEntity, String> {
    List<ArchitectureDecisionEntity> findByProjectId(String projectId);
}

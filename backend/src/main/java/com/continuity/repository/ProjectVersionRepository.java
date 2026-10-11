package com.continuity.repository;

import com.continuity.entity.ProjectVersionEntity;
import com.continuity.entity.ProjectVersionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectVersionRepository extends JpaRepository<ProjectVersionEntity, ProjectVersionId> {
    List<ProjectVersionEntity> findByIdProjectIdOrderByTimestampDesc(String projectId);
    Optional<ProjectVersionEntity> findByIdProjectIdAndIdId(String projectId, String id);
    Optional<ProjectVersionEntity> findFirstByIdProjectIdOrderByTimestampDesc(String projectId);
}

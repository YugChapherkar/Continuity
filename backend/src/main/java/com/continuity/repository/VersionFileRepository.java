package com.continuity.repository;

import com.continuity.entity.VersionFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VersionFileRepository extends JpaRepository<VersionFileEntity, String> {
    List<VersionFileEntity> findByProjectIdAndVersionId(String projectId, String versionId);
    List<VersionFileEntity> findByProjectId(String projectId);
    void deleteByProjectIdAndVersionId(String projectId, String versionId);
}

package com.continuity.repository;

import com.continuity.entity.KnowledgeIndexEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeIndexRepository extends JpaRepository<KnowledgeIndexEntity, String> {
    Optional<KnowledgeIndexEntity> findByProjectIdAndVersionId(String projectId, String versionId);
    Optional<KnowledgeIndexEntity> findFirstByProjectIdOrderByLastIndexedAtDesc(String projectId);
    List<KnowledgeIndexEntity> findByProjectId(String projectId);
}

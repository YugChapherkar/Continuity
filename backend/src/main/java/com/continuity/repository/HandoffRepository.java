package com.continuity.repository;

import com.continuity.entity.HandoffEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HandoffRepository extends JpaRepository<HandoffEntity, String> {
    List<HandoffEntity> findByProjectId(String projectId);
    List<HandoffEntity> findByRecipientId(String recipientId);
    List<HandoffEntity> findBySenderId(String senderId);
    List<HandoffEntity> findByRecipientIdOrSenderId(String recipientId, String senderId);
    List<HandoffEntity> findAllByOrderByCreatedAtDesc();
}

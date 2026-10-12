package com.continuity.repository;

import com.continuity.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, String> {
    List<NotificationEntity> findByRecipientIdOrderByTimestampDesc(String recipientId);
    List<NotificationEntity> findAllByOrderByTimestampDesc();
}

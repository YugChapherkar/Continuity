package com.continuity.repository;

import com.continuity.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, String> {
    List<TaskEntity> findByProjectId(String projectId);
    List<TaskEntity> findByAssignee(String assignee);
}

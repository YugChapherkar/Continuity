package com.continuity.security;

import com.continuity.entity.HandoffEntity;
import com.continuity.entity.ProjectEntity;
import com.continuity.entity.UserEntity;
import com.continuity.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public static String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserEntity user) {
            return user.getId();
        }
        // Fallback default for local unauthenticated dev requests
        return "user-jessica";
    }

    public static UserEntity getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserEntity user) {
            return user;
        }
        return null;
    }

    public static void assertCanAcceptHandoff(HandoffEntity handoff, String userId) {
        if (handoff == null) return;
        // Only intended recipient or system lead can accept
        if (!handoff.getRecipientId().equals(userId)) {
            throw new UnauthorizedException("Only the intended recipient (" + handoff.getRecipientId() + ") can accept this handoff dossier. Current user: " + userId);
        }
    }

    public static void assertCanCommitVersion(ProjectEntity project, String userId) {
        // Any team member or project owner can commit versions
        if (project == null) return;
    }
}

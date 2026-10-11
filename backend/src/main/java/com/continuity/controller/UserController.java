package com.continuity.controller;

import com.continuity.dto.UserDto;
import com.continuity.security.SecurityUtils;
import com.continuity.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Users & Authentication", description = "User identities, corporate authentication, and persona switching")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/users")
    @Operation(summary = "Get list of all enterprise users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/api/users/{userId}")
    @Operation(summary = "Get user profile by ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @GetMapping("/api/auth/me")
    @Operation(summary = "Get currently authenticated user persona")
    public ResponseEntity<UserDto> getCurrentUser(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        String currentUserId = userId != null ? userId : SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(userService.getUserById(currentUserId));
    }

    @PostMapping("/api/auth/login")
    @Operation(summary = "Corporate SSO login endpoint")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        UserDto user = userService.getAllUsers().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(userService.getAllUsers().get(0));

        return ResponseEntity.ok(Map.of(
                "token", "demo-token-" + user.getId(),
                "user", user
        ));
    }
}

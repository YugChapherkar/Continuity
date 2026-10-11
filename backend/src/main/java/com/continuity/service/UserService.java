package com.continuity.service;

import com.continuity.dto.UserDto;
import com.continuity.entity.UserEntity;
import com.continuity.exception.ResourceNotFoundException;
import com.continuity.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(String id) {
        return userRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public UserDto toDto(UserEntity u) {
        return new UserDto(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getRole(),
                u.getAvatar(),
                u.getInitials(),
                u.getDepartment(),
                u.getBio(),
                u.getLocation(),
                u.getActiveProjectsCount(),
                u.getPendingHandoffsCount()
        );
    }
}

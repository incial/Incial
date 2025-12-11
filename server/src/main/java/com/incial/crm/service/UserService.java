package com.incial.crm.service;

import com.incial.crm.dto.UserDto;
import com.incial.crm.entity.User;
import com.incial.crm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<UserDto> getLeaderboard() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getTasksCompleted).reversed())
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToDto(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return convertToDto(user);
    }

    public void incrementTasksCompleted(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        user.setTasksCompleted(user.getTasksCompleted() + 1);
        userRepository.save(user);
    }

    private UserDto convertToDto(User entity) {
        return UserDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .role(entity.getRole())
                .tasksCompleted(entity.getTasksCompleted())
                .googleId(entity.getGoogleId())
                .avatarUrl(entity.getAvatarUrl())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "SYSTEM";
        }
        return authentication.getName();
    }

}
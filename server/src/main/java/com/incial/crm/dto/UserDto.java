package com.incial.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Integer tasksCompleted;
    private String googleId;
    private String avatarUrl;
    private LocalDateTime createdAt;
}
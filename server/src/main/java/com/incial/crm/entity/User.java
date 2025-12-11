package com.incial.crm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, name = "password_hash", length = 512)
    private String passwordHash;

    @Column(nullable = false, length = 50)
    private String role;

    @Column(name = "tasks_completed", nullable = false)
    private Integer tasksCompleted = 0;

    @Column(name = "google_id", unique = true, length = 255)
    private String googleId;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (tasksCompleted == null) {
            tasksCompleted = 0;
        }
    }
}
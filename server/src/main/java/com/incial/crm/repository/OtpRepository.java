package com.incial.crm.repository;

import com.incial.crm.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByEmailAndOtpCodeAndVerifiedFalseAndExpiresAtAfter(
            String email, String otpCode, LocalDateTime currentTime);
    
    void deleteByEmail(String email);
    
    void deleteByExpiresAtBefore(LocalDateTime currentTime);
}

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
public class MeetingDto {
    private Long id;
    private String title;
    private LocalDateTime dateTime;
    private String status;
    private String meetingLink;
    private String notes;
    private Long companyId;
    private String assignedTo;
    private LocalDateTime createdAt;
}

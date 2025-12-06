package com.incial.workhub.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CRMDTO {

    private Long id;

    private String contactName;
    private String company;

    private List<String> work;
    private String status;

    private LocalDate lastContact;
    private LocalDate nextFollowUp;

    private BigDecimal dealValue;
    private String phone;
    private String notes;
    private String email;

    private List<String> tags;
    private List<String> leadSources;

    private String assignedTo;
}


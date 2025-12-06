package com.incial.workhub.dto;

import com.incial.workhub.enums.USER_ROLE;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private USER_ROLE role;
}
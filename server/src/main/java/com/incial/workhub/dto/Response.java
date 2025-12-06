package com.incial.workhub.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    private int statusCode;
    private String message;

    private String token;
    private String role;

    private CRMDTO crmdto;
    private UserDTO userDTO;

    private List<UserDTO> users;
    private List<CRMDTO> crmList;

}

package com.incial.workhub.utils;

import com.incial.workhub.dto.*;
import com.incial.workhub.model.CRM;
import com.incial.workhub.model.User;

import java.util.List;

public class Utils {

    // =====================================================================
    // USER MAPPING
    // =====================================================================

    public static UserDTO mapUserToDTO(User user) {
        if (user == null) return null;

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        return dto;
    }

    // =====================================================================
    // CRM → RESPONSE DTO
    // =====================================================================

    public static CRMDTO mapCRMToDTO(CRM crm) {
        if (crm == null) return null;

        CRMDTO dto = new CRMDTO();

        dto.setId(crm.getId());
        dto.setContactName(crm.getContactName());
        dto.setCompany(crm.getCompany());
        dto.setWork(crm.getWork());
        dto.setStatus(crm.getStatus());

        dto.setLastContact(crm.getLastContact());
        dto.setNextFollowUp(crm.getNextFollowUp());
        dto.setDealValue(crm.getDealValue());

        dto.setPhone(crm.getPhone());
        dto.setNotes(crm.getNotes());
        dto.setEmail(crm.getEmail());

        dto.setTags(crm.getTags());
        dto.setLeadSources(crm.getLeadSources());
        dto.setAssignedTo(crm.getAssignedTo());

        return dto;
    }


    // =====================================================================
    // REQUEST DTO → ENTITY (CREATE)
    // =====================================================================

    public static CRM mapDtoToCRM(CRMDTO dto) {
        if (dto == null) return null;

        CRM crm = new CRM();

        crm.setContactName(dto.getContactName());
        crm.setCompany(dto.getCompany());
        crm.setWork(dto.getWork());
        crm.setStatus(dto.getStatus());

        crm.setLastContact(dto.getLastContact());
        crm.setNextFollowUp(dto.getNextFollowUp());
        crm.setDealValue(dto.getDealValue());

        crm.setPhone(dto.getPhone());
        crm.setNotes(dto.getNotes());
        crm.setEmail(dto.getEmail());

        crm.setTags(dto.getTags());
        crm.setLeadSources(dto.getLeadSources());
        crm.setAssignedTo(dto.getAssignedTo());

        return crm;
    }

    public static List<CRMDTO> mapListToCRMDTO(List<CRM> crmList) {

        return crmList.stream().map(Utils::mapCRMToDTO).toList();

    }


}

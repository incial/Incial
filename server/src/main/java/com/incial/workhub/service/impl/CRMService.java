package com.incial.workhub.service.impl;

import com.incial.workhub.dto.Response;
import com.incial.workhub.exception.OurException;
import com.incial.workhub.model.CRM;
import com.incial.workhub.repository.CRMRepository;
import com.incial.workhub.service.repo.ICRMService;
import com.incial.workhub.utils.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CRMService implements ICRMService {

    private final CRMRepository crmRepository;

    // ---------------------------------------------------------
    // CREATE
    // ---------------------------------------------------------
    @Override
    public Response createCRM(CRM crm) {
        Response response = new Response();
        try {
            crmRepository.save(crm);
            response.setStatusCode(201);
            response.setMessage("CRM entry created successfully");
            response.setCrmdto(Utils.mapCRMToDTO(crm));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error while creating CRM: " + e.getMessage());
        }
        return response;
    }

    // ---------------------------------------------------------
    // GET ALL
    // ---------------------------------------------------------
    @Override
    public Response getAllCRMs() {
        Response response = new Response();
        try {
            List<CRM> list = crmRepository.findAll();
            response.setCrmList(Utils.mapListToCRMDTO(list));
            response.setStatusCode(200);
            response.setMessage("CRM entries fetched successfully");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error while fetching CRM: " + e.getMessage());
        }
        return response;
    }

    // ---------------------------------------------------------
    // GET SINGLE
    // ---------------------------------------------------------
    @Override
    public Response getCRM(Long id) {
        Response response = new Response();
        try {
            CRM crm = crmRepository.findById(id)
                    .orElseThrow(() -> new OurException("CRM entry not found"));

            response.setCrmdto(Utils.mapCRMToDTO(crm));
            response.setStatusCode(200);
            response.setMessage("CRM fetched successfully");

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error while fetching CRM: " + e.getMessage());
        }
        return response;
    }

    // ---------------------------------------------------------
    // UPDATE
    // ---------------------------------------------------------
    @Override
    public Response updateCRM(Long id, CRM request) {
        Response response = new Response();

        try {
            CRM crm = crmRepository.findById(id)
                    .orElseThrow(() -> new OurException("CRM entry not found"));

            // PATCH UPDATE (Notion-like behavior)
            if (request.getContactName() != null) crm.setContactName(request.getContactName());
            if (request.getCompany() != null) crm.setCompany(request.getCompany());
            if (request.getWork() != null) crm.setWork(request.getWork());
            if (request.getStatus() != null) crm.setStatus(request.getStatus());
            if (request.getLastContact() != null) crm.setLastContact(request.getLastContact());
            if (request.getNextFollowUp() != null) crm.setNextFollowUp(request.getNextFollowUp());
            if (request.getDealValue() != null) crm.setDealValue(request.getDealValue());
            if (request.getPhone() != null) crm.setPhone(request.getPhone());
            if (request.getNotes() != null) crm.setNotes(request.getNotes());
            if (request.getEmail() != null) crm.setEmail(request.getEmail());
            if (request.getTags() != null) crm.setTags(request.getTags());
            if (request.getLeadSources() != null) crm.setLeadSources(request.getLeadSources());
            if (request.getAssignedTo() != null) crm.setAssignedTo(request.getAssignedTo());

            crmRepository.save(crm);

            response.setStatusCode(200);
            response.setMessage("CRM updated successfully");
            response.setCrmdto(Utils.mapCRMToDTO(crm));

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error while updating CRM: " + e.getMessage());
        }

        return response;
    }

    // ---------------------------------------------------------
    // DELETE
    // ---------------------------------------------------------
    @Override
    public Response deleteCRM(Long id) {
        Response response = new Response();
        try {
            CRM crm = crmRepository.findById(id)
                    .orElseThrow(() -> new OurException("CRM entry not found"));

            crmRepository.delete(crm);

            response.setStatusCode(200);
            response.setMessage("CRM deleted successfully");

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error while deleting CRM: " + e.getMessage());
        }
        return response;
    }

    // ---------------------------------------------------------
    // FILTERS
    // ---------------------------------------------------------
    @Override
    public Response getByStatus(String status) {
        Response response = new Response();
        try {
            List<CRM> list = crmRepository.findByStatus(status);
            response.setCrmList(Utils.mapListToCRMDTO(list));
            response.setStatusCode(200);
            response.setMessage("Filtered by status");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error filtering by status: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getByAssignedTo(String assignedTo) {
        Response response = new Response();
        try {
            List<CRM> list = crmRepository.findByAssignedTo(assignedTo);
            response.setCrmList(Utils.mapListToCRMDTO(list));
            response.setStatusCode(200);
            response.setMessage("Filtered by assigned user");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error filtering by assigned user: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getByTag(String tag) {
        Response response = new Response();
        try {
            List<CRM> list = crmRepository.findByTagsContaining(tag);
            response.setCrmList(Utils.mapListToCRMDTO(list));
            response.setStatusCode(200);
            response.setMessage("Filtered by tag");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error filtering by tag: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getByLeadSource(String source) {
        Response response = new Response();
        try {
            List<CRM> list = crmRepository.findByLeadSourcesContaining(source);
            response.setCrmList(Utils.mapListToCRMDTO(list));
            response.setStatusCode(200);
            response.setMessage("Filtered by lead source");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error filtering by lead source: " + e.getMessage());
        }
        return response;
    }

    // ---------------------------------------------------------
    // HIGH VALUE DEALS
    // ---------------------------------------------------------
    @Override
    public Response getHighValueDeals(BigDecimal minValue) {
        Response response = new Response();
        try {
            List<CRM> list = crmRepository.findByDealValueGreaterThanEqual(minValue);
            response.setCrmList(Utils.mapListToCRMDTO(list));
            response.setStatusCode(200);
            response.setMessage("High value deals fetched");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching high value deals: " + e.getMessage());
        }
        return response;
    }

    // ---------------------------------------------------------
    // FOLLOW-UP CALENDAR
    // ---------------------------------------------------------
    @Override
    public Response getUpcomingFollowUps() {
        Response response = new Response();
        try {
            LocalDate today = LocalDate.now();
            List<CRM> list = crmRepository.findByNextFollowUpAfterOrderByNextFollowUpAsc(today);
            response.setCrmList(Utils.mapListToCRMDTO(list));
            response.setStatusCode(200);
            response.setMessage("Upcoming follow-ups fetched");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching follow-ups: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getFollowUpsOnDate(LocalDate date) {
        Response response = new Response();
        try {
            List<CRM> list = crmRepository.findByNextFollowUp(date);
            response.setCrmList(Utils.mapListToCRMDTO(list));
            response.setStatusCode(200);
            response.setMessage("Follow-ups for date fetched");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching follow-ups: " + e.getMessage());
        }
        return response;
    }
}

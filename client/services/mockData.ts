
import { CRMEntry, Company } from '../types';

export const MOCK_CRM_DATA: CRMEntry[] = [
  {
    id: 1,
    company: "SMR Rubbers",
    phone: "9567569270",
    email: "anil@stmarysrubbers.com",
    contactName: "Anil Michael",
    assignedTo: "Vallapata",
    lastContact: "2023-10-25",
    nextFollowUp: new Date().toISOString().split('T')[0], // Today
    dealValue: 35000.00,
    notes: "Proposal revised, waiting for signoff. Logo refreshment needed.",
    status: "on progress",
    tags: ["Follow-up", "VIP"],
    work: ["branding", "marketing"],
    leadSources: ["Google Business"]
  },
  {
    id: 2,
    company: "TechFlow Systems",
    phone: "4155550123",
    email: "sarah@techflow.io",
    contactName: "Sarah Connor",
    assignedTo: "John Doe",
    lastContact: "2023-10-20",
    nextFollowUp: "2023-10-24", // Past
    dealValue: 120000.00,
    notes: "Initial meeting went well. Needs tech specs.",
    status: "lead",
    tags: ["New"],
    work: ["development"],
    leadSources: ["Referral"]
  },
  {
    id: 3,
    company: "Green Earth Co",
    phone: "5550192834",
    email: "info@greenearth.org",
    contactName: "David Green",
    assignedTo: "Vallapata",
    lastContact: "2023-10-28",
    nextFollowUp: "2025-11-01", // Future
    dealValue: 15000.00,
    notes: "Contract signed. Sustainability audit included.",
    status: "onboarded",
    tags: ["Eco"],
    work: ["consulting"],
    leadSources: ["LinkedIn"]
  },
  {
    id: 4,
    company: "Nebula Corps",
    phone: "2025550111",
    email: "contact@nebula.com",
    contactName: "Nebula Stark",
    assignedTo: "John Doe",
    lastContact: "2023-09-15",
    nextFollowUp: "2023-09-20", // Past
    dealValue: 5000.00,
    notes: "Not interested at this time.",
    status: "drop",
    tags: [],
    work: ["branding"],
    leadSources: ["Cold Call"]
  },
   {
    id: 5,
    company: "Alpha Logistics",
    phone: "2125559988",
    email: "ops@alphalog.com",
    contactName: "Mike Ross",
    assignedTo: "Vallapata",
    lastContact: "2023-10-29",
    nextFollowUp: "2025-10-30",
    dealValue: 75000.00,
    notes: "Quotation sent for fleet management UI.",
    status: "Quote Sent",
    tags: ["Hot"],
    work: ["software"],
    leadSources: ["Website"]
  }
];

export const MOCK_COMPANIES_DATA: Company[] = [
  {
    id: 1,
    referenceId: "REF-2024-001",
    name: "Acme Innovations",
    work: ["Marketing", "Branding"],
    status: "running",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-10-01T14:00:00Z"
  },
  {
    id: 2,
    referenceId: "REF-2024-002",
    name: "CyberDyne Systems",
    work: ["UI/UX", "Website"],
    status: "not_started",
    createdAt: "2023-02-20T09:30:00Z",
    updatedAt: "2023-02-20T09:30:00Z"
  },
  {
    id: 3,
    referenceId: "REF-2024-003",
    name: "Globex Corporation",
    work: ["Video", "VFX"],
    status: "completed",
    createdAt: "2022-11-05T16:20:00Z",
    updatedAt: "2023-09-15T11:45:00Z"
  },
  {
    id: 4,
    referenceId: "REF-2024-004",
    name: "Soylent Corp",
    work: ["Ads", "Poster"],
    status: "discontinued",
    createdAt: "2023-05-12T08:00:00Z",
    updatedAt: "2023-06-01T10:00:00Z"
  },
  {
    id: 5,
    referenceId: "REF-2024-005",
    name: "Massive Dynamic",
    work: ["LinkedIn", "Marketing"],
    status: "running",
    createdAt: "2023-08-10T13:15:00Z",
    updatedAt: "2023-10-25T09:00:00Z"
  }
];

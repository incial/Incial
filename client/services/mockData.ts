
import { CRMEntry, Task } from '../types';

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
    leadSources: ["Google Business"],
    driveLink: "https://drive.google.com/drive/folders/sample-project-id",
    socials: {
        website: "https://stmarysrubbers.com",
        linkedin: "https://linkedin.com/company/smr-rubbers",
        instagram: "https://instagram.com/smrrubbers",
        twitter: "https://twitter.com/smrrubbers"
    },
    lastUpdatedBy: "Vallapata",
    lastUpdatedAt: "2023-10-26T10:00:00Z",
    referenceId: "REF-2023-001"
  },
  {
    id: 2,
    company: "TechFlow Systems",
    phone: "415-555-0123",
    email: "sarah@techflow.io",
    contactName: "Sarah Connor",
    assignedTo: "John Doe",
    lastContact: "2023-10-20",
    nextFollowUp: "2023-10-24", // Past
    dealValue: 120000.00,
    notes: "Initial meeting went well. Needs tech specs for the new API integration.",
    status: "lead",
    tags: ["New", "Tech"],
    work: ["development", "consulting"],
    leadSources: ["Referral"],
    socials: {
        website: "https://techflow.io",
        linkedin: "https://linkedin.com/company/techflow",
        twitter: "https://twitter.com/techflowsys"
    },
    lastUpdatedBy: "John Doe",
    lastUpdatedAt: "2023-10-21T14:30:00Z"
  },
  {
    id: 3,
    company: "Green Earth Co",
    phone: "555-019-2834",
    email: "info@greenearth.org",
    contactName: "David Green",
    assignedTo: "Vallapata",
    lastContact: "2023-10-28",
    nextFollowUp: "2025-11-01", // Future
    dealValue: 15000.00,
    notes: "Contract signed. Sustainability audit included in the branding package.",
    status: "onboarded",
    tags: ["Eco", "Signed"],
    work: ["consulting", "branding"],
    leadSources: ["LinkedIn"],
    driveLink: "https://drive.google.com/drive/u/0/folders/green-earth-assets",
    socials: {
        website: "https://greenearth.org",
        facebook: "https://facebook.com/greenearth"
    },
    lastUpdatedBy: "Vallapata",
    lastUpdatedAt: "2023-10-29T09:15:00Z",
    referenceId: "REF-2023-003"
  },
  {
    id: 4,
    company: "Nebula Corps",
    phone: "202-555-0111",
    email: "contact@nebula.com",
    contactName: "Nebula Stark",
    assignedTo: "John Doe",
    lastContact: "2023-09-15",
    nextFollowUp: "2023-09-20", // Past
    dealValue: 5000.00,
    notes: "Not interested at this time. Budget constraints.",
    status: "drop",
    tags: ["Budget Issue"],
    work: ["branding"],
    leadSources: ["Cold Call"],
    lastUpdatedBy: "Demo User",
    lastUpdatedAt: "2023-09-16T11:00:00Z"
  },
   {
    id: 5,
    company: "Alpha Logistics",
    phone: "212-555-9988",
    email: "ops@alphalog.com",
    contactName: "Mike Ross",
    assignedTo: "Vallapata",
    lastContact: "2023-10-29",
    nextFollowUp: "2025-10-30",
    dealValue: 75000.00,
    notes: "Quotation sent for fleet management UI dashboard.",
    status: "Quote Sent",
    tags: ["Hot", "Logistics"],
    work: ["software", "UI/UX"],
    leadSources: ["Website"],
    socials: {
        website: "https://alphalog.com",
        facebook: "https://facebook.com/alphalog",
        linkedin: "https://linkedin.com/company/alphalogistics"
    },
    lastUpdatedBy: "Vallapata",
    lastUpdatedAt: "2023-10-29T16:45:00Z",
    referenceId: "REF-2023-005"
  },
  {
    id: 6,
    company: "Quantum Dynamics",
    phone: "650-555-9876",
    email: "contact@quantumdyn.com",
    contactName: "Dr. Freeman",
    assignedTo: "Vallapata",
    lastContact: "2023-11-05",
    nextFollowUp: "2023-11-12",
    dealValue: 250000.00,
    notes: "High potential client. Interested in full rebranding and 3D visualization for their new quantum processor launch.",
    status: "Quote Sent",
    tags: ["Enterprise", "High Value"],
    work: ["branding", "VFX", "video"],
    leadSources: ["Referral"],
    driveLink: "https://drive.google.com/drive/folders/quantum-project-assets",
    socials: {
        website: "https://quantumdyn.com",
        linkedin: "https://linkedin.com/company/quantum-dynamics",
        other: "https://behance.net/quantum-concepts"
    },
    lastUpdatedBy: "Vallapata",
    lastUpdatedAt: "2023-11-06T09:30:00Z",
    referenceId: "REF-2023-006"
  },
  {
    id: 7,
    company: "Blue Sky Retail",
    phone: "321-555-4321",
    email: "marketing@bluesky.store",
    contactName: "Alice Chen",
    assignedTo: "John Doe",
    lastContact: "2023-11-01",
    nextFollowUp: new Date().toISOString().split('T')[0],
    dealValue: 12000.00,
    notes: "Needs a Shopify store setup and Instagram ads strategy.",
    status: "lead",
    tags: ["Retail", "Urgent"],
    work: ["shopify", "Ads"],
    leadSources: ["Social Media"],
    socials: {
        instagram: "https://instagram.com/blueskyretail",
        website: "https://bluesky.store",
        twitter: "https://twitter.com/blueskyretail"
    },
    lastUpdatedBy: "John Doe",
    lastUpdatedAt: "2023-11-02T14:15:00Z"
  },
  {
    id: 8,
    company: "Urban Coffee Roasters",
    phone: "206-555-0011",
    email: "manager@urbancoffee.co",
    contactName: "James Barista",
    assignedTo: "Demo User",
    lastContact: "2023-10-15",
    nextFollowUp: "2024-01-10",
    dealValue: 5000.00,
    notes: "Client ghosted after initial consultation. Mark as cold lead.",
    status: "drop",
    tags: ["Local Business"],
    work: ["poster", "branding"],
    leadSources: ["Direct Walk-in"],
    lastUpdatedBy: "Demo User",
    lastUpdatedAt: "2023-10-20T11:00:00Z"
  },
  {
    id: 9,
    company: "Apex Construction",
    phone: "444-555-8888",
    email: "info@apexbuilds.com",
    contactName: "Robert Apex",
    assignedTo: "Vallapata",
    lastContact: "2023-09-30",
    nextFollowUp: "2024-09-30",
    dealValue: 85000.00,
    notes: "Website and drone videography completed successfully. Archive project.",
    status: "completed",
    tags: ["Loyal"],
    work: ["website", "video"],
    leadSources: ["Partner"],
    driveLink: "https://drive.google.com/drive/folders/apex-final-deliverables",
    socials: {
        website: "https://apexbuilds.com",
        facebook: "https://facebook.com/apexconstruction"
    },
    lastUpdatedBy: "Vallapata",
    lastUpdatedAt: "2023-10-01T16:00:00Z",
    referenceId: "REF-2023-009"
  },
  {
    id: 10,
    company: "Pixel Perfect Studios",
    phone: "213-555-6789",
    email: "creative@pixelperfect.io",
    contactName: "Lisa Art",
    assignedTo: "Vallapata",
    lastContact: "2023-11-08",
    nextFollowUp: "2023-11-15",
    dealValue: 45000.00,
    notes: "Collaborating on a joint venture for UI/UX projects. Regular sync needed.",
    status: "on progress",
    tags: ["Partner"],
    work: ["UI/UX", "consulting"],
    leadSources: ["Event"],
    socials: {
        website: "https://pixelperfect.io",
        linkedin: "https://linkedin.com/company/pixel-perfect",
        twitter: "https://twitter.com/pixelperfect"
    },
    lastUpdatedBy: "Vallapata",
    lastUpdatedAt: "2023-11-08T13:45:00Z",
    referenceId: "REF-2023-010"
  }
];

export const MOCK_TASKS_DATA: Task[] = [
  {
    id: 1,
    companyId: 1,
    title: "Draft Proposal for Acme",
    description: "Create a preliminary branding deck for Acme Innovations based on the last meeting.",
    status: "In Progress",
    priority: "High",
    taskType: "General",
    assignedTo: "Vallapata",
    dueDate: new Date().toISOString().split('T')[0], // Today
    createdAt: "2023-10-20T10:00:00Z",
    taskLink: "https://docs.google.com/document/d/sample-proposal",
    lastUpdatedBy: "Vallapata",
    lastUpdatedAt: "2023-10-20T12:00:00Z"
  },
  {
    id: 2,
    companyId: 2,
    title: "Follow up with TechFlow",
    description: "Send an email regarding the missing technical specifications.",
    status: "Not Started",
    priority: "Medium",
    taskType: "General",
    assignedTo: "John Doe",
    dueDate: "2023-11-05",
    createdAt: "2023-10-21T11:00:00Z",
    lastUpdatedBy: "John Doe",
    lastUpdatedAt: "2023-10-21T11:30:00Z"
  },
  {
    id: 3,
    companyId: 1,
    title: "Update Website Portfolio",
    description: "Add the latest VFX project from Globex to the homepage slider.",
    status: "Done",
    priority: "Low",
    taskType: "Post",
    assignedTo: "Vallapata",
    dueDate: "2023-10-15",
    createdAt: "2023-10-01T09:00:00Z",
    taskLink: "https://stmarysrubbers.com/portfolio",
    lastUpdatedBy: "Vallapata",
    lastUpdatedAt: "2023-10-15T15:45:00Z"
  },
  {
    id: 4,
    companyId: 1,
    title: "New Reel Idea",
    description: "Brainstorm reel ideas for the new product launch.",
    status: "Dropped",
    priority: "Medium",
    taskType: "Reel",
    assignedTo: "Vallapata",
    dueDate: "2023-10-28",
    createdAt: "2023-10-20T10:00:00Z"
  },
  {
    id: 5,
    companyId: 5,
    title: "Prepare Invoice for SMR",
    description: "Finalize the invoice for the logo design work.",
    status: "Not Started",
    priority: "High",
    taskType: "General",
    assignedTo: "Demo User",
    dueDate: "2023-11-01",
    createdAt: "2023-10-25T14:00:00Z",
    lastUpdatedBy: "Demo User",
    lastUpdatedAt: "2023-10-25T14:10:00Z"
  }
];

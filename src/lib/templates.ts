import type { Workflow } from "./types";
import { buildNode, emptyWorkflow, linkEdges } from "./factory";

export interface TemplateDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  accent: string;
  icon: string;
  nodeCount: number;
  steps: string[];
  build: () => Workflow;
}

function node(id: string, type: string, x: number, y: number) {
  return buildNode({ id, type, position: { x, y } });
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "customer-support",
    name: "AI Customer Support",
    tagline: "Classify → Resolve → Verify → Follow up",
    description:
      "Handle inbound support requests end-to-end: classify intent, resolve with an AI agent backed by knowledge search, then route high-value cases to a human and close the loop by email.",
    category: "AI Support",
    accent: "#818cf8",
    icon: "Headphones",
    nodeCount: 7,
    steps: [
      "Webhook receives request",
      "Classifier detects intent",
      "AI agent answers from knowledge base",
      "Human approves high-value replies",
      "Email confirmation to customer",
    ],
    build: () => {
      const wf = emptyWorkflow("AI Customer Support");
      const n1 = node("cs-webhook", "webhook", 40, 260);
      const n2 = node("cs-classify", "classifier", 320, 180);
      const n3 = node("cs-agent", "agent", 600, 180);
      const n4 = node("cs-knowledge", "knowledge", 880, 60);
      const n5 = node("cs-response", "prompt", 880, 260);
      const n6 = node("cs-approval", "approval", 1160, 260);
      const n7 = node("cs-email", "email", 1440, 260);

      wf.nodes = [
        n1,
        n2,
        n3,
        n4,
        n5,
        n6,
        {
          ...n7,
          data: {
            ...n7.data,
            config: { ...n7.data.config, template: "support" },
          },
        },
      ];
      wf.edges = linkEdges(
        [
          { source: "cs-webhook", target: "cs-classify" },
          { source: "cs-classify", target: "cs-agent", sourceHandle: "category" },
          { source: "cs-agent", target: "cs-knowledge", sourceHandle: "toolCalls" },
          {
            source: "cs-knowledge",
            target: "cs-agent",
            sourceHandle: "results",
            targetHandle: "context",
          },
          { source: "cs-agent", target: "cs-response", sourceHandle: "response" },
          { source: "cs-response", target: "cs-approval" },
          { source: "cs-approval", target: "cs-email", sourceHandle: "approved" },
        ],
        new Set()
      );
      wf.meta.status = "ready";
      return wf;
    },
  },
  {
    id: "lead-qualification",
    name: "Lead Qualification & Follow-up",
    tagline: "Extract → Score → Route → Upsert → Nurture",
    description:
      "Capture inbound leads, extract and score them with AI, branch on lead quality, upsert to the CRM, and trigger a tailored follow-up for qualified prospects.",
    category: "Sales",
    accent: "#34d399",
    icon: "Target",
    nodeCount: 7,
    steps: [
      "Webhook captures lead",
      "Extract structured lead data",
      "AI scores lead quality",
      "Condition routes qualified leads",
      "CRM upsert + follow-up email",
    ],
    build: () => {
      const wf = emptyWorkflow("Lead Qualification & Follow-up");
      wf.nodes = [
        node("lq-webhook", "webhook", 40, 280),
        node("lq-extract", "extract", 320, 200),
        node("lq-qualify", "agent", 600, 200),
        node("lq-score", "llm", 880, 200),
        node("lq-condition", "condition", 1160, 200),
        node("lq-crm", "crm", 1440, 60),
        node("lq-email", "email", 1440, 320),
      ];
      wf.edges = linkEdges(
        [
          { source: "lq-webhook", target: "lq-extract" },
          { source: "lq-extract", target: "lq-qualify", sourceHandle: "fields" },
          { source: "lq-qualify", target: "lq-score", sourceHandle: "response" },
          { source: "lq-score", target: "lq-condition", sourceHandle: "completion" },
          { source: "lq-condition", target: "lq-crm", sourceHandle: "true" },
          { source: "lq-condition", target: "lq-email", sourceHandle: "false" },
        ],
        new Set()
      );
      wf.meta.status = "ready";
      return wf;
    },
  },
  {
    id: "invoice-processing",
    name: "Invoice Processing",
    tagline: "Extract → Validate → Approve → Store → Notify",
    description:
      "Automate the accounts-payable pipeline: parse invoice data, validate against business rules, escalate to an approver for high amounts, then persist and notify.",
    category: "Finance",
    accent: "#f472b6",
    icon: "ReceiptText",
    nodeCount: 7,
    steps: [
      "Event triggers on upload",
      "Extract invoice line items",
      "Validate totals and vendor",
      "Condition on amount threshold",
      "Approval then database + notify",
    ],
    build: () => {
      const wf = emptyWorkflow("Invoice Processing");
      wf.nodes = [
        node("inv-upload", "schedule", 40, 260),
        node("inv-extract", "extract", 320, 180),
        node("inv-validate", "validate", 600, 180),
        node("inv-condition", "condition", 880, 180),
        node("inv-approval", "approval", 1160, 40),
        node("inv-db", "database", 1160, 320),
        node("inv-notify", "notification", 1440, 180),
      ];
      wf.edges = linkEdges(
        [
          { source: "inv-upload", target: "inv-extract", sourceHandle: "tick" },
          { source: "inv-extract", target: "inv-validate", sourceHandle: "fields" },
          {
            source: "inv-validate",
            target: "inv-condition",
            sourceHandle: "valid",
          },
          { source: "inv-condition", target: "inv-approval", sourceHandle: "true" },
          { source: "inv-condition", target: "inv-db", sourceHandle: "false" },
          {
            source: "inv-approval",
            target: "inv-db",
            sourceHandle: "approved",
          },
          { source: "inv-db", target: "inv-notify", sourceHandle: "rows" },
        ],
        new Set()
      );
      wf.meta.status = "ready";
      return wf;
    },
  },
  {
    id: "document-processing",
    name: "AI Document Processing",
    tagline: "OCR → Summarize → Classify → Store → Notify",
    description:
      "Ingest uploaded documents, run OCR to extract text, summarize and classify content with AI, then store the result and notify the requesting team.",
    category: "Documents",
    accent: "#38bdf8",
    icon: "FileText",
    nodeCount: 6,
    steps: [
      "Upload event triggers",
      "OCR extracts document text",
      "AI summarizes the content",
      "Classifier tags document type",
      "Store result + notify team",
    ],
    build: () => {
      const wf = emptyWorkflow("AI Document Processing");
      wf.nodes = [
        node("doc-upload", "webhook", 40, 240),
        node("doc-ocr", "ocr", 320, 160),
        node("doc-summarize", "summarize", 600, 160),
        node("doc-classify", "classifier", 880, 160),
        node("doc-store", "database", 1160, 60),
        node("doc-notify", "notification", 1160, 260),
      ];
      wf.edges = linkEdges(
        [
          { source: "doc-upload", target: "doc-ocr" },
          { source: "doc-ocr", target: "doc-summarize", sourceHandle: "text" },
          { source: "doc-summarize", target: "doc-classify", sourceHandle: "summary" },
          { source: "doc-classify", target: "doc-store", sourceHandle: "category" },
          { source: "doc-classify", target: "doc-notify", sourceHandle: "category" },
        ],
        new Set()
      );
      wf.meta.status = "ready";
      return wf;
    },
  },
];

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

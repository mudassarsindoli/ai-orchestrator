import type { NodeConfig } from "./types";

export const CATEGORIES = [
  "Triggers",
  "AI",
  "Logic",
  "Integrations",
  "Data",
  "Actions",
] as const;

export const NODE_CATALOG: Record<string, NodeConfig> = {};

function define(config: NodeConfig) {
  NODE_CATALOG[config.type] = config;
  return config;
}

// ─── Triggers ──────────────────────────────────────────────────────────────

define({
  type: "manual",
  label: "Manual Trigger",
  category: "Triggers",
  icon: "Zap",
  accent: "#f59e0b",
  headline: "Run workflow manually",
  description:
    "Start the workflow when a user clicks Run in the editor or via the API.",
  inputs: [],
  outputs: ["run"],
  fields: [
    {
      key: "label",
      label: "Trigger Name",
      type: "text",
      default: "Manual Trigger",
      required: true,
    },
    {
      key: "payload",
      label: "Sample Payload",
      type: "textarea",
      default: '{\n  "requestId": "req_123"\n}',
      help: "Payload injected into the downstream context.",
    },
  ],
});

define({
  type: "webhook",
  label: "Webhook",
  category: "Triggers",
  icon: "Webhook",
  accent: "#818cf8",
  headline: "Receive incoming HTTP",
  description:
    "Fire the workflow whenever a third-party service POSTs to the webhook URL.",
  inputs: [],
  outputs: ["payload"],
  fields: [
    {
      key: "method",
      label: "Method",
      type: "select",
      default: "POST",
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
      ],
    },
    {
      key: "path",
      label: "Webhook Path",
      type: "text",
      default: "/webhook/ai-orchestration",
      required: true,
    },
    {
      key: "respond",
      label: "Auto Respond",
      type: "toggle",
      default: true,
      help: "Automatically acknowledge the request.",
    },
  ],
});

define({
  type: "schedule",
  label: "Schedule",
  category: "Triggers",
  icon: "CalendarClock",
  accent: "#34d399",
  headline: "Run on a schedule",
  description:
    "Trigger the workflow at fixed intervals or cron expressions.",
  inputs: [],
  outputs: ["tick"],
  fields: [
    {
      key: "interval",
      label: "Interval",
      type: "select",
      default: "hourly",
      options: [
        { value: "minutely", label: "Every minute" },
        { value: "hourly", label: "Hourly" },
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
      ],
    },
    {
      key: "cron",
      label: "Cron Expression",
      type: "text",
      default: "0 * * * *",
      help: "Advanced cron syntax overrides interval.",
    },
    {
      key: "timezone",
      label: "Timezone",
      type: "select",
      default: "UTC",
      options: [
        { value: "UTC", label: "UTC" },
        { value: "America/New_York", label: "America/New_York" },
        { value: "Europe/London", label: "Europe/London" },
        { value: "Asia/Kolkata", label: "Asia/Kolkata" },
      ],
    },
  ],
});

// ─── AI ────────────────────────────────────────────────────────────────────

define({
  type: "llm",
  label: "LLM",
  category: "AI",
  icon: "Brain",
  accent: "#a78bfa",
  headline: "Call a large language model",
  description:
    "Send a prompt to an LLM provider and capture a streamed completion.",
  inputs: ["prompt"],
  outputs: ["completion"],
  fields: [
    {
      key: "provider",
      label: "Provider",
      type: "select",
      default: "openai",
      options: [
        { value: "openai", label: "OpenAI" },
        { value: "anthropic", label: "Anthropic" },
        { value: "bedrock", label: "AWS Bedrock" },
        { value: "gemini", label: "Google Gemini" },
      ],
    },
    {
      key: "model",
      label: "Model",
      type: "select",
      default: "gpt-4o-mini",
      options: [
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4o-mini", label: "GPT-4o mini" },
        { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
        { value: "claude-3-haiku", label: "Claude 3 Haiku" },
      ],
    },
    {
      key: "temperature",
      label: "Temperature",
      type: "number",
      default: 0.7,
    },
    {
      key: "maxTokens",
      label: "Max Tokens",
      type: "number",
      default: 1024,
    },
  ],
});

define({
  type: "agent",
  label: "AI Agent",
  category: "AI",
  icon: "Bot",
  accent: "#c084fc",
  headline: "Autonomous reasoning agent",
  description:
    "An agent that plans, calls tools and memory, then returns an answer.",
  inputs: ["query", "context"],
  outputs: ["response", "toolCalls"],
  fields: [
    {
      key: "systemPrompt",
      label: "System Prompt",
      type: "textarea",
      default:
        "You are a helpful support assistant. Answer concisely using the provided context.",
    },
    {
      key: "tools",
      label: "Tools",
      type: "select-multi",
      default: ["knowledge_search", "email"],
      options: [
        { value: "knowledge_search", label: "Knowledge Search" },
        { value: "email", label: "Send Email" },
        { value: "http_request", label: "HTTP Request" },
        { value: "crm", label: "CRM Lookup" },
      ],
    },
    {
      key: "memory",
      label: "Conversation Memory",
      type: "toggle",
      default: true,
    },
  ],
});

define({
  type: "prompt",
  label: "Prompt",
  category: "AI",
  icon: "MessageSquareText",
  accent: "#60a5fa",
  headline: "Templated prompt builder",
  description:
    "Compose a prompt from input context and template variables.",
  inputs: ["context"],
  outputs: ["prompt"],
  fields: [
    {
      key: "template",
      label: "Prompt Template",
      type: "textarea",
      default:
        "Given the following customer request {{input.request}}, produce a professional response.",
    },
    {
      key: "system",
      label: "System Role",
      type: "text",
      default: "You are an expert assistant.",
    },
  ],
});

define({
  type: "classifier",
  label: "Classifier",
  category: "AI",
  icon: "Tags",
  accent: "#f472b6",
  headline: "Classify input data",
  description:
    "Use an LLM or rules to tag incoming data with a categorical label.",
  inputs: ["data"],
  outputs: ["category", "fallback"],
  fields: [
    {
      key: "categories",
      label: "Categories",
      type: "text",
      default: "billing, technical, sales, general",
      help: "Comma-separated list of possible labels.",
    },
    {
      key: "engine",
      label: "Engine",
      type: "select",
      default: "llm",
      options: [
        { value: "llm", label: "LLM" },
        { value: "rules", label: "Rule-based" },
        { value: "regex", label: "Regex" },
      ],
    },
  ],
});

define({
  type: "extract",
  label: "Extract Data",
  category: "AI",
  icon: "ScanSearch",
  accent: "#2dd4bf",
  headline: "Extract structured fields",
  description:
    "Pull structured attributes out of unstructured text or documents.",
  inputs: ["source"],
  outputs: ["fields"],
  fields: [
    {
      key: "schema",
      label: "Extraction Schema",
      type: "textarea",
      default: "name, email, company, amount, invoiceNumber",
      help: "Comma-separated fields to extract.",
    },
    {
      key: "strict",
      label: "Strict Schema",
      type: "toggle",
      default: true,
    },
  ],
});

define({
  type: "summarize",
  label: "Summarization",
  category: "AI",
  icon: "AlignLeft",
  accent: "#fbbf24",
  headline: "Summarize a document",
  description: "Condense a long document into a concise summary.",
  inputs: ["document"],
  outputs: ["summary"],
  fields: [
    {
      key: "length",
      label: "Summary Length",
      type: "select",
      default: "medium",
      options: [
        { value: "short", label: "Short" },
        { value: "medium", label: "Medium" },
        { value: "long", label: "Long" },
      ],
    },
    {
      key: "style",
      label: "Style",
      type: "select",
      default: "bullet",
      options: [
        { value: "bullet", label: "Bullet points" },
        { value: "paragraph", label: "Paragraph" },
      ],
    },
  ],
});

define({
  type: "knowledge",
  label: "Knowledge Search",
  category: "AI",
  icon: "DatabaseZap",
  accent: "#38bdf8",
  headline: "Semantic knowledge lookup",
  description:
    "Query a vector store and retrieve the most relevant chunks.",
  inputs: ["query"],
  outputs: ["results", "empty"],
  fields: [
    {
      key: "collection",
      label: "Collection",
      type: "text",
      default: "help-center",
    },
    {
      key: "topK",
      label: "Top-K Results",
      type: "number",
      default: 5,
    },
    {
      key: "threshold",
      label: "Relevance Threshold",
      type: "number",
      default: 0.7,
    },
  ],
});

define({
  type: "ocr",
  label: "OCR",
  category: "AI",
  icon: "FileScan",
  accent: "#fb7185",
  headline: "Extract text from images",
  description:
    "Convert scanned documents and images into machine-readable text.",
  inputs: ["file"],
  outputs: ["text"],
  fields: [
    {
      key: "engine",
      label: "Engine",
      type: "select",
      default: "tesseract",
      options: [
        { value: "tesseract", label: "Tesseract" },
        { value: "cloud", label: "Cloud Vision" },
        { value: "llm", label: "Multimodal LLM" },
      ],
    },
    {
      key: "language",
      label: "Language",
      type: "select",
      default: "en",
      options: [
        { value: "en", label: "English" },
        { value: "fr", label: "French" },
        { value: "de", label: "German" },
        { value: "es", label: "Spanish" },
        { value: "hi", label: "Hindi" },
      ],
    },
  ],
});

// ─── Logic ─────────────────────────────────────────────────────────────────

define({
  type: "condition",
  label: "Condition",
  category: "Logic",
  icon: "GitBranch",
  accent: "#a3e635",
  headline: "Route on a true/false condition",
  description:
    "Evaluate an expression and branch between true and false paths.",
  inputs: ["data"],
  outputs: ["true", "false"],
  fields: [
    {
      key: "lhs",
      label: "Left Operand",
      type: "text",
      default: "{{input.category}}",
    },
    {
      key: "operator",
      label: "Operator",
      type: "select",
      default: "equals",
      options: [
        { value: "equals", label: "Equals" },
        { value: "notEquals", label: "Not equals" },
        { value: "contains", label: "Contains" },
        { value: "greaterThan", label: "Greater than" },
        { value: "lessThan", label: "Less than" },
      ],
    },
    {
      key: "rhs",
      label: "Right Operand",
      type: "text",
      default: "billing",
    },
  ],
});

define({
  type: "switch",
  label: "Switch",
  category: "Logic",
  icon: "GitMerge",
  accent: "#4ade80",
  headline: "Multi-way routing",
  description: "Route to one of several branches based on input value.",
  inputs: ["value"],
  outputs: ["case1", "case2", "case3", "default"],
  fields: [
    {
      key: "inputField",
      label: "Switch On",
      type: "text",
      default: "{{input.priority}}",
    },
    {
      key: "case1",
      label: "Case 1",
      type: "text",
      default: "high",
    },
    {
      key: "case2",
      label: "Case 2",
      type: "text",
      default: "medium",
    },
    {
      key: "case3",
      label: "Case 3",
      type: "text",
      default: "low",
    },
  ],
});

define({
  type: "loop",
  label: "Loop",
  category: "Logic",
  icon: "Repeat",
  accent: "#22c55e",
  headline: "Iterate over items",
  description: "Repeat downstream steps for each item in an array.",
  inputs: ["items"],
  outputs: ["item"],
  fields: [
    {
      key: "collection",
      label: "Collection",
      type: "text",
      default: "{{input.items}}",
    },
    {
      key: "maxIterations",
      label: "Max Iterations",
      type: "number",
      default: 100,
    },
    {
      key: "concurrency",
      label: "Concurrency",
      type: "number",
      default: 4,
    },
  ],
});

define({
  type: "merge",
  label: "Merge",
  category: "Logic",
  icon: "Combine",
  accent: "#84cc16",
  headline: "Combine multiple branches",
  description:
    "Wait for all inbound branches and merge their outputs into one record.",
  inputs: ["input1", "input2", "input3"],
  outputs: ["merged"],
  fields: [
    {
      key: "mode",
      label: "Merge Mode",
      type: "select",
      default: "object",
      options: [
        { value: "object", label: "Merge into object" },
        { value: "array", label: "Concatenate arrays" },
      ],
    },
  ],
});

define({
  type: "delay",
  label: "Delay",
  category: "Logic",
  icon: "Timer",
  accent: "#fbbf24",
  headline: "Pause execution",
  description: "Insert a pause before continuing the workflow.",
  inputs: ["in"],
  outputs: ["out"],
  fields: [
    {
      key: "seconds",
      label: "Delay (seconds)",
      type: "number",
      default: 2,
    },
    {
      key: "varies",
      label: "Allow variance",
      type: "toggle",
      default: false,
    },
  ],
});

// ─── Integrations ──────────────────────────────────────────────────────────

define({
  type: "http",
  label: "HTTP Request",
  category: "Integrations",
  icon: "Globe",
  accent: "#38bdf8",
  headline: "Call an external HTTP endpoint",
  description: "Send an HTTP request and use the response downstream.",
  inputs: ["body"],
  outputs: ["response"],
  fields: [
    {
      key: "method",
      label: "Method",
      type: "select",
      default: "GET",
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
        { value: "PATCH", label: "PATCH" },
        { value: "DELETE", label: "DELETE" },
      ],
    },
    {
      key: "url",
      label: "URL",
      type: "text",
      default: "https://api.example.com/v1/endpoint",
      required: true,
    },
    {
      key: "headers",
      label: "Headers (JSON)",
      type: "textarea",
      default: '{  "Content-Type": "application/json" }',
    },
  ],
});

define({
  type: "rest",
  label: "REST API",
  category: "Integrations",
  icon: "Server",
  accent: "#818cf8",
  headline: "REST API operation",
  description:
    "Full REST operation with auth, params and response handling.",
  inputs: ["params"],
  outputs: ["data"],
  fields: [
    {
      key: "verb",
      label: "Verb",
      type: "select",
      default: "GET",
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
      ],
    },
    {
      key: "baseUrl",
      label: "Base URL",
      type: "text",
      default: "https://api.corp.example.com",
    },
    {
      key: "resource",
      label: "Resource",
      type: "text",
      default: "/customers",
    },
    {
      key: "auth",
      label: "Auth",
      type: "select",
      default: "bearer",
      options: [
        { value: "none", label: "None" },
        { value: "bearer", label: "Bearer token" },
        { value: "api-key", label: "API key" },
        { value: "oauth2", label: "OAuth2" },
      ],
    },
  ],
});

define({
  type: "crm",
  label: "CRM",
  category: "Integrations",
  icon: "Contact",
  accent: "#34d399",
  headline: "CRM record operation",
  description:
    "Create, update or search records in a CRM system such as Salesforce or HubSpot.",
  inputs: ["customer"],
  outputs: ["record", "notFound"],
  fields: [
    {
      key: "system",
      label: "System",
      type: "select",
      default: "salesforce",
      options: [
        { value: "salesforce", label: "Salesforce" },
        { value: "hubspot", label: "HubSpot" },
        { value: "pipedrive", label: "Pipedrive" },
      ],
    },
    {
      key: "operation",
      label: "Operation",
      type: "select",
      default: "upsert",
      options: [
        { value: "create", label: "Create" },
        { value: "update", label: "Update" },
        { value: "upsert", label: "Upsert" },
        { value: "lookup", label: "Lookup" },
      ],
    },
    {
      key: "object",
      label: "Object",
      type: "text",
      default: "Lead",
    },
  ],
});

define({
  type: "database",
  label: "Database",
  category: "Integrations",
  icon: "Database",
  accent: "#60a5fa",
  headline: "Run a database operation",
  description:
    "Execute a query or write statement against a connected datastore.",
  inputs: ["params"],
  outputs: ["rows"],
  fields: [
    {
      key: "connection",
      label: "Connection",
      type: "select",
      default: "postgres-prod",
      options: [
        { value: "postgres-prod", label: "Postgres (Prod)" },
        { value: "mongodb", label: "MongoDB" },
        { value: "snowflake", label: "Snowflake" },
        { value: "mysql", label: "MySQL" },
      ],
    },
    {
      key: "operation",
      label: "Operation",
      type: "select",
      default: "insert",
      options: [
        { value: "select", label: "SELECT" },
        { value: "insert", label: "INSERT" },
        { value: "update", label: "UPDATE" },
        { value: "delete", label: "DELETE" },
      ],
    },
    {
      key: "table",
      label: "Table",
      type: "text",
      default: "invoices",
    },
  ],
});

define({
  type: "email",
  label: "Email",
  category: "Actions",
  icon: "Mail",
  accent: "#fb7185",
  headline: "Send an email",
  description: "Send a transactional email to one or more recipients.",
  inputs: ["body"],
  outputs: ["sent"],
  fields: [
    {
      key: "to",
      label: "To",
      type: "text",
      default: "{{input.customer.email}}",
      required: true,
    },
    {
      key: "subject",
      label: "Subject",
      type: "text",
      default: "Your request has been resolved",
    },
    {
      key: "template",
      label: "Template",
      type: "select",
      default: "default",
      options: [
        { value: "default", label: "Default" },
        { value: "support", label: "Support reply" },
        { value: "followup", label: "Follow-up" },
      ],
    },
  ],
});

define({
  type: "slack",
  label: "Slack",
  category: "Actions",
  icon: "MessageCircle",
  accent: "#f97316",
  headline: "Send a Slack message",
  description: "Post a message to a Slack channel or user.",
  inputs: ["text"],
  outputs: ["posted"],
  fields: [
    {
      key: "channel",
      label: "Channel",
      type: "text",
      default: "#alerts",
    },
    {
      key: "mention",
      label: "Mention",
      type: "toggle",
      default: false,
    },
    {
      key: "thread",
      label: "Reply in thread",
      type: "toggle",
      default: false,
    },
  ],
});

define({
  type: "notification",
  label: "Notification",
  category: "Actions",
  icon: "Bell",
  accent: "#fde047",
  headline: "Send a notification",
  description:
    "Deliver a notification across configured channels.",
  inputs: ["message"],
  outputs: ["delivered"],
  fields: [
    {
      key: "channels",
      label: "Channels",
      type: "select-multi",
      default: ["inbox"],
      options: [
        { value: "inbox", label: "Inbox" },
        { value: "email", label: "Email" },
        { value: "sms", label: "SMS" },
        { value: "push", label: "Push" },
      ],
    },
    {
      key: "title",
      label: "Title",
      type: "text",
      default: "Workflow update",
    },
  ],
});

// ─── Data / Actions ────────────────────────────────────────────────────────

define({
  type: "transform",
  label: "Transform Data",
  category: "Data",
  icon: "IterationCw",
  accent: "#2dd4bf",
  headline: "Map and transform data",
  description:
    "Shape, rename and compute fields in the pipeline payload.",
  inputs: ["data"],
  outputs: ["transformed"],
  fields: [
    {
      key: "mapping",
      label: "Field Mapping",
      type: "textarea",
      default: '{\n  "fullName": "{{input.firstName}} {{input.lastName}}"\n}',
    },
    {
      key: "includeRaw",
      label: "Include raw input",
      type: "toggle",
      default: false,
    },
  ],
});

define({
  type: "validate",
  label: "Validate Data",
  category: "Data",
  icon: "BadgeCheck",
  accent: "#4ade80",
  headline: "Validate against a schema",
  description:
    "Ensure the payload meets an expected schema before continuing.",
  inputs: ["data"],
  outputs: ["valid", "invalid"],
  fields: [
    {
      key: "schema",
      label: "Validation Rules",
      type: "textarea",
      default: '{\n  "invoiceNumber": "required|string",\n  "total": "required|number|min:0"\n}',
    },
    {
      key: "onInvalid",
      label: "On invalid",
      type: "select",
      default: "fail",
      options: [
        { value: "fail", label: "Fail step" },
        { value: "route", label: "Route to invalid output" },
        { value: "warn", label: "Warn and continue" },
      ],
    },
  ],
});

define({
  type: "approval",
  label: "Human Approval",
  category: "Actions",
  icon: "ShieldCheck",
  accent: "#f472b6",
  headline: "Require human sign-off",
  description:
    "Pause until an approver reviews and approves or rejects the step.",
  inputs: ["item"],
  outputs: ["approved", "rejected"],
  fields: [
    {
      key: "approvers",
      label: "Approvers",
      type: "text",
      default: "finance@corp.example.com",
    },
    {
      key: "busyUntil",
      label: "Timeout (hours)",
      type: "number",
      default: 24,
    },
    {
      key: "escalate",
      label: "Escalate on timeout",
      type: "toggle",
      default: true,
    },
  ],
});

export const NODE_ORDER: string[] = Object.keys(NODE_CATALOG);

export function getNodeConfig(type: string): NodeConfig {
  return (
    NODE_CATALOG[type] ?? {
      type,
      label: "Unknown",
      category: "Actions",
      icon: "Box",
      accent: "#9ca3af",
      headline: "Unknown node",
      description: "Unrecognized node type.",
      inputs: ["in"],
      outputs: ["out"],
      fields: [],
    }
  );
}

export const NODE_COUNT = Object.keys(NODE_CATALOG).length;

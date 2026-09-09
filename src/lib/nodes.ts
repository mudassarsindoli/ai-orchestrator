import type { NodeConfig } from "./types";

export const CATEGORIES = [
  "Triggers",
  "Apps",
  "AI",
  "Logic",
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
  label: "Manually",
  service: "Manual",
  category: "Triggers",
  icon: "MousePointerClick",
  color: "#6b7280",
  accent: "#6b7280",
  headline: "Run workflow manually",
  description: "Start the workflow when you click the Execute Workflow button.",
  inputs: [],
  outputs: ["main"],
  fields: [
    {
      key: "payload",
      label: "Test Data (JSON)",
      type: "textarea",
      default: '{\n  "name": "John",\n  "email": "john@example.com"\n}',
      help: "Sample data that will be available to the first node.",
    },
  ],
});

define({
  type: "webhook",
  label: "Webhook",
  service: "Webhook",
  category: "Triggers",
  icon: "Globe",
  color: "#3b82f6",
  accent: "#3b82f6",
  headline: "Receive HTTP requests",
  description: "Start the workflow when an HTTP request is sent to this webhook URL.",
  inputs: [],
  outputs: ["main"],
  fields: [
    {
      key: "method",
      label: "HTTP Method",
      type: "select",
      default: "POST",
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
        { value: "PATCH", label: "PATCH" },
      ],
    },
    {
      key: "path",
      label: "Webhook Path",
      type: "text",
      default: "/webhook/my-workflow",
      required: true,
    },
  ],
});

define({
  type: "schedule",
  label: "Schedule Trigger",
  service: "Schedule",
  category: "Triggers",
  icon: "Clock",
  color: "#8b5cf6",
  accent: "#8b5cf6",
  headline: "Run on a schedule",
  description: "Trigger this workflow automatically at regular intervals.",
  inputs: [],
  outputs: ["main"],
  fields: [
    {
      key: "interval",
      label: "Run Every",
      type: "select",
      default: "hourly",
      options: [
        { value: "minute", label: "1 Minute" },
        { value: "fiveminutes", label: "5 Minutes" },
        { value: "hourly", label: "1 Hour" },
        { value: "daily", label: "1 Day" },
        { value: "weekly", label: "1 Week" },
      ],
    },
  ],
});

define({
  type: "whatsapp_trigger",
  label: "WhatsApp Trigger",
  service: "WhatsApp",
  category: "Triggers",
  icon: "MessageCircle",
  color: "#25D366",
  accent: "#25D366",
  headline: "Receive WhatsApp messages",
  description: "Start the workflow when a message is received on WhatsApp.",
  inputs: [],
  outputs: ["main"],
  fields: [
    {
      key: "event",
      label: "Listen For",
      type: "select",
      default: "messages",
      options: [
        { value: "messages", label: "All Messages" },
        { value: "text", label: "Text Messages Only" },
        { value: "media", label: "Media Messages Only" },
      ],
    },
  ],
});

define({
  type: "email_trigger",
  label: "Email Trigger",
  service: "Email",
  category: "Triggers",
  icon: "Mail",
  color: "#ea4335",
  accent: "#ea4335",
  headline: "Receive incoming emails",
  description: "Start the workflow when a new email arrives in the connected inbox.",
  inputs: [],
  outputs: ["main"],
  fields: [
    {
      key: "mailbox",
      label: "Mailbox",
      type: "select",
      default: "inbox",
      options: [
        { value: "inbox", label: "Inbox" },
        { value: "sent", label: "Sent" },
      ],
    },
    {
      key: "filter",
      label: "Subject Filter",
      type: "text",
      placeholder: "e.g. Invoice",
      help: "Only trigger for emails matching this subject text.",
    },
  ],
});

// ─── Apps & Integrations ──────────────────────────────────────────────────

define({
  type: "whatsapp",
  label: "Send WhatsApp Message",
  service: "WhatsApp",
  category: "Apps",
  icon: "MessageCircle",
  color: "#25D366",
  accent: "#25D366",
  headline: "Send a WhatsApp message",
  description: "Send a text or media message to a WhatsApp contact or group.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "to",
      label: "To (Phone Number)",
      type: "text",
      placeholder: "+1 234 567 8900",
      required: true,
      help: "Phone number with country code.",
    },
    {
      key: "message",
      label: "Message",
      type: "textarea",
      default: "Hello! This is an automated message.",
      required: true,
    },
    {
      key: "mediaUrl",
      label: "Media URL (optional)",
      type: "text",
      placeholder: "https://example.com/image.jpg",
      help: "URL of image, video, or document to send.",
    },
  ],
});

define({
  type: "gmail",
  label: "Gmail",
  service: "Gmail",
  category: "Apps",
  icon: "Mail",
  color: "#EA4335",
  accent: "#EA4335",
  headline: "Send an email via Gmail",
  description: "Send an email using your Gmail account. Requires Google credentials.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "to",
      label: "To",
      type: "text",
      required: true,
      placeholder: "recipient@example.com",
    },
    {
      key: "subject",
      label: "Subject",
      type: "text",
      required: true,
    },
    {
      key: "body",
      label: "Email Body",
      type: "textarea",
      required: true,
    },
    {
      key: "isHtml",
      label: "HTML Content",
      type: "toggle",
      default: false,
    },
  ],
});

define({
  type: "slack",
  label: "Slack",
  service: "Slack",
  category: "Apps",
  icon: "Hash",
  color: "#4A154B",
  accent: "#4A154B",
  headline: "Send a Slack message",
  description: "Post a message to a Slack channel or send a direct message.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "channel",
      label: "Channel",
      type: "text",
      default: "#general",
      required: true,
      help: "Channel name (e.g. #general) or user ID for DMs.",
    },
    {
      key: "message",
      label: "Message",
      type: "textarea",
      required: true,
    },
    {
      key: "thread",
      label: "Reply in Thread",
      type: "toggle",
      default: false,
    },
  ],
});

define({
  type: "http",
  label: "HTTP Request",
  service: "HTTP",
  category: "Apps",
  icon: "Globe",
  color: "#3b82f6",
  accent: "#3b82f6",
  headline: "Make an HTTP request",
  description: "Send an HTTP request to any API endpoint and use the response.",
  inputs: ["main"],
  outputs: ["main"],
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
      required: true,
      placeholder: "https://api.example.com/data",
    },
    {
      key: "headers",
      label: "Headers (JSON)",
      type: "textarea",
      default: '{\n  "Content-Type": "application/json"\n}',
    },
    {
      key: "body",
      label: "Body (JSON)",
      type: "textarea",
      placeholder: '{\n  "key": "value"\n}',
    },
  ],
});

define({
  type: "rest",
  label: "REST API",
  service: "REST API",
  category: "Apps",
  icon: "Server",
  color: "#6366f1",
  accent: "#6366f1",
  headline: "Call a REST API",
  description: "Make a RESTful API call with authentication and response handling.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "verb",
      label: "HTTP Verb",
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
      required: true,
      placeholder: "https://api.example.com",
    },
    {
      key: "resource",
      label: "Resource Path",
      type: "text",
      default: "/items",
    },
    {
      key: "auth",
      label: "Authentication",
      type: "select",
      default: "bearer",
      options: [
        { value: "none", label: "None" },
        { value: "bearer", label: "Bearer Token" },
        { value: "api-key", label: "API Key" },
      ],
    },
  ],
});

define({
  type: "database",
  label: "Database",
  service: "Database",
  category: "Apps",
  icon: "Database",
  color: "#2563eb",
  accent: "#2563eb",
  headline: "Query a database",
  description: "Run a SELECT, INSERT, UPDATE, or DELETE query on your database.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "connection",
      label: "Connection",
      type: "select",
      default: "postgres",
      options: [
        { value: "postgres", label: "PostgreSQL" },
        { value: "mysql", label: "MySQL" },
        { value: "mongodb", label: "MongoDB" },
      ],
    },
    {
      key: "operation",
      label: "Operation",
      type: "select",
      default: "select",
      options: [
        { value: "select", label: "Find/Select" },
        { value: "insert", label: "Insert" },
        { value: "update", label: "Update" },
        { value: "delete", label: "Delete" },
      ],
    },
    {
      key: "table",
      label: "Table / Collection",
      type: "text",
      required: true,
      placeholder: "users",
    },
  ],
});

define({
  type: "crm",
  label: "CRM",
  service: "Salesforce",
  category: "Apps",
  icon: "Contact",
  color: "#00a1e0",
  accent: "#00a1e0",
  headline: "Manage CRM records",
  description: "Create, update, or search records in Salesforce, HubSpot, or other CRMs.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "system",
      label: "CRM System",
      type: "select",
      default: "salesforce",
      options: [
        { value: "salesforce", label: "Salesforce" },
        { value: "hubspot", label: "HubSpot" },
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
      type: "select",
      default: "Lead",
      options: [
        { value: "Lead", label: "Lead" },
        { value: "Contact", label: "Contact" },
        { value: "Opportunity", label: "Opportunity" },
      ],
    },
  ],
});

define({
  type: "google_sheets",
  label: "Google Sheets",
  service: "Google Sheets",
  category: "Apps",
  icon: "Table",
  color: "#0f9d58",
  accent: "#0f9d58",
  headline: "Read or write Google Sheets",
  description: "Append, update, or read rows from a Google Spreadsheet.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "operation",
      label: "Operation",
      type: "select",
      default: "append",
      options: [
        { value: "append", label: "Append Row" },
        { value: "read", label: "Read Rows" },
        { value: "update", label: "Update Row" },
      ],
    },
    {
      key: "sheetId",
      label: "Spreadsheet ID",
      type: "text",
      required: true,
      help: "Found in the Google Sheets URL.",
    },
    {
      key: "range",
      label: "Sheet Range",
      type: "text",
      default: "Sheet1!A:Z",
    },
  ],
});

define({
  type: "notion",
  label: "Notion",
  service: "Notion",
  category: "Apps",
  icon: "BookOpen",
  color: "#000000",
  accent: "#323130",
  headline: "Interact with Notion",
  description: "Create, update, or query pages and databases in Notion.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "resource",
      label: "Resource",
      type: "select",
      default: "page",
      options: [
        { value: "page", label: "Page" },
        { value: "database", label: "Database" },
      ],
    },
    {
      key: "operation",
      label: "Operation",
      type: "select",
      default: "create",
      options: [
        { value: "create", label: "Create" },
        { value: "get", label: "Get" },
        { value: "update", label: "Update" },
        { value: "search", label: "Search" },
      ],
    },
  ],
});

// ─── AI & Intelligence ────────────────────────────────────────────────────

define({
  type: "openai",
  label: "OpenAI",
  service: "OpenAI",
  category: "AI",
  icon: "Sparkles",
  color: "#10a37f",
  accent: "#10a37f",
  headline: "Call OpenAI models",
  description: "Send a prompt to GPT-4, GPT-4o, or other OpenAI models and get a response.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "model",
      label: "Model",
      type: "select",
      default: "gpt-4o",
      options: [
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4o-mini", label: "GPT-4o Mini" },
        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
      ],
    },
    {
      key: "prompt",
      label: "Prompt",
      type: "textarea",
      required: true,
      default: "You are a helpful assistant.",
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
  type: "claude",
  label: "Claude AI",
  service: "Claude",
  category: "AI",
  icon: "Brain",
  color: "#d97706",
  accent: "#d97706",
  headline: "Call Claude by Anthropic",
  description: "Send a message to Claude and get an intelligent response.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "model",
      label: "Model",
      type: "select",
      default: "claude-sonnet-4-20250514",
      options: [
        { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
        { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
        { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
      ],
    },
    {
      key: "prompt",
      label: "Prompt",
      type: "textarea",
      required: true,
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
  type: "ai_agent",
  label: "AI Agent",
  service: "AI Agent",
  category: "AI",
  icon: "Bot",
  color: "#8b5cf6",
  accent: "#8b5cf6",
  headline: "Autonomous AI agent",
  description: "An AI agent that can reason, use tools, and accomplish complex tasks step by step.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "systemPrompt",
      label: "System Instructions",
      type: "textarea",
      default: "You are a helpful assistant. Use the provided tools to answer the user's question.",
    },
    {
      key: "tools",
      label: "Available Tools",
      type: "select-multi",
      default: ["web_search", "calculator"],
      options: [
        { value: "web_search", label: "Web Search" },
        { value: "calculator", label: "Calculator" },
        { value: "code_interpreter", label: "Code Interpreter" },
        { value: "knowledge_base", label: "Knowledge Base" },
      ],
    },
    {
      key: "memory",
      label: "Keep Conversation History",
      type: "toggle",
      default: true,
    },
  ],
});

define({
  type: "classifier",
  label: "Classifier",
  service: "AI",
  category: "AI",
  icon: "Tags",
  color: "#ec4899",
  accent: "#ec4899",
  headline: "Classify incoming data",
  description: "Automatically categorize text or data into labels you define. Great for routing support tickets, emails, etc.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "categories",
      label: "Categories (comma-separated)",
      type: "text",
      default: "billing, technical support, sales, general inquiry",
      required: true,
    },
    {
      key: "engine",
      label: "Classification Method",
      type: "select",
      default: "ai",
      options: [
        { value: "ai", label: "AI-Powered" },
        { value: "rules", label: "Keyword Rules" },
      ],
    },
  ],
});

define({
  type: "extract",
  label: "Data Extractor",
  service: "AI",
  category: "AI",
  icon: "ScanSearch",
  color: "#14b8a6",
  accent: "#14b8a6",
  headline: "Extract structured data",
  description: "Pull specific fields like names, emails, dates, or amounts from unstructured text.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "fields",
      label: "Fields to Extract",
      type: "text",
      required: true,
      default: "name, email, phone, company",
      help: "Comma-separated list of field names.",
    },
    {
      key: "strict",
      label: "Strict Mode",
      type: "toggle",
      default: true,
      help: "Fail if a required field cannot be extracted.",
    },
  ],
});

define({
  type: "summarize",
  label: "Summarize",
  service: "AI",
  category: "AI",
  icon: "AlignLeft",
  color: "#f59e0b",
  accent: "#f59e0b",
  headline: "Summarize text",
  description: "Condense long documents, articles, or conversations into a brief summary.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "length",
      label: "Summary Length",
      type: "select",
      default: "medium",
      options: [
        { value: "short", label: "Short (1-2 sentences)" },
        { value: "medium", label: "Medium (paragraph)" },
        { value: "long", label: "Long (detailed)" },
      ],
    },
    {
      key: "format",
      label: "Output Format",
      type: "select",
      default: "paragraph",
      options: [
        { value: "paragraph", label: "Paragraph" },
        { value: "bullets", label: "Bullet Points" },
      ],
    },
  ],
});

// ─── Logic ─────────────────────────────────────────────────────────────────

define({
  type: "if",
  label: "IF",
  service: "Logic",
  category: "Logic",
  icon: "GitBranch",
  color: "#22c55e",
  accent: "#22c55e",
  headline: "Branch on a condition",
  description: "Continue down different paths depending on whether a condition is true or false.",
  inputs: ["main"],
  outputs: ["true", "false"],
  fields: [
    {
      key: "leftValue",
      label: "Value 1",
      type: "text",
      required: true,
      placeholder: "e.g. {{ $json.status }}",
    },
    {
      key: "operator",
      label: "Operation",
      type: "select",
      default: "equals",
      options: [
        { value: "equals", label: "Equals" },
        { value: "notEquals", label: "Not Equal" },
        { value: "contains", label: "Contains" },
        { value: "gt", label: "Greater Than" },
        { value: "lt", label: "Less Than" },
        { value: "isEmpty", label: "Is Empty" },
        { value: "isNotEmpty", label: "Is Not Empty" },
      ],
    },
    {
      key: "rightValue",
      label: "Value 2",
      type: "text",
      placeholder: "e.g. completed",
    },
  ],
});

define({
  type: "switch",
  label: "Switch",
  service: "Logic",
  category: "Logic",
  icon: "GitMerge",
  color: "#16a34a",
  accent: "#16a34a",
  headline: "Multi-way branching",
  description: "Route data to different paths based on the value of a field.",
  inputs: ["main"],
  outputs: ["case1", "case2", "case3", "default"],
  fields: [
    {
      key: "field",
      label: "Switch On",
      type: "text",
      required: true,
      placeholder: "e.g. {{ $json.priority }}",
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
  service: "Logic",
  category: "Logic",
  icon: "Repeat",
  color: "#15803d",
  accent: "#15803d",
  headline: "Loop over items",
  description: "Process each item in a list one by one (or in parallel).",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "batchSize",
      label: "Batch Size",
      type: "number",
      default: 1,
      help: "How many items to process at once.",
    },
    {
      key: "maxItems",
      label: "Max Items",
      type: "number",
      default: 100,
    },
  ],
});

define({
  type: "merge",
  label: "Merge",
  service: "Logic",
  category: "Logic",
  icon: "Combine",
  color: "#65a30d",
  accent: "#65a30d",
  headline: "Merge branches",
  description: "Wait for multiple branches to complete and combine their data into one flow.",
  inputs: ["branch1", "branch2"],
  outputs: ["main"],
  fields: [
    {
      key: "mode",
      label: "Merge Mode",
      type: "select",
      default: "append",
      options: [
        { value: "append", label: "Append All Items" },
        { value: "combine", label: "Combine Fields" },
        { value: "waitAll", label: "Wait for All" },
      ],
    },
  ],
});

define({
  type: "wait",
  label: "Wait",
  service: "Logic",
  category: "Logic",
  icon: "Pause",
  color: "#d97706",
  accent: "#d97706",
  headline: "Pause execution",
  description: "Wait for a specific amount of time before continuing. Useful for rate limiting.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "amount",
      label: "Wait Time",
      type: "number",
      default: 5,
      required: true,
    },
    {
      key: "unit",
      label: "Time Unit",
      type: "select",
      default: "seconds",
      options: [
        { value: "seconds", label: "Seconds" },
        { value: "minutes", label: "Minutes" },
        { value: "hours", label: "Hours" },
        { value: "days", label: "Days" },
      ],
    },
  ],
});

// ─── Data ──────────────────────────────────────────────────────────────────

define({
  type: "transform",
  label: "Transform Data",
  service: "Data",
  category: "Data",
  icon: "Shuffle",
  color: "#0891b2",
  accent: "#0891b2",
  headline: "Reshape your data",
  description: "Rename fields, compute new values, or restructure the data flowing through.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "mode",
      label: "Mode",
      type: "select",
      default: "manual",
      options: [
        { value: "manual", label: "Manual Mapping" },
        { value: "code", label: "JavaScript Code" },
      ],
    },
    {
      key: "mapping",
      label: "Field Mapping (JSON)",
      type: "textarea",
      default: '{\n  "fullName": "{{ $json.firstName }} {{ $json.lastName }}"\n}',
    },
  ],
});

define({
  type: "validate",
  label: "Validate Data",
  service: "Data",
  category: "Data",
  icon: "BadgeCheck",
  color: "#059669",
  accent: "#059669",
  headline: "Validate incoming data",
  description: "Check that data matches expected format before continuing. Route invalid data separately.",
  inputs: ["main"],
  outputs: ["valid", "invalid"],
  fields: [
    {
      key: "rules",
      label: "Validation Rules",
      type: "textarea",
      default: '{\n  "email": "required|email",\n  "age": "required|number|min:0"\n}',
    },
    {
      key: "onInvalid",
      label: "If Invalid",
      type: "select",
      default: "continue",
      options: [
        { value: "continue", label: "Continue on Invalid Path" },
        { value: "stop", label: "Stop Workflow" },
      ],
    },
  ],
});

define({
  type: "filter",
  label: "Filter",
  service: "Data",
  category: "Data",
  icon: "Filter",
  color: "#0e7490",
  accent: "#0e7490",
  headline: "Filter items",
  description: "Only let through items that match your conditions. Useful for removing unwanted data.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "field",
      label: "Field",
      type: "text",
      required: true,
      placeholder: "e.g. status",
    },
    {
      key: "operator",
      label: "Condition",
      type: "select",
      default: "equals",
      options: [
        { value: "equals", label: "Equals" },
        { value: "notEquals", label: "Not Equal" },
        { value: "contains", label: "Contains" },
        { value: "gt", label: "Greater Than" },
        { value: "lt", label: "Less Than" },
        { value: "exists", label: "Exists" },
      ],
    },
    {
      key: "value",
      label: "Value",
      type: "text",
      required: true,
      placeholder: "e.g. active",
    },
  ],
});

define({
  type: "code",
  label: "Code",
  service: "Data",
  category: "Data",
  icon: "Code",
  color: "#7c3aed",
  accent: "#7c3aed",
  headline: "Run JavaScript code",
  description: "Write custom JavaScript to transform, filter, or process data in any way you need.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "language",
      label: "Language",
      type: "select",
      default: "javascript",
      options: [
        { value: "javascript", label: "JavaScript" },
      ],
    },
    {
      key: "code",
      label: "Code",
      type: "textarea",
      required: true,
      default: '// Access input data via $input.all()\n// Return transformed data\nreturn $input.all().map(item => ({\n  ...item.json,\n  processed: true\n}));',
    },
  ],
});

// ─── Actions ───────────────────────────────────────────────────────────────

define({
  type: "send_email",
  label: "Send Email",
  service: "Email",
  category: "Actions",
  icon: "Send",
  color: "#2563eb",
  accent: "#2563eb",
  headline: "Send an email",
  description: "Send a transactional email to one or more recipients via SMTP or email API.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "to",
      label: "To",
      type: "text",
      required: true,
      placeholder: "recipient@example.com",
    },
    {
      key: "subject",
      label: "Subject",
      type: "text",
      required: true,
    },
    {
      key: "body",
      label: "Body",
      type: "textarea",
      required: true,
    },
    {
      key: "isHtml",
      label: "HTML Email",
      type: "toggle",
      default: false,
    },
  ],
});

define({
  type: "human_approval",
  label: "Human Approval",
  service: "Approval",
  category: "Actions",
  icon: "ShieldCheck",
  color: "#e11d48",
  accent: "#e11d48",
  headline: "Wait for human review",
  description: "Pause the workflow until a person reviews and approves (or rejects) this step.",
  inputs: ["main"],
  outputs: ["approved", "rejected"],
  fields: [
    {
      key: "approvers",
      label: "Approvers (email)",
      type: "text",
      required: true,
      placeholder: "manager@company.com",
    },
    {
      key: "timeout",
      label: "Timeout (hours)",
      type: "number",
      default: 24,
    },
    {
      key: "message",
      label: "Approval Message",
      type: "textarea",
      default: "Please review this item and approve or reject.",
    },
  ],
});

define({
  type: "notification",
  label: "Notification",
  service: "Notification",
  category: "Actions",
  icon: "Bell",
  color: "#f59e0b",
  accent: "#f59e0b",
  headline: "Send a notification",
  description: "Send an in-app, email, SMS, or push notification.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "channels",
      label: "Channels",
      type: "select-multi",
      default: ["email"],
      options: [
        { value: "email", label: "Email" },
        { value: "sms", label: "SMS" },
        { value: "push", label: "Push Notification" },
        { value: "inapp", label: "In-App" },
      ],
    },
    {
      key: "title",
      label: "Title",
      type: "text",
      required: true,
      default: "Workflow Notification",
    },
    {
      key: "message",
      label: "Message",
      type: "textarea",
      required: true,
    },
  ],
});

define({
  type: "slack_action",
  label: "Slack Action",
  service: "Slack",
  category: "Actions",
  icon: "Hash",
  color: "#4A154B",
  accent: "#4A154B",
  headline: "Slack notification",
  description: "Send a notification to a Slack channel as part of the workflow.",
  inputs: ["main"],
  outputs: ["main"],
  fields: [
    {
      key: "channel",
      label: "Channel",
      type: "text",
      default: "#alerts",
      required: true,
    },
    {
      key: "message",
      label: "Message",
      type: "textarea",
      required: true,
    },
    {
      key: "mention",
      label: "Mention Someone",
      type: "text",
      placeholder: "@username",
    },
  ],
});

export const NODE_ORDER: string[] = Object.keys(NODE_CATALOG);

export function getNodeConfig(type: string): NodeConfig {
  return (
    NODE_CATALOG[type] ?? {
      type,
      label: "Unknown Node",
      service: "Unknown",
      category: "Actions",
      icon: "Box",
      color: "#9ca3af",
      accent: "#9ca3af",
      headline: "Unknown node",
      description: "Unrecognized node type.",
      inputs: ["main"],
      outputs: ["main"],
      fields: [],
    }
  );
}

export const NODE_COUNT = Object.keys(NODE_CATALOG).length;

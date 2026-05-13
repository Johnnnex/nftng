import type { RegisterFormData } from "@/lib";

type Option = { value: string; label: string };

export type TextField = {
  kind: "text";
  name: keyof RegisterFormData;
  label: string;
  placeholder: string;
  type?: "text" | "email" | "tel" | "textarea";
};

export type SelectField = {
  kind: "select" | "multi-select";
  name: keyof RegisterFormData;
  label: string;
  placeholder: string;
  options: Option[];
};

export type FieldConfig = TextField | SelectField;

export type RegistrationEvent = {
  id: string;
  name: string;
  image: string;
};

export const GENDERS: Option[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const COUNTRIES: Option[] = [
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
  { value: "EG", label: "Egypt" },
  { value: "ET", label: "Ethiopia" },
  { value: "TZ", label: "Tanzania" },
  { value: "RW", label: "Rwanda" },
  { value: "SN", label: "Senegal" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "OTHER", label: "Other" },
];

export const DESCRIBES_YOU: Option[] = [
  { value: "builder", label: "Builder / Developer" },
  { value: "creator", label: "Creator / Influencer" },
  { value: "investor", label: "Investor / Trader" },
  { value: "student", label: "Student / Beginner" },
  { value: "brand", label: "Brand / Company" },
];

export const TOPICS: Option[] = [
  { value: "defi", label: "DeFi" },
  { value: "cefi", label: "CeFi" },
  { value: "nfts", label: "NFTs & Culture" },
  { value: "trading", label: "Trading" },
  { value: "airdrops", label: "Airdrops" },
  { value: "community", label: "Community Building" },
  { value: "regulations", label: "Regulations & Compliance" },
];

export const FIRST_TIME: Option[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const REGISTRATION_EVENTS: RegistrationEvent[] = [
  {
    id: "soccer_tournament",
    name: "Soccer Tournament",
    image: "ticket-futbol.png",
  },
  {
    id: "unchain_summer_conference",
    name: "Unchain Summer Conference",
    image: "ticket-us.png",
  },
];

export const FORM_FIELDS: FieldConfig[] = [
  {
    kind: "text",
    name: "first_name",
    label: "First Name *",
    placeholder: "John",
  },
  { kind: "text", name: "last_name", label: "Last Name *", placeholder: "Doe" },
  {
    kind: "text",
    name: "email",
    label: "Email Address *",
    placeholder: "john@example.com",
    type: "email",
  },
  {
    kind: "text",
    name: "phone",
    label: "Phone Number *",
    placeholder: "+234 800 000 0000",
    type: "tel",
  },
  {
    kind: "select",
    name: "gender",
    label: "Gender *",
    placeholder: "Select gender",
    options: GENDERS,
  },
  {
    kind: "select",
    name: "country",
    label: "Country *",
    placeholder: "Select country",
    options: COUNTRIES,
  },
  { kind: "text", name: "city", label: "City *", placeholder: "e.g. Lagos" },
  {
    kind: "text",
    name: "twitter_handle",
    label: "X (Twitter) Handle",
    placeholder: "@handle",
  },
  {
    kind: "select",
    name: "what_describes_you",
    label: "What best describes you? *",
    placeholder: "Select the option that best fits you",
    options: DESCRIBES_YOU,
  },
  {
    kind: "multi-select",
    name: "topics_of_interest",
    label: "What topics are you most interested in? *",
    placeholder: "Select topics",
    options: TOPICS,
  },
  {
    kind: "text",
    name: "looking_forward_to",
    label: "What are you looking forward to experiencing at the event?",
    placeholder: "Tell us what excites you most...",
    type: "textarea",
  },
  {
    kind: "select",
    name: "first_time_attendee",
    label: "Will this be your first NFTNG/Unchain Summer event? *",
    placeholder: "Select one",
    options: FIRST_TIME,
  },
  {
    kind: "text",
    name: "how_did_you_hear",
    label: "How did you hear about the event?",
    placeholder: "Tell us how you found out...",
    type: "textarea",
  },
];

export type RegistrantRecord = {
  id: string;
  alias: string;
  email: string;
  gender: string;
  country: string;
  city: string;
  whatDescribesYou: string;
  topicsOfInterest: string[];
  firstTimeAttendee: string;
  events: string[];
  attended: boolean;
  attendedAt: string | null;
  createdAt: string;
};

export type RegistrationsTab = "registrations" | "attendees";

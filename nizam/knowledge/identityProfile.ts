export interface IdentityProfile {
  fullName: string;
  preferredName: string;
  dateOfBirth: string;
  birthdayDisplay: string;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  professionalHeadline: string;
  yearsOfExperience: string;
  birthplace?: string;
  hometown?: string;
}

export const identityProfile: IdentityProfile = {
  fullName: "Nizamuddin Ali Ahmed",
  preferredName: "Nizam",
  dateOfBirth: "1993-04-11",
  birthdayDisplay: "11 April 1993",
  birthDay: 11,
  birthMonth: 4,
  birthYear: 1993,
  professionalHeadline:
    "Senior Android Engineer | Kotlin | Gradle Plugin Developer | Android SDK Developer | Architecture & Modularization",
  yearsOfExperience: "6+ years",
  birthplace: "Mukalmua, Assam, India",
  hometown: "Mukalmua, Assam, India",
};

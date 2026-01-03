export interface Theme {
  theme: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_dark: string;
    background_light: string;
    text_light: string;
    text_dark: string;
    font_family: string;
    font_heading: string;
  };
  site: {
    name: string;
    title: string;
    tagline: string;
    description: string;
  };
}

export interface Video {
  id: string;
  title: string;
  description: string;
  year: number;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  category: string;
}

export interface Photo {
  id: string;
  title: string;
  description: string;
  year: number;
  image_url: string;
  thumbnail_url: string;
  category: string;
  location: string;
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Software {
  name: string;
  level: number;
  icon: string;
}

export interface Achievement {
  year: number;
  title: string;
  event: string;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  photo_url: string;
  experience_years: number;
  location: string;
}

export interface AboutData {
  profile: Profile;
  skills: Skill[];
  software: Software[];
  achievements: Achievement[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface ContactData {
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  social: SocialLink[];
  availability: {
    status: string;
    message: string;
  };
}

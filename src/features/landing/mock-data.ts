export type Category = "Academic" | "Technical" | "General Errands";
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";
export type Status = "Open" | "In Progress" | "Completed" | "Cancelled";

export type Commission = {
  id: string;
  title: string;
  description: string;
  category: Category;
  subcategory?: string;
  skillLevel: SkillLevel;
  fare: string;
  status: Status;
  poster: { name: string; rating: number; location: string };
};

export const ACADEMIC_SUBCATEGORIES = [
  "Mathematics", "Science", "Language", "Essay Writing", "Tutoring", "Research",
];

export const COMMISSIONS: Commission[] = [
  { id: "c1", title: "Calculus I Tutoring Session", description: "Need help with derivatives and integration", category: "Academic", subcategory: "Mathematics", skillLevel: "Intermediate", fare: "250-400/hr", status: "Open", poster: { name: "Maria Santos", rating: 4.8, location: "CSU Main" } },
  { id: "c2", title: "Algebra Homework Help", description: "Linear equations and polynomial problems", category: "Academic", subcategory: "Mathematics", skillLevel: "Beginner", fare: "200-300/hr", status: "Open", poster: { name: "Juan Dela Cruz", rating: 4.6, location: "CSU Main" } },
  { id: "c3", title: "Statistics Data Analysis", description: "Statistical analysis for research project", category: "Academic", subcategory: "Mathematics", skillLevel: "Advanced", fare: "300-500/hr", status: "Open", poster: { name: "Prof. Reyes", rating: 5.0, location: "CSU Main" } },
  { id: "c4", title: "Chemistry Lab Report Writing", description: "Help writing organic chemistry lab report", category: "Academic", subcategory: "Science", skillLevel: "Intermediate", fare: "350-600", status: "Open", poster: { name: "Anna Cruz", rating: 4.7, location: "CSU Main" } },
  { id: "c5", title: "Physics Problem Solving", description: "Mechanics and thermodynamics tutoring", category: "Academic", subcategory: "Science", skillLevel: "Advanced", fare: "250-400/hr", status: "Open", poster: { name: "Carlo Lim", rating: 4.5, location: "CSU Main" } },
  { id: "c6", title: "English Essay Proofreading", description: "Proofread 10-page literature essay", category: "Academic", subcategory: "Language", skillLevel: "Intermediate", fare: "200-350", status: "Open", poster: { name: "Liza Tan", rating: 4.9, location: "CSU Main" } },
  { id: "c7", title: "Spanish Language Tutoring", description: "Conversational Spanish practice and grammar", category: "Academic", subcategory: "Language", skillLevel: "Intermediate", fare: "300-450/hr", status: "Open", poster: { name: "Mark Yu", rating: 4.7, location: "CSU Main" } },
  { id: "c8", title: "Research Paper Writing", description: "Write 15-page sociology research paper", category: "Academic", subcategory: "Essay Writing", skillLevel: "Advanced", fare: "800-1500", status: "Open", poster: { name: "Dept. of Sociology", rating: 4.8, location: "CSU Main" } },
  { id: "c9", title: "Literature Review Assistance", description: "Help with systematic literature review", category: "Academic", subcategory: "Research", skillLevel: "Advanced", fare: "500-900", status: "Open", poster: { name: "Grad. Office", rating: 4.6, location: "CSU Main" } },
  { id: "t1", title: "CSU Website Redesign", description: "Full redesign of the official CSU website. Looking for a skilled web developer with UI/UX experience.", category: "Technical", subcategory: "Web Development", skillLevel: "Expert", fare: "50,000", status: "Open", poster: { name: "CSU Admin", rating: 5.0, location: "CSU Main" } },
  { id: "t2", title: "Logo Design for Student Org", description: "Create a modern logo for our student organization", category: "Technical", subcategory: "Graphic Design", skillLevel: "Intermediate", fare: "1,500-3,000", status: "Open", poster: { name: "USG", rating: 4.9, location: "CSU Main" } },
  { id: "g1", title: "General Errands", description: "Run errands on campus or nearby areas. Tasks include document delivery, purchasing supplies, etc.", category: "General Errands", skillLevel: "Beginner", fare: "500/errand", status: "Open", poster: { name: "Various", rating: 4.5, location: "CSU Main" } },
  { id: "g2", title: "50 Flyers Distribution", description: "Distribute 50 event flyers around campus", category: "General Errands", skillLevel: "Beginner", fare: "300", status: "Open", poster: { name: "Glen Licayan", rating: 4.8, location: "CSU Main" } },
];

export const CATEGORIES = [
  { name: "Academic", description: "Tutoring, essays, research", icon: "book" },
  { name: "Technical", description: "Programming, design, tech", icon: "code" },
  { name: "General Errands", description: "Shopping, delivery, tasks", icon: "cart" },
] as const;

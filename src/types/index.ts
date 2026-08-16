export type Role = "principal" | "teacher" | "class_teacher" | "student" | "parent";

export interface User {
  uid: string;
  email: string;
  name: string;
  role: Role;
  createdAt: number;
}

export interface Class {
  id: string; // e.g., "grade8-secA"
  grade: string; // e.g., "8"
  section: string; // e.g., "A"
  academicYearId: string;
  createdAt: number;
}

export interface TeacherClassAssignment {
  id: string;
  teacherId: string; // refs users.uid
  classId: string; // refs classes.id
  isClassTeacher: boolean;
  academicYearId: string;
  assignedAt: number;
}

export interface TeacherSubjectAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  academicYearId: string;
  assignedAt: number;
}

export interface StudentProfile {
  uid: string; // refs users.uid
  classId: string;
  admissionNumber: string;
  rollNumber: string;
  dateOfBirth: string;
  gender: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
}

import { database } from './config';
import { ref, set, get, update, remove } from 'firebase/database';

export interface StudentUser {
  id: string;
  rollNo: string;
  name: string;
  email?: string;
  department?: string;
  createdAt: string;
  role: 'student';
  faceData?: string; // Base64 string or face descriptor
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role: 'admin';
}

// Student Authentication
export const registerStudent = async (rollNo: string, password: string, name: string, email: string, faceData?: string): Promise<StudentUser> => {
  try {
    const studentId = `student_${rollNo}_${Date.now()}`;
    const studentData: StudentUser = {
      id: studentId,
      rollNo,
      name,
      email,
      createdAt: new Date().toISOString(),
      role: 'student',
      faceData,
    };

    const studentRef = ref(database, `students/${studentId}`);
    await set(studentRef, {
      ...studentData,
      password: btoa(password), // Basic encoding (use proper hashing in production)
    });

    return studentData;
  } catch (error) {
    console.error('Error registering student:', error);
    throw error;
  }
};

export const loginStudent = async (rollNo: string, password: string): Promise<StudentUser | null> => {
  try {
    const studentsRef = ref(database, 'students');
    const snapshot = await get(studentsRef);

    if (snapshot.exists()) {
      const students = snapshot.val();
      for (const student of Object.values(students)) {
        const studentData = student as any;
        if (studentData.rollNo === rollNo && btoa(password) === studentData.password) {
          return {
            id: studentData.id,
            rollNo: studentData.rollNo,
            name: studentData.name,
            createdAt: studentData.createdAt,
            role: 'student',
            faceData: studentData.faceData,
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error logging in student:', error);
    throw error;
  }
};

export const getStudent = async (studentId: string): Promise<StudentUser | null> => {
  try {
    const studentRef = ref(database, `students/${studentId}`);
    const snapshot = await get(studentRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        id: data.id,
        rollNo: data.rollNo,
        name: data.name,
        createdAt: data.createdAt,
        role: 'student',
        faceData: data.faceData,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
};

// Admin Authentication
export const getAdminCount = async (): Promise<number> => {
  try {
    const adminsRef = ref(database, 'admins');
    const snapshot = await get(adminsRef);
    if (snapshot.exists()) {
      return Object.keys(snapshot.val()).length;
    }
    return 0;
  } catch (error) {
    console.error('Error getting admin count:', error);
    throw error;
  }
};

export const registerAdmin = async (email: string, password: string, name: string): Promise<AdminUser> => {
  try {
    // Check if the 4-admin limit has been reached
    const count = await getAdminCount();
    if (count >= 4) {
      throw new Error('Admin registration limit reached. Maximum 4 administrators allowed.');
    }

    // Sanitize email for use in Firebase path (remove dots and special chars)
    const sanitizedEmail = email.replace(/[.#$\[\]]/g, '_');
    const adminId = `admin_${sanitizedEmail}_${Date.now()}`;
    const adminData: AdminUser = {
      id: adminId,
      email,
      name,
      createdAt: new Date().toISOString(),
      role: 'admin',
    };

    const adminRef = ref(database, `admins/${adminId}`);
    await set(adminRef, {
      ...adminData,
      password: btoa(password), // Basic encoding (use proper hashing in production)
    });

    return adminData;
  } catch (error) {
    console.error('Error registering admin:', error);
    throw error;
  }
};

export const loginAdmin = async (email: string, password: string): Promise<AdminUser | null> => {
  try {
    const adminsRef = ref(database, 'admins');
    const snapshot = await get(adminsRef);

    if (snapshot.exists()) {
      const admins = snapshot.val();
      for (const admin of Object.values(admins)) {
        const adminData = admin as any;
        if (adminData.email === email && btoa(password) === adminData.password) {
          return {
            id: adminData.id,
            email: adminData.email,
            name: adminData.name,
            createdAt: adminData.createdAt,
            role: 'admin',
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error logging in admin:', error);
    throw error;
  }
};

export const getAdmin = async (adminId: string): Promise<AdminUser | null> => {
  try {
    const adminRef = ref(database, `admins/${adminId}`);
    const snapshot = await get(adminRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        createdAt: data.createdAt,
        role: 'admin',
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin:', error);
    throw error;
  }
};

// Check if student exists
export const studentExists = async (rollNo: string): Promise<boolean> => {
  try {
    const studentsRef = ref(database, 'students');
    const snapshot = await get(studentsRef);

    if (snapshot.exists()) {
      const students = snapshot.val();
      for (const student of Object.values(students)) {
        if ((student as any).rollNo === rollNo) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking student existence:', error);
    throw error;
  }
};

export const getStudentByRollNoAndEmail = async (rollNo: string, email: string): Promise<StudentUser | null> => {
  try {
    const studentsRef = ref(database, 'students');
    const snapshot = await get(studentsRef);

    if (snapshot.exists()) {
      const students = snapshot.val();
      for (const student of Object.values(students)) {
        const studentData = student as any;
        if (studentData.rollNo === rollNo && studentData.email === email) {
          return {
            id: studentData.id,
            rollNo: studentData.rollNo,
            name: studentData.name,
            email: studentData.email,
            createdAt: studentData.createdAt,
            role: 'student',
            faceData: studentData.faceData,
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching student by roll no and email:', error);
    throw error;
  }
};

export const updateStudentPassword = async (studentId: string, newPassword: string): Promise<void> => {
  try {
    const studentRef = ref(database, `students/${studentId}`);
    await update(studentRef, {
      password: btoa(newPassword)
    });
  } catch (error) {
    console.error('Error updating student password:', error);
    throw error;
  }
};

// Check if admin exists
export const adminExists = async (email: string): Promise<boolean> => {
  try {
    const adminsRef = ref(database, 'admins');
    const snapshot = await get(adminsRef);

    if (snapshot.exists()) {
      const admins = snapshot.val();
      for (const admin of Object.values(admins)) {
        if ((admin as any).email === email) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking admin existence:', error);
    throw error;
  }
};

// Student Management for Admins
export const getAllStudents = async (): Promise<StudentUser[]> => {
  try {
    const studentsRef = ref(database, 'students');
    const snapshot = await get(studentsRef);
    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as StudentUser[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching all students:', error);
    throw error;
  }
};

export const updateStudentInFirebase = async (studentId: string, updates: any): Promise<void> => {
  try {
    const studentRef = ref(database, `students/${studentId}`);
    
    // If password is being updated, encode it
    if (updates.password) {
      updates.password = btoa(updates.password);
    }
    
    await update(studentRef, updates);
  } catch (error) {
    console.error('Error updating student in Firebase:', error);
    throw error;
  }
};

export const deleteStudentFromFirebase = async (studentId: string): Promise<void> => {
  try {
    const studentRef = ref(database, `students/${studentId}`);
    await remove(studentRef);
  } catch (error) {
    console.error('Error deleting student from Firebase:', error);
    throw error;
  }
};

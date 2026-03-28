import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDHeHHsFBU3WyHfOEVJAMlblM_2LTTp0Ps",
  authDomain: "college-vote-hub.firebaseapp.com",
  projectId: "college-vote-hub",
  storageBucket: "college-vote-hub.firebasestorage.app",
  messagingSenderId: "1010432861476",
  appId: "1:1010432861476:web:7000e7187826967a54ffb1",
  measurementId: "G-RY4N11HY69",
  databaseURL: "https://college-vote-hub-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function checkStudents() {
  try {
    const studentsRef = ref(database, 'students');
    const snapshot = await get(studentsRef);
    if (snapshot.exists()) {
      const students = snapshot.val();
      console.log(`Total Students: ${Object.keys(students).length}`);
      Object.values(students).forEach(student => {
        console.log(`- ${student.name} (${student.rollNo}) | Email: ${student.email || 'None'}`);
      });
    } else {
      console.log("No students found.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkStudents();

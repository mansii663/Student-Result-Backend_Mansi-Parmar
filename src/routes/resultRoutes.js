const express = require("express");
const router = express.Router();
const pool = require("../db");

/* 🔹 Test Route */
router.get("/test", (req, res) => {
  res.json({ message: "Result routes working ✅" });
});

/* 🔹 Get Student Result */
router.post("/result", async (req, res) => {
  const { student_id, student_name, dob } = req.body;

  if (!student_id || !student_name || !dob) {
    return res.status(400).json({
      message: "student_id, student_name and dob are required",
    });
  }

  try {
    const query = `
      SELECT
        stud_id,
        stud_name,
        dob::text AS dob,
        maths,
        english,
        science
      FROM students
      WHERE stud_id = $1
      AND stud_name = $2
      AND dob = $3
    `;

    const values = [student_id, student_name, dob];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = result.rows[0];

    const total = student.maths + student.science + student.english;
    const percentage = ((total / 300) * 100).toFixed(2);
    const status = percentage >= 40 ? "PASS" : "FAIL";

    res.json({
      student_id: student.stud_id,
      student_name: student.stud_name,
      dob: student.dob, // keep as DB date
      marks: {
        maths: student.maths,
        science: student.science,
        english: student.english,
      },
      total,
      percentage,
      result: status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* 🔹 Add Student (NEW API) */
router.post("/add-student", async (req, res) => {
  const { stud_id, stud_name, dob, maths, english, science } = req.body;

  if (!stud_id || !stud_name || !dob) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    await pool.query(
      `INSERT INTO students (stud_id, stud_name, dob, maths, english, science)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [stud_id, stud_name, dob, maths, english, science]
    );

    res.status(201).json({ message: "Student added successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding student" });
  }
});

module.exports = router;

import express from "express";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

const router = express.Router();

// Employee login
router.post("/login", async (req, res) => {
  try {
    const { employeeNumber, password } = req.body;

    if (
      typeof employeeNumber !== "string" ||
      typeof password !== "string" ||
      !employeeNumber.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: "Employee number and password are required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        employee_number,
        first_name,
        last_name,
        password_hash
      FROM employees
      WHERE employee_number = $1
        AND is_active = TRUE
      `,
      [employeeNumber.trim()]
    );

    const employee = result.rows[0];

    if (!employee) {
      return res.status(401).json({
        error: "Invalid employee number or password.",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      employee.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid employee number or password.",
      });
    }

    req.session.regenerate((error) => {
      if (error) {
        console.error("Session error:", error);
        return res.status(500).json({
          error: "Unable to log in.",
        });
      }

      req.session.employeeId = employee.id;

      res.json({
        message: "Login successful.",
        employee: {
          id: employee.id,
          employeeNumber: employee.employee_number,
          firstName: employee.first_name,
          lastName: employee.last_name,
        },
      });
    });
  } catch (error) {
    console.error("Employee login error:", error);

    res.status(500).json({
      error: "Unable to log in.",
    });
  }
});

// Check current login session
router.get("/me", async (req, res) => {
  if (!req.session.employeeId) {
    return res.status(401).json({
      error: "Not logged in.",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, employee_number, first_name, last_name
      FROM employees
      WHERE id = $1 AND is_active = TRUE
      `,
      [req.session.employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Employee not found.",
      });
    }

    const employee = result.rows[0];

    res.json({
      employee: {
        id: employee.id,
        employeeNumber: employee.employee_number,
        firstName: employee.first_name,
        lastName: employee.last_name,
      },
    });
  } catch (error) {
    console.error("Session lookup error:", error);

    res.status(500).json({
      error: "Unable to retrieve employee.",
    });
  }
});

// Employee logout
router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        error: "Unable to log out.",
      });
    }

    res.clearCookie("crush.employee.sid");

    res.json({
      message: "Logged out successfully.",
    });
  });
});

// Clock in
router.post("/clock-in", async (req, res) => {
  try {
    // Check if employee is logged in
    if (!req.session.employeeId) {
      return res.status(401).json({
        error: "Please log in first.",
      });
    }

    const employeeId = req.session.employeeId;

    // Check whether employee already has an active shift
    const existingShift = await pool.query(
      `
      SELECT id
      FROM employee_shifts
      WHERE employee_id = $1
        AND clock_out IS NULL
      `,
      [employeeId]
    );

    if (existingShift.rows.length > 0) {
      return res.status(409).json({
        error: "You are already clocked in.",
      });
    }

    // Create a new shift
    const result = await pool.query(
      `
      INSERT INTO employee_shifts (employee_id)
      SELECT id
      FROM employees
      WHERE id = $1 AND is_active = TRUE
      RETURNING
        id,
        employee_id,
        clock_in,
        clock_out,
        break_start,
        break_end
      `,
      [employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        error: "Employee account is inactive or unavailable.",
      });
    }

    res.status(201).json({
      message: "Clocked in successfully.",
      shift: result.rows[0],
    });
  } catch (error) {
    // Unique index also prevents simultaneous duplicate clock-ins
    if (error.code === "23505") {
      return res.status(409).json({
        error: "You are already clocked in.",
      });
    }

    console.error("Clock-in error:", error);

    res.status(500).json({
      error: "Unable to clock in.",
    });
  }
});

// Start break
router.post('/break-start', async (req, res) => {
  try {
    if (!req.session.employeeId) {
      return res.status(401).json({
        error: 'Please log in first.'
      })
    }

    const result = await pool.query(
      `
      UPDATE employee_shifts
      SET break_start = NOW()
      WHERE employee_id = $1
        AND clock_out IS NULL
        AND break_start IS NULL
      RETURNING *
      `,
      [req.session.employeeId]
    )

    if (result.rows.length === 0) {
      return res.status(409).json({
        error: 'You must be clocked in and cannot start another break.'
      })
    }

    res.json({
      message: 'Break started successfully.',
      shift: result.rows[0]
    })

  } catch (error) {
    console.error('Start break error:', error)

    res.status(500).json({
      error: 'Unable to start break.'
    })
  }
})


// End break
router.post('/break-end', async (req, res) => {
  try {
    if (!req.session.employeeId) {
      return res.status(401).json({
        error: 'Please log in first.'
      })
    }

    const result = await pool.query(
      `
      UPDATE employee_shifts
      SET break_end = NOW()
      WHERE employee_id = $1
        AND clock_out IS NULL
        AND break_start IS NOT NULL
        AND break_end IS NULL
      RETURNING *
      `,
      [req.session.employeeId]
    )

    if (result.rows.length === 0) {
      return res.status(409).json({
        error: 'You do not have an active break.'
      })
    }

    res.json({
      message: 'Break ended successfully.',
      shift: result.rows[0]
    })

  } catch (error) {
    console.error('End break error:', error)

    res.status(500).json({
      error: 'Unable to end break.'
    })
  }
})

 // Clock out
 router.post('/clock-out', async (req, res) => {
  try {
    if (!req.session.employeeId) {
      return res.status(401).json({
        error: 'Please log in first.'
      })
    }

    const result = await pool.query(
      `
      UPDATE employee_shifts
      SET clock_out = NOW()
      WHERE employee_id = $1
        AND clock_out IS NULL
        AND (
          break_start IS NULL
          OR break_end IS NOT NULL
        )
      RETURNING *
      `,
      [req.session.employeeId]
    )

    if (result.rows.length === 0) {
      return res.status(409).json({
        error: 'No active shift found, or you must end your break before clocking out.'
      })
    }

    res.json({
      message: 'Clocked out successfully.',
      shift: result.rows[0]
    })
  } catch (error) {
    console.error('Clock-out error:', error)

    res.status(500).json({
      error: 'Unable to clock out.'
    })
  }
})

 // Get the logged-in employee's active shift
 router.get('/active-shift', async (req, res) => {
  try {
    if (!req.session.employeeId) {
      return res.status(401).json({
        error: 'Please log in first.'
      })
    }

    const result = await pool.query(
      `
      SELECT
        id,
        employee_id,
        clock_in,
        clock_out,
        break_start,
        break_end
      FROM employee_shifts
      WHERE employee_id = $1
        AND clock_out IS NULL
      LIMIT 1
      `,
      [req.session.employeeId]
    )

    res.json({
      shift: result.rows[0] || null
    })
  } catch (error) {
    console.error('Active shift error:', error)

    res.status(500).json({
      error: 'Unable to retrieve active shift.'
    })
  }
})


export default router;

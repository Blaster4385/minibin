import sqlite3 from "sqlite3";

const dbPath = "./database/bins.db";

function createBinTable() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error connecting to database:", err.message);
      return;
    }

    const sql = `CREATE TABLE IF NOT EXISTS bin (
      id TEXT PRIMARY KEY,
      html_content TEXT
    )`;

    db.run(sql, (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log("`bin` table created successfully");
      }

      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err.message);
        }
      });
    });
  });
}

const createBin = (req, res) => {
  console.log(`createBin: ${req.body}`);
  const { html_content } = req.body;
  const id = Math.random().toString(36).substring(7);

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error connecting to database:", err.message);
      throw err; // Re-throw for async handling
    }

    const sql = `INSERT INTO bin (id, html_content) VALUES (?, ?)`;

    db.run(sql, [id, html_content], (err) => {
      if (err) {
        console.error("Error creating entry:", err.message);
        throw err; // Re-throw for async handling
      } else {
        res.status(201).json({ id });
        console.log("Entry created successfully:", id);
      }

      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err.message);
        }
      });
    });
  });
};

const getBin = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Missing required parameter: id"); // Throw error for missing ID
  }

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error connecting to database:", err.message);
      throw err; // Re-throw for async handling
    }

    const sql = `SELECT * FROM bin WHERE id = ?`;

    db.get(sql, [id], (err, row) => {
      if (err) {
        console.error("Error retrieving entry:", err.message);
        throw err; // Re-throw for async handling
      } else if (!row) {
        console.log("Entry not found:", id);
        return null; // Handle case where no entry exists
      }

      res.status(200).json(row);
      console.log("Entry retrieved:", id);
      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err.message);
        }
      });

      return row;
    });
  });
};

export default { createBinTable, createBin, getBin };

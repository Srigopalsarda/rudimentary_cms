const connection = require("./connection");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const PORT = 8000;

// middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT,DROP, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Origin, Accept, X-Requested-With"
  );
  next();
});
// Post requests to create a new entity

app.post("/create-new-table", (req, res) => {
  const { Tablename, attributes } = req.body;

  // Format attributes
  const formattedAttributes = Object.entries(attributes)
    .map(([key, value]) => `${key} ${value}`)
    .join(", ");

  // Construct SQL query
  const createEntityTableQuery = `CREATE TABLE ${Tablename} (id INT AUTO_INCREMENT PRIMARY KEY, ${formattedAttributes})`;

  // Execute SQL query
  connection.query(createEntityTableQuery, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(201).json({ message: "Entity created successfully" });
    }
  });
});

app.delete("/delete-table/:tablename", (req, res) => {
  const tablename = req.params.tablename;

  connection.query(`DROP TABLE ${tablename}`, (err, results) => {
    if (err) {
      console.error("Error deleting table: " + err.stack);
      res.status(500).send("Error deleting table");
      return;
    }
    res.json({ message: "Table deleted successfully" });
  });
});
app.post("/all-new-entities", (req, res) => {
  const tablename = req.body.Tablename;
  connection.query(`DESCRIBE ${tablename}`, (err, results, fields) => {
    if (err) {
      console.error("Error querying database: " + err.stack);
      res.status(500).json(["Error querying database"]);
      return;
    }

    console.log(results);
    res.json(results);
  });
});

app.get("/columns/:tablename", (req, res) => {
  const tablename = req.params.tablename;

  connection.query(`DESCRIBE ${tablename}`, (err, describeResults) => {
    if (err) {
      console.error("Error describing table: " + err.stack);
      res.status(500).send(["Error describing table"]);
      return;
    }

    // Extract column names from describeResults
    const headers = describeResults.map((field) => field.Field);

    // console.log(headers);
    // Send headers as the response
    res.send(headers);

  });
});

app.post("/insert/:tablename", (req, res) => {
  const tablename = req.params.tablename;
  const rowData = req.body;
   const newRowData = Object.values(rowData);
   console.log("newRowData",newRowData);
//   Create an array of question marks for parameterized query
  const placeholders = newRowData.map(() => "?").join(",");

  // Construct the SQL query
  const sql = `INSERT INTO ${tablename} VALUES (${placeholders})`;

  connection.query(sql, newRowData, (err, results) => {
    if (err) {
      console.error("Error inserting into table: " + err.stack);
      res.status(500).send("Error inserting into table");
      return;
    }
    console.log("Row inserted successfully");
    res.json({"message":"Row inserted successfully"});
  });
});


app.post("/add-new-row/:tablename", (req, res) => {
  let tablename = req.params.tablename;
  let empdata = [emp.name, emp.email, emp.mobileNumber];
  connection.query(
    `INSERT INTO ${tablename}(name,email,mobileNumber) values(?)`,
    [empdata],
    (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        console.log(rows);
        res.send("Inserted Successfully");
      }
    }
  );
});
app.get("/get-row/:tablename/:id", (req, res) => {
  const { tablename, id } = req.params;

  const sql = `SELECT * FROM ${tablename} WHERE id = ?`;

  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching row data: " + err.stack);
      res.status(500).send("Error fetching row data");
      return;
    }
    if (results.length === 0) {
      res.status(404).send("Row not found");
      return;
    }
    res.json(results[0]);
  });
});


app.put("/update/:tablename/:id", (req, res) => {
  const { tablename, id } = req.params;
  const rowData = req.body;
  const updateData = Object.entries(rowData)
    .map(([key, value]) => `${key} = ?`)
    .join(", ");
  const values = Object.values(rowData);

  const sql = `UPDATE ${tablename} SET ${updateData} WHERE id = ?`;

  connection.query(sql, [...values, id], (err, results) => {
    if (err) {
      console.error("Error updating row: " + err.stack);
      res.status(500).send("Error updating row");
      return;
    }
    res.json({ message: "Row updated successfully" });
  });
});

// Delete row
app.delete("/delete/:tablename/:id", (req, res) => {
  const { tablename, id } = req.params;

  const sql = `DELETE FROM ${tablename} WHERE id = ?`;

  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error deleting row: " + err.stack);
      res.status(500).send("Error deleting row");
      return;
    }
    res.json({ message: "Row deleted successfully" });
  });
});

// app.get("/all-entities", (req, res) => {
//   connection.query("SELECT * FROM gopal", (err, rows) => {
//     if (err) {
//       console.log(err);
//       res.send(err);
//     } else {
//       console.log(rows);
//       res.send(rows);
//     }
//   });
// });

//for a table to get all the columns

app.post("/all-new-entities", (req, res) => {
  const tablename = req.body.Tablename;
  connection.query(`DESCRIBE ${tablename}`, (err, results, fields) => {
    if (err) {
      console.error("Error querying database: " + err.stack);
       res.json("Did not find the table");
      return;
    }

    console.log(results);
    res.send(results);
  });
});

app.get("/all-new-entities/:id", (req, res) => {
  let alltables = [];
  const tablename = req.params.id;
  connection.query(`DESCRIBE ${tablename}`, (err, results, fields) => {
    if (err) {
      console.error("Error querying database: " + err.stack);
      res.send(["Did not find the table"]);
      return;
    }
    alltables.push(results);
  });
  try {
    connection.query(`SELECT * FROM ${tablename}`, (err, data, fields) => {
      if (err) {
        console.error("Error querying database: " + err.stack);
      }
      alltables.push(data);
      console.log("inside select query ,data",alltables);
      res.send(alltables);
    });
  } catch (err) {
    console.log("error", err);
  }
  console.log(alltables);
});


app.get("/getalltables", (req, res) => {
  connection.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA='rudimentary_cms'",
    (err, results) => {
      if (err) {
        console.log(err);
        res.send("problem in fetching tables");
      } else {
        console.log(results);
        res.send(results);
      }
    }
  );
});

//crud operations in an entity of the database
app.get("/entity/:id", (req, res) => {
  connection.query(
    "SELECT * FROM entities WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        console.log(rows);
        res.send(rows);
      }
    }
  );
});

app.delete("/entity/:id", (req, res) => {
  connection.query(
    "DELETE FROM entities WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        console.log(rows);
        res.send(rows);
      }
    }
  );
});

app.post("/entity", (req, res) => {
  let emp = req.body;
  let empdata = [emp.name, emp.email, emp.mobileNumber];
  connection.query(
    "INSERT INTO entities(name,email,mobileNumber) values(?)",
    [empdata],
    (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Inserted Successfully");
      }
    }
  );
});

app.listen(PORT, () => {
  console.log("Server is running on port 8000");
});

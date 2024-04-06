const { Client } = require("pg");
/* 
let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
} */

let database;

if (process.env.NODE_ENV === "test") {
  database = "biztime_test";
} else {
  database = "biztime";
}

let db = new Client({
  /// connectionString: DB_URI,
  user: "postgres",
  password: "postgres",
  database: database,
});

db.connect();

module.exports = db;

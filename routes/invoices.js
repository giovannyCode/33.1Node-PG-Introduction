const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query("SELECT * FROM invoices  WHERE id = $1", [
      id,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice  with id of ${id}`, 404);
    }
    return res.send({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      "INSERT INTO invoices (comp_code ,amt) VALUES ($1, $2) RETURNING id,comp_code,amt, paid, add_date, paid_date",
      [comp_code, amt]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;
    const { paid } = req.body;

    const invoice = await db.query(
      `SELECT paid
       FROM invoices
       WHERE id = $1`,
      [id]
    );

    if (invoice.rows.length === 0) {
      throw new ExpressError(`No such invoice: ${id}`, 404);
    }
    console.log(invoice.rows[0]);
    const currPaidDate = invoice.rows[0].paid_date;

    if (!currPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = currPaidDate;
    }
    const results = await db.query(
      `UPDATE invoices
           SET amt=$1, paid=$2, paid_date=$3
           WHERE id=$4
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, paid, paidDate, id]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update invoice  with id ${code}`, 404);
    }
    return res.send({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  let { id } = req.params;
  try {
    const results = await db.query(
      "DELETE FROM invoices WHERE id = $1 RETURNING id",
      [id]
    );

    console.log("hola como estas", results.rows.length);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't delete invoice  with id ${id}`, 404);
    }
    return res.send({ status: "deleted" });
  } catch (e) {
    console.log(e);
    return next(e);
  }
});

module.exports = router;

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const slugify = require("slugify");
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT i.code, i.industry_name, ci.company_code
      FROM industries i left join company_industries ci
      on i.code =ci.industry_code`
    );
    const transformedObject = transformData(results.rows);
    return res.json({ industries: transformedObject });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query("SELECT * FROM industries WHERE code = $1", [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find industry with code of ${code}`, 404);
    }
    return res.send({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name } = req.body;
    const results = await db.query(
      "INSERT INTO industries (code ,industry_name ) VALUES ($1, $2) RETURNING code, industry_name",
      [code, name]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/:industry_code", async (req, res, next) => {
  try {
    const { industry_code } = req.params;
    const { company_code } = req.body;
    const results = await db.query(
      "INSERT INTO company_industries (company_code, industry_code ) VALUES ($1, $2) RETURNING company_code, industry_code",
      [company_code, industry_code]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

function transformData(inputData) {
  var outputObj = {};

  inputData.forEach(function (item) {
    if (!outputObj[item.code]) {
      outputObj[item.code] = {
        code: item.code,
        industry_name: item.industry_name,
      };
    }

    if (item.company_code) {
      if (!outputObj[item.code].company_code) {
        outputObj[item.code].company_code = [item.company_code];
      } else {
        outputObj[item.code].company_code.push(item.company_code);
      }
    }
  });

  return Object.values(outputObj);
}

module.exports = router;

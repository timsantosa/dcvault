// import { Request, Response } from 'express';

const addOrUpdateJump = (req, res, db) => {
  console.log('Add or update jump');
  res.json({ ok: true, message: 'Jump successfully added.' });
};

const getJump = (req, res, db) => {
  console.log('get jump');
  const jump = {
    id: 1,
  }
  res.json({ ok: true, jump });
};

const deleteJump = (req, res, db) => {
  console.log('delete jump');
  res.json({ ok: true, message: 'Jump deletion successful' });
};

const fetchJumps = (req, res, db) => {
  console.log('fetch jumps');
  res.json({ ok: true, jumps: [] });
};

module.exports = { addOrUpdateJump, getJump, deleteJump, fetchJumps }
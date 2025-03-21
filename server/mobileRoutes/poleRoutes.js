const express = require('express');
const { getPoles } = require("../controllers/polesController");

const poleRoutes = (db) => {
    const router = express.Router();

    router.get('/', (req, res) => getPoles(req, res, db));

    return router;
};

module.exports = poleRoutes;
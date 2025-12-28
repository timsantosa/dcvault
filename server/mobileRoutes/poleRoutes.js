const express = require('express');
const { getPoles, getPinnedPolesPerProfile } = require("../controllers/polesController");
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');

const poleRoutes = (db) => {
    const router = express.Router();

    router.get('/', (req, res) => getPoles(req, res, db));
    router.get('/pinned', checkPermission('view_favorite_poles'), (req, res) => getPinnedPolesPerProfile(req, res, db));

    return router;
};

module.exports = poleRoutes;
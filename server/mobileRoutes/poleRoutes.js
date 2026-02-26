const express = require('express');
const { getPoles, getPinnedPolesPerProfile, createPole, updatePole, deletePole } = require("../controllers/polesController");
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');

const poleRoutes = (db) => {
    const router = express.Router();

    router.get('/', (req, res) => getPoles(req, res, db));
    router.post('/', checkPermission('manage_poles'), (req, res) => createPole(req, res, db));
    router.put('/:id', checkPermission('manage_poles'), (req, res) => updatePole(req, res, db));
    router.delete('/:id', checkPermission('manage_poles'), (req, res) => deletePole(req, res, db));
    router.get('/pinned', checkPermission('view_favorite_poles'), (req, res) => getPinnedPolesPerProfile(req, res, db));

    return router;
};

module.exports = poleRoutes;
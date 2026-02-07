const { Op } = require('sequelize');

async function getFacilities(req, res, db) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const where = search
      ? { name: { [Op.like]: `%${search}%` } }
      : {};
    const facilities = await db.tables.Facilities.findAll({
      where,
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'address'],
      raw: true
    });
    const results = facilities.map(f => ({
      id: f.id,
      name: f.name,
      ...(f.address && Object.keys(f.address).length ? { address: f.address } : {})
    }));
    res.json({ results });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function getOrganizations(req, res, db) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const where = search
      ? { name: { [Op.like]: `%${search}%` } }
      : {};
    const organizations = await db.tables.HostingOrganizations.findAll({
      where,
      order: [['name', 'ASC']],
      attributes: ['id', 'name'],
      raw: true
    });
    res.json({ results: organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function getMeetNames(req, res, db) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const where = search
      ? { name: { [Op.like]: `%${search}%` } }
      : {};
    const meetNames = await db.tables.MeetNames.findAll({
      where,
      order: [['name', 'ASC']],
      attributes: ['id', 'name'],
      raw: true
    });
    res.json({ results: meetNames });
  } catch (error) {
    console.error('Error fetching meet names:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function createFacility(req, res, db) {
  try {
    const { name, address } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ ok: false, message: 'name is required.' });
    }
    const facility = await db.tables.Facilities.create({
      name: name.trim(),
      address: address && typeof address === 'object' ? address : null
    });
    const row = facility.get({ plain: true });
    res.status(201).json({
      id: row.id,
      name: row.name,
      ...(row.address && Object.keys(row.address).length ? { address: row.address } : {})
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ ok: false, message: 'A facility with this name already exists.' });
    }
    console.error('Error creating facility:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function updateFacility(req, res, db) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid facility id.' });
    }
    const facility = await db.tables.Facilities.findByPk(id);
    if (!facility) {
      return res.status(404).json({ ok: false, message: 'Facility not found.' });
    }
    const { name, address } = req.body;
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (address !== undefined) updates.address = address && typeof address === 'object' ? address : null;
    await facility.update(updates);
    const row = facility.get({ plain: true });
    res.json({
      id: row.id,
      name: row.name,
      ...(row.address && Object.keys(row.address).length ? { address: row.address } : {})
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ ok: false, message: 'A facility with this name already exists.' });
    }
    console.error('Error updating facility:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function deleteFacility(req, res, db) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid facility id.' });
    }
    const facility = await db.tables.Facilities.findByPk(id);
    if (!facility) {
      return res.status(404).json({ ok: false, message: 'Facility not found.' });
    }
    await facility.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting facility:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function createOrganization(req, res, db) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ ok: false, message: 'name is required.' });
    }
    const organization = await db.tables.HostingOrganizations.create({ name: name.trim() });
    res.status(201).json({ id: organization.id, name: organization.name });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ ok: false, message: 'An organization with this name already exists.' });
    }
    console.error('Error creating organization:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function updateOrganization(req, res, db) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid organization id.' });
    }
    const organization = await db.tables.HostingOrganizations.findByPk(id);
    if (!organization) {
      return res.status(404).json({ ok: false, message: 'Organization not found.' });
    }
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ ok: false, message: 'name is required.' });
    }
    await organization.update({ name: name.trim() });
    res.json({ id: organization.id, name: organization.name });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ ok: false, message: 'An organization with this name already exists.' });
    }
    console.error('Error updating organization:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function deleteOrganization(req, res, db) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid organization id.' });
    }
    const organization = await db.tables.HostingOrganizations.findByPk(id);
    if (!organization) {
      return res.status(404).json({ ok: false, message: 'Organization not found.' });
    }
    await organization.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function createMeetName(req, res, db) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ ok: false, message: 'name is required.' });
    }
    const meetName = await db.tables.MeetNames.create({ name: name.trim() });
    res.status(201).json({ id: meetName.id, name: meetName.name });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ ok: false, message: 'A meet name with this name already exists.' });
    }
    console.error('Error creating meet name:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function updateMeetName(req, res, db) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid meet name id.' });
    }
    const meetName = await db.tables.MeetNames.findByPk(id);
    if (!meetName) {
      return res.status(404).json({ ok: false, message: 'Meet name not found.' });
    }
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ ok: false, message: 'name is required.' });
    }
    await meetName.update({ name: name.trim() });
    res.json({ id: meetName.id, name: meetName.name });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ ok: false, message: 'A meet name with this name already exists.' });
    }
    console.error('Error updating meet name:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function deleteMeetName(req, res, db) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid meet name id.' });
    }
    const meetName = await db.tables.MeetNames.findByPk(id);
    if (!meetName) {
      return res.status(404).json({ ok: false, message: 'Meet name not found.' });
    }
    await meetName.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting meet name:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

module.exports = {
  getFacilities,
  getOrganizations,
  getMeetNames,
  createFacility,
  updateFacility,
  deleteFacility,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  createMeetName,
  updateMeetName,
  deleteMeetName
};

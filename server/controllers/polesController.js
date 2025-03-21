const getPoles = async (req, res, db) => {
  try {
    const poles = await db.tables.Poles.findAll({
        attributes: ['id', 'brand', 'feet', 'inches', 'weight'],
      order: [['feet', 'ASC'], ['inches', 'ASC'], ['weight', 'ASC']],
    });

    const allPolls = poles.map(pole => ({
        id: pole.id,
        brand: pole.brand,
        feet: pole.feet,
        inches: pole.inches,
        weight: pole.weight,
        // location: pole.location,
        // damaged: pole.damaged,
        // missing: pole.missing,
        // needsTip: pole.needsTip,
        // broken: pole.broken,
        // note: pole.note,
        // rented: pole.rented
    }));
    res.json({
      ok: true,
      poles: allPolls,
    });
  } catch (error) {
    console.error('Error in getPoles:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

module.exports = {
  getPoles
};

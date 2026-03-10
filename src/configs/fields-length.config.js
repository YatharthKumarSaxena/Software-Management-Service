// 📁 configs/field-lengths.config.js

module.exports = {
  phoneNumberLength: {
    min: 10,
    max: 16 
  },
  localNumberLength: {
    min: 9,
    max: 12
  },
  countryCodeLength: {
    min: 1,
    max: 4 
  },
  emailLength: {
    min: 5,
    max: 254
  },
  firstNameLength: {
    min: 2,
    max: 50
  },
  deviceNameLength: {
    min: 3,
    max: 64
  },
  notesFieldLength: {
    min: 0,
    max: 500
  },
  adminIdLength: {
    min: 10, 
    max: 10
  }
  ,mongoIdLength: {
    min: 24,
    max: 24
  },
  uuidV4Length: {
    min: 36,
    max: 36
  },
  orgNameLength: {
    min: 2,
    max: 200
  },

  // ─── Project Fields ───────────────────────────────────────────────────────
  projectNameLength: {
    min: 3,
    max: 150
  },
  descriptionLength: {
    min: 10,
    max: 2000
  },
  problemStatementLength: {
    min: 10,
    max: 2000
  },
  projectGoalLength: {
    min: 10,
    max: 1000
  }
};
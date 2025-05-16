const express = require('express');
const router = express.Router();
const { getContentByType } = require('../controllers/appContent');

// -> /appContant/help
// -> /appContant/privacy
router.get('/:type(help|privacy)', getContentByType);

module.exports = router;

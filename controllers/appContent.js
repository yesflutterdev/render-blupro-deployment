const AppContent = require('../models/appContent');

exports.getContentByType = async (req, res) => {
    try {
        const type = req.params.type;
        const data = await AppContent.findOne({ type });

        if (!data) {
            return res.status(404).json({ message: 'Content not found' });
        }

        res.json({ type: data.type, content: data.content });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

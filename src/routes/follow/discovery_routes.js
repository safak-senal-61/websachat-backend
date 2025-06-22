// src/routes/follow/discovery_routes.js
const express = require('express');
const router = express.Router();
const followController = require('../../controllers/follow');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /follows/search:
 *   get:
 *     summary: Kullanıcı arar (takip bağlamında)
 *     tags: [UserSearch (Follow Context)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: searchTerm
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arama sonuçları.
 */
router.get('/search', authenticateToken, followController.searchUsers);

/**
 * @swagger
 * /follows/suggestions:
 *   get:
 *     summary: Takip önerileri
 *     tags: [FollowSuggestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Takip önerileri.
 */
router.get('/suggestions', authenticateToken, followController.getFollowSuggestions);

module.exports = router;
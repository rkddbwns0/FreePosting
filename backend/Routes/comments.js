const express = require('express');
const db = require('../dbconnection');
const router = express.Router();

function insertComment(board_no, category_no, user_id, nickname, comment, parent_id, group_order, depth, res) {
    const insertQuery = `
        INSERT INTO comments (board_no, category_no, user_id, nickname, comment, parent_id, group_order, depth, regDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW());
    `;
    db.query(
        insertQuery,
        [board_no, category_no, user_id, nickname, comment, parent_id, group_order, depth],
        (error, result) => {
            if (error) {
                console.error(error);
                return res.status(400).json({ message: '에러임' });
            }
        }
    );
}

router.get('/select/:board_no/:category_no', (req, res) => {
    const { board_no, category_no } = req.params;

    const query = `
    SELECT * FROM comments WHERE board_no = ? AND category_no = ? ORDER BY group_order, depth, regDate DESC
    `;
    db.query(query, [board_no, category_no], (error, result) => {
        if (error) {
            console.error(error);
            return error;
        }
        res.json(result);
    });
});

router.post('/insert', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.json({ mesaage: '로그인 한 회원만 사용가능합니다.' });
    }

    const { board_no, category_no, nickname, comment, parent_id = null } = req.body;
    const userId = req.session.user.id;

    if (parent_id) {
        const query = 'SELECT group_order, depth FROM comments WHERE no = ?';
        db.query(query, [parent_id], (error, result) => {
            if (error || result.length === 0) {
                console.error(error);
                res.status(400).json({ message: '데이터를 확인해 주세요.' });
            }
            const parentComment = result[0];
            const group_order = parentComment.group_order;
            const depth = parentComment.depth + 1;

            insertComment(board_no, category_no, userId, nickname, comment, parent_id, group_order, depth, res);
        });
    } else {
        const maxGroupOrderQuery = 'SELECT MAX(group_order) AS max_order FROM comments WHERE board_no = ?';
        db.query(maxGroupOrderQuery, [board_no], (error, result) => {
            if (error) {
                console.error(error);
            }

            const group_order = (result[0].max_order || 0) + 1;
            const depth = 0;

            insertComment(board_no, category_no, userId, nickname, comment, null, group_order, depth, res);
        });
    }
});

module.exports = router;
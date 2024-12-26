const express = require('express');
const db = require('../dbconnection');
const router = express.Router();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const checkToken = require('./jwtToken');

let token = {};

router.post('/signup', (req, res) => {
    const { id, password, name, phone, nickname } = req.body;

    const query = 'INSERT INTO userdb (id, password, name, phone, nickname) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [id, password, name, phone, nickname], (error, result) => {
        if (error) {
            console.error(error);
        }
        res.status(201).json(result);
    });
});

router.post('/checkUser', (req, res) => {
    const { id, phone } = req.body;

    let query = '';
    let type = '';
    let value = '';

    if (id) {
        query = 'SELECT id FROM userdb WHERE id = ?';
        value = id;
        type = '아이디';
    } else if (phone) {
        query = 'SELECT phone FROM userdb WHERE Phone = ?';
        value = phone;
        type = '휴대폰 번호';
    }

    db.query(query, [value], (error, result) => {
        if (error) {
            console.error(error);
        }
        if (result.length > 0) {
            res.json({ message: `이미 가입된 ${type}입니다.`, exist: false });
        } else if (result) {
            res.json({ message: `사용 가능한 ${type}입니다.`, exist: true });
        }
    });
});

router.post('/login', (req, res) => {
    const { id, password } = req.body;
    const accessToken = createAccessToken(id);
    const refreshToken = createRefreshToken();

    const query = 'SELECT * FROM userdb WHERE id = ? AND password = ?';

    db.query(query, [id, password], async (error, result) => {
        try {
            if (result.length > 0) {
                const user = result[0];
                const updateToken = 'UPDATE userdb SET refresh_token = ? WHERE id = ?';
                db.query(updateToken, [refreshToken, id], async (error, result) => {
                    token[refreshToken] = id;
                    await res.cookie('accessToken', accessToken, { httpOnly: true });
                    await res.cookie('refreshToken', refreshToken, { httpOnly: true });
                    if (error) {
                        console.error(error);
                    }
                    return await res.json({ login: true, user: user });
                });
            } else {
                res.json({ message: '로그인 실패' });
            }
        } catch (error) {
            console.error(error);
        }

        if (error) {
            console.error(error);
        }
    });
});

router.post('/user', checkToken, async (req, res) => {
    const userId = req.user.id;

    const query = 'SELECT * FROM userdb WHERE id = ?';

    db.query(query, [userId], (error, result) => {
        if (error) {
            console.error(error);
        }

        res.json(result);
    });
});

router.post('/logout', checkToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const query = 'SELECT * FROM userdb WHERE id = ?';
        db.query(query, [userId], (error, result) => {
            if (error) {
                console.error(error);
            }

            if (result.length > 0) {
                const updateToken = 'UPDATE userdb SET refresh_token = null WHERE id = ?';
                db.query(updateToken, [userId], (error, updateResult) => {
                    if (error) {
                        console.error(error);
                    }

                    res.clearCookie('accessToken', { httpOnly: true });
                    res.clearCookie('refreshToken', { httpOnly: true });

                    return res.status(200).json({ message: '로그아웃이욤' });
                });
            }
        });
    } catch (error) {
        console.error(error);
    }
});

router.post('/modifyInfo', checkToken, (req, res) => {
    const userId = req.user.id;
    const { password, nickname } = req.body;

    if (password || nickname) {
        const updates = [];
        const values = [];

        if (password) {
            updates.push('password = ?');
            values.push(password);
        }

        if (nickname) {
            updates.push('nickname = ?');
            values.push(nickname);
        }

        const query = `UPDATE userdb SET ${updates.join(', ')} WHERE id = ?`;
        values.push(userId);

        try {
            db.query(query, values, (error, result) => {
                if (error) {
                    console.error(error);
                }
                console.log(result);
                if (password === null && nickname === null) {
                    res.status(400).json({ success: false });
                } else if (result.length > 0) {
                    res.status(400).json({ success: false });
                } else {
                    res.status(200).json({ success: true });
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
});

function createAccessToken(id) {
    const secret_key = process.env.JWT_SECRET_KET;
    const accessToken = jwt.sign({ id: id }, secret_key, { expiresIn: '1h' });
    return accessToken;
}

function createRefreshToken() {
    const secret_key = process.env.JWT_SECRET_KET;
    const refreshToken = jwt.sign({}, secret_key, { expiresIn: '7d' });
    return refreshToken;
}

module.exports = router;

import React, { useEffect, useState } from 'react';
import './css/topBar.css';
import axios from 'axios';
import { replace, useLocation, useNavigate } from 'react-router-dom';
import { SERVER_ADDRESS } from './serverAddress/serverAddress';

function Nav({ user }) {
    const navigate = useNavigate();
    const [category, setCategory] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        axios
            .get(`${SERVER_ADDRESS}/posts_category/category`)
            .then((res) => {
                setCategory(res.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const logout = async () => {
        try {
            const response = await axios.post('http://localhost:8080/userdb/logout', {}, { withCredentials: true });
            console.log(response.data);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    const handleClickCategory = (item) => {
        navigate('/board', { state: { category: item.category, category_no: item.no } });
    };

    useEffect(() => {}, [user]);

    return (
        <header className="header">
            <div className="topContainer">
                <div className="title">
                    <strong className="title-text" href="/">
                        <a className="title-a" href="/">
                            FreePosting
                        </a>
                    </strong>
                    <div className="main-top-nav">
                        <div className="categoryContainer">
                            <a className="top-nav-text" onClick={() => setOpen((prev) => !prev)}>
                                게시판
                            </a>
                            {open && (
                                <div className="dropdown-menu">
                                    {category.map((item, index) => (
                                        <p
                                            key={index}
                                            onClick={() => {
                                                handleClickCategory({ no: item.no, category: item.category });
                                                setOpen((prev) => !prev);
                                            }}
                                        >
                                            {item.category}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <a className="top-nav-text">공지사항</a>
                    </div>
                </div>
                <div className="top-bar">
                    {user ? (
                        <div className="loginView">
                            <a onClick={logout}>로그아웃</a>
                            <a href="/myPage">마이페이지</a>
                            <a>{user[0]?.nickname}님</a>
                        </div>
                    ) : (
                        <div className="loginView">
                            <a className="login" href="/login">
                                로그인
                            </a>
                            <a className="signup" href="/signup">
                                회원가입
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Nav;

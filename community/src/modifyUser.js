import { useNavigate } from 'react-router-dom';
import useFetchUser from './useFetchUser';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { SERVER_ADDRESS } from './serverAddress/serverAddress';
import Nav from './Nav';
import './css/modifyUser.css';

function ModifyUser() {
    const { user } = useFetchUser();
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const passwordRef = useRef(null);

    const handleShowPassword = async () => {
        const password = await passwordRef.current;
        if (password === null) return;

        await setShowPassword(!showPassword);
        if (!showPassword) {
            password.type = 'text';
        } else {
            password.type = 'password';
        }
    };

    const logout = async () => {
        try {
            const response = await axios.post('http://localhost:8080/userdb/logout', {}, { withCredentials: true });
            navigate('/login');
        } catch (error) {
            console.error(error);
        }
    };

    const modifyInfo = async () => {
        try {
            if (password === '' && user[0]?.nickname === nickname) {
                alert('변경할 정보를 입력해 주세요.');
                return false;
            }
            const response = await axios.post(
                `${SERVER_ADDRESS}/userdb/modifyInfo`,
                {
                    nickname: nickname || null,
                    password: password || null,
                },
                { withCredentials: true }
            );
            if (response.status === 200) {
                alert('정보가 변경되었습니다. 다시 로그인해 주세요.');
                logout();
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (user) {
            setNickname(user[0]?.nickname);
        } else {
            alert('로그인을 해 주세요.');
            navigate('/login');
        }
    }, [user]);

    return (
        <div>
            <div>
                <Nav user={user} />
            </div>
            <div style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <h2>정보 수정</h2>
            </div>
            {user ? (
                <div className="modifyContainer">
                    <div className="infoSection">
                        <h4 className="sectionTitle">아이디</h4>
                        <input className="modifyInput" value={user[0]?.id} disabled={true} />
                    </div>
                    <div className="infoSection">
                        <h4 className="sectionTitle">이름</h4>
                        <input className="modifyInput" value={user[0]?.name} disabled={true} />
                    </div>
                    <div className="infoSection">
                        <h4 className="sectionTitle">전화번호</h4>
                        <input className="modifyInput" value={user[0]?.phone} disabled={true} />
                    </div>
                    <div className="infoSection">
                        <h4 className="sectionTitle">닉네임</h4>
                        <input
                            className="modifyInput"
                            value={nickname}
                            onChange={(text) => setNickname(text.target.value)}
                        />
                    </div>
                    <div className="infoSection">
                        <h4 className="sectionTitle">비밀번호 재설정</h4>
                        <input
                            className="modifyInput"
                            value={password}
                            onChange={(text) => setPassword(text.target.value)}
                            type="password"
                            ref={passwordRef}
                        />
                        <div className="showPasswordView">
                            <input type="checkbox" onChange={handleShowPassword} />
                            <span>비밀번호 보기</span>
                        </div>
                    </div>
                    <div className="modifyBtnView">
                        <button onClick={modifyInfo}>수정하기</button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default ModifyUser;

import React, { useEffect, useState } from 'react';
import Nav from './Nav';
import useFetchUser from './useFetchUser';
import { useNavigate } from 'react-router-dom';

function MyPage() {
    const { user } = useFetchUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            alert('로그인을 해 주세요.');
            navigate('/login');
        }
    });

    return (
        <div>
            <div>
                <Nav user={user} />
            </div>
            <div>
                <div>
                    <a href="/myPosts">
                        <h4>내가 작성한 게시글</h4>
                    </a>
                </div>

                <div>
                    <a href="/myComments">
                        <h4>내가 작성한 댓글</h4>
                    </a>
                </div>

                <div>
                    <a href="/modifyUser">
                        <h4>회원정보 수정하기</h4>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default MyPage;

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toggleFollow as toggleFollowApi, getFollowingUsers } from '../api/followApi';

const FollowContext = createContext(null);

export function FollowProvider({ children }) {
    const { user } = useAuth();

    // 팔로우 중인 username 목록
    const [followingList, setFollowingList] = useState([]);

    // 로그인 상태가 바뀔 때 서버에서 팔로잉 목록 동기화
    useEffect(() => {
        if (!user) {
            setFollowingList([]);
            return;
        }
        getFollowingUsers(user.id)
            .then((users) => setFollowingList(users.map((u) => u.username)))
            .catch(() => setFollowingList([]));
    }, [user]);

    // 특정 유저를 팔로우 중인지 확인
    function isFollowing(username) {
        return followingList.includes(username);
    }

    // 팔로우/언팔로우 전환 (targetUserId 필요)
    async function toggleFollow(username, targetUserId) {
        if (!user || !targetUserId) return;
        try {
            const result = await toggleFollowApi(user.id, targetUserId);
            if (result.following) {
                setFollowingList((prev) => [...prev, username]);
            } else {
                setFollowingList((prev) => prev.filter((n) => n !== username));
            }
        } catch (e) {
            console.error('팔로우 처리 실패:', e);
        }
    }

    const value = {
        followingList,
        isFollowing,
        toggleFollow,
    };

    return (
        <FollowContext.Provider value={value}>
            {children}
        </FollowContext.Provider>
    );
}

export function useFollow() {
    return useContext(FollowContext);
}

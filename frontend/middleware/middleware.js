import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

export const withAuth = (Component) => {
  return (props) => {
    const router = useRouter();
    const { authState } = useContext(AuthContext);

    useEffect(() => {
      if (!authState.isAuthenticated) {
        // 인증되지 않은 경우 로그인 화면으로 리다이렉트
        router.replace('/login');
      }
    }, [authState.isAuthenticated]);

    // 인증된 경우 컴포넌트를 렌더링
    return authState.isAuthenticated ? <Component {...props} /> : null;
  };
};

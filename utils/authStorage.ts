import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthData {
  token: string;
  user: {
    id: number;
    username: string;
    fullName?: string;
    email: string;
    roles: string[];
  };
}

export const saveAuth = async (data: any) => {
  try {
    const authData: AuthData = {
      token: data.token || data.accessToken,
      user: {
        id: data.id,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        roles: data.roles
      }
    };

    await AsyncStorage.setItem('auth', JSON.stringify(authData));
    console.log('✅ Auth data saved:', authData);
    return authData;
  } catch (error) {
    console.error('❌ Error saving auth:', error);
    throw error;
  }
};

export const getAuth = async (): Promise<AuthData | null> => {
  try {
    const authString = await AsyncStorage.getItem('auth');
    return authString ? JSON.parse(authString) : null;
  } catch (error) {
    console.error('❌ Error getting auth:', error);
    return null;
  }
};

export const clearAuth = async () => {
  try {
    await AsyncStorage.removeItem('auth');
  } catch (error) {
    console.error('❌ Error clearing auth:', error);
  }
};
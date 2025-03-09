import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Save SIEG key for the current user
export const saveSiegKey = async (siegKey: string): Promise<{ message: string }> => {
  const userStr = localStorage.getItem('user');
  let token = null;
  
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      token = userData.token;
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }
  }
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/users/sieg-key`, 
      { siegKey }, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error saving SIEG key:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.message || 'Erro ao salvar a chave SIEG');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Servidor não respondeu. Verifique sua conexão.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || 'Erro ao salvar a chave SIEG');
    }
  }
};

// Get SIEG key for the current user
export const getSiegKey = async (): Promise<{ siegKey: string }> => {
  const userStr = localStorage.getItem('user');
  let token = null;
  
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      token = userData.token;
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }
  }
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }
  
  try {
    const response = await axios.get(
      `${API_URL}/users/sieg-key`, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting SIEG key:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Erro ao obter a chave SIEG');
    } else if (error.request) {
      throw new Error('Servidor não respondeu. Verifique sua conexão.');
    } else {
      throw new Error(error.message || 'Erro ao obter a chave SIEG');
    }
  }
};
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Interface for CNPJ data
export interface CNPJ {
  id: string;
  cnpj: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all CNPJs for the current user
export const getCNPJs = async (): Promise<CNPJ[]> => {
  console.log('getCNPJs service called');
  const userStr = localStorage.getItem('user');
  let token = null;
  
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      token = userData.token;
      console.log('Token retrieved from user data in localStorage');
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }
  }
  
  if (!token) {
    console.error('Authentication token not found in localStorage');
    throw new Error('Usuário não autenticado');
  }
  
  try {
    console.log(`Making GET request to ${API_URL}/cnpjs`);
    const response = await axios.get(`${API_URL}/cnpjs`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('CNPJs fetched successfully, count:', response.data);
    // Ensure we always return an array, even if response.data.cnpjs is undefined
    return response.data || [];
  } catch (error: any) {
    console.error('Error fetching CNPJs:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
    throw error;
  }
};

// Add a new CNPJ
export const addCNPJ = async (cnpj: string): Promise<CNPJ> => {
  console.log('addCNPJ service called with:', cnpj);
  const userStr = localStorage.getItem('user');
  let token = null;
  
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      token = userData.token;
      console.log('Token retrieved from user data in localStorage');
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }
  }
  
  if (!token) {
    console.error('Authentication token not found in localStorage');
    throw new Error('Usuário não autenticado');
  }
  
  try {
    console.log(`Making POST request to ${API_URL}/cnpjs with payload:`, { cnpj });
    const response = await axios.post(`${API_URL}/cnpjs`, { cnpj }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('CNPJ added successfully, response:', response.data);
    return response.data.cnpj;
  } catch (error: any) {
    console.error('Error adding CNPJ:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
    throw error;
  }
};

// Remove a CNPJ
export const removeCNPJ = async (cnpjId: string): Promise<void> => {
  console.log('removeCNPJ service called with ID:', cnpjId);
  const userStr = localStorage.getItem('user');
  let token = null;
  
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      token = userData.token;
      console.log('Token retrieved from user data in localStorage');
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }
  }
  
  if (!token) {
    console.error('Authentication token not found in localStorage');
    throw new Error('Usuário não autenticado');
  }
  
  try {
    console.log(`Making DELETE request to ${API_URL}/cnpjs/${cnpjId}`);
    await axios.delete(`${API_URL}/cnpjs/${cnpjId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('CNPJ removed successfully');
  } catch (error: any) {
    console.error('Error removing CNPJ:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
    throw error;
  }
};
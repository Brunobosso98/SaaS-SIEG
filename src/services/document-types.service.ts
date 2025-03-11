import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getToken = (): string | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      return userData.token;
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
      return null;
    }
  }
  return null;
};

// Fetch document types for the current user
export const fetchDocumentTypes = async (): Promise<{ documentTypes: string[] }> => {
  const token = getToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const response = await axios.get(
      `${API_URL}/users/settings/document-types`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching document types:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Erro ao carregar tipos de documentos');
    } else if (error.request) {
      throw new Error('Servidor não respondeu. Verifique sua conexão.');
    } else {
      throw new Error(error.message || 'Erro ao carregar tipos de documentos');
    }
  }
};

// Add a document type for the current user
export const addDocumentType = async (documentType: number): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  try {
    await axios.post(
      `${API_URL}/users/settings/document-types`,
      { documentType },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } catch (error: any) {
    console.error('Error adding document type:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Erro ao adicionar tipo de documento');
    } else if (error.request) {
      throw new Error('Servidor não respondeu. Verifique sua conexão.');
    } else {
      throw new Error(error.message || 'Erro ao adicionar tipo de documento');
    }
  }
};

// Remove a document type for the current user
export const removeDocumentType = async (documentType: number): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  try {
    await axios.delete(
      `${API_URL}/users/settings/document-types`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: { documentType }
      }
    );
  } catch (error: any) {
    console.error('Error removing document type:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Erro ao remover tipo de documento');
    } else if (error.request) {
      throw new Error('Servidor não respondeu. Verifique sua conexão.');
    } else {
      throw new Error(error.message || 'Erro ao remover tipo de documento');
    }
  }
};

// Save all document type preferences for the current user
export const saveDocumentTypePreferences = async (documentTypes: string[]): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  try {
    await axios.put(
      `${API_URL}/users/settings`,
      {
        settings: {
          documentTypes
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } catch (error: any) {
    console.error('Error saving document type preferences:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Erro ao salvar preferências');
    } else if (error.request) {
      throw new Error('Servidor não respondeu. Verifique sua conexão.');
    } else {
      throw new Error(error.message || 'Erro ao salvar preferências');
    }
  }
};
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
};

const requiredKeys = ['apiKey', 'projectId'];

const ensureConfig = () => {
  const missing = requiredKeys.filter((key) => !firebaseConfig[key]);
  if (missing.length) {
    throw new Error(`Missing Firebase environment variables: ${missing.join(', ')}`);
  }
};

const parseIdentityResponse = async (response) => {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || 'Firebase authentication request failed');
  }

  return {
    uid: payload.localId,
    email: payload.email,
    idToken: payload.idToken,
    refreshToken: payload.refreshToken,
    expiresAt: Date.now() + Number(payload.expiresIn || 3600) * 1000
  };
};

const callIdentityToolkit = async (method, body) => {
  ensureConfig();

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${firebaseConfig.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, returnSecureToken: true })
  });

  return parseIdentityResponse(response);
};

const docToQrCode = (document) => {
  const fields = document.fields || {};
  return {
    id: fields.id?.stringValue || document.name.split('/').pop(),
    type: fields.type?.stringValue || 'unknown',
    data: fields.data?.stringValue || '{}',
    image: fields.image?.stringValue || '',
    createdAt: fields.createdAt?.stringValue || new Date(0).toISOString()
  };
};

export const firebaseAuthApi = {
  signUp: (email, password) => callIdentityToolkit('signUp', { email, password }),
  signIn: (email, password) => callIdentityToolkit('signInWithPassword', { email, password })
};

export const firestoreApi = {
  async saveQrCode({ idToken, uid, entry }) {
    ensureConfig();

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}/qrcodes?documentId=${entry.id}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            id: { stringValue: entry.id },
            type: { stringValue: entry.type },
            data: { stringValue: entry.data },
            image: { stringValue: entry.image },
            createdAt: { stringValue: entry.createdAt }
          }
        })
      }
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error?.message || 'Failed to save QR code');
    }

    return docToQrCode(payload);
  },

  async getQrCodes({ idToken, uid }) {
    ensureConfig();

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}/qrcodes`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      }
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error?.message || 'Failed to fetch QR history');
    }

    return (payload.documents || []).map(docToQrCode).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async deleteQrCode({ idToken, uid, id }) {
    ensureConfig();

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}/qrcodes/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      }
    );

    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.error?.message || 'Failed to delete QR code');
    }
  }
};

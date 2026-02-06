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
    displayName: payload.displayName || '',
    photoURL: payload.photoUrl || '',
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
    title: fields.title?.stringValue || 'Untitled QR',
    type: fields.type?.stringValue || 'unknown',
    data: fields.data?.stringValue || '{}',
    image: fields.image?.stringValue || '',
    createdAt: fields.createdAt?.stringValue || new Date(0).toISOString(),
    favorite: fields.favorite?.booleanValue ?? false
  };
};

const parseNumberValue = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const docToUserProfile = (document) => {
  const fields = document.fields || {};
  return {
    uid: fields.uid?.stringValue || document.name.split('/').pop(),
    name: fields.name?.stringValue || '',
    email: fields.email?.stringValue || '',
    photoURL: fields.photoURL?.stringValue || '',
    createdAt: fields.createdAt?.stringValue || '',
    theme: fields.theme?.stringValue || 'light',
    defaultQrColor: fields.defaultQrColor?.stringValue || '#111827',
    defaultQrSize: parseNumberValue(fields.defaultQrSize?.integerValue, 512)
  };
};

export const firebaseAuthApi = {
  signUp: (email, password) => callIdentityToolkit('signUp', { email, password }),
  signIn: (email, password) => callIdentityToolkit('signInWithPassword', { email, password }),
  signInWithGoogle: (idToken, requestUri) =>
    callIdentityToolkit('signInWithIdp', {
      requestUri,
      postBody: `id_token=${encodeURIComponent(idToken)}&providerId=google.com`,
      returnIdpCredential: true
    })
};

export const firestoreApi = {
  async getUserProfile({ idToken, uid }) {
    ensureConfig();

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      }
    );

    if (response.status === 404) {
      return null;
    }

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error?.message || 'Failed to fetch user profile');
    }

    return docToUserProfile(payload);
  },

  async ensureUserProfile({ idToken, profile }) {
    const existing = await this.getUserProfile({ idToken, uid: profile.uid });
    if (existing) {
      return existing;
    }
    return this.createUserProfile({ idToken, profile });
  },

  async createUserProfile({ idToken, profile }) {
    ensureConfig();

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${profile.uid}?currentDocument.exists=false`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            uid: { stringValue: profile.uid },
            name: { stringValue: profile.name || '' },
            email: { stringValue: profile.email || '' },
            photoURL: { stringValue: profile.photoURL || '' },
            createdAt: { stringValue: profile.createdAt || new Date().toISOString() },
            theme: { stringValue: profile.theme || 'light' },
            defaultQrColor: { stringValue: profile.defaultQrColor || '#111827' },
            defaultQrSize: { integerValue: String(profile.defaultQrSize || 512) }
          }
        })
      }
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error?.message || 'Failed to create user profile');
    }

    return docToUserProfile(payload);
  },

  async updateUserProfile({ idToken, uid, updates }) {
    ensureConfig();

    const params = new URLSearchParams();
    const fields = {};

    if (updates.name !== undefined) {
      params.append('updateMask.fieldPaths', 'name');
      fields.name = { stringValue: updates.name || '' };
    }

    if (updates.photoURL !== undefined) {
      params.append('updateMask.fieldPaths', 'photoURL');
      fields.photoURL = { stringValue: updates.photoURL || '' };
    }

    if (updates.theme !== undefined) {
      params.append('updateMask.fieldPaths', 'theme');
      fields.theme = { stringValue: updates.theme || 'light' };
    }

    if (updates.defaultQrColor !== undefined) {
      params.append('updateMask.fieldPaths', 'defaultQrColor');
      fields.defaultQrColor = { stringValue: updates.defaultQrColor || '#111827' };
    }

    if (updates.defaultQrSize !== undefined) {
      params.append('updateMask.fieldPaths', 'defaultQrSize');
      fields.defaultQrSize = { integerValue: String(updates.defaultQrSize || 512) };
    }

    if (!Object.keys(fields).length) {
      return null;
    }

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}?${params.toString()}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      }
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error?.message || 'Failed to update user profile');
    }

    return docToUserProfile(payload);
  },

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
            title: { stringValue: entry.title || 'Untitled QR' },
            type: { stringValue: entry.type },
            data: { stringValue: entry.data },
            image: { stringValue: entry.image },
            createdAt: { stringValue: entry.createdAt },
            favorite: { booleanValue: Boolean(entry.favorite) }
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
  },

  async updateQrCode({ idToken, uid, id, updates }) {
    ensureConfig();

    const params = new URLSearchParams();
    const fields = {};

    if (updates.title !== undefined) {
      params.append('updateMask.fieldPaths', 'title');
      fields.title = { stringValue: updates.title || 'Untitled QR' };
    }

    if (updates.favorite !== undefined) {
      params.append('updateMask.fieldPaths', 'favorite');
      fields.favorite = { booleanValue: Boolean(updates.favorite) };
    }

    if (!Object.keys(fields).length) {
      return null;
    }

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}/qrcodes/${id}?${params.toString()}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      }
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error?.message || 'Failed to update QR code');
    }

    return docToQrCode(payload);
  }
};

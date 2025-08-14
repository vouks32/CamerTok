import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';

const AuthContext = createContext();

const baseUrl = 'http://16.170.236.54' // URL du serveur AWS

const tiktokURL = baseUrl + '/api/tiktok/info';
const UserUrl = baseUrl + '/api/users';
const campaignFilesUrl = baseUrl + '/api/campaigns/files';
const campaignDataUrl = baseUrl + '/api/campaigns/data';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [allCampaigns, setCampaigns] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [tabSelection, setTabSelection] = useState(1);



  const CreateCampaign = async (files, campaign, edit, campaignId) => {
    setUploading(true)
    const normalized = files.map((f, i) => {
      const _n = {
        id: i,
        campaignId: campaign.id,
        name: f.serverName,
        uri: f.uri,
        mimeType: f.mimeType || f.mime || "application/octet-stream",
        size: f.size || 0,
        progress: 0,
        status: "ready", // ready | uploading | done | error
      }
      return _n
    }).filter(f => (edit) ? !allCampaigns.docs.find(c => c.id === campaignId).campaignInfo.documents.find(d => d.name === f.name) : true);
    setUploadProgress(normalized)

    // Start uploads in parallel but track individually
    const uploads = normalized.map((f, i, _normalized) => {
      if (f.status === "done")
        return Promise.resolve(); // skip already done
      return uploadSingleFile(f, i, _normalized);
    });

    const results = await Promise.all(uploads);
    //console.log("file upload results", results)
    await CampaignAPI(campaign, edit, campaignId)
    setUploading(false)
  };

  const DeleteCampaign = async (campaignId) => {
    try {
      const id = campaignId;

      // Créer un nouveau joueur
      const createResponse = await fetch(campaignDataUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "skip_zrok_interstitial": "true"
        },
        body: JSON.stringify({
          action: "delete",
          campaignId: id
        })
      });

      const newCampaign = await createResponse.json();
      await loadCampaigns()
      return newCampaign

    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  }

  const uploadSingleFile = (file, i, normalized) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      // Append file object for RN/Expo: { uri, name, type }
      formData.append("files", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      });

      xhr.open("POST", campaignFilesUrl + "?campaignid=" + file.campaignId);

      // update status to uploading
      setUploadProgress((prev) =>
        prev.map((p) => (p.id === file.id ? { ...p, status: "uploading", progress: 0 } : p))
      );

      // Track progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) / 2;
          setUploadProgress((prev) => prev.map((p) => (p.id === file.id ? { ...p, progress: percent } : p)));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress((prev) => prev.map((p) => (p.id === file.id ? { ...p, progress: 1, status: "done" } : p)));
          console.log(`Upload succeeded: ${xhr.status}`)
          resolve(xhr.responseText);
        } else {
          setUploadProgress((prev) => prev.map((p) => (p.id === file.id ? { ...p, status: "error" } : p)));
          console.log(`Upload failed: ${xhr.status}`)
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        setUploadProgress((prev) => prev.map((p) => (p.id === file.id ? { ...p, status: "error" } : p)));
        console.log("Network error")

        reject(new Error("Network error"));
      };

      xhr.send(formData);
    });
  };

  // Check for existing session on app start
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        await loadCampaigns();
        const userData = await AsyncStorage.getItem('user');
        const userLastLogin = await AsyncStorage.getItem('lastLogin');
        const allUsersResponse = await AuthAPI({ email: "@all" });
        setAllUsers(allUsersResponse)

        if (userData) {
          if (parseInt(userLastLogin) + (1000 * 60 * 60 * 24 * 7) < Date.now()) {
            Alert.alert('Connexion expiré', 'veillez vous reconnecter à votre compte')
            return
          }
          let userJSON = JSON.parse(userData);
          userJSON.userType = "business"
          userJSON.companyName = "Boi SARL"
          await AsyncStorage.setItem('lastLogin', Date.now().toString());
          setUser(userJSON);
        } else {
          console.log("no user -- need to login")
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const loadCampaigns = async () => {
    const allCampaignsResponse = await CampaignAPI({ id: "@all" })
    console.log("Campaigns in Server =", allCampaignsResponse?.size)
    setCampaigns(allCampaignsResponse)
  }

  const login = async (credentials, login = false) => {
    try {
      // Replace with your actual API call
      const response = await AuthAPI(credentials, login);
      if (response.error) {
        throw response;
      }
      setUser(response);
      await AsyncStorage.setItem('user', JSON.stringify(response));
      await AsyncStorage.setItem('lastLogin', Date.now().toString());
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };


  return (
    <AuthContext.Provider value={{
      baseUrl,
      user,
      uploadProgress,
      uploading,
      tabSelection,
      setTabSelection,
      CreateCampaign,
      DeleteCampaign,
      loadCampaigns,
      allCampaigns,
      isLoading,
      allUsers,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Fake authentication for development
const AuthAPI = async (user, login = false) => {
  try {
    const email = user.email;

    // Vérifier si le joueur existe
    const user_response = await fetch(`${UserUrl}?email=${email}`, {
      headers: {
        "skip_zrok_interstitial": "true"
      }
    });

    if (user_response.status === 404 && !login) {
      // Créer un nouveau joueur
      const createResponse = await fetch(UserUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "skip_zrok_interstitial": "true"
        },
        body: JSON.stringify({
          ...user,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isFirstTime: true
        })
      });

      const newUser = await createResponse.json();
      return newUser
    } else if (user_response.status === 404) {
      return { error: true, message: "l'adresse mail ne correspond pas, si vous n'avez pas de compte, créez en un" }
    } else {
      // Mettre à jour le joueur existant
      const newUser = await user_response.json();
      if (newUser.password !== user.password) {
        return { error: true, message: "le mot de passe ne correspond pas" }
      }
      return newUser;
    }
  } catch (error) {
    console.error('Error initializing player:', error);
  }
};

// Fake authentication for development
const CampaignAPI = async (campaign, edit, campaignId) => {
  try {
    const id = campaign.id;

    // Vérifier si le joueur existe
    const response = await fetch(`${campaignDataUrl}?id=${id}`, {
      headers: {
        "skip_zrok_interstitial": "true"
      }
    });

    if (response.status === 404) {
      // Créer un nouveau joueur
      const createResponse = await fetch(campaignDataUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "skip_zrok_interstitial": "true"
        },
        body: JSON.stringify({
          ...campaign
        })
      });

      const newCampaign = await createResponse.json();
      return newCampaign
    } else if (edit) {
      // Créer un nouveau joueur
      const createResponse = await fetch(campaignDataUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...campaign
        })
      });

      const newCampaign = await createResponse.json();
      return newCampaign
    } else {
      // Mettre à jour le joueur existant
      const campaignData = await response.json();
      return campaignData;
    }
  } catch (error) {
    console.error('Error initializing campaign:', error);
  }
};

export const TiktokUsernameSearch = async (text) => {
  try {
    // Vérifier si le joueur existe
    const response = await fetch(`${tiktokURL}?username=${text}`, {
      headers: {
        "skip_zrok_interstitial": "true"
      }
    });
    if (response.ok) {
      // Mettre à jour le joueur existant
      const tiktokUserData = await response.json();
      // console.log("Tiktok user found:", tiktokUserData.result?.user.username)
      return tiktokUserData
    }
    return null
  } catch (error) {
    console.error('Error initializing players List:', error);
    return null
  }

}

export const useAuth = () => useContext(AuthContext);
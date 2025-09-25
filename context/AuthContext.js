import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect, use } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import Toast from '../components/Toast';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const AuthContext = createContext();

//const baseUrl = 'http://192.168.1.188' // URL du serveur local pour test
const baseUrl = 'https://camer-tok-server.vercel.app' // URL du serveur enligne pour test

const tiktokURL = baseUrl + '/api/tiktok/info';
const UserUrl = baseUrl + '/api/users';
const NotificationUrl = baseUrl + '/api/notification';
const ChannelUrl = baseUrl + '/api/notification/channel';
const campaignFilesUrl = baseUrl + '/api/campaigns/files';
const campaignDataUrl = baseUrl + '/api/campaigns/data';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [allCampaigns, setCampaigns] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isLoadingCampaigns, setIsLoadingCamapigns] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [tabSelection, setTabSelection] = useState(1);
  const [toast, setToast] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [canShowToast, setCanShowToast] = useState(true);


  ///////  TOASTS
  const AddToasts = (title, body, onClose = null, buttons = [], image = null, duration = 3000) => {
    let f = (s = setShowToast, t = setToast, cst = setCanShowToast) => {
      s(false)
      t(null)
      cst(true)
      if (onClose)
        onClose()
    }
    setToasts(toasts.concat([{ title, body, image, duration, buttons, onClose: f }]))
  }

  // Check for existing session on app start
  useEffect(() => {
    const showToastsOrder = () => {
      if (toasts.length === 0 || !canShowToast) return
      setToast(toasts[0])
      setToasts(toasts.filter((_, i) => i !== 0))
      setShowToast(true)
      setCanShowToast(false)
    };

    showToastsOrder();
  }, [toasts, canShowToast]);

  ///////  CAMPAIGNS
  const CreateCampaign = async (files, campaign, edit, campaignId) => {
    setUploading(true);

    const normalized = files.map((f, i) => {
      return {
        id: i,
        campaignId: campaign.id,
        name: f.serverName,
        uri: f.uri,
        mimeType: f.mimeType || f.mime || "application/octet-stream",
        size: f.size || 0,
        progress: 0,
        status: "ready", // ready | uploading | done | error
      };
    }).filter(f =>
      (edit)
        ? !allCampaigns.docs.find(c => c.id === campaignId)
          .campaignInfo.documents.find(d => d.name === f.name)
        : true
    );

    setUploadProgress(normalized);

    let results = [];
    for (let i = 0; i < normalized.length; i++) {
      const file = normalized[i];

      if (file.status === "done") continue;

      // Upload the file
      const result = await uploadSingleFile(file, i, normalized);
      results.push(result);

      // Wait 1 second before moving to the next
      if (i < normalized.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await CampaignAPI(campaign, edit, campaignId);
    setUploading(false);
  };


  const UpdateCampaign = async (campaign) => {
    setIsLoadingCamapigns(true)
    //console.log("file upload results", results)
    const campaignUpdated = await CampaignAPI(campaign, true, null)
    const allCamp = { ...allCampaigns }
    allCamp.docs.forEach(c => {
      if (c.id == campaignUpdated.id)
        c = campaignUpdated
    });

    setCampaigns(allCamp)
    setIsLoadingCamapigns(false)
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

  
const uploadSingleFile = async (file, i, normalized) => {
  try {
    // Mark as uploading
    setUploadProgress((prev) =>
      prev.map((p) =>
        p.id === file.id ? { ...p, status: "uploading", progress: 0 } : p
      )
    );

    // Prepare file stream
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Generate a unique key for the file in R2
    const objectKey = `${file.campaignId}/${Date.now()}-${file.name}`;

    // Upload to R2
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectKey,
        Body: blob,
        ContentType: file.mimeType || "application/octet-stream",
      })
    );

    // Mark as done
    setUploadProgress((prev) =>
      prev.map((p) =>
        p.id === file.id
          ? { ...p, progress: 1, status: "done", remoteKey: objectKey }
          : p
      )
    );

    return { success: true, key: objectKey };
  } catch (err) {
    console.error("Upload error", err);
    setUploadProgress((prev) =>
      prev.map((p) =>
        p.id === file.id ? { ...p, status: "error" } : p
      )
    );
    return { success: false, error: err };
  }
};

  // Check for existing session on app start
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const userLastLogin = await AsyncStorage.getItem('lastLogin');
        if (userData) {
          if (parseInt(userLastLogin) + (1000 * 60 * 60 * 24 * 7) < Date.now()) {
            alert('Connexion expiré', 'veillez vous reconnecter à votre compte')
            return
          }
          let userJSON = JSON.parse(userData);
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

      try {
        const allUsersResponse = await GetAllusersAPI();
        setAllUsers(allUsersResponse)
        await loadCampaigns();
      } catch (error) {
        alert("Une érreur est survenue lors de la connexion avec le serveur, veillez vérifier votre connexion internet")
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


  const updateUserInfo = async (credentials) => {
    try {
      console.log("FCM  saving in server:");
      // Replace with your actual API call
      const response = await UserUpdateAPI({ email: user.email, updates: credentials })
      if (response.error) {
        throw response;
      }
      setUser(response);
      console.log("FCM  saved in server:");
      await AsyncStorage.setItem('user', JSON.stringify(response));
      await AsyncStorage.setItem('lastLogin', Date.now().toString());
      return response;
    } catch (error) {
      throw error;
    }
  };

  const sendNotification = async (receivers, topic, title = '', body = "", data = {}, sender = { email: 'Kolabo' }) => {
    if ((!receivers || receivers.length === 0) && !topic) return false

    const _data = {
      receivers,
      topic,
      title,
      body,
      data,
      sender
    }
    const resp = await NotificationApi(_data)

    if (!resp || resp.error) {
      return resp
    }
    return resp
  }

  const subscribeNotification = async (tokens, topic) => {
    if ((!tokens || tokens.length === 0) && !topic) return false

    const _data = {
      tokens,
      topic
    }
    const resp = await SubscribeTokenToChannelAPI(_data)

    if (!resp || resp.error) {
      return resp
    }
    return resp
  }

  const reloadUser = async () => {
    try {
      // Replace with your actual API call
      if (!user || Object.keys(user).length == 0) return null
      const response = await AuthAPI(user, true);
      if (response.error) {
        throw response;
      }
      setUser(response);
      await AsyncStorage.setItem('user', JSON.stringify(response));
      await AsyncStorage.setItem('lastLogin', Date.now().toString());
      return response;
    } catch (error) {
      console.log("error reloading user", error)
      return null;
    }
  };

  const logout = async () => {
    setIsLoading(true)
    await AsyncStorage.removeItem('user');
    setUser(null);
    setIsLoading(false)

  };

  ///  Tiktok ////
  const fetchTiktokVideos = async () => {
    if (user?.tiktokToken) {
      try {
        setIsLoadingVideos(true)
        const resp = await fetch('https://campay-api.vercel.app/api/refresh_token?email=' + user.email + '&refresh_token=' + user?.tiktokToken.refresh_token)
        await reloadUser()

        const createResponse = await fetch('https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,embed_link,view_count,like_count,comment_count,share_count,create_time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + user?.tiktokToken.access_token
          },
          body: JSON.stringify({
            "max_count": 15
          })
        });
        const response = await createResponse.json()
        return response.data.videos;
      } catch (error) {

      } finally {
        setIsLoadingVideos(false)
      }

    } else
      return false;
  }

  return (
    <AuthContext.Provider value={{
      baseUrl,
      user,
      uploadProgress,
      uploading,
      tabSelection,
      setTabSelection,
      CreateCampaign,
      UpdateCampaign,
      DeleteCampaign,
      loadCampaigns,
      allCampaigns,
      isLoading,
      allUsers,
      login,
      logout,
      updateUserInfo,
      reloadUser,
      fetchTiktokVideos,
      isLoadingVideos,
      isLoadingCampaigns,
      sendNotification,
      AddToasts,
      subscribeNotification
    }}>
      {children}
      {showToast && (
        <Toast
          title={toast.title}
          body={toast.body}
          duration={toast.duration}
          buttons={toast.buttons}
          onClose={toast.onClose}
        />
      )}
    </AuthContext.Provider>
  );
};

const GetAllusersAPI = async () => {
  const user_response = await fetch(`${UserUrl}?email=@all`, {
    headers: {
      "skip_zrok_interstitial": "true"
    }
  });

  if (user_response.status === 404) {
    return { docs: [], size: 0 }
  } else {
    const newUser = await user_response.json();
    return newUser
  }
}

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

    if (user_response.status === 404) {

      if (!login) {
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
      } else {
        return { error: true, message: "l'adresse mail ne correspond pas, si vous n'avez pas de compte, créez en un" }
      }
    } else {
      if (login) {
        // Mettre à jour le joueur existant
        const newUser = await user_response.json();
        if (newUser.password !== user.password) {
          return { error: true, message: "le mot de passe ne correspond pas" }
        }
        return newUser;
      } else {
        return { error: true, message: "Ce compte existe déjà, connectez vous plutôt" }
      }
    }
  } catch (error) {
    console.error('Error initializing player:', error);
  }
};



// Fake authentication for development
const NotificationApi = async (data) => {
  try {
    // Créer un nouveau joueur
    const createResponse = await fetch(NotificationUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data
      })
    });

    return await createResponse.json();
  } catch (error) {
    console.error('Error initializing player:', error);
    return null
  }
};


// Fake authentication for development
const SubscribeTokenToChannelAPI = async (data) => {
  try {
    // Créer un nouveau joueur
    const createResponse = await fetch(ChannelUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data
      })
    });

    return await createResponse.json();
  } catch (error) {
    console.error('Error initializing player:', error);
    return null
  }
};

// Fake authentication for development
const UserUpdateAPI = async (_user) => {
  try {
    // Créer un nouveau joueur
    const createResponse = await fetch(UserUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ..._user
      })
    });

    return await createResponse.json();
  } catch (error) {
    console.error('Error initializing player:', error);
    return null
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

      console.log(createResponse.body, await createResponse.text(), createResponse)

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
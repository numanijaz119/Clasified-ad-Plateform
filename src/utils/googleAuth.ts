// src/utils/googleAuth.ts

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Load Google OAuth script
export const loadGoogleOAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google OAuth script"));
    document.head.appendChild(script);
  });
};

// Initialize Google OAuth
export const initializeGoogleAuth = async (
  onGoogleLogin: (tokenData: { id_token: string }) => Promise<void>
): Promise<void> => {
  try {
    await loadGoogleOAuth();

    if (!GOOGLE_CLIENT_ID) {
      throw new Error("Google Client ID not configured");
    }

    // Simple initialization without One Tap to avoid policy issues
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => handleGoogleCallback(response, onGoogleLogin),
      ux_mode: "popup", // Use popup mode for better compatibility
      auto_select: false,
    });
  } catch (error) {
    console.error("Error initializing Google Auth:", error);
    throw error;
  }
};

// Handle Google OAuth callback
const handleGoogleCallback = async (
  response: any,
  onGoogleLogin: (tokenData: { id_token: string }) => Promise<void>
) => {
  try {
    if (response.credential) {
      await onGoogleLogin({
        id_token: response.credential,
      });
    } else {
      throw new Error("No credential received from Google");
    }
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

// Trigger Google Sign-In - Direct popup approach
export const signInWithGoogle = (
  onGoogleLogin: (tokenData: { id_token: string }) => Promise<void>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error("Google OAuth not loaded"));
      return;
    }

    try {
      // Use direct popup method - more reliable and policy-compliant
      showGooglePopup(resolve, reject, onGoogleLogin);
    } catch (error) {
      console.error("Google sign-in error:", error);
      reject(error);
    }
  });
};

// Fallback popup method
const showGooglePopup = (
  resolve: Function,
  reject: Function,
  onGoogleLogin: (tokenData: { id_token: string }) => Promise<void>
) => {
  try {
    const popupCallback = async (response: any) => {
      try {
        if (response.credential) {
          await onGoogleLogin({
            id_token: response.credential, // Correctly sending id_token
          });
          resolve();
        } else {
          reject(new Error("No credential received from Google"));
        }
      } catch (error) {
        reject(error);
      }
    };

    // Create temporary button for popup
    const buttonContainer = document.createElement("div");
    buttonContainer.style.position = "absolute";
    buttonContainer.style.top = "-9999px";
    document.body.appendChild(buttonContainer);

    window.google.accounts.id.renderButton(buttonContainer, {
      theme: "outline",
      size: "large",
      type: "standard",
      text: "signin_with",
      callback: popupCallback,
    });

    // Auto-click to trigger popup
    const button = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
    if (button) {
      setTimeout(() => {
        button.click();
        setTimeout(() => {
          document.body.removeChild(buttonContainer);
        }, 1000);
      }, 100);
    } else {
      document.body.removeChild(buttonContainer);
      reject(new Error("Failed to create Google sign-in button"));
    }
  } catch (error) {
    reject(error);
  }
};

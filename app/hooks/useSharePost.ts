import { useState } from "react";
import { Share, Platform, Linking } from "react-native";
import { showAlert } from "../utils/customAlert";

export interface PostShareData {
  title: string;
  body: string;
}

export const useSharePost = () => {
  const [isSharing, setIsSharing] = useState(false);

  const APP_LINK = "https://yourapp.com/download";
  const PROMO_BANNER_IMAGE = "https://via.placeholder.com/150x150.png"; // Replace with your actual banner URL

  const shareToFacebook = async (data: PostShareData) => {
    try {
      // Don't pass title if it's empty or "EMPTY"
      const title =
        data.title && !["EMPTY", "Empty", "empty"].includes(data.title.trim())
          ? data.title
          : "Confession";
      const content = data.body;
      const message = `${title}\n\n${content}\n\n🔗 Check out our app: ${APP_LINK}`;

      // Try Facebook app URL scheme first
      const facebookAppUrl = `fb://sharer?u=${encodeURIComponent(APP_LINK)}&quote=${encodeURIComponent(message)}`;
      console.log("Facebook app URL:", facebookAppUrl);

      try {
        await Linking.openURL(facebookAppUrl);
      } catch (appError) {
        // If Facebook app is not installed, fall back to web URL
        console.log("Facebook app not installed, using web URL");
        const facebookWebUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_LINK)}&quote=${encodeURIComponent(message)}`;
        await Linking.openURL(facebookWebUrl);
      }
    } catch (error) {
      console.error("Facebook share error:", error);
      showAlert("Share Error", "Failed to share to Facebook");
    }
  };

  const shareToInstagram = async (data: PostShareData) => {
    try {
      // Don't pass title if it's empty or "EMPTY"
      const title =
        data.title && !["EMPTY", "Empty", "empty"].includes(data.title.trim())
          ? data.title
          : "Confession";
      await Share.share({
        message: `${title}\n\n${data.body}\n\n🔗 Check out our app: ${APP_LINK}`,
        title: title,
      });
    } catch (error) {
      console.error("Instagram share error:", error);
      showAlert("Share Error", "Failed to share to Instagram");
    }
  };

  const shareToWhatsApp = async (data: PostShareData) => {
    try {
      // Don't pass title if it's empty or "EMPTY"
      const title =
        data.title && !["EMPTY", "Empty", "empty"].includes(data.title.trim())
          ? data.title
          : "Confession";
      const message = `${title}\n\n${data.body}\n\n🔗 Check out our app: ${APP_LINK}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      await Linking.openURL(whatsappUrl);
    } catch (error) {
      console.error("WhatsApp share error:", error);
      showAlert("Share Error", "Failed to share to WhatsApp");
    }
  };

  const shareGeneric = async (data: PostShareData) => {
    try {
      const shareOptions = {
        message: `${data.title}\n\n${data.body}\n\n🔗 Check out our app: ${APP_LINK}`,
        url: APP_LINK,
        title: data.title,
      };

      if (Platform.OS === "ios") {
        // iOS: Show share sheet
        await Share.share(shareOptions);
      } else {
        // Android: Show intent chooser
        await Share.share(shareOptions);
      }
    } catch (error) {
      console.error("Generic share error:", error);
      showAlert("Share Error", "Failed to share post");
    }
  };

  const sharePost = async (
    data: PostShareData,
    platform?: "facebook" | "instagram" | "whatsapp" | "generic",
  ) => {
    setIsSharing(true);

    try {
      switch (platform) {
        case "facebook":
          await shareToFacebook(data);
          break;
        case "instagram":
          await shareToInstagram(data);
          break;
        case "whatsapp":
          await shareToWhatsApp(data);
          break;
        default:
          await shareGeneric(data);
          break;
      }
    } catch (error) {
      console.error("Share error:", error);
      showAlert("Share Error", "Failed to share post");
    } finally {
      setIsSharing(false);
    }
  };

  return {
    sharePost,
    shareToFacebook,
    shareToInstagram,
    shareToWhatsApp,
    shareGeneric,
    isSharing,
  };
};

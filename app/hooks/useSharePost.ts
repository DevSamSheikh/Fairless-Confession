import { useState } from "react";
import { Share, Platform } from "react-native";
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
      await Share.share({
        message: `${data.title}\n\n${data.body}\n\n🔗 Check out our app: ${APP_LINK}`,
        url: undefined, // Facebook doesn't support URL with message
        title: data.title,
      });
    } catch (error) {
      console.error("Facebook share error:", error);
      showAlert("Share Error", "Failed to share to Facebook");
    }
  };

  const shareToInstagram = async (data: PostShareData) => {
    try {
      await Share.share({
        message: `${data.title}\n\n${data.body}\n\n🔗 Check out our app: ${APP_LINK}`,
        url: undefined, // Instagram doesn't support URL
        title: data.title,
      });
    } catch (error) {
      console.error("Instagram share error:", error);
      showAlert("Share Error", "Failed to share to Instagram");
    }
  };

  const shareToWhatsApp = async (data: PostShareData) => {
    try {
      await Share.share({
        message: `${data.title}\n\n${data.body}\n\n🔗 Check out our app: ${APP_LINK}`,
        url: `whatsapp://send?text=${encodeURIComponent(`${data.title}\n\n${data.body}\n\n🔗 Check out our app: ${APP_LINK}`)}`, // WhatsApp deep link
        title: data.title,
      });
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

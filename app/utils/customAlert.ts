interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

type AlertListener = (config: AlertConfig) => void;
type HideListener = () => void;

class CustomAlertManager {
  private showListeners: AlertListener[] = [];
  private hideListeners: HideListener[] = [];

  on(event: 'show', listener: AlertListener): void;
  on(event: 'hide', listener: HideListener): void;
  on(event: string, listener: any): void {
    if (event === 'show') {
      this.showListeners.push(listener);
    } else if (event === 'hide') {
      this.hideListeners.push(listener);
    }
  }

  off(event: 'show', listener: AlertListener): void;
  off(event: 'hide', listener: HideListener): void;
  off(event: string, listener: any): void {
    if (event === 'show') {
      this.showListeners = this.showListeners.filter(l => l !== listener);
    } else if (event === 'hide') {
      this.hideListeners = this.hideListeners.filter(l => l !== listener);
    }
  }

  show(title: string, message?: string, buttons?: AlertButton[]) {
    const config: AlertConfig = {
      title,
      message,
      buttons: buttons || [{ text: 'OK', style: 'default' }],
    };
    this.showListeners.forEach(listener => listener(config));
  }

  hide() {
    this.hideListeners.forEach(listener => listener());
  }
}

export const customAlertManager = new CustomAlertManager();

// Drop-in replacement for Alert.alert
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  customAlertManager.show(title, message, buttons);
};

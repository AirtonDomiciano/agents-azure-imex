export type DesktopNotification = {
  title: string;
  message: string;
};

export class DesktopNotifier {
  async notify(_notification: DesktopNotification): Promise<void> {
    // V2: integrar com notify-send no Debian.
  }
}

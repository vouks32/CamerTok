import { useEffect, useState } from "react";
import { Platform } from "react-native";

//const localStorage = null /// EXPO TESTS


export default function usePWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [installationCompleted, setInstallationCompleted] = useState(window.localStorage?.getItem("wasInstalled") === "true");

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        const saveInstallState = () => {
            console.log("PWA was installed 🎉");
            window.localStorage?.setItem("wasInstalled", "true"); // persist for future 
            setInstallationCompleted(true)
        }

        let standalone = false
        if (window?.addEventListener) {
            window?.addEventListener("beforeinstallprompt", handler);

            window?.addEventListener("appinstalled", saveInstallState);
            return () => {
                window?.removeEventListener("beforeinstallprompt", handler);
                window?.removeEventListener("appinstalled", saveInstallState);
            }
        }
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return false;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setIsInstallable(false);
        return outcome === "accepted";
    };

    const wasInstalled = () => {
        let standalone = false
        if (window?.matchMedia)
            standalone =
                window?.matchMedia("(display-mode: standalone)").matches ||
                window?.navigator.standalone === true;

        const wasInstall = window.localStorage?.getItem("wasInstalled") === "true";

        return standalone || wasInstall
    };

    const isStandalone = () => {
        let standalone = false
        if (window?.matchMedia)
            standalone =
                window?.matchMedia("(display-mode: standalone)").matches ||
                window?.navigator.standalone === true;

        return standalone
    };

    return { isInstallable, promptInstall, wasInstalled, isStandalone, installationCompleted };
}

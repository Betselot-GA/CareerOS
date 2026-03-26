import { useEffect, useRef } from "react";
import { Alert } from "react-bootstrap";

type GoogleAuthButtonProps = {
  onCredential: (idToken: string) => void;
  onError: (message: string) => void;
  text?: "continue_with" | "signup_with" | "signin_with" | "signin";
};

function GoogleAuthButton({ onCredential, onError, text = "continue_with" }: GoogleAuthButtonProps) {
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (!response.credential) {
            onError("Google login did not return a token");
            return;
          }
          onCredential(response.credential);
        }
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 360,
        text
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", renderGoogleButton);
      return () => existingScript.removeEventListener("load", renderGoogleButton);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [googleClientId, onCredential, onError, text]);

  if (!googleClientId) {
    return (
      <Alert variant="warning" className="mb-0">
        Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>apps/web/.env</code> to enable Google popup login.
      </Alert>
    );
  }

  return (
    <div className="google-btn-wrap">
      <div ref={googleButtonRef} />
    </div>
  );
}

export default GoogleAuthButton;

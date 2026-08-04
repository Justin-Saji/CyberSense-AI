import React, { useRef, useState, useEffect } from 'react';
import { GoogleLogin, useGoogleOAuth } from '@react-oauth/google';

const GoogleSignInButtonContent = ({
  onSuccess,
  onError,
  text,
  theme,
  shape,
}) => {
  const containerRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(320);
  const { scriptLoadedSuccessfully } = useGoogleOAuth();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const width = el.offsetWidth;
      if (width > 0) {
        setButtonWidth(Math.min(Math.max(width, 200), 400));
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center min-h-[44px]">
      {scriptLoadedSuccessfully ? (
        <GoogleLogin
          key={buttonWidth}
          onSuccess={onSuccess}
          onError={onError}
          useOneTap={false}
          theme={theme}
          shape={shape}
          text={text}
          width={buttonWidth}
        />
      ) : (
        <div
          className="w-full max-w-[400px] h-10 rounded-full bg-slate-800 animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

/**
 * Google Sign-In button with responsive pixel width (GSI requires 200–400px, not "%").
 */
export const GoogleSignInButton = ({
  onSuccess,
  onError,
  text = 'continue_with',
  theme = 'filled_black',
  shape = 'pill',
}) => {
  const configuredClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';

  if (!configuredClientId) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[400px] rounded-full border border-slate-700 bg-slate-800/70 px-4 py-2 text-center text-sm text-slate-300">
          Google sign-in is currently unavailable.
        </div>
      </div>
    );
  }

  return (
    <GoogleSignInButtonContent
      onSuccess={onSuccess}
      onError={onError}
      text={text}
      theme={theme}
      shape={shape}
    />
  );
};

export default GoogleSignInButton;

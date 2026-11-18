// src/context/authStorage.js
// Where the signed-in user (and their login token) is kept in the browser.
//
// - "Keep me signed in" ticked  -> localStorage: survives closing the app/browser.
// - Not ticked (e.g. a shared hospital computer) -> sessionStorage: gone when the tab closes.
// An expired token is dropped on load, so nobody sees a signed-in screen that the server will refuse.

const KEY = 'hyperlink_user';

const attempt = (fn, fallback = null) => {
  try {
    return fn();
  } catch {
    return fallback; // storage blocked (private mode, full, disabled)
  }
};

// Reads the "exp" time (seconds) from a JWT without needing its secret.
export const tokenExpired = (token) => {
  if (!token) return false; // nothing to judge; the server will answer 401 if needed
  return attempt(() => {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(part));
    return typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now();
  }, false);
};

export const clearUser = () => {
  attempt(() => localStorage.removeItem(KEY));
  attempt(() => sessionStorage.removeItem(KEY));
};

export const readUser = () => {
  const raw = attempt(() => localStorage.getItem(KEY)) || attempt(() => sessionStorage.getItem(KEY));
  if (!raw) return null;
  const user = attempt(() => JSON.parse(raw));
  if (!user || tokenExpired(user.token)) {
    clearUser();
    return null;
  }
  return user;
};

// remember: true = localStorage, false = sessionStorage, undefined = keep wherever the
// user already is (so updating a profile never changes how they chose to stay signed in).
export const writeUser = (user, remember) => {
  const inSessionOnly = attempt(
    () => !!sessionStorage.getItem(KEY) && !localStorage.getItem(KEY),
    false
  );
  const useLocal = remember === undefined ? !inSessionOnly : !!remember;
  const text = JSON.stringify(user);
  clearUser();
  const stored = attempt(() => {
    (useLocal ? localStorage : sessionStorage).setItem(KEY, text);
    return true;
  }, false);
  if (!stored) {
    // chosen storage unavailable: fall back to the other so login still works
    attempt(() => (useLocal ? sessionStorage : localStorage).setItem(KEY, text));
  }
};

import { readable } from "svelte/store";

// Helper to get current location state
function getLocation() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    full: window.location.href,
  };
}

// The main store object
function createSlocation() {
  const { subscribe } = readable(getLocation(), (set) => {
    const update = () => set(getLocation());

    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);

    // Monkey-patch pushState/replaceState to notify store
    const { pushState, replaceState } = window.history;
    window.history.pushState = function (...args) {
      pushState.apply(this, args);
      update();
    };
    window.history.replaceState = function (...args) {
      replaceState.apply(this, args);
      update();
    };

    // Initial update
    update();

    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
      window.history.pushState = pushState;
      window.history.replaceState = replaceState;
    };
  });

  // SPA navigation helper
  function goto(path: string, { replace = false } = {}) {
    if (replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }
    // Dispatch popstate to trigger subscribers
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return { subscribe, goto };
}

export const slocation = createSlocation();

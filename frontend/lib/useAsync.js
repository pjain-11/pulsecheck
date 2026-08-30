"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs an async `loader` on mount (and whenever `key` changes) and
 * exposes { loading, error, data, reload, setData }.
 *
 * State is only updated from the promise callbacks, never synchronously
 * inside the effect body.
 */
export function useAsync(loader, key) {
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
    key,
    nonce: 0,
  });

  // React pattern: adjust state during render when an input changes.
  if (state.key !== key) {
    setState((s) => ({
      loading: true,
      error: null,
      data: null,
      key,
      nonce: s.nonce + 1,
    }));
  }

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null, nonce: s.nonce + 1 }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    loaderRef
      .current()
      .then((data) => {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: null, data }));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: err && err.message ? err.message : "Failed to load data.",
            data: null,
          }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [state.nonce]);

  const setData = useCallback((updater) => {
    setState((s) => ({
      ...s,
      data: typeof updater === "function" ? updater(s.data) : updater,
    }));
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    data: state.data,
    reload,
    setData,
  };
}

"use client";

import { useEffect, useState } from "react";

interface FetchState<T> {
  url: string | null;
  data: T | null;
  error: string | null;
}

// Small JSON fetch hook. `loading` and the freshness of `data`/`error` are
// *derived* from whether the stored result matches the current `url`, so the
// effect never calls setState synchronously (avoids cascading renders and the
// react-hooks/set-state-in-effect rule) while still showing a skeleton on every
// param change. Pass `null` to skip fetching. Aborts stale responses.
export function useFetch<T>(
  url: string | null,
  errorMessage = "데이터를 불러오지 못했습니다.",
): { data: T | null; error: string | null; loading: boolean } {
  const [state, setState] = useState<FetchState<T>>({
    url: null,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!url) return;
    let active = true;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(errorMessage);
        return r.json();
      })
      .then((d: T) => active && setState({ url, data: d, error: null }))
      .catch(
        (e: Error) => active && setState({ url, data: null, error: e.message }),
      );
    return () => {
      active = false;
    };
  }, [url, errorMessage]);

  const fresh = state.url === url;
  return {
    data: fresh ? state.data : null,
    error: fresh ? state.error : null,
    loading: url != null && !fresh,
  };
}

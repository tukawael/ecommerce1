import { QueryClient, QueryFunction, QueryKey } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error('API Request Error:', {
      status: res.status,
      statusText: res.statusText,
      responseText: text
    });
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body } = options;
  
  // Ensure URL has the /api prefix
  const apiUrl = url.startsWith('/api') ? url : `/api${url}`;
  
  const requestHeaders: Record<string, string> = {
    ...headers,
    ...(body ? { "Content-Type": "application/json" } : {})
  };

  const res = await fetch(apiUrl, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // For HEAD or DELETE requests that don't return content
  if (method === 'HEAD' || (method === 'DELETE' && res.status === 204)) {
    return {} as T;
  }
  
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";

// Fix the QueryFunction type to match what QueryClient expects
function createQueryFn<T>(options: { on401: UnauthorizedBehavior }): QueryFunction<T, QueryKey> {
  return async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const apiUrl = url.startsWith('/api') ? url : `/api${url}`;
    
    const res = await fetch(apiUrl, {
      credentials: "include",
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      return null as T;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: createQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

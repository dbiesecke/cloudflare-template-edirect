import { HeaderChanges, patchHeaders, patchRequest } from '../common/patch';
import { FetchEvent, ServeFunction } from '../types';

export type GetEndpoint = (req?: Request) => URL;

export interface ProxyOptions {
  host?: 'original' | 'xforwarded';
}

const DEFAULT_OPTIONS: ProxyOptions = {
  host: 'xforwarded'
};

export function proxy(
  picker: GetEndpoint,
  options?: ProxyOptions
): ServeFunction {
  return async function serve(event: FetchEvent): Promise<Response> {
    const request = event.request;

    // Fallback to default options if none provided
    const opts: ProxyOptions = {
      ...DEFAULT_OPTIONS,
      ...(options || {})
    };

    // Copy of the original URL
    const original = new URL(request.url);

    // Find which endpoint to use
    const endpoint = picker(request);

    // Modify request
    const upstreamRequest = requestToUpstream(request, endpoint, opts);

    // Make request
    console.log('upstreamRequest:', upstreamRequest.url);
    console.log([...upstreamRequest.headers.entries()]);
    console.log();
    const response = await fetch(upstreamRequest, {
      redirect: 'manual',
      cf: {
        resolveOverride: opts.host === 'original' ? endpoint.hostname : undefined
      }
    } as any);

    // Return response \o/
    return response;
  };
}

// requestToUpstream rewrites a Request to route it to the upstream
export function requestToUpstream(
  request: Request,
  upstream: URL,
  opts: ProxyOptions
): Request {
  // Parse Request's URL
  const original = new URL(request.url); // Copy of original info
  const url = new URL(request.url); // Copy we'll modify

  // Modify request (to route to upstream)
  url.pathname = `${upstream.pathname}/${original.pathname}`;
  url.hostname =
    opts.host === 'original' ? original.hostname : upstream.hostname;
  url.protocol = upstream.protocol;

  const customHeaders: HeaderChanges =
    opts.host === 'xforwarded'
      ? {
        'X-Forwarded-Host': original.hostname,
        'X-Forwarded-Proto': original.protocol
      }
      : {
        Host: original.hostname
      };

  // Copy old headers
  const headers = patchHeaders(request.headers, customHeaders);

  return patchRequest(request, {
    url: url.toString(),
    headers
  });
}
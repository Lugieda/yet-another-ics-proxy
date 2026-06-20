import { IncomingMessage, ServerResponse } from "node:http";
import { icsTranslator } from "./ics-translator";
import { Environment } from "./environment";

const ALLOWED_HOSTS = Environment.ALLOWED_HOSTS;
const ENABLE_HTTP = Environment.ENABLE_HTTP;

export async function requestHandler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  console.log(`Request Recieved: ${req.url}`);
  const reqUrl = new URL(req.url ?? "", `http://${req.headers.host}`);

  switch (reqUrl.pathname) {
    case "/":
      return handleProxyRequest(res, reqUrl.searchParams);
    case "/status":
      return handleStatusRequest(res);
    default:
      return handleNotFoundException(res);
  }
}

async function handleProxyRequest(
  res: ServerResponse,
  search: URLSearchParams,
) {
  const targetUri = search.get("uri");

  if (!targetUri) {
    return handleBadRequestException(res);
  }

  try {
    // 1. Sanitize the target URI
    const url = new URL(targetUri);

    const hostname = url.hostname.toLowerCase();
    const isHttpAllowed = ENABLE_HTTP && url.protocol === "http:";
    const isHttpsAllowed = url.protocol === "https:";
    const isHostAllowed = ALLOWED_HOSTS.includes(hostname);

    if (!(isHttpAllowed || isHttpsAllowed) || !isHostAllowed) {
      console.log(`Forbidden URL: ${url}`);
      console.dir({
        isHttpAllowed,
        isHttpsAllowed,
        isHostAllowed,
        ENABLE_HTTP,
        ALLOWED_HOSTS,
      });
      return handleForbiddenException(res);
    }

    // 2. Fetch the ICS file from the target URI
    console.log("Fetching URL:", url.toString());
    const response = await fetch(url);

    if (!response.ok) {
      const msg = `Upstream server responded with: ${response.status} ${response.statusText}`;
      console.log(msg);
      return handleInternalServerErrorException(res);
    }

    // 3. Process and translate the file
    const ics = icsTranslator(await response.text());

    // 4. Return the translated ICS file to the caller
    res.writeHead(200, {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="calendar.ics"',
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    });

    res.end(ics);
  } catch (error) {
    console.trace("Error processing ICS URI:", error);
    console.error("Failed to process ICS URI:", error);
    return handleInternalServerErrorException(res);
  }
}

function handleStatusRequest(res: ServerResponse) {
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  });
  res.end("yet-another-ics-proxy is running");
}

function handleNotFoundException(res: ServerResponse) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
}

function handleBadRequestException(res: ServerResponse) {
  res.writeHead(400, { "Content-Type": "text/plain" });
  res.end("Bad Request");
}

function handleInternalServerErrorException(res: ServerResponse) {
  res.writeHead(500, { "Content-Type": "text/plain" });
  res.end("Internal Server Error");
}

function handleForbiddenException(res: ServerResponse) {
  res.writeHead(403, { "Content-Type": "text/plain" });
  res.end("Forbidden");
}

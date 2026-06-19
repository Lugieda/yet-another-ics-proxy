import { IncomingMessage, ServerResponse } from "node:http";
import { icsTranslator } from "./ics-translator";

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
    // 1. Fetch the remote ICS file
    const url = new URL(targetUri);
    const response = await fetch(url);

    if (!response.ok) {
      const msg = `Upstream server responded with: ${response.status} ${response.statusText}`;
      console.log(msg);
      return handleInternalServerErrorException(res);
    }

    // 2. Process and translate the file
    const ics = icsTranslator(await response.text());

    // 3. Return the translated ICS file to the caller
    res.writeHead(200, {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="calendar.ics"',
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    });

    res.end(ics);
  } catch (error) {
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

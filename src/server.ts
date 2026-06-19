import http from 'http';

const PORT: string | number = process.env.PORT ?? 3000;

const requestHandler = (req: http.IncomingMessage, res: http.ServerResponse): void => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('yet-another-ics-proxy is running');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
};

const server = http.createServer(requestHandler);
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

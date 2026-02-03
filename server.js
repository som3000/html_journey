const decoder = new TextDecoder();
const encoder = new TextEncoder();

const home = Deno.readTextFileSync("./home.html");
const interns = Deno.readTextFileSync("./interns.html");
const page1 = Deno.readTextFileSync("./page1.html");
const aboutSom = Deno.readTextFileSync("./som.html");
// const myJson = {}

const createSuccessResponse = (content) => {
  return {
    responseLine: "HTTP/1.1 200 OK",
    headers: {
      "Content-Type": "text/html",
      "Content-Length": content.length,
    },
    body: content,
  };
};

const createHeaders = (headers) => {
  return Object.entries(headers)
    .map(([name, value]) => `${name}: ${value}`)
    .join("\r\n");
};

const formateResponse = (response) => {
  const fullResponse = [
    response.responseLine,
    createHeaders(response.headers),
    "",
    response.body,
  ].join("\r\n");
  return fullResponse;
};

const pathContent = (resourcePath) => {
  switch (resourcePath) {
    case "/":
      return home;

    case "/interns.html":
      return interns;

    case "/page1.html":
      return page1;

    case "/som.html":
      return aboutSom;
    default:
      return home;
  }
};

const connReader = async (conn) => {
  const buffer = new Uint8Array(1024);
  const bytesRead = await conn.read(buffer);
  if (bytesRead === null) {
    console.log("Connection Lost");
    conn.close();
  }
  
  const request = decoder.decode(buffer.slice(0, bytesRead));
  return request;
}

const requestHandler = (request, ) =>{

}

async function handleConn(conn) {
  const request = await connReader(conn);
  const [requestLine] = request.split("\r\n");
  const [method, resourcePath, protocol] = requestLine.split(" ");
  // console.log({ method, resourcePath, protocol });

  const requestedContents = pathContent(resourcePath);
  const response = createSuccessResponse(requestedContents);
  const formatted = formateResponse(response);
  await conn.write(encoder.encode(formatted));
  await conn.close();
}

export const serve = async (port) => {
  const listener = await Deno.listen({
    hostname: "localhost",
    transport: "tcp",
    port: port,
  });

  console.log("listening on http://localhost:" + port);

  for await (const conn of listener) {
    handleConn(conn);
  }
};

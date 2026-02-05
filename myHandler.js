import { log } from "node:console";

export const getPathContents = (path, readFn) => {
  const htmlPATHS = {
    "/": "./pages/home.html",
    "/home": "./pages/home.html",
    "/interns": "./pages/interns.html",
    "/page1": "./pages/page1.html",
    "/som": "./pages/som.html",
  };
  const jsonPATHS = {
    "/names": "./pages/names.json",
  };

  if (path in htmlPATHS) {
    const pathContents = readFn(htmlPATHS[path]);
    return { pathContents, success: true, contentType: "text/html" };
  }

  if (path in jsonPATHS) {
    const pathContents = readFn(jsonPATHS[path]);
    return { pathContents, success: true, contentType: "application/json" };
  }
  const pathContents = readFn("./pages/not_Found.html");
  return { pathContents, success: false, contentType: "text/html" };
};

const updateResponse = (
  responseParams,
  content,
  successStatus,
  contentType,
) => {
  //  UPDATE RESPONSE HEADER
  responseParams.headers["Content-Type"] = contentType;
  responseParams.headers["Content-Length"] = content.length;

  responseParams.body = content;
  if (successStatus === false) {
    responseParams.statusCode = "404";
  }
};

const createResponseTemplate = () => {
  const responseParams = {
    statusCode: 200,
    headers: {},
    body: "",
  };
  return responseParams;
};

export const handleParsedRequest = (resourcePath, readFn) => {
  const responseParams = createResponseTemplate();
  const { pathContents, success, contentType } = getPathContents(
    resourcePath,
    readFn,
  );
  updateResponse(responseParams, pathContents, success, contentType);
  return responseParams;
};

export const parseRequest = (request) => {
  const url = new URL(request.url);
  const resourcePath = url.pathname;
  const method = request.method;
  const protocol = "HTTP/1.1";
  return { method, resourcePath, protocol };
};

export async function requestHandler(request, readFn) {
  
  if (request.method === "POST") {
    const body = await request.json();
    console.log({received : body});
    Deno.writeTextFileSync( "./pages/names.json", JSON.stringify(body))
    
    return new Response(JSON.stringify(body), {headers:{
      "Content-Type": "application/json"
    }});
  }
  console.log(request);
  const { resourcePath } = parseRequest(request);
  const { statusCode, headers, body } = handleParsedRequest(
    resourcePath,
    readFn,
  );
  const response = new Response(body, {
    status: statusCode,
    headers: headers,
  });
  console.log(response);
  return response;
}

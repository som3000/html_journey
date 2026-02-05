// import { serve } from "./server.js";

import { requestHandler } from "./myHandler.js";

const main = () => {
  const readFn = Deno.readTextFileSync;
  const myFn = (request) => requestHandler(request, readFn);
  Deno.serve(myFn);
};

main();

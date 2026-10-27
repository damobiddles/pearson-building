import type { Context } from "@netlify/edge-functions";

// Duda serves a separate HTML build to phones. Pages under /_mobile are that
// build; everything else (desktop and tablets) is served from the site root.
const MOBILE_UA = /Mobi|iPhone|iPod|Android.+Mobile|Windows Phone|BlackBerry|Opera Mini|IEMobile/i;
const TABLET_UA = /iPad|Tablet/i;

export default async (request: Request, context: Context) => {
  if (request.method !== "GET" && request.method !== "HEAD") return;

  const url = new URL(request.url);
  const ua = request.headers.get("user-agent") ?? "";
  const mobile = MOBILE_UA.test(ua) && !TABLET_UA.test(ua);
  const response = mobile
    ? await context.rewrite("/_mobile" + (url.pathname === "/" ? "/" : url.pathname))
    : await context.next();

  const out = new Response(response.body, response);
  out.headers.append("Vary", "User-Agent");
  return out;
};

export const config = {
  path: ["/", "/contact", "/phelps", "/project-videos", "/tanners-farm-house", "/castle-hill-new-build"],
};

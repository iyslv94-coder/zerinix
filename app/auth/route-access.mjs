export function getAuthRouteState(user) {
  return user ? "redirect_dashboard" : "show_auth";
}

export function getAuthRouteRedirectPath(pathname, user) {
  const authRoute = pathname === "/login" || pathname === "/register";

  if (!authRoute) {
    return null;
  }

  return getAuthRouteState(user) === "redirect_dashboard" ? "/dashboard" : null;
}

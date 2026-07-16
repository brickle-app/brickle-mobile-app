import { Href } from "expo-router";

type RouterWithFallback = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: Href) => void;
};

export function goBackOrReplace(router: RouterWithFallback, fallbackHref: Href) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}

let navigatedWithinApp = false;

export function markNavigatedWithinApp() {
  navigatedWithinApp = true;
}

export function hasNavigatedWithinApp() {
  return navigatedWithinApp;
}
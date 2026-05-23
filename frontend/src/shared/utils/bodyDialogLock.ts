let openOverlayCount = 0;
let previousBodyOverflow: string | null = null;

export function lockBodyForDialog() {
  if (openOverlayCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-dialog-open", "true");
  }

  openOverlayCount += 1;

  return () => {
    openOverlayCount = Math.max(0, openOverlayCount - 1);

    if (openOverlayCount === 0) {
      document.body.style.overflow = previousBodyOverflow ?? "";
      previousBodyOverflow = null;
      document.body.removeAttribute("data-dialog-open");
    }
  };
}

export function resetBodyDialogLockForTests() {
  openOverlayCount = 0;
  previousBodyOverflow = null;
}

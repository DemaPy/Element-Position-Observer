export function observeMove(
  element: HTMLElement,
  onMove: (rect: DOMRect) => void
) {
  const root = document.documentElement;

  let intersectionObserver: IntersectionObserver | null;

  function disconnect() {
    if (intersectionObserver) {
      intersectionObserver.disconnect();
    }
    intersectionObserver = null;
  }

  function refresh() {
    disconnect();

    const elementRect = element.getBoundingClientRect();

    onMove(elementRect);

    const rootMargin = [
      Math.floor(elementRect.top), // top offet up to element border top
      Math.floor(root.clientWidth - elementRect.right), // right offet up to element border right
      Math.floor(root.clientHeight - elementRect.bottom), // bottom offet up to element border bottom
      Math.floor(elementRect.left), // left offet up to element border left
    ]
      // Convert each computed value to negative one, because of rootMargin borders should be tight to element borders
      .map((value) => `${-Math.floor(value)}px`)
      .join(" ");

    // Initialize IntersectionObserver
    // In callback handler call refresh function only if
    // ratio < 1 -> element position relative to rootMargin is not eaqual 1.
    // call refresh smth like recursively.
    // disconnect from previous Intersection observer and 
    // make computation for new IntersectionObserver rootMargin.
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        const ratio = entry.intersectionRatio;

        if (ratio < 1) {
          refresh();
        }
      },
      {
        root: document,
        rootMargin,
        threshold: 1,
      }
    );

    intersectionObserver.observe(element);
  }

  refresh();

  return disconnect;
}

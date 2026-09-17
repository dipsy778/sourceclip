function removeNativeTooltips(root = document) {
  if (root instanceof Element && root.hasAttribute('title')) {
    root.removeAttribute('title')
  }

  root.querySelectorAll?.('[title]').forEach((element) => {
    element.removeAttribute('title')
  })
}

removeNativeTooltips()

const tooltipObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
      mutation.target.removeAttribute('title')
      continue
    }

    mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) removeNativeTooltips(node)
    })
  }
})

tooltipObserver.observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ['title'],
})

const allowedTags = new Set(['p', 'a', 'img', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'blockquote'])
const allowedAttrs = new Set(['href', 'src', 'alt', 'target', 'rel'])

const enforceLinkAttrs = (el: Element) => {
  if (el.tagName.toLowerCase() === 'a') {
    el.setAttribute('target', '_blank')
    el.setAttribute('rel', 'noopener noreferrer')
  }
}

export const sanitizeHtml = (html: string) => {
  if (!html) return ''

  if (process.server) {
    return html
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')

  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      const tag = el.tagName.toLowerCase()
      if (!allowedTags.has(tag)) {
        const fragment = document.createDocumentFragment()
        while (el.firstChild) {
          fragment.appendChild(el.firstChild)
        }
        el.replaceWith(fragment)
        return
      }

      Array.from(el.attributes).forEach(attr => {
        if (!allowedAttrs.has(attr.name)) {
          el.removeAttribute(attr.name)
        }
      })

      enforceLinkAttrs(el)
    }

    Array.from(node.childNodes).forEach(walk)
  }

  Array.from(doc.body.childNodes).forEach(walk)
  return doc.body.innerHTML
}

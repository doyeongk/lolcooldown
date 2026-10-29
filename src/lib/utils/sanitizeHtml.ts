/**
 * Allowlist-based HTML sanitiser for CDragon ability descriptions.
 * Keeps only safe formatting tags and drops every attribute.
 */

const ALLOWED_TAGS = new Set(['br', 'span', 'b', 'i', 'em', 'strong'])

/**
 * Sanitises HTML string by allowing only safe tags.
 * Returns plain text if DOMParser unavailable (SSR).
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // SSR fallback: plain text only. Escape after stripping so an unclosed
    // tag such as "<img onerror=..." can never reach innerHTML.
    return escapeHtml(html.replace(/<[^>]*>/g, ''))
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  function sanitizeNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent ?? '')
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()

      if (!ALLOWED_TAGS.has(tagName)) {
        // Recursively process children, skip the tag itself
        return Array.from(element.childNodes).map(sanitizeNode).join('')
      }

      // Build sanitised element (no attributes: CDragon descriptions don't use them,
      // and arbitrary classes could restyle the page with Tailwind utilities)
      const result = `<${tagName}>`

      // Self-closing tags
      if (tagName === 'br') {
        return result
      }

      // Process children
      return result + Array.from(element.childNodes).map(sanitizeNode).join('') + `</${tagName}>`
    }

    return ''
  }

  return Array.from(doc.body.childNodes).map(sanitizeNode).join('')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

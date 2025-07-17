export default function visibilityObserver(callback) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          callback()
        }
      }
    },
    { threshold: 0 },
  )

  // Observe the root element of the iframe's document
  observer.observe(document.body || document.documentElement)
}

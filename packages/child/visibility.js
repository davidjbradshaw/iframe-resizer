export default function visibilityObserver(callback) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        callback(entry.isIntersecting)
      }
    },
    {
      threshold: 0,
    },
  )

  const target = document.documentElement
  observer.observe(target)

  return () => observer.unobserve(target)
}

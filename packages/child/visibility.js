export default function visibilityObserver(callback) {
  const observer = new IntersectionObserver(
    (entries) => callback(entries[0].isIntersecting),
    {
      threshold: 0,
    },
  )

  const target = document.documentElement
  observer.observe(target)
}

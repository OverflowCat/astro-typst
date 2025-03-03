#let repeat = (n, f) => {
  for i in range(n) {
    f()
  }
}

#let render = () => [
  + 天地，无恙乎？
]

#repeat(10, render)

#html.frame[
  $ oo $
]

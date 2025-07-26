#let repeat = (n, f) => {
  for i in range(n) {
    f()
  }
}

#let render = () => [
  + Hello, typst!
]

#repeat(10, render)

#html.frame[
  $ oo $
]

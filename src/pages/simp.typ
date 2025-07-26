#set page(width: auto, height: auto, margin: 0.5em)

#let repeat = (n, f) => {
  for i in range(n) {
    f()
  }
}

#let render = () => [
  + Hello, typst!
]

#repeat(10, render)

#include "_included.typ"


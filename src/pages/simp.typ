#set page(width: auto, height: auto, margin: 0.5em)

#let repeat = (n, f) => {
  for i in range(n) {
    f()
  }
}

#let render = () => [
  + 天地，无恙乎？
]

#repeat(10, render)

$ oo $

#include "_included.typ"

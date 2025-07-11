#let t = {
  set text(
    size: 1.05em,
    font: "Buenard",
    weight: "bold",
    fill: rgb("#239dad"),
  )
  move(box(
    height: 1.1em,
    {
    text("t")
    text("y")
    h(0.035em)
    text("p")
    h(-0.025em)
    text("s")
    h(-0.015em)
    text("t")
  }))
}

#let typst = html.elem("span", attrs: ("style": "display: inline-block; transform: translateY(0.3em);"), html.frame(t))

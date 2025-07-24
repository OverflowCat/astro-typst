#let jsx = s => html.elem("script", attrs: ("data-jsx": s))
#let slot = s => html.elem("slot", attrs: ("name": if s { s } else { "default" }))

#import "_lib.typ": typst

=== JSX from Typst!

==== Slot

#jsx("<slot name='default'></slot>")

#jsx("<slot name='jueqi'></slot>")

==== Component

#jsx("import Counter from '../components/Counter.astro'")

#jsx("<Counter initialCount={10} jueqi='typst' />")

我宣布 #typst & 前端已经崛起了！

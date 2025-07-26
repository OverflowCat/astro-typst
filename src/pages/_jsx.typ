#let jsx = s => html.elem("script", attrs: ("data-jsx": s))

#import "_lib.typ": typst

=== JSX from Typst!

#jsx("import Counter from '../components/Counter.astro'")

#jsx("<Counter initialCount={10} message='typst' />")

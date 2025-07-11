#let jsx = (s) => html.elem("script", attrs: ("data-jsx": s)) 

#import "_lib.typ": typst

=== JSX from Typst!

#jsx("import Counter from '../components/Counter.astro'")

#jsx("<Counter initialCount={10} jueqi='typst' />")

我宣布 #typst & 前端已经崛起了！

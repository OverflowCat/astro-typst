#let jsx = s => html.elem("script", attrs: ("data-jsx": s))

// you can customize the syntax as you like, just make sure it's in the above format
// for example, as code block
#let jsx2 = cb => html.elem("script", attrs: ("data-jsx": cb.text))

#import "_lib.typ": typst

=== JSX from Typst!

#jsx("import Counter from '../components/Counter.astro'")

#jsx2[```jsx
<Counter initialCount={10} message='typst' />
```]

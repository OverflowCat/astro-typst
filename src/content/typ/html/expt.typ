#metadata(
  (
    "title": "HTML export test in Content collection",
    "author": "OverflowCat",
    desc: "Some physics equations",
    date:  datetime(
      year: 2025,
      month: 5,
      day: 3,
    ),
  )
)<frontmatter>

#show math.equation: x => box(html.frame(x))

时间差 $ Delta t = (4 A Omega) / c^2 $
将此时间差与光程差联系起来：$ Delta L = c Delta t = (4 A Omega) / c $
又 $f = display(c / lambda)$，对于周长为 P 的激光腔，谐振频率是 $display(c / P)$ 的整数倍。由于光程变化 $Delta L$ 引起的频率变化 $Delta f$ 可近似为 $ |(Delta f) / f| approx |Delta L / P|. $
代入 $Delta L$，得到 $ |Delta f| approx (f / P) times (4 A Omega / c) $

又 $f approx display(c / lambda)$，有$ |Delta f| approx (c / (lambda P)) times (4 A Omega / c) = (4 A) / (lambda P) Omega. $
这个拍频 $Delta f$ 就是环形激光陀螺中测量的量。记前面的系数 $display((4 A) / (lambda P) = S)$ 即为激光陀螺的标度因数。

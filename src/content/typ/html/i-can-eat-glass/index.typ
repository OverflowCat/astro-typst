#metadata(
  (
    "title": "I can eat glass",
    "author": "OverflowCat",
    desc: "Some lorem ipsum",
    date:  datetime(
      year: 2025,
      month: 7,
      day: 26,
    ),
  )
)<frontmatter>

#let glasses = json("_glass.json")

#for (lang, glass) in glasses {
  text(lang: lang, glass + " / ")
}

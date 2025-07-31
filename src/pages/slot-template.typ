#metadata(
  (
    title: "Slot Test page",
    author: "Uwni",
    desc: [the page to test slot template],
    date: datetime(
      year: 2025,
      month: 7,
      day: 31,
    ),
  ),
)<frontmatter>

#html.elem("html", attrs: (lang: "zh-CN"))[
  #html.elem("head")[
    #html.elem("meta", attrs: (charset: "UTF-8"))
    #html.elem("meta", attrs: (name: "viewport", content: "width=device-width, initial-scale=1.0"))
    #html.elem("meta", attrs: (name: "description", content: "the page to test slot template"))
    #html.elem("meta", attrs: (name: "author", content: "Uwni"))
    #html.elem("title")[Slot Test page]
  ]
  #html.elem("body")[
    #html.elem("main")[
      = Slot Test Page

      == A default slot

      #html.elem("div", attrs: (class: "slot-container"))[
        _A default slot will be replaced with its content here:_
        #html.elem("slot")[
          Default slot content
        ]
      ]

      == named slot
      #html.elem("div", attrs: (class: "slot-container"))[
        _A slot with a name will be replaced with its content here:_
        #html.elem("slot", attrs: (name: "quote"))[
          Quote slot content
        ]
      ]

      #html.elem("footer")[
        #html.elem("p")[
          Footer
        ]
      ]
    ]
  ]
]

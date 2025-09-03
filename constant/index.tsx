import { Bot, Calculator, CircleDot, Languages,  Link, MessageCircle, Mic,  Save,  Users2, Video } from "lucide-react"

export const PRICING_CARDS = [
  {
    planType: 'Free Plan',
    price: '0',
    description: 'Limited block trials  for teams',
    highlightFeature: '',
    features: [
        "Pen, Pencil, Eraser",
        "Basic Shapes: Circle, Rectangle, Triangle, Line",
        "Text tool (basic fonts & colors)",
        "Image upload (limit size or count)",
        "Ruler & Protractor",
        "Save whiteboard (limit to 3 boards or sessions)",
        "Multiple users (limit 2–3 participants per session)",
        "Basic chat",
      ],
  },
  {
    planType: 'Pro Plan',
    price: '12.99',
    description: 'Billed annually. $17 billed monthly',
    highlightFeature: 'Everything in free +',
    features: [
        "Unlimited voice chat & mic time",
        "Screen sharing",
        "Unlimited participants per session (beyond 3 users)",
        "Equation editor & Graphing tools",
        "Unlimited saved whiteboards & session history",
        "Export whiteboard as PDF / Image",
        "Multiple languages support",
        "Advanced chat features (emoji, file sharing)",
        "Dashboard",
      ],
  },
];

export const NavigationLinks = [
    {
        id: 1,
        label: "Home",
        href: "/"
    },
    {
        id: 2,
        label: "Features",
        href: "/features"
    },
    {
        id: 3,
        label: "Prices",
        href: "/prices"
    },
    {
        id: 4,
        label: "Use cases",
        href: "/use-cases"
    },
    {
        id: 5,
        label: "Contact",
        href: "/contact"
    }
]

export const FaqQuestions = [
  {
    id: 1,
    label: "Is it free to use?",
    desc: "Yes! You can start using the platform for free during our beta period. No credit card required. Premium features will be introduced later."
  },
  {
    id: 2,
    label: "Do students need to create an account to join?",
    desc: "No. Students can instantly join your class using a simple link — no signup or login required."
  },
  {
    id: 3,
    label: "Can I use voice while teaching?",
    desc: "Absolutely! Our built-in voice chat lets you speak to your students in real-time while drawing on the whiteboard."
  },
  {
    id: 4,
    label: "Can I save or export the whiteboard after class?",
    desc: "Yes. You can export your whiteboard as an image or PDF to share with students or save for future reference."
  },
  {
    id: 5,
    label: "Do I need to install anything?",
    desc: "Not at all. Everything runs in your browser. Just open the link, and you're ready to teach."
  },
]

export const Tags = [
  {
    id: 1,
    label: "VoiceCall",
    position: "top-18 left-25 sm:top-10 sm:left-20 md:top-30 md:left-80 -rotate-10 ",
    
  },
  {
    id: 2,
    label: "Freely Draw",
    position: "top-12 right-18 sm:top-10 sm:left-20 md:top-25 md:right-135 border px-2 border-black rounded-full md:left-auto rotate-20"
  },
  {
    id: 3,
    label: "WhiteBoard",
    position: "top-36 left-20 sm:top-10 sm:left-20 md:top-40 md:left-110 -rotate-20",
  },
  {
    id: 4,
    label: "Image Upload",
    position: "top-32 right-22 sm:top-10 sm:left-20 md:top-45 md:right-85 md:left-auto rotate-48"
  },
  {
    id: 5,
    label: "Live",
   position: "top-42 left-40 sm:top-10 sm:left-20 md:top-60 md:right-140 md:left-auto"
  },
  {
    id: 6,
    label: "PDF import",
   position: "top-50 left-10 sm:top-10 sm:left-20 md:top-65 md:left-110 -rotate-10 ",
  },
]

 export const features = [
    {
      title: "Freehand Drawing",
      desc: "Experience smooth, real-time sketching designed for classroom speed. Whether you're explaining a math equation or illustrating a concept, the drawing feels instant and responsive.",
      img: "/assets/Croods - Object 2.png", // Replace with your actual image
    },
    {
      title: "Shapes & Text Tools",
      desc: "Draw rectangles, circles, arrows, and more to create diagrams, flowcharts, or highlights. Combine them with editable text to label steps, write definitions, or call out key points clearly.",
      img: "/assets/Croods - Object 1.png",
    },
    {
      title: "Undo, Redo & Eraser",
      desc: "Easily undo or redo any stroke or element with a single click. Need to fix something? Just select the eraser tool to clean up your board without disrupting your flow.",
      img: "/assets/Croods - Big Plant 4.png",
    },
    {
      title: "Multi-color & Brush Styles",
      desc: "Switch between different brush sizes and colors to emphasize, categorize, or explain clearly. Use color coding to help students follow along more intuitively.",
      img: "/assets/Hobbies - Hobbies Outline.png",
    },
    {
      title: "Built-in Voice Chat",
      desc: "Voice is seamlessly integrated into the platform, so you can explain concepts, answer questions, and guide your students in real time — all without needing Zoom or external apps.",
      img: "/assets/Hands - Exchange [colors].png",
    },
];

export const sidebarIcons = [
  {
    label: "Students",
    icon: <Users2/>
  },
  {
    label: "Save",
    icon: <Save/>
  },
  {
    label: "Languages",
    icon: <Languages/>
  },
  {
    label: "Coming soon",
    icon: <Bot/>
  },
  {
    label: "Chat",
    icon: <MessageCircle/>
  },
  {
    label: "InviteCode",
    icon: <Link/>
  },
  {
    label: "Calculator",
    icon: <Calculator/>
  },
];

export const penElements = [
   {
    icon:"/assets/board/ink-pen.svg",
    name: "Pen",
    value: "pen",
  },
  {
    icon: "/assets/board/eraser.png",
    name: "Erase",
    value: "eraser"
  }
];

export const shapeElements = [
  {
    icon: "/assets/board/rectangle.png",
    name: "Rectangle",
    value: "rectangle"
  },
  {
    icon: "/assets/board/circle.png",
    name: "Circle",
    value: "circle"
  },
  {
    icon: "/assets/board/triangle.png",
    name: "Triangle",
    value:"triangle"
  },
  {
    icon:"/assets/board/dotted-line.png",
    name:"Dotted Line",
    value:"dottedline"
  },
  {
    icon:"/assets/board/line.png",
    name:"Line",
    value:"line"
  },
  {
    icon:"/assets/board/poly.png",
    name:"Polygon",
    value:"polygon"
  },
]

export const rulerElements = [
  {
    icon:"/assets/board/ruler.png",
    name:"Ruler",
    value:"ruler"
  },
  {
    icon:"/assets/board/protracter.png",
    name: "Protracter",
    value: "protracter"
  }
]

export const mathElements = [
  {
     icon: "/assets/board/pi.png",
     name: "pi",
     value: "pi",
  },
  {
     icon: "/assets/board/alpha.png",
     name: "Alpha",
     value: "alpha",
  },
  {
     icon: "/assets/board/mu.png",
     name: "Mu",
     value: "mu",
  },
  {
     icon: "/assets/board/omega.png",
     name: "Omega",
     value: "omega",
  },
  {
     icon: "/assets/board/square.png",
     name: "Square",
     value: "square",
  },
  {
     icon: "/assets/board/symbol.png",
     name: "Symbol",
     value: "symbol",
  },
]


export const navElements = [
  {
    icon: "/assets/board/select.png",
    name: "Select",
    value: "select"
  },
  {
    icon: "/assets/board/ink-pen.svg",
    name: "Pen",
    value: penElements,
  },
  {
    icon: "/assets/board/rectangle.png",
    name: "Rectangle",
    value: shapeElements,
  },
  {
    icon: "/assets/board/ruler.png",
    name: "Ruler",
    value: rulerElements,
  },
  {
     icon: "/assets/board/pi.png",
     name: "pi",
     value: mathElements,
  },
  {
    icon: "/assets/board/type.png" ,
    name: "Text",
    value: "text",
  },
  {
    icon: "/assets/board/reset.png" ,
    value: "reset",
    name: "Reset",
  },
  {
    icon: "/assets/board/trash.png",
    name:"Delete",
    value: "delete"
  },
   {
    icon: "/assets/board/img.png",
    value: "image",
    name: "Image",
  }
];

export const defaultNavElement = {
  icon: "/assets/select.svg",
  name: "Select",
  value: "select",
};



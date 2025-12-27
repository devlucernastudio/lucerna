export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
}

export const products: Product[] = [
  {
    id: "ginkgo-1",
    name: "Підвісний світильник Ginkgo",
    price: 12500,
    image: "/white-textured-pendant-lamp-ginkgo-leaf-design.jpg",
    description: "Елегантний світильник ручної роботи з текстурою листя гінкго",
    category: "pendant",
  },
  {
    id: "olea-1",
    name: "Підвісний світильник Olea",
    price: 12500,
    image: "/cream-elongated-pendant-lamp-nature-field.jpg",
    description: "Вишуканий світильник із плавними природними формами",
    category: "pendant",
  },
  {
    id: "morchella-1",
    name: "Підвісний світильник Morchella",
    price: 14500,
    image: "/textured-cone-pendant-lamp-honeycomb-pattern.jpg",
    description: "Унікальний світильник із рельєфною текстурою",
    category: "pendant",
  },
  {
    id: "phellinus-1",
    name: "Підвісний світильник Phellinus",
    price: 12500,
    image: "/smooth-white-bell-pendant-lamp-minimalist.jpg",
    description: "Мінімалістичний світильник у формі дзвону",
    category: "pendant",
  },
  {
    id: "amanita-1",
    name: "Світильник Amanita",
    price: 15500,
    image: "/large-dome-pendant-lamp-warm-interior-glow.jpg",
    description: "Великий куполоподібний світильник з теплим світлом",
    category: "pendant",
  },
  {
    id: "cantharellus-1",
    name: "Світильник Cantharellus",
    price: 13500,
    image: "/wavy-textured-pendant-lamp-mushroom-shape.jpg",
    description: "Органічний світильник із хвилястими формами",
    category: "pendant",
  },
]

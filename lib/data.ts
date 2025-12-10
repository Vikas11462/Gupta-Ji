export interface Product {
    id: string
    name: string
    description: string
    price: number
    category: string
    image: string
    popular: boolean
}

export interface Category {
    id: string
    name: string
    slug: string
}



export const products: Product[] = [
    {
        id: "1",
        name: "Premium Basmati Rice",
        description: "High quality aged basmati rice, perfect for biryani.",
        price: 120,
        category: "Groceries",
        image: "/placeholder.svg",
        popular: true,
    },
    {
        id: "2",
        name: "Sunflower Oil 1L",
        description: "Refined sunflower oil for healthy cooking.",
        price: 150,
        category: "Groceries",
        image: "/placeholder.svg",
        popular: true,
    },
    {
        id: "3",
        name: "Potato Chips (Salted)",
        description: "Crispy salted potato chips.",
        price: 20,
        category: "Snacks",
        image: "/placeholder.svg",
        popular: true,
    },
    {
        id: "4",
        name: "Chocolate Cookies",
        description: "Rich chocolate chip cookies.",
        price: 40,
        category: "Snacks",
        image: "/placeholder.svg",
        popular: false,
    },
    {
        id: "5",
        name: "Cola Drink 750ml",
        description: "Refreshing carbonated cola drink.",
        price: 45,
        category: "Beverages",
        image: "/placeholder.svg",
        popular: true,
    },
    {
        id: "6",
        name: "Mango Juice 1L",
        description: "Real mango pulp juice.",
        price: 100,
        category: "Beverages",
        image: "/placeholder.svg",
        popular: false,
    },
    {
        id: "7",
        name: "Toothpaste 150g",
        description: "Herbal toothpaste for strong teeth.",
        price: 85,
        category: "Personal Care",
        image: "/placeholder.svg",
        popular: false,
    },
    {
        id: "8",
        name: "Dishwashing Liquid 500ml",
        description: "Lemon fresh dishwashing liquid.",
        price: 95,
        category: "Household",
        image: "/placeholder.svg",
        popular: false,
    },
]

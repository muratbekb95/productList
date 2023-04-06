interface ProductEntity {
    id: number
    title: string
    description: string
    price: number
    currency: string
    image: string
    rating: number
}

class Product {
    id: number
    title: string
    description: string
    price: number
    currency: string
    image: string
    rating: number

    constructor(product: ProductEntity) {
        this.id = product.id;
        this.title = product.title;
        this.description = product.description;
        this.price = product.price;
        this.currency = product.currency;
        this.image = product.image;
        this.rating = product.rating;
    }
}

export default Product;
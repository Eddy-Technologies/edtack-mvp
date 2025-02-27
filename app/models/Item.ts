export class Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;

  constructor(
    id: string = crypto.randomUUID(), // Generate a unique ID if none provided
    name: string = '',
    price: number = 0,
    quantity: number = 1,
    image: string = ''
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.image = image;
  }

  // Calculate the subtotal for this item
  get subtotal(): number {
    return this.price * this.quantity;
  }

  // Method to update quantity
  updateQuantity(newQuantity: number): void {
    this.quantity = Math.max(1, newQuantity); // Ensure quantity is at least 1
  }

  // Create Item from a plain object
  static fromObject(obj: Partial<Item>): Item {
    return new Item(
      obj.id,
      obj.name,
      obj.price,
      obj.quantity,
      obj.image
    );
  }

  // Create a copy of the item
  clone(): Item {
    return new Item(
      this.id,
      this.name,
      this.price,
      this.quantity,
      this.image
    );
  }
}

// Type definition for your cart
export type Cart = Item[];

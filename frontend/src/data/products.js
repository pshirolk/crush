export const categories = {
  "Coffee & Tea": [
    { id: 1, name: "Espresso", price: 3.0, modifierType: "espresso" },
    { id: 2, name: "Americano", price: 3.5, modifierType: "americano", requires: [1] },
    { id: 3, name: "Latte", price: 4.75, modifierType: "milkCoffee", requires: [1] },
    { id: 4, name: "Cappuccino", price: 4.5, modifierType: "milkCoffee", requires: [1] },
    { id: 5, name: "Chai Latte", inventoryName: "Chai", price: 4.75, modifierType: "chai" },
    { id: 6, name: "Matcha Latte", inventoryName: "Matcha", price: 5.25, modifierType: "matcha" },
  ],
  "Baked Goods": [
    { id: 7, name: "Croissant", price: 3.75 },
    { id: 8, name: "Blueberry Muffin", price: 3.5 },
    { id: 9, name: "Chocolate Chip Cookie", price: 2.75 },
  ],
  "Bottled Beverages & Chips": [
    { id: 10, name: "Bottled Water", price: 2.0 },
    { id: 11, name: "Sparkling Water", price: 2.75 },
    { id: 12, name: "Potato Chips", price: 2.5 },
  ],
  Merch: [
    { id: 13, name: "Crush Tote Bag", price: 18.0 },
    { id: 14, name: "Crush Mug", price: 15.0 },
  ],
};

export const products = Object.values(categories).flat();

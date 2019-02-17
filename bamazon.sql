

USE bamazon;

CREATE TABLE products (
  position INT NOT NULL,
  item_id VARCHAR(100) NULL,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(110) NULL,
  price DECIMAL(10,4) NULL,
  stock_quantitiy VARCHAR(100) NULL,
  PRIMARY KEY (position)
);

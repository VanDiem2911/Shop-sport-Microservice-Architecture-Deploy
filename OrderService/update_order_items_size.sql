USE order_db;
ALTER TABLE order_items ADD COLUMN size VARCHAR(20) AFTER quantity;

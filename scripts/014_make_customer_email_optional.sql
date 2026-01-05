-- Make customer_email optional in orders table
-- Since email is not required in the checkout form, we should allow NULL values

ALTER TABLE orders 
ALTER COLUMN customer_email DROP NOT NULL;


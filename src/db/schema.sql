CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  oauth_provider VARCHAR(50) NOT NULL,
  oauth_id VARCHAR(191) NOT NULL,
  username VARCHAR(191) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_provider_oauth_id (oauth_provider, oauth_id)
);

CREATE TABLE IF NOT EXISTS products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  description TEXT,
  price_cents INT UNSIGNED NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'PEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  amount_cents INT UNSIGNED NOT NULL,
  currency VARCHAR(10) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  provider_payment_id VARCHAR(191),
  status VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_payments_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS refunds (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT NOT NULL,
  amount_cents INT UNSIGNED NOT NULL,
  reason VARCHAR(255),
  provider_refund_id VARCHAR(191),
  status VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
);

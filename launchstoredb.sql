DROP DATABASE IF EXISTS launchstoredb;
CREATE DATABASE launchstoredb;

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "password" text NOT NULL,
  "cpf_cnpj" text UNIQUE NOT NULL,
  "cep" text,
  "address" text,
  "reset_token" text,
  "reset_token_expires" text,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

-- CONNECT PG SIMPLE TABLE
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "category_id" int NOT NULL,
  "user_id" int,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "old_price" integer,
  "price" integer NOT NULL,
  "quantity" integer DEFAULT 0,
  "status" integer DEFAULT 1,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

-- POPULA A TABELA DE CATEGORIA DEPOIS DE CRIADA
INSERT INTO categories (name, created_at) 
VALUES ('Comida',NOW()),
('Eletrônicos',NOW()),
('Automóveis',NOW());

CREATE TABLE "files" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "path" text NOT NULL,
  "product_id" integer,
  "created_at" timestamp DEFAULT (now())
);

ALTER TABLE "products" ADD CONSTRAINT products_user_id_fkey FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");
ALTER TABLE "files" ADD CONSTRAINT files_product_id_fkey FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE;

COMMENT ON COLUMN "products"."description" IS 'Description in product';

-- cascade effect when delete
ALTER TABLE "products" DROP CONSTRAINT products_user_id_fkey,
ADD CONSTRAINT products_user_id_fkey FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "files"
DROP CONSTRAINT files_product_id_fkey,
ADD CONSTRAINT files_product_id_fkey FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE;
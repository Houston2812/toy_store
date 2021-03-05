-- CREATE DATABASE toys;

-- USE toys;

-- CREATE TABLE admins(
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     username VARCHAR(255),
--     password VARCHAR(255),
--     email VARCHAR(255),
--     phone_number VARCHAR(255),
--     profile_picture VARCHAR(255)
-- );

-- INSERT INTO admins(username, password, email, phone_number, profile_picture) VALUES
-- ("huseyn", "$2b$10$SkiP0w78emigZ9Cbsc/vQOjYWUytS5m5FEJglWkFEfGwRX.RHhIH2", "huseyn@gmail.com", "+994777777777","howdy.jpg"),
-- ("leonardo", "$2b$10$FGO3C5DbC3YxnSgCCTG5CuloF.59lTwRKFQI6q0Dx06o2yA7VJW.u", "leonardo@gmail.com", "+994555555555", "dino_pp.png"),
-- ("paladin", "$2b$10$UF62R7zxCI87Xu6vX.8KCONySq/Wkm10LqdG2bxDw6tEFey8ORFR2", "paladin@gmail.com", "+994505055555", "scobyy.png");

-- CREATE TABLE items(
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(255),
--     pic_name VARCHAR(255),
--     description VARCHAR(255),
--     amount INT,
--     price INT 
-- );

-- INSERT INTO items(name, pic_name, description, amount, price) VALUES
-- ("Qantas Airplane", "airplane.jpg", "A little model of modern airplane. Best toy for growing pilots.", 10, 15),
-- ("Vintage car", "car.jpg", "Old vintage car. Ideal for your son or collection.", 5, 30),
-- ("Cute cow Edward", "cow_toy.jpg", "Cute cow Edward. Beautiful sign of 2021.", 4, 12),
-- ("Gray elephant", "elephant.jpg", "Gray elephant an awesome gift for little ones.", 30, 20),
-- ("Teddy bear", "teddy_bear.jpg", "Teddy bear is the most beloved gift for the couples.", 50, 25),
-- ("Train", "train.png", "Train is the best gift for the young mechanics.", 25, 60);


-- CREATE TABLE out_of_stock(
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     item_name VARCHAR(255),
--     is_deleted BOOLEAN  DEFAULT 0
-- );


-- DELIMITER $$
-- CREATE TRIGGER is_items_left
-- AFTER UPDATE ON items FOR EACH ROW
--     BEGIN
--         IF NEW.amount = 0 THEN
--             INSERT INTO out_of_stock(item_name) VALUES (OLD.name);
--         END IF; 
--     END$$
-- DELIMITER ;


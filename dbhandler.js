const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
  },
  money: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }
});

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

sequelize.sync();

// Létrehoz egy új felhasználót
async function createUser(username, password, role = 'user') {
  return await User.create({ username, password, role });
}

// Felhasználó keresése a felhasználónév alapján
async function findUserByUsername(username) {
  return await User.findOne({ where: { username } });
}

// Termék létrehozása
async function createProduct(name, description, price, image) {
  return await Product.create({ name, description, price, image });
}

// Összes termék lekérése
async function getAllProducts() {
  return await Product.findAll();
}

// Termék frissítése
async function updateProduct(id, name, description, price, image) {
  return await Product.update({ name, description, price, image }, { where: { id } });
}

// Termék törlése
async function deleteProduct(id) {
  return await Product.destroy({ where: { id } });
}

// Termék lekérése az id alapján
async function getProductById(id) {
  return await Product.findByPk(id);
}

// Felhasználó keresése ID alapján
async function findUserById(id) {
  return await User.findByPk(id);
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  Product,
  User,
  getProductById,
};
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./dbhandler');

const app = express();
const PORT = process.env.PORT || 5555;

app.use(express.json());
app.use(express.static('public'))


app.post('/register', async (req, res) => {
  const { username, password, role, money } = req.body;
  try {
    await db.createUser(username, password, role, money);
    res.status(201).json({ message: 'Sikeres regisztráció!' });
  } catch (error) {
    res.status(500).json({ message: 'Sikertelen regisztráció.' });
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.findUserByUsername(username);
    if (user && user.password == password) {
      const token = jwt.sign({ id: user.id, role: user.role, money: user.money }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, role: user.role });
    } else {
      res.status(401).json({ message: 'Érvénytelen adatok.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sikertelen belépés.' });
  }
});

app.put('/decreaseMoney', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  const { productPrice } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Nincs token!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await db.findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Nem található felhasználó!' });
    }

    if (user.money < productPrice) {
      return res.status(400).json({ message: 'Nincs elég pénzed!' });
    }

    user.money -= productPrice;
    await user.save();

    const newToken = jwt.sign({ id: user.id, role: user.role, money: user.money }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ auth: true, message: 'Sikeres vásárlás!', token: newToken });

  } catch (error) {
    
    res.status(500).json({ message: 'Sikertelen frissítés!' });
  }
});


app.put('/mupdate', async (req, res) => {
  console.log("Kérés érkezett:", req.body);

  try {
     
      const user = await db.User.findOne({ where: { username: req.body.username } });

      if (!user) {
          return res.status(404).json({ error: "Felhasználó nem található" });
      }

      
      if (user.money == req.body.money) {
          return res.status(400).json({ error: "Nincs változás az adatokban" });
      }

      const result = await db.User.update(
          { money: req.body.money },
          { where: { username: req.body.username } }
      );

      if (result[0] == 0) {
          return res.status(400).json({ error: "Nem történt módosítás" });
      }

      res.json({ message: "Sikeres frissítés!" });
  } catch (error) {
      console.error("Hiba történt az adatbázis frissítésekor:", error);
      res.status(500).json({ error: "Szerverhiba" });
  }
});


app.get('/products', async (req, res) => {
  try {
    const products = await db.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Nem sikerült lekérni a termékeket.' });
  }
});


app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const product = await db.getProductById(id);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: 'Termék nem található.' });
      }
    } catch (error) {
      console.error('Hiba történt a termék lekérése során:', error);
      res.status(500).json({ message: 'Hiba történt a termék lekérése során.' });
    }
  });


app.post('/products', async (req, res) => {
  const { name, description, price, image } = req.body;
  try {
    const product = await db.createProduct(name, description, price, image);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Sikertelen létrehozás.' });
  }
});


app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image } = req.body;
  try {
    await db.updateProduct(id, name, description, price, image);
    res.json({ message: 'Sikeres termék frissítés!' });
  } catch (error) {
    res.status(500).json({ message: 'Sikertelen termék frissítés.' });
  }
});


app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteProduct(id);
    res.json({ message: 'Sikeres törlés!' });
  } catch (error) {
    res.status(500).json({ message: 'Sikertelen törlés.' });
  }
});


app.listen(PORT, () => {
  console.log(`Szerver fut: http://localhost:${PORT}`);
});
// Модули, библиотеки
const express = require("express");
const server = express();
const http = require("http").createServer(server).listen(3000);
const io = require("socket.io")(http);
const sass = require('sass');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api')
const serveStatic = require('serve-static');
const mime = require('mime-types');
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));
// Токен бота
const BOT_TOKEN = "7344423782:AAFd7sOhUELzFlpClkWaDwYy49iAsYeOHtU"

// Пароль чтобы получить данные заказа
const BOT_PASSWORD = "12345"

//Вызываем библиотеку
const bot = new TelegramBot(BOT_TOKEN, { 
  polling: true 
})

function loadItems() {
    try {
        const itemsData = fs.readFileSync(path.join(__dirname, 'items.json'), 'utf8');
        return JSON.parse(itemsData);
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        return [];
    }
}

function compileSass(srcPath, destPath) {
    if (fs.existsSync(srcPath)) {
        const result = sass.compile(srcPath, {
            style: 'compressed'
        });
        fs.writeFileSync(destPath, result.css);
    } else {
        console.error(`Файл ${srcPath} не найден.`);
    }
}

server.use((req, res, next) => {
    if (req.path.endsWith('.css')) {
        const cssFileName = path.basename(req.path, '.css');
        const srcPath = path.join(__dirname, 'scss', `${cssFileName}.scss`);
        const destPath = path.join(__dirname, 'css', req.path);

        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        compileSass(srcPath, destPath);
    }
    next();
});

server.use(serveStatic(path.join(__dirname, '/css'), {
    setHeaders: function (res, path) {
        if (mime.lookup(path) === 'text/css') {
            res.setHeader('Content-Type', 'text/css');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

server.get('/', (req, res) => {
    const items = loadItems();
    res.render('index', { items });
});

server.get('/item/:id', (req, res) => {
    const items = loadItems();
    const itemId = parseInt(req.params.id);
    
    const item = items.find(item => item.id === itemId);
    
    if (item) {
        res.render('item', { item });
    } else {
        res.status(404).render('404');
    }
});

server.get('/category/:category', (req, res) => {
    const items = loadItems();
    const category = req.params.category;
    
    let filteredItems = items;
    if (category !== 'all') {
        filteredItems = items.filter(item => item.category === category);
    }
    
    res.render('index', { items: filteredItems, currentCategory: category });
});

server.get('/subcategory/:subcategory', (req, res) => {
    const items = loadItems();
    const subcategory = req.params.subcategory;
    
    const filteredItems = items.filter(item => item.subcategory === subcategory);
    
    res.render('index', { items: filteredItems, currentSubcategory: subcategory });
});

server.use('/img-items', express.static(path.join(__dirname, 'img-items')));
server.use('/js', express.static(path.join(__dirname, 'js')));
server.use('/images', express.static(path.join(__dirname, 'images')));

// Обработчик команды /start
bot.onText("/start", (msg) => {
    let chatId = msg.chat.id
    bot.sendMessage(chatId, `Пришли пароль`)
});

bot.on('message', (msg) => {
    const messageText = msg.text
    const chatId = msg.chat.id
    
    if (messageText === BOT_PASSWORD) {
        let orders = [];
        try {
            if (fs.existsSync("orders.json")) {
                const ordersData = fs.readFileSync("orders.json", "utf8");
                const parsedOrders = JSON.parse(ordersData);
                orders = Array.isArray(parsedOrders) ? parsedOrders : [];
            }
        } catch (error) {
            console.error('Ошибка при чтении файла заказов:', error);
            orders = [];
        }

        for (let i = 0; i < orders.length; i++) {
            // Сообщение с заказами
            const message = `
            Заказы:
            Имя: ${orders[i].fullName}
            Телефон: ${orders[i].phone}
            Email: ${orders[i].email}
            Telegram: ${orders[i].telegram}
            Город: ${orders[i].city}
            Товар: ${orders[i].itemName}
            Размер: ${orders[i].size}
            Цвет: ${orders[i].color}
            `
            bot.sendMessage(chatId, message)
        }
    } else if (messageText !== "/start") {
        bot.sendMessage(chatId, "Неверный пароль")
    }
});

// Обработчик покупки
io.sockets.on("connection", (socket) => {
    socket.on('purchase', (formData) => {
        if (!formData) {
            return;
        }
        
        let orders = [];
        try {
            if (fs.existsSync("orders.json")) {
                const ordersData = fs.readFileSync("orders.json", "utf8");
                const parsedOrders = JSON.parse(ordersData);
                orders = Array.isArray(parsedOrders) ? parsedOrders : [];
            }
        } catch (error) {
            console.error('Ошибка при чтении файла заказов:', error);
            orders = [];
        }
        
        orders.push(formData);
        
        try {
            fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2));
        } catch (error) {
            console.error('Ошибка при сохранении заказов:', error);
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
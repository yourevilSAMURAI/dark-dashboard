function updateClocks() {
    // Получаем текущее время в разных часовых поясах
    const now = new Date();
    
    // toLocaleTimeString берет время и форматирует его под нужный город
    document.getElementById('time-msk').textContent = now.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' });
    document.getElementById('time-lon').textContent = now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' });
    document.getElementById('time-tok').textContent = now.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

// Запускаем функцию каждую секунду (1000 миллисекунд)
setInterval(updateClocks, 1000);
updateClocks(); // И вызываем один раз сразу, чтобы не ждать секунду
async function fetchCrypto() {
    try {
        // Отправляем запрос на CoinGecko (работает без VPN)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
        const data = await response.json(); 

        // Выводим на экран. toLocaleString('en-US') добавит запятые для удобства (например, $67,000)
        document.getElementById('crypto-btc').textContent = `$${data.bitcoin.usd.toLocaleString('en-US')}`;
        document.getElementById('crypto-eth').textContent = `$${data.ethereum.usd.toLocaleString('en-US')}`;
        
    } catch (error) {
        console.error("Ошибка загрузки крипты:", error);
        document.getElementById('crypto-btc').textContent = "Offline";
        document.getElementById('crypto-eth').textContent = "Offline";
    }
}

fetchCrypto(); 
setInterval(fetchCrypto, 15000); // Обновляем каждые 15 секунд (у CoinGecko есть лимиты на бесплатные запросы)
function updateSystem() {
    // Генерируем случайное число от 10 до 50
    const randomPing = Math.floor(Math.random() * 40) + 10;
    document.getElementById('sys-ping').textContent = `${randomPing} ms`;

    // Иногда меняем уровень угрозы для смеха
    if (randomPing > 40) {
        document.getElementById('sys-threat').textContent = "HIGH";
        document.getElementById('sys-threat').style.color = "#ff0000";
    } else {
        document.getElementById('sys-threat').textContent = "LOW";
        document.getElementById('sys-threat').style.color = "#8b0000";
    }
}
setInterval(updateSystem, 2000); // Меняем каждые 2 секунды
updateSystem();
// ==========================================
// 4. ПОГОДА (API Open-Meteo)
// ==========================================
async function fetchWeather() {
    try {
        // Используем сервис wttr.in для Москвы, запрашивая формат JSON
        const response = await fetch('https://wttr.in/Moscow?format=j1');
        const data = await response.json();
        
        // В этом API температура лежит немного глубже в структуре данных
        const temp = data.current_condition[0].temp_C;
        
        // Форматируем вывод (добавляем плюс, если температура положительная)
        const tempDisplay = temp > 0 ? `+${temp}` : temp;
        document.getElementById('weather-temp').textContent = `${tempDisplay}°C`;
        
    } catch (error) {
        console.error("Ошибка загрузки погоды:", error);
        document.getElementById('weather-temp').textContent = "Offline";
    }
}

fetchWeather(); 
setInterval(fetchWeather, 1800000); // Обновляем раз в 30 минут

// ==========================================
// 5. ВАЛЮТЫ (API ЦБ РФ)
// ==========================================
async function fetchCurrency() {
    try {
        // Запрашиваем данные у ЦБ РФ
        const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        const data = await response.json();
        
        // Достаем курсы доллара и евро и округляем до 2 знаков
        const usdRate = data.Valute.USD.Value.toFixed(2);
        const eurRate = data.Valute.EUR.Value.toFixed(2);
        
        // Выводим на экран
        document.getElementById('usd-rate').textContent = usdRate;
        document.getElementById('eur-rate').textContent = eurRate;
        
    } catch (error) {
        console.error("Ошибка загрузки валют:", error);
        document.getElementById('usd-rate').textContent = "Ошибка";
        document.getElementById('eur-rate').textContent = "Ошибка";
    }
}

fetchCurrency(); // Запускаем при загрузке
// Курс валют тоже не нужно дергать каждую секунду, обновляем раз в час (3600000 мс)
setInterval(fetchCurrency, 3600000);
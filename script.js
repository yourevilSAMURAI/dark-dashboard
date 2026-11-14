// ==========================================================================
// 0. СЛОВАРИ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ==========================================================================
const weatherDictionary = {
    'Sunny': 'Солнечно', 'Clear': 'Ясно', 'Partly cloudy': 'Переменная облачность',
    'Cloudy': 'Облачно', 'Overcast': 'Пасмурно', 'Mist': 'Туман',
    'Patchy rain possible': 'Возможен дождь', 'Light drizzle': 'Морось',
    'Light rain': 'Легкий дождь', 'Moderate rain': 'Умеренный дождь',
    'Heavy rain': 'Сильный дождь', 'Light snow': 'Легкий снег',
    'Moderate snow': 'Умеренный снег', 'Heavy snow': 'Сильный снег',
    'Blizzard': 'Метель', 'Fog': 'Туман', 'Thundery outbreaks possible': 'Возможна гроза'
};

const weatherIcons = {
    'Sunny': '☀', 'Clear': '☾', 'Partly cloudy': '⛅', 'Cloudy': '☁', 'Overcast': '☁',
    'Mist': '≡', 'Fog': '≡', 'Light drizzle': '☂', 'Light rain': '☂', 
    'Moderate rain': '☔', 'Heavy rain': '☔', 'Light snow': '❄', 
    'Moderate snow': '❄', 'Heavy snow': '❄', 'Blizzard': '❆'
};

const startTime = Date.now(); 
let currentUsdRate = 0; 

// ==========================================================================
// 1. МИРОВОЕ ВРЕМЯ
// ==========================================================================
function updateClocks() {
    const now = new Date();
    document.getElementById('time-msk').textContent = now.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' });
    document.getElementById('time-lon').textContent = now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' });
    document.getElementById('time-tok').textContent = now.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

// ==========================================================================
// 2. ПОГОДА
// ==========================================================================
async function fetchWeather(city = 'Moscow') {
    try {
        const response = await fetch(`https://wttr.in/${city}?format=j1`);
        const data = await response.json();

        const temp = data.current_condition[0].temp_C;
        const englishDesc = data.current_condition[0].weatherDesc[0].value;

        // Перевод
        const dictKey = Object.keys(weatherDictionary).find(key => key.toLowerCase() === englishDesc.trim().toLowerCase());
        const russianDesc = dictKey ? weatherDictionary[dictKey] : englishDesc;
        
        // Иконка
        const iconKey = Object.keys(weatherIcons).find(key => key.toLowerCase() === englishDesc.trim().toLowerCase());
        const icon = iconKey ? weatherIcons[iconKey] : '•';

        document.getElementById('weather-temp').textContent = `${temp > 0 ? '+' + temp : temp}°C`;
        document.getElementById('weather-desc').textContent = russianDesc;
        document.getElementById('weather-icon').textContent = icon;
        document.getElementById('current-city-display').textContent = city.toUpperCase();
    } catch (error) {
        console.error("Ошибка погоды:", error);
        document.getElementById('weather-temp').textContent = "Offline";
    }
}

// ==========================================================================
// 3. ВАЛЮТЫ (С динамикой и сохранением курса доллара)
// ==========================================================================
async function fetchCurrency() {
    const currencyCode = document.getElementById('currency-select').value;
    
    document.getElementById('currency-name').textContent = `${currencyCode} / RUB`;
    document.getElementById('currency-rate').textContent = 'Загрузка...';

    try {
        const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        const data = await response.json();

        const currentRate = data.Valute[currencyCode].Value;
        const previousRate = data.Valute[currencyCode].Previous;
        
        // Сохраняем доллар для крипты
        currentUsdRate = data.Valute['USD'].Value; 

        const diff = currentRate - previousRate;
        const percentDiff = (diff / previousRate) * 100;
        const sign = diff >= 0 ? '+' : '';

        document.getElementById('currency-rate').textContent = currentRate.toFixed(2);
        
        const changeElement = document.getElementById('currency-change');
        changeElement.textContent = `${sign}${diff.toFixed(2)} (${sign}${percentDiff.toFixed(2)}%)`;
        
        if (diff > 0) changeElement.className = 'rate currency-up';
        else if (diff < 0) changeElement.className = 'rate currency-down';
        else changeElement.className = 'rate';

        updateCryptoDisplay(); // Обновляем рубли в крипте
    } catch (error) {
        console.error("Ошибка валют:", error);
    }
}

// ==========================================================================
// 4. КРИПТОВАЛЮТЫ (CoinLore)
// ==========================================================================
async function updateCryptoDisplay() {
    const coinId = document.getElementById('crypto-select').value;
    const coinName = document.getElementById('crypto-select').options[document.getElementById('crypto-select').selectedIndex].text;

    document.getElementById('crypto-name').textContent = `${coinName} / USD`;
    document.getElementById('crypto-name-rub').textContent = `${coinName} / RUB`;

    const coinLoreIds = { 'bitcoin': '90', 'ethereum': '80', 'dogecoin': '2', 'solana': '48543' };

    try {
        const response = await fetch(`https://api.coinlore.net/api/ticker/?id=${coinLoreIds[coinId]}`);
        const data = await response.json();
        const priceUsd = parseFloat(data[0].price_usd);

        document.getElementById('crypto-price').textContent = `$${priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        if (currentUsdRate > 0) {
            const priceRub = priceUsd * currentUsdRate;
            document.getElementById('crypto-price-rub').textContent = `${priceRub.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`;
        }
    } catch (error) {
        document.getElementById('crypto-price').textContent = "Offline";
    }
}

// ==========================================================================
// 5. СТАТУС СИСТЕМЫ
// ==========================================================================
function updateSystem() {
    // Пинг
    const randomPing = Math.floor(Math.random() * 34) + 12;
    document.getElementById('sys-ping').textContent = `${randomPing} ms`;
    document.getElementById('sys-threat').textContent = randomPing > 40 ? "HIGH" : "LOW";
    document.getElementById('sys-threat').style.color = randomPing > 40 ? "#ff0000" : "#8b0000";

    // Uptime
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('sys-uptime').textContent = 
        `${Math.floor(elapsed / 3600).toString().padStart(2, '0')}:` +
        `${Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0')}:` +
        `${(elapsed % 60).toString().padStart(2, '0')}`;

    // Память
    if (performance.memory) {
        document.getElementById('sys-mem').textContent = `${(performance.memory.usedJSHeapSize / 1048576).toFixed(1)} MB`;
    } else {
        document.getElementById('sys-mem').textContent = `N/A`;
    }
}

// ==========================================================================
// 6. СОХРАНЕНИЕ НАСТРОЕК И ЗАПУСК
// ==========================================================================
function changeCurrency(val) {
    localStorage.setItem('dash_currency', val);
    fetchCurrency();
}

function changeCrypto(val) {
    localStorage.setItem('dash_crypto', val);
    updateCryptoDisplay();
}

// Главный запуск при загрузке страницы
window.onload = function() {
    // 1. Проверяем, что сохранил пользователь
    const savedCity = localStorage.getItem('dash_city') || 'Moscow';
    const savedCurrency = localStorage.getItem('dash_currency') || 'USD';
    const savedCrypto = localStorage.getItem('dash_crypto') || 'bitcoin';

    // 2. Восстанавливаем интерфейс
    document.getElementById('city-input').value = savedCity;
    document.getElementById('currency-select').value = savedCurrency;
    document.getElementById('crypto-select').value = savedCrypto;

    // 3. Делаем первые запросы
    fetchWeather(savedCity);
    fetchCurrency(); // Внутри вызовется updateCryptoDisplay
    updateClocks();
    updateSystem();

    // 4. Запускаем таймеры
    setInterval(updateClocks, 1000);       // Часы
    setInterval(updateSystem, 2000);       // Статус
    setInterval(updateCryptoDisplay, 60000); // Крипта (раз в минуту)
    setInterval(fetchWeather, 1800000);    // Погода (раз в 30 минут)
    setInterval(fetchCurrency, 3600000);   // Валюты (раз в час)
};

// Функция поиска города (вызывается и по кнопке, и по Enter)
function searchCity() {
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        localStorage.setItem('dash_city', city);
        fetchWeather(city);
        document.getElementById('city-input').blur(); 
    }
}

// Слушатель Enter (для удобства на ПК)
document.getElementById('city-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchCity();
    }
});
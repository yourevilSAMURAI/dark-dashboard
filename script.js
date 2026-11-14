// ==========================================
// 0. СЛОВАРЬ ПОГОДЫ
// ==========================================
const weatherDictionary = {
    'Sunny': 'Солнечно',
    'Clear': 'Ясно',
    'Partly cloudy': 'Переменная облачность',
    'Cloudy': 'Облачно',
    'Overcast': 'Пасмурно',
    'Mist': 'Туман',
    'Patchy rain possible': 'Возможен дождь',
    'Light drizzle': 'Морось',
    'Light rain': 'Легкий дождь',
    'Moderate rain': 'Умеренный дождь',
    'Heavy rain': 'Сильный дождь',
    'Light snow': 'Легкий снег',
    'Moderate snow': 'Умеренный снег',
    'Heavy snow': 'Сильный снег',
    'Blizzard': 'Метель',
    'Fog': 'Туман',
    'Thundery outbreaks possible': 'Возможна гроза'
};
let currentUsdRate = 0; // Глобальная переменная для хранения курса доллара
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

// ==========================================
// 2. КРИПТОВАЛЮТЫ (API CoinLore, без прокси)
// ==========================================
async function updateCryptoDisplay() {
    const coinId = document.getElementById('crypto-select').value;
    const coinName = document.getElementById('crypto-select').options[document.getElementById('crypto-select').selectedIndex].text;

    // Меняем заголовки и ставим статус загрузки
    document.getElementById('crypto-name').textContent = `${coinName} / USD`;
    document.getElementById('crypto-name-rub').textContent = `${coinName} / RUB`;
    document.getElementById('crypto-price').textContent = 'Загрузка...';
    document.getElementById('crypto-price-rub').textContent = 'Загрузка...';

    const coinLoreIds = {
        'bitcoin': '90',
        'ethereum': '80',
        'dogecoin': '2',
        'solana': '48543'
    };
    const loreId = coinLoreIds[coinId];

    try {
        const response = await fetch(`https://api.coinlore.net/api/ticker/?id=${loreId}`);
        const data = await response.json();
        const priceUsd = parseFloat(data[0].price_usd);

        // Выводим цену в долларах
        document.getElementById('crypto-price').textContent = `$${priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // 👇 КОНВЕРТАЦИЯ В РУБЛИ
        if (currentUsdRate > 0) {
            const priceRub = priceUsd * currentUsdRate;
            document.getElementById('crypto-price-rub').textContent = `${priceRub.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
        } else {
            document.getElementById('crypto-price-rub').textContent = 'Курс не загружен';
        }

    } catch (error) {
        console.error("Ошибка крипты:", error);
        document.getElementById('crypto-price').textContent = "Offline";
        document.getElementById('crypto-price-rub').textContent = "Offline";
    }
}

updateCryptoDisplay();
setInterval(updateCryptoDisplay, 60000); // Обновляем раз в минуту

// ==========================================
// 4. ПОГОДА (API wttr.in)
// ==========================================
async function fetchWeather(city = 'Moscow') {
    try {
        const response = await fetch(`https://wttr.in/${city}?format=j1`);
        const data = await response.json();

        const temp = data.current_condition[0].temp_C;
        const englishDesc = data.current_condition[0].weatherDesc[0].value;

        // Ищем ключ в словаре, игнорируя регистр (большие/маленькие буквы)
        const dictKey = Object.keys(weatherDictionary).find(key => key.toLowerCase() === englishDesc.trim().toLowerCase());
        const russianDesc = dictKey ? weatherDictionary[dictKey] : englishDesc;

        // Форматируем температуру
        const tempDisplay = temp > 0 ? `+${temp}` : temp;

        // Выводим данные на экран
        document.getElementById('weather-temp').textContent = `${tempDisplay}°C`;
        document.getElementById('weather-desc').textContent = russianDesc;

        // Обновляем название города в заголовке карточки
        document.getElementById('current-city-display').textContent = city.toUpperCase();

    } catch (error) {
        console.error("Ошибка загрузки погоды:", error);
        document.getElementById('weather-temp').textContent = "Offline";
        document.getElementById('weather-desc').textContent = "Ошибка";
    }
}

// Запускаем погоду при загрузке страницы (по умолчанию Москва)
fetchWeather();
setInterval(fetchWeather, 1800000); // Обновляем раз в 30 минут

// 👇 СЛУШАТЕЛЬ СОБЫТИЙ ДЛЯ СМЕНЫ ГОРОДА
const cityInput = document.getElementById('city-input');

cityInput.addEventListener('keypress', function (event) {
    // Если нажата клавиша Enter
    if (event.key === 'Enter') {
        // Берем текст из поля ввода и передаем его в функцию
        fetchWeather(cityInput.value);
        // Убираем фокус с поля (чтобы курсор исчез)
        cityInput.blur();
    }
});

fetchWeather();
setInterval(fetchWeather, 1800000); // Обновляем раз в 30 минут

// ==========================================
// 5. ВАЛЮТЫ (API ЦБ РФ с динамикой за день)
// ==========================================
async function fetchCurrency() {
    const currencyCode = document.getElementById('currency-select').value;

    document.getElementById('currency-name').textContent = `${currencyCode} / RUB`;
    document.getElementById('currency-rate').textContent = 'Загрузка...';
    document.getElementById('currency-change').textContent = '...';

    try {
        const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        const data = await response.json();

        const currencyData = data.Valute[currencyCode];
        const currentRate = currencyData.Value;
        const previousRate = currencyData.Previous; // Курс на вчера

        // Сохраняем текущий курс доллара для пересчета крипты
        currentUsdRate = data.Valute['USD'].Value;

        // 👇 ВЫЧИСЛЯЕМ ИЗМЕНЕНИЕ
        const diff = currentRate - previousRate;
        const percentDiff = (diff / previousRate) * 100;

        // Форматируем строку: абсолютная разница, процент
        const sign = diff >= 0 ? '+' : ''; // Плюс для положительных чисел
        const changeText = `${sign}${diff.toFixed(2)} (${sign}${percentDiff.toFixed(2)}%)`;

        // Выводим на экран
        document.getElementById('currency-rate').textContent = currentRate.toFixed(2);

        const changeElement = document.getElementById('currency-change');
        changeElement.textContent = changeText;

        // 👇 МЕНЯЕМ ЦВЕТ В ЗАВИСИМОСТИ ОТ НАПРАВЛЕНИЯ
        if (diff > 0) {
            changeElement.className = 'rate currency-up';
        } else if (diff < 0) {
            changeElement.className = 'rate currency-down';
        } else {
            changeElement.className = 'rate'; // Если 0, оставляем серым
        }

        // Пересчитываем крипту в рублях
        updateCryptoDisplay();

    } catch (error) {
        console.error("Ошибка загрузки валют:", error);
        document.getElementById('currency-rate').textContent = "Ошибка";
        document.getElementById('currency-change').textContent = "--";
    }
}

fetchCurrency(); // Запускаем при загрузке страницы
// Обновляем раз в час (3600000 мс). Больше не нужно, курсы ЦБ меняются раз в день.
setInterval(fetchCurrency, 3600000);

// ==========================================
// 6. СТАТУС СИСТЕМЫ (Имитация активности)
// ==========================================
function updateSystem() {
    // Генерируем случайный пинг от 12 до 45
    const randomPing = Math.floor(Math.random() * 34) + 12;
    document.getElementById('sys-ping').textContent = `${randomPing} ms`;

    // Меняем цвет уровня угрозы в зависимости от пинга
    const threatElement = document.getElementById('sys-threat');
    if (randomPing > 40) {
        threatElement.textContent = "HIGH";
        threatElement.style.color = "#ff0000"; // Красный при высоком пинге
    } else {
        threatElement.textContent = "LOW";
        threatElement.style.color = "#8b0000"; // Кровавый при низком
    }
}

// Запускаем сразу и обновляем каждые 2 секунды
updateSystem();
setInterval(updateSystem, 2000);
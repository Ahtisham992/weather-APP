const apiKey = "YOUR_API_Key"; // OpenWeather API Key
const geminiApiKey = "YOUR_API_Key"; // Gemini API Key

// DOM Elements
const getWeatherButton = document.getElementById("get-weather");
const cityInput = document.getElementById("city-input");
const cityNameDisplay = document.getElementById("city-name");
const temperatureDisplay = document.getElementById("temperature");
const humidityDisplay = document.getElementById("humidity");
const windSpeedDisplay = document.getElementById("wind-speed");
const conditionDisplay = document.getElementById("condition");
const weatherIcon = document.getElementById("weather-icon");
const weatherDataSection = document.getElementById("weather-data");
const forecastTableBody = document.getElementById("forecast-data");
const dashboardSection = document.getElementById("dashboard");
const tableSection = document.getElementById("table");
const dashboardButton = document.getElementById("dashboard-btn");
const tableButton = document.getElementById("table-btn");

let barChart, doughnutChart, lineChart; // Variables to hold chart instances

// Function to fetch current weather data
async function fetchWeatherData(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    const data = await response.json();

    if (response.ok) {
        displayWeatherData(data);
        fetchForecastData(city); // Fetch forecast data after getting current weather
    } else {
        alert("City not found!");
    }
}

function updateBackgroundImage(weatherCondition) {
    const backgroundElement = document.querySelector('#weather-data .weather-background');
    let imageUrl = '';

    switch (weatherCondition.toLowerCase()) {
        case 'clear':
            imageUrl = 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80';
            break;
        case 'clouds':
            imageUrl = 'https://images.unsplash.com/photo-1611928482473-7b27d24eab80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';
            break;
        case 'rain':
            imageUrl = 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';
            break;
        case 'thunderstorm':
            imageUrl = 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80';
            break;
        case 'snow':
            imageUrl = 'https://images.unsplash.com/photo-1547754980-3df97fed72a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';
            break;
        default:
            imageUrl = 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80';
    }

    backgroundElement.style.backgroundImage = `url(${imageUrl})`;
}


// Function to display current weather data
function displayWeatherData(data) {
    cityNameDisplay.innerText = `${data.name}, ${data.sys.country}`;
    temperatureDisplay.innerText = `Temperature: ${data.main.temp} °C`;
    humidityDisplay.innerText = `Humidity: ${data.main.humidity}%`;
    windSpeedDisplay.innerText = `Wind Speed: ${data.wind.speed} m/s`;
    conditionDisplay.innerText = `Condition: ${data.weather[0].description}`;
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    updateBackgroundImage(data.weather[0].main);
    weatherDataSection.classList.remove("hidden");
}

// Function to fetch 5-day weather forecast data
async function fetchForecastData(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
    const data = await response.json();

    if (response.ok) {
        displayForecastData(data.list);
        createCharts(data.list);
    } else {
        alert("Unable to fetch forecast data!");
    }
}

// Function to display forecast data in the table
function displayForecastData(forecastData) {
    forecastTableBody.innerHTML = ''; // Clear previous data

    const uniqueDays = [...new Set(forecastData.map(item => item.dt_txt.split(' ')[0]))];
    
    uniqueDays.forEach(date => {
        const dayData = forecastData.find(item => item.dt_txt.startsWith(date));

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${date}</td>
            <td>${dayData.main.temp.toFixed(1)}</td>
            <td>${dayData.weather[0].description}</td>
        `;
        forecastTableBody.appendChild(row);
    });
}

// Function to create charts based on forecast data
function createCharts(forecastData) {
    const labels = forecastData.map(item => item.dt_txt);
    const temperatures = forecastData.map(item => item.main.temp);

    // Bar Chart
    const ctxBar = document.getElementById("barChart").getContext("2d");
    if (barChart) barChart.destroy(); // Destroy previous instance
    barChart = new Chart(ctxBar, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°C)",
                data: temperatures,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Doughnut Chart
    const ctxDoughnut = document.getElementById("doughnutChart").getContext("2d");
    if (doughnutChart) doughnutChart.destroy();
    doughnutChart = new Chart(ctxDoughnut, {
        type: "doughnut",
        data: {
            labels: ["Temperature", "Humidity"],
            datasets: [{
                data: [Math.max(...temperatures), Math.min(...temperatures)],
                backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)"],
                borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
                borderWidth: 1
            }]
        }
    });

    // Line Chart
    const ctxLine = document.getElementById("lineChart").getContext("2d");
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(ctxLine, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°C)",
                data: temperatures,
                fill: false,
                borderColor: "rgba(75, 192, 192, 1)"
            }]
        }
    });
}

// Event listener for the Get Weather button
getWeatherButton.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        alert("Please enter a city name!");
    }
});

// Switch between dashboard and table sections
dashboardButton.addEventListener("click", () => {
    dashboardSection.classList.remove("hidden");
    tableSection.classList.add("hidden");
});

tableButton.addEventListener("click", () => {
    dashboardSection.classList.add("hidden");
    tableSection.classList.remove("hidden");
});

// Chatbot Section

// DOM Elements
const chatlog = document.getElementById('chatlog');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Function to handle sending messages
function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        appendMessage(`You: ${message}`);
        userInput.value = ''; // Clear input field

        // Check if the message is about weather
        if (message.toLowerCase().includes('weather')) {
            handleWeatherQuery(message);
        } else {
            // If not about weather, use Gemini API
            fetchGeminiChatResponse(message);
        }
    }
}

// Function to append messages to the chat log
function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatlog.appendChild(messageElement);
    chatlog.scrollTop = chatlog.scrollHeight; // Scroll to bottom
}

async function handleWeatherQuery(message) {
    // Extract city name from the message
    const cityMatch = message.match(/weather\s+(?:in|for|at)?\s+([a-zA-Z\s]+)/i);
    if (cityMatch && cityMatch[1]) {
        const city = cityMatch[1].trim();
        try {
            const weatherData = await fetchChatbotWeatherData(city);
            const response = generateWeatherResponse(weatherData);
            appendMessage(`Bot: ${response}`);
        } catch (error) {
            appendMessage(`Bot: I'm sorry, I couldn't fetch the weather information for ${city}. ${error.message}`);
        }
    } else {
        appendMessage("Bot: I'm sorry, I couldn't determine the city you're asking about. Can you please specify the city name?");
    }
}

async function fetchChatbotWeatherData(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    if (!response.ok) {
        throw new Error('City not found or API request failed');
    }
    return await response.json();
}

function generateWeatherResponse(data) {
    return `Here's the current weather in ${data.name}, ${data.sys.country}:
    Temperature: ${data.main.temp}°C
    Condition: ${data.weather[0].description}
    Humidity: ${data.main.humidity}%
    Wind Speed: ${data.wind.speed} m/s`;
}

async function fetchGeminiChatResponse(userMessage) {
    try {
        const response = await fetch(`URL for Gemini`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: userMessage
                            }
                        ]
                    }
                ]
            }),
        });

        console.log('Response Status:', response.status);

        const data = await response.json();
        console.log('Full API Response:', data);

        if (!response.ok) {
            appendMessage(`Bot: Error! ${data.error.message || `Response code ${response.status}`}`);
            return;
        }

        if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            appendMessage(`Bot: ${data.candidates[0].content.parts[0].text}`);
        } else {
            appendMessage("Bot: Sorry, I didn't understand that.");
        }

    } catch (error) {
        console.error('Error fetching response:', error);
        appendMessage("Bot: Unable to connect to the chatbot service.");
    }
}

// Add event listeners for the send button and input field
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

//menu buttons for different screen sizes
document.getElementById('menu-toggle').addEventListener('click', function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
});

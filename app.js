const catalog = {
  basil: {
    name: "바질", emoji: "🌿",
    tips: ["햇빛을 하루 5~6시간 받는 밝은 곳에서 키워요.", "겉흙이 마르면 화분 밑으로 물이 빠질 만큼 흠뻑 주세요.", "줄기 끝을 자주 따주면 옆으로 풍성하게 자라요."],
  },
  tomato: {
    name: "토마토", emoji: "🍅",
    tips: ["햇빛을 많이 받는 곳에서 키우고 흙이 마르지 않게 살펴봐요.", "물을 줄 때 잎보다 흙에 직접 주면 병충해 예방에 도움이 돼요.", "열매가 달리면 줄기가 쓰러지지 않게 지지대를 세워주세요."],
  },
  arugula: {
    name: "루꼴라", emoji: "🥬",
    tips: ["밝은 햇빛과 서늘한 환경을 좋아해요.", "흙 표면이 마르기 시작하면 물을 주세요.", "바깥쪽 잎부터 수확하면 계속 새잎이 자라요."],
  },
  sunflower: {
    name: "해바라기", emoji: "🌻",
    tips: ["하루 종일 햇빛이 잘 드는 장소가 좋아요.", "큰 키로 자라니 처음부터 넉넉한 화분을 준비해요.", "어린 모종일 때 흙이 마르지 않도록 물을 챙겨주세요."],
  },
  cucumber: {
    name: "오이", emoji: "🥒",
    tips: ["따뜻하고 햇빛이 잘 드는 곳에서 키워요.", "덩굴이 뻗을 수 있도록 지지대를 설치해 주세요.", "열매가 자라기 시작하면 물을 꾸준히 주는 게 중요해요."],
  },
  carrot: {
    name: "당근", emoji: "🥕",
    tips: ["뿌리가 곧게 자라도록 돌이 적고 깊은 흙을 준비해요.", "싹이 자라면 서로 너무 빽빽하지 않게 솎아주세요.", "흙이 마르지 않게 관리하되 물이 고이지 않게 해요."],
  },
  lemonbalm: {
    name: "레몬밤", emoji: "🍃",
    tips: ["밝은 반그늘에서도 잘 자라 초보자에게 좋아요.", "겉흙이 마른 것을 확인한 뒤 물을 주세요.", "잎을 수확하며 가지 끝을 잘라주면 새순이 풍성해져요."],
  },
  other: {
    name: "직접 입력", emoji: "🪴",
    tips: ["식물 종류에 맞는 햇빛과 물 주기를 먼저 확인해 보세요.", "물을 주기 전 흙의 상태를 손으로 살펴보면 좋아요.", "새잎과 줄기 변화를 천천히 관찰해 보세요."],
  },
};

const storageKey = "green-diary-data-v1";
const today = new Date();
const toLocalDate = (date) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(date);
const dateInputValue = toLocalDate(today);
const dateLabel = (value, options) => new Intl.DateTimeFormat("ko-KR", options).format(new Date(`${value}T12:00:00`));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

const ui = {
  todayLabel: document.querySelector("#today-label"),
  homeView: document.querySelector("#home-view"),
  plantsView: document.querySelector("#plants-view"),
  entryForm: document.querySelector("#entry-form"),
  noPlants: document.querySelector("#no-plants-message"),
  plantSelect: document.querySelector("#entry-plant"),
  entryDate: document.querySelector("#entry-date"),
  entryNote: document.querySelector("#entry-note"),
  entryMessage: document.querySelector("#entry-message"),
  photoInput: document.querySelector("#photo-input"),
  photoPreview: document.querySelector("#photo-preview"),
  photoPrompt: document.querySelector("#photo-prompt"),
  photoPicker: document.querySelector("#photo-picker"),
  removePhoto: document.querySelector("#remove-photo"),
  diaryView: document.querySelector("#diary-view"),
  calendarView: document.querySelector("#calendar-view"),
  entryList: document.querySelector("#entry-list"),
  journalEmpty: document.querySelector("#journal-empty"),
  calendarMonth: document.querySelector("#calendar-month"),
  calendarDays: document.querySelector("#calendar-days"),
  selectedDayRecords: document.querySelector("#selected-day-records"),
  plantList: document.querySelector("#plant-list"),
  plantTips: document.querySelector("#plant-tips"),
  catalogSelect: document.querySelector("#catalog-plant"),
  plantNickname: document.querySelector("#plant-nickname"),
  plantStartDate: document.querySelector("#plant-start-date"),
  plantMessage: document.querySelector("#plant-message"),
  dialogTip: document.querySelector("#dialog-tip"),
  plantDialog: document.querySelector("#plant-dialog"),
};

let state = { plants: [], entries: [] };
let photoData = "";
let selectedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDay = dateInputValue;

function loadState() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed.plants) || !Array.isArray(parsed.entries)) {
        throw new Error("저장된 식물 기록의 형식이 올바르지 않습니다.");
      }
      state = parsed;
    }
  } catch (error) {
    ui.entryMessage.textContent = "저장된 기록을 불러오지 못했어요. 브라우저 저장 공간을 확인해 주세요.";
    console.error("식물 기록 불러오기 실패:", error);
  }
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch (error) {
    const message = error instanceof DOMException && error.name === "QuotaExceededError"
      ? "저장 공간이 부족해요. 오래된 사진 기록을 정리한 뒤 다시 저장해 주세요."
      : "기록을 저장하지 못했어요. 브라우저 저장 설정을 확인해 주세요.";
    ui.entryMessage.textContent = message;
    ui.plantMessage.textContent = message;
    console.error("식물 기록 저장 실패:", error);
    return false;
  }
}

function plantName(plant) {
  return plant.nickname || catalog[plant.kind]?.name || "이름 없는 식물";
}

function renderPlantSelects() {
  const previous = ui.plantSelect.value;
  const options = state.plants.map((plant) =>
    `<option value="${escapeHtml(plant.id)}">${escapeHtml(plant.emoji)} ${escapeHtml(plantName(plant))}</option>`,
  ).join("");
  ui.plantSelect.innerHTML = `<option value="">식물을 선택해 주세요</option>${options}`;
  ui.plantSelect.value = state.plants.length === 1 ? state.plants[0].id : state.plants.some((plant) => plant.id === previous) ? previous : "";
  ui.entryForm.hidden = state.plants.length === 0;
  ui.noPlants.hidden = state.plants.length > 0;
}

function renderEntryCard(entry) {
  const plant = state.plants.find((item) => item.id === entry.plantId);
  const image = entry.photo
    ? `<img src="${entry.photo}" alt="${escapeHtml(plant ? plantName(plant) : "식물")} 사진">`
    : `<span aria-hidden="true">${escapeHtml(plant?.emoji || "🌱")}</span>`;
  return `<article class="entry-card">
    <div class="entry-photo">${image}</div>
    <div class="entry-content">
      <div class="entry-meta"><strong>${escapeHtml(plant ? plantName(plant) : "등록한 식물")}</strong><span>·</span><time>${escapeHtml(dateLabel(entry.date, { month: "long", day: "numeric" }))}</time></div>
      <p>${escapeHtml(entry.note || "오늘의 모습을 사진으로 남겼어요.")}</p>
      <small>${plant ? escapeHtml(dayBadge(plant, entry.date)) : ""}${observations[entry.observation] ? ` · ${escapeHtml(observations[entry.observation].label)}` : Number.isFinite(entry.height) ? ` · 키 ${entry.height} cm` : ""}</small>
    </div>
  </article>`;
}

function renderDiary() {
  const entries = [...state.entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  ui.entryList.innerHTML = entries.map(renderEntryCard).join("");
  ui.journalEmpty.hidden = entries.length > 0;
}

function renderCalendar() {
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  ui.calendarMonth.textContent = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(selectedMonth);
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const counts = new Map();
  state.entries.forEach((entry) => counts.set(entry.date, (counts.get(entry.date) || 0) + 1));
  const cells = [];
  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push('<button class="calendar-day" type="button" disabled aria-hidden="true"></button>');
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const value = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const classes = [
      "calendar-day",
      counts.has(value) ? "has-entry" : "",
      value === selectedDay ? "is-selected" : "",
      value === dateInputValue ? "is-today" : "",
    ].filter(Boolean).join(" ");
    cells.push(`<button class="${classes}" type="button" data-date="${value}" aria-label="${month + 1}월 ${day}일${counts.has(value) ? `, 기록 ${counts.get(value)}개` : ""}" aria-pressed="${value === selectedDay}">${day}</button>`);
  }
  ui.calendarDays.innerHTML = cells.join("");
  renderSelectedDay();
}

function renderSelectedDay() {
  const records = state.entries.filter((entry) => entry.date === selectedDay)
    .sort((a, b) => b.createdAt - a.createdAt);
  ui.selectedDayRecords.innerHTML = `<p>${escapeHtml(dateLabel(selectedDay, { month: "long", day: "numeric", weekday: "long" }))}의 기록</p>${
    records.length ? records.map(renderEntryCard).join("") : '<span class="privacy-hint">이날은 아직 기록이 없어요.</span>'
  }`;
}

function renderPlants() {
  if (!state.plants.length) {
    ui.plantList.innerHTML = '<div class="plant-empty">아직 함께하는 식물이 없어요.<br>새 식물을 등록해 첫 친구를 만들어 주세요.</div>';
    ui.plantTips.innerHTML = "";
    return;
  }
  ui.plantList.innerHTML = state.plants.map((plant) => {
    const count = state.entries.filter((entry) => entry.plantId === plant.id).length;
    return `<article class="plant-card">
      <span class="plant-emoji" aria-hidden="true">${escapeHtml(plant.emoji)}</span>
      <div><h3>${escapeHtml(plantName(plant))}</h3><p>${escapeHtml(catalog[plant.kind]?.name || "식물")} · ${escapeHtml(dateLabel(plant.startDate, { year: "numeric", month: "short", day: "numeric" }))}부터 · 기록 ${count}개</p></div>
      <button class="remove-plant" type="button" data-remove-plant="${escapeHtml(plant.id)}" aria-label="${escapeHtml(plantName(plant))} 삭제">삭제</button>
    </article>`;
  }).join("");
  const usedTips = [...new Set(state.plants.map((plant) => plant.kind))];
  ui.plantTips.innerHTML = usedTips.map((kind) => {
    const plant = catalog[kind] || catalog.other;
    return `<article class="tip-detail"><strong>${escapeHtml(plant.emoji)} ${escapeHtml(plant.name)} 키우기</strong><ul>${plant.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul></article>`;
  }).join("");
}

function renderAll() {
  renderPlantSelects();
  renderDiary();
  renderCalendar();
  renderPlants();
  renderGarden();
}

function setPage(page) {
  const isHome = page === "home";
  ui.homeView.hidden = !isHome;
  ui.plantsView.hidden = isHome;
  document.querySelectorAll(".nav-button").forEach((button) => {
    const active = button.dataset.page === page;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setJournalView(view) {
  const isDiary = view === "diary";
  ui.diaryView.hidden = !isDiary;
  ui.calendarView.hidden = isDiary;
  document.querySelectorAll(".view-button").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function openPlantDialog() {
  ui.plantMessage.textContent = "";
  ui.plantNickname.value = "";
  ui.plantStartDate.value = dateInputValue;
  updatePlantDialogTip();
  ui.plantDialog.showModal();
}

function updatePlantDialogTip() {
  const plant = catalog[ui.catalogSelect.value] || catalog.basil;
  ui.dialogTip.textContent = `작은 팁: ${plant.tips[0]}`;
}

function clearPhoto() {
  photoData = "";
  ui.photoInput.value = "";
  ui.photoPreview.removeAttribute("src");
  ui.photoPreview.hidden = true;
  ui.photoPrompt.hidden = false;
  ui.removePhoto.hidden = true;
  ui.photoPicker.classList.remove("has-photo");
}

async function resizePhoto(file) {
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일을 선택해 주세요.");
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1000;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("사진을 처리할 수 없어요. 다른 사진을 선택해 주세요.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.78);
}

let weather = null;
let weatherLoading = false;
const dayDifference = (start, end = toLocalDate(new Date())) => Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000);
function dayBadge(plant, date) {
  const days = dayDifference(plant.startDate, date);
  return Number.isFinite(days) ? days < 0 ? `D −${Math.abs(days)} · 심기 전` : `D +${days}` : "심은 날짜 확인 필요";
}
const observations = {
  sprout: { label: "새싹이 올라왔어요", tip: "새싹이 올라왔네요! 흙을 헤집지 말고 부드럽게 물을 주며 밝은 곳에서 관찰해 주세요." },
  leaves: { label: "새잎이 났어요", tip: "새잎이 자라고 있어요! 잎 색과 줄기 변화를 사진으로 남겨보세요. 갑자기 강한 직사광선에 옮기지는 마세요." },
  flower: { label: "꽃이 피었어요", tip: "꽃이 피었네요! 물은 꽃보다 흙에 주고, 식물 종류에 맞는 개화기 관리를 확인해 주세요." },
  fruit: { label: "열매가 생겼어요", tip: "열매가 생겼네요! 가지가 처지면 지지대를 살펴보고, 흙이 지나치게 말랐다 젖었다 하지 않도록 확인해 주세요." },
  same: { label: "아직 비슷해요", tip: "겉으로 비슷해도 천천히 자랄 수 있어요. 물이나 비료를 갑자기 늘리기보다 며칠 간격의 사진을 비교해 보세요." },
  wilting: { label: "잎이 처지거나 노래졌어요", tip: "잎이 처진다고 바로 물을 더 주지는 마세요. 먼저 흙의 건조·과습, 배수 구멍, 잎 뒷면의 벌레를 확인해 주세요." },
};
function latestObservation(plant) {
  return state.entries.filter((entry) => entry.plantId === plant.id && observations[entry.observation] && entry.date <= toLocalDate(new Date()))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)[0];
}
function growthSummary(plant) {
  const last = latestObservation(plant);
  return last ? `${last.date.slice(5).replace("-", "/")} 관찰 · ${observations[last.observation].label}` : "사진과 눈에 보이는 변화로 성장 기록하기";
}
function careTips(plant) {
  const tips = [];
  const days = dayDifference(plant.startDate);
  if (days < 0) return ["아직 심기 전이에요. 화분 배수 구멍과 종류에 맞는 흙을 준비해 주세요.", (catalog[plant.kind] || catalog.other).tips[0]];
  if (!weather) tips.push("서울 날씨를 확인하지 못했어요. 겉흙을 만져보고 마른 경우에만 물을 주세요.");
  else {
    if (weather.temp >= 28 || weather.humidity < 40) tips.push("덥거나 건조한 날이에요. 흙을 평소보다 자주 확인하고 마르면 흠뻑 물을 주세요. 받침의 고인 물은 버려요.");
    else if (weather.rain > 0 || weather.humidity >= 75) tips.push("비가 오거나 습한 날이에요. 물을 더 주기 전에 흙이 말랐는지 확인해 과습을 피해주세요.");
    else tips.push((catalog[plant.kind] || catalog.other).tips[1]);
    if (weather.temp < 12) tips.push("바깥 공기가 차가워요. 창가의 찬바람을 피하고 환기는 식물을 창문에서 옮긴 뒤 짧게 해주세요.");
    else if (weather.wind >= 25 || weather.code >= 95) tips.push("바람이 강하거나 뇌우가 있는 날이에요. 창문을 크게 열기보다 실내 공기를 부드럽게 순환시켜 주세요.");
    else tips.push("창문을 잠깐 열어 공기를 순환시켜 주세요. 빗물이 들이치거나 미세먼지가 나쁘면 실내 공기 순환으로 대신해요.");
  }
  tips.push(days < 14 ? "심은 지 얼마 안 됐어요. 새싹과 잎 변화를 살펴보고 흙을 세게 헤집지 마세요." : (catalog[plant.kind] || catalog.other).tips[2]);
  const current = ui.plantSelect.value === plant.id ? document.querySelector("#entry-observation").value : "";
  if (observations[current]) tips.push(observations[current].tip);
  else tips.push("오늘 눈에 보이는 변화를 선택하면 그에 맞는 팁을 보여드려요. 선택하지 않아도 기록할 수 있어요.");
  return tips;
}
function renderGarden() {
  document.querySelector("#garden-status").hidden = false;
  document.querySelector("#plant-day-list").innerHTML = state.plants.length ? state.plants.map((plant) => `<button type="button" class="plant-day-card ${ui.plantSelect.value === plant.id ? "is-selected" : ""}" data-select-plant="${escapeHtml(plant.id)}"><span class="pixel-sprout" aria-hidden="true"></span><span><strong>${escapeHtml(plantName(plant))}</strong><small>${escapeHtml(growthSummary(plant))}</small></span><b>${escapeHtml(dayBadge(plant))}</b></button>`).join("") : '<p class="garden-empty">첫 식물을 심고 나만의 정원을 시작해요!</p>';
  const plant = state.plants.find((item) => item.id === ui.plantSelect.value);
  document.querySelector("#daily-guidance").hidden = !state.plants.length;
  document.querySelector("#guidance-stage").textContent = plant ? `${plantName(plant)} · ${dayBadge(plant)}` : "식물을 선택해 주세요";
  document.querySelector("#guidance-list").innerHTML = plant ? careTips(plant).map((tip) => `<li>${escapeHtml(tip)}</li>`).join("") : "<li>위쪽 식물 카드를 누르거나 기록할 식물을 선택하면 맞춤 팁이 보여요.</li>";
  document.querySelector("#record-weather-tag").textContent = weather ? `서울 ${weather.temp}°C · TIP` : "TODAY’S QUEST";
}
async function loadWeather() {
  if (weatherLoading) return;
  weatherLoading = true;
  const refresh = document.querySelector("#weather-refresh");
  refresh.disabled = true;
  document.querySelector("#weather-summary").textContent = "서울 날씨 확인 중…";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FSeoul&forecast_days=1", { signal: controller.signal });
    if (!response.ok) throw new Error("Weather unavailable");
    const data = await response.json();
    const current = data.current;
    if (!current || data.daily?.time?.[0] !== toLocalDate(new Date()) || ![current.temperature_2m, current.relative_humidity_2m, current.weather_code, current.wind_speed_10m, data.daily.precipitation_sum[0], data.daily.temperature_2m_min[0], data.daily.temperature_2m_max[0]].every(Number.isFinite)) throw new Error("Invalid weather");
    weather = { temp: current.temperature_2m, humidity: current.relative_humidity_2m, wind: current.wind_speed_10m, code: current.weather_code, rain: data.daily.precipitation_sum[0] };
    const description = weather.code === 0 ? "맑음" : weather.code <= 3 ? "구름" : weather.code <= 48 ? "안개" : weather.code >= 95 ? "뇌우" : weather.code >= 71 && weather.code <= 77 || weather.code >= 85 && weather.code <= 86 ? "눈" : "비";
    document.querySelector("#weather-icon").textContent = description === "맑음" ? "☀" : "☁";
    document.querySelector("#weather-summary").textContent = `서울 · ${description} · ${weather.temp}°C`;
    document.querySelector("#weather-details").textContent = `최저 ${data.daily.temperature_2m_min[0]}° / 최고 ${data.daily.temperature_2m_max[0]}° · 습도 ${weather.humidity}% · 오늘 예상 강수 ${weather.rain} mm · ${current.time.slice(11, 16)} 기준`;
  } catch {
    weather = null;
    document.querySelector("#weather-summary").textContent = "서울 날씨를 불러오지 못했어요";
    document.querySelector("#weather-details").textContent = "인터넷 연결을 확인하고 ↻ 버튼을 눌러주세요. 일반 관리 팁을 표시해요.";
  } finally {
    clearTimeout(timeout);
    weatherLoading = false;
    refresh.disabled = false;
    renderGarden();
  }
}
ui.plantSelect.addEventListener("change", () => {
  document.querySelector("#entry-observation").value = "";
  renderGarden();
});
document.querySelector("#entry-observation").addEventListener("change", renderGarden);
document.querySelector("#plant-day-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-select-plant]");
  if (button) {
    if (ui.plantSelect.value !== button.dataset.selectPlant) document.querySelector("#entry-observation").value = "";
    ui.plantSelect.value = button.dataset.selectPlant;
    renderGarden();
  }
});
document.querySelector("#weather-refresh").addEventListener("click", loadWeather);
document.addEventListener("visibilitychange", () => { if (!document.hidden) { renderGarden(); loadWeather(); } });
ui.todayLabel.textContent = dateLabel(dateInputValue, { month: "long", day: "numeric", weekday: "short" });
ui.entryDate.value = dateInputValue;
ui.plantStartDate.value = dateInputValue;
ui.catalogSelect.innerHTML = Object.entries(catalog).map(([key, plant]) =>
  `<option value="${escapeHtml(key)}">${escapeHtml(plant.emoji)} ${escapeHtml(plant.name)}</option>`,
).join("");
loadState();
renderAll();
loadWeather();

document.querySelectorAll("[data-page]").forEach((button) =>
  button.addEventListener("click", () => setPage(button.dataset.page)),
);
document.querySelectorAll("[data-view]").forEach((button) =>
  button.addEventListener("click", () => setJournalView(button.dataset.view)),
);
document.querySelectorAll("[data-open-plant-form]").forEach((button) =>
  button.addEventListener("click", openPlantDialog),
);
document.querySelector("#close-dialog").addEventListener("click", () => ui.plantDialog.close());
ui.catalogSelect.addEventListener("change", updatePlantDialogTip);

ui.plantDialog.addEventListener("click", (event) => {
  if (event.target === ui.plantDialog) ui.plantDialog.close();
});

document.querySelector("#plant-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const kind = ui.catalogSelect.value;
  const plant = catalog[kind];
  if (!plant || !ui.plantStartDate.value) {
    ui.plantMessage.textContent = "식물과 심은 날짜를 확인해 주세요.";
    return;
  }
  state.plants.push({
    id: crypto.randomUUID(),
    kind,
    emoji: plant.emoji,
    nickname: ui.plantNickname.value.trim(),
    startDate: ui.plantStartDate.value,
  });
  if (!saveState()) {
    state.plants.pop();
    return;
  }
  renderAll();
  ui.plantDialog.close();
});

ui.plantList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-plant]");
  if (!button) return;
  const plant = state.plants.find((item) => item.id === button.dataset.removePlant);
  if (!plant || !window.confirm(`${plantName(plant)}와 관련된 기록도 함께 삭제할까요?`)) return;
  const previousState = state;
  state = {
    plants: state.plants.filter((item) => item.id !== plant.id),
    entries: state.entries.filter((entry) => entry.plantId !== plant.id),
  };
  if (!saveState()) state = previousState;
  renderAll();
});

ui.photoInput.addEventListener("change", async () => {
  const file = ui.photoInput.files?.[0];
  if (!file) return;
  ui.entryMessage.textContent = "";
  try {
    photoData = await resizePhoto(file);
    ui.photoPreview.src = photoData;
    ui.photoPreview.hidden = false;
    ui.photoPrompt.hidden = true;
    ui.removePhoto.hidden = false;
    ui.photoPicker.classList.add("has-photo");
  } catch (error) {
    ui.entryMessage.textContent = error instanceof Error ? error.message : "사진을 불러오지 못했어요.";
    clearPhoto();
  }
});
ui.removePhoto.addEventListener("click", clearPhoto);

ui.entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!ui.plantSelect.value || !ui.entryDate.value) {
    ui.entryMessage.textContent = "식물과 기록 날짜를 선택해 주세요.";
    return;
  }
  const entry = {
    id: crypto.randomUUID(),
    plantId: ui.plantSelect.value,
    date: ui.entryDate.value,
    note: ui.entryNote.value.trim(),
    photo: photoData,
    createdAt: Date.now(),
    observation: document.querySelector("#entry-observation").value,
  };
  state.entries.push(entry);
  if (!saveState()) {
    state.entries.pop();
    return;
  }
  selectedDay = entry.date;
  selectedMonth = new Date(`${entry.date}T12:00:00`);
  ui.entryNote.value = "";
  document.querySelector("#entry-observation").value = "";
  ui.entryDate.value = dateInputValue;
  clearPhoto();
  ui.entryMessage.textContent = "오늘의 초록을 일기에 남겼어요.";
  renderAll();
});

document.querySelector(".calendar-heading").addEventListener("click", (event) => {
  const button = event.target.closest(".month-button");
  if (!button) return;
  selectedMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + (button.id === "next-month" ? 1 : -1), 1);
  renderCalendar();
});
ui.calendarDays.addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (!button) return;
  selectedDay = button.dataset.date;
  renderCalendar();
});

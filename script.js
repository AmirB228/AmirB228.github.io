var wordsByTopic = {
  "Theory of Mind": [
    "Theory of Mind",
    "False-Belief Task",
    "Second-Order ToM"
  ],
  "Bayesian Statistics": [
    "Bayesian Inference",
    "Prior",
    "Likelihood",
    "Posterior",
    "Marginal Likelihood"
  ],
  "Sign Language": [
    "Gloss",
    "Homesign",
    "Nicaraguan Sign Language",
    "Emergent Grammar",
    "Spatial Loci",
    "Classifier Construction",
    "Role-Shift"
  ],
  "Research Methods": [
    "Annotation",
    "Transcription",
    "Coding",
    "Nonmanual Markers",
    "Annotation Schema",
    "Tier",
    "Inter-Annotator Agreement"
  ],
  "Language Acquisition": [
    "Iconicity",
    "Bootstrapping Hypothesis",
    "Form–Meaning Mapping"
  ],
  "Ethics": [
    "Deaf-Led Research",
    "Systemic Bias",
    "Naturalistic Data",
    "Consent Form",
    "Cultural Sensitivity",
    "Data Governance"
  ],
  "Tools & Software": [
    "ELAN",
    "ANVIL",
    "SignLex",
    "SemLex",
    "SignStream",
    "HamNoSys",
    "MediaPipe",
    "OpenPose"
  ],
  "Computer Vision": [
    "RGB-D Sensors",
    "3D Hand-Pose Estimation",
    "Skeleton Tracking"
  ],
  "Machine Learning": [
    "Convolutional Neural Network",
    "Recurrent Neural Network",
    "LSTM",
    "Transformer",
    "Hidden Markov Model",
    "Conditional Random Field",
    "Dynamic Time Warping",
    "Data Augmentation",
    "Domain Adaptation",
    "Multimodal Fusion",
    "Transfer Learning"
  ],
  "Evaluation Metrics": [
    "Word Error Rate",
    "BLEU",
    "CIDEr"
  ],
  "Researchers": [
    "Malihe Alikhani",
    "Annemarie Kocab",
    "Saki Imai",
    "Alex Lu",
    "Josh Tenenbaum",
    "Noah Goodman",
    "Tom Griffiths",
    "Simon Baron-Cohen",
    "Uta Frith",
    "Josef Perner",
    "Henry Wellman",
    "Ann Senghas",
    "Susan Goldin-Meadow",
    "Ted Supalla",
    "Carla Mathur",
    "Shinichi Imai",
    "Peggy Speidel",
    "Pauline Gardaz",
    "Oscar Koller",
    "Hamed R. Tavakoli",
    "Richard Bowden",
    "Barbara Plank",
    "Geoffrey Hinton",
    "Yann LeCun",
    "Andrew Ng",
    "Ashish Vaswani",
    "Ilya Sutskever",
    "Martin Sundermeyer",
    "Zhe Cao",
    "Martin R. Leahy",
    "Michael Black",
    "Timnit Gebru",
    "Joy Buolamwini",
    "Kate Crawford",
    "Latanya Sweeney",
    "Mark Aronoff",
    "Elissa Newport",
    "Kathryn Campbell-Kibler",
    "Susan Fussell"
  ]
};

// Generate flat array from the wordsByTopic object
var words = [];
for (let topic in wordsByTopic) {
  words = words.concat(wordsByTopic[topic]);
}

const mappings = {};
'abcdefghijklmnopqrstuvwxyz'.split('').forEach(char => {
  const path = `asl_images/${char}.jpeg`;
  mappings[char] = path;
  mappings[char.toUpperCase()] = path;
});

let currentWord = '';
let usedWords = [];
let delay = 1000;
let currentTimeout; // Variable to store the timeout
let selectedTopics = Object.keys(wordsByTopic); // all topics active

var incorrectGuesses = 0;

function populateTopicDropdown() {
  const dropdown = document.getElementById('topicDropdown');
  dropdown.innerHTML = ''; // Clear existing options

  for (let topic in wordsByTopic) {
    const option = document.createElement('label');
    option.className = 'topic-option selected'; // All selected by default
    option.setAttribute('data-topic', topic);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = topic;
    checkbox.checked = true;

    const span = document.createElement('span');
    span.textContent = topic;

    checkbox.addEventListener('change', function() {
      if (this.checked) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
      updateSelectedTopics();
    });

    option.appendChild(checkbox);
    option.appendChild(span);
    dropdown.appendChild(option);
  }
}

function toggleTopicDropdown() {
  const dropdown = document.getElementById('topicDropdown');
  const button   = document.querySelector('.topic-button');
  dropdown.classList.toggle('show');
  button.classList.toggle('open');
}

function updateSelectedTopics() {
  selectedTopics = [];
  document.querySelectorAll('.topic-option input[type="checkbox"]').forEach(cb => {
    if (cb.checked) selectedTopics.push(cb.value);
  });

  // If none checked, automatically re-select all to avoid empty set
  if (selectedTopics.length === 0) {
    document.querySelectorAll('.topic-option').forEach(option => {
      const cb = option.querySelector('input[type="checkbox"]');
      cb.checked = true;
      option.classList.add('selected');
      selectedTopics.push(cb.value);
    });
  }

  usedWords = [];
  nextWord();
}

function getAvailableWords() {
  let availableWords = [];
  selectedTopics.forEach(topic => {
    availableWords = availableWords.concat(wordsByTopic[topic]);
  });
  return availableWords;
}

function preloadImages() {
  for (let key in mappings) {
    const img = new Image();
    img.src = mappings[key];
  }
}

function getRandomWord() {
  const availableWords = getAvailableWords();
  
  if (usedWords.length >= availableWords.length) {
    usedWords = [];
  }
  
  let word;
  do {
    word = availableWords[Math.floor(Math.random() * availableWords.length)];
  } while (usedWords.includes(word));
  
  usedWords.push(word);
  return word;
}

function startGame(p) {
  if (p == undefined || p == "") {
    currentWord = getRandomWord();
  } else {
    currentWord = p
  }
  displayImages(currentWord);
}

function displayImages(word) {
  const imageDisplay = document.getElementById('imageDisplay');
  let currentPos = 0;
  let lastValidImage = 'placeholder.jpg';

  function updateImage(substring) {
    if (mappings[substring]) {
      imageDisplay.style.backgroundImage = `url('${mappings[substring]}')`;
      lastValidImage = mappings[substring];
    } else {
      imageDisplay.style.backgroundImage = `url('${lastValidImage}')`;
    }
    currentTimeout = setTimeout(() => updateImageQueue(), delay);
  }

  function updateImageQueue() {
    if (currentPos >= word.length) return;

    let maxMatchLength = 0;
    let maxMatch = '';
    for (let key in mappings) {
      if (word.substr(currentPos, key.length) === key && key.length > maxMatchLength) {
        maxMatch = key;
        maxMatchLength = key.length;
      }
    }

    if (maxMatch) {
      updateImage(maxMatch);
      currentPos += maxMatchLength;
    } else {
      updateImage(word[currentPos]);
      currentPos++;
    }
  }

  // Clear any ongoing timeout to stop previous fingerspelling
  clearTimeout(currentTimeout);
  updateImageQueue();
}

function updateDelay() {
  const delayInput = document.getElementById('inputDelay').value;
  delay = parseInt(delayInput);
  if (isNaN(delay) || delay < 0) {
    alert("Please enter a valid positive number for the delay.");
    delay = 400; // Reset to default if invalid
    document.getElementById('inputDelay').value = 400; // Reset input value
  }
  replay(); // Replay current word with new delay
}

function checkGuess() {
  const guess = document.getElementById('inputGuess').value;
  const feedback = document.getElementById('feedback');
  if (guess.toLowerCase() === currentWord.toLowerCase()) {
    feedback.textContent = 'Correct!';
    feedback.style.color = 'green';
    incorrectGuesses = 0;
  } else {
    feedback.textContent = 'Try Again!';
    feedback.style.color = 'red';
    incorrectGuesses++;
    if (incorrectGuesses == 3){
      var showWordButton = document.createElement('button')
      document.getElementById('controls').appendChild(showWordButton);
      document.getElementById('controls').appendChild(document.getElementById('editWordLists'));
      showWordButton.id = 'showWord'
      showWordButton.textContent = 'Show Word';
      showWordButton.style.backgroundColor = '#ff6363';
      showWordButton.addEventListener('click', () => {
        alert('The word is: ' + currentWord);
        nextWord();
      });
    }
  }
}

function replay() {
  displayImages(currentWord);
}

function nextWord() {
  incorrectGuesses = 0;
  var showWordButton = document.getElementById('showWord');
  if (showWordButton){
    showWordButton.remove();
  }
  startGame();
  document.getElementById('inputGuess').value = '';
  document.getElementById('feedback').textContent = '';
}

const ADMIN_PASSWORD = 'letmein123'; // Hard-coded admin password – change as desired

// ---------------- Modal Helpers ---------------- //
function openEditModal() {
  populateModalSelect();
  document.getElementById('editModal').classList.add('show');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('show');
}

let modalSelectedTopic = null;

function populateModalSelect() {
  const select = document.getElementById('modalTopicSelect');
  select.innerHTML = '';
  Object.keys(wordsByTopic).forEach(topic => {
    const opt = document.createElement('option');
    opt.value = topic;
    opt.textContent = topic;
    select.appendChild(opt);
  });
  modalSelectedTopic = select.value;
  populateModalTextarea();
}

function populateModalTextarea() {
  const select = document.getElementById('modalTopicSelect');
  modalSelectedTopic = select.value;
  const ta = document.getElementById('modalTopicWords');
  ta.value = (wordsByTopic[modalSelectedTopic] || []).join('\n');
}

function addModalTopic() {
  const newTopic = prompt('Enter new topic name');
  if (!newTopic) return;
  if (wordsByTopic[newTopic]) {
    alert('Topic already exists.');
    return;
  }
  wordsByTopic[newTopic] = [];
  populateModalSelect();
  document.getElementById('modalTopicSelect').value = newTopic;
  populateModalTextarea();
}

function removeModalTopic() {
  if (!modalSelectedTopic) return;
  if (!confirm(`Delete topic "${modalSelectedTopic}"? This cannot be undone.`)) return;
  delete wordsByTopic[modalSelectedTopic];
  populateModalSelect();
  populateTopicDropdown(); // Refresh game dropdown
}

function submitModalChanges() {
  const ta = document.getElementById('modalTopicWords');
  const newWords = ta.value.split('\n').map(w => w.trim()).filter(Boolean);
  wordsByTopic[modalSelectedTopic] = newWords;

  const pw = prompt('Enter admin password');
  if (pw !== ADMIN_PASSWORD) {
    alert('Incorrect password.');
    return;
  }

  fetch('/api/words', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wordsByTopic)
  }).then(r => {
    if (!r.ok) throw new Error('Failed');
    alert('Saved!');
    closeEditModal();
    populateTopicDropdown(); // Rebuild dropdowns with new data
  }).catch(err => {
    console.error(err);
    alert('Save failed.');
  });
}

window.onload = function() {
  preloadImages();
  document.getElementById('inputDelay').value = 400;
  delay = 400; // Initialize the delay variable to 400 ms

  // Try to load shared words from backend before starting
  fetch('/api/words')
    .then(r => r.ok ? r.json() : null)
    .then(json => {
      if (json && typeof json === 'object') {
        wordsByTopic = json;
        selectedTopics = Object.keys(wordsByTopic);
      }
    })
    .catch(err => console.warn('Using default word list – could not load from backend.', err))
    .finally(() => {
      var urlPath = window.location.pathname.substring(1, window.location.pathname.length);
      console.log('Current URL path:', urlPath);
      populateTopicDropdown();
      startGame(urlPath);
    });

  // Close the dropdown if user clicks outside (existing listener)
  window.addEventListener('click', function(event) {
    const dropdown = document.getElementById('topicDropdown');
    const button = document.querySelector('.topic-button');
    if (!button.contains(event.target) && !dropdown.contains(event.target) && dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
      button.classList.remove('open');
    }
  });
};

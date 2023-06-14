const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('#start_btn'),
    // sound_btn: document.querySelector('#toggle_sound'),
    // music_btn: document.querySelector('#toggle_music'),
    // tick_btn: document.querySelector('#toggle_tick'),
    win: document.querySelector('.win'),
    title: document.querySelector("#gameTitle")
}

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}



let gameTitle = "Chaos Recall: Memory Aesthetics";
let isDistractionEnabled = true;
let timeLimit = 300;
let minimumInterval = 0.3; // in seconds, minimum spawning interval time
let initialPopUpInterval  = 5; // in seconds
let startPopupTime = 30; //pop up begin spawning after a 30-second pass
let stopPopupTime = 30; //stop spawning 30 seconds before the end
let videoWidth = 640; 
let videoHeight = 360; 
let intervalIntense = 3; // it will multiply the intense in the middle of the game 2x. change as your need



initialPopUpInterval *= 1000;
minimumInterval *= 1000;
selectors.title.textContent = gameTitle;



const shuffle = array => {
    const clonedArray = [...array]

    for (let index = clonedArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1))
        const original = clonedArray[index]

        clonedArray[index] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}

const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = []

    for (let index = 0; index < items; index++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)
        
        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}

const generateGame = () => {
  const dimensions = selectors.board.getAttribute('data-dimension');

  if (dimensions % 2 !== 0) {
    throw new Error("The dimension of the board must be an even number.");
  }

  const totalCards = dimensions * dimensions;
  const numPairs = totalCards / 2;
  const numImages = Math.min(numPairs, 23);
  const baseURL = location.origin;
  const imagePaths = Array.from({ length: numImages }, (_, index) => `./assets/Artwork/${index + 1}.jpg`);
  const items = shuffle([...imagePaths, ...imagePaths]);
  const cards = `
      <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
          ${items.map(item => `
              <div class="card">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${item}" alt="Image" style="width: 100%; height: 100%;">
                  </div>
              </div>
          `).join('')}
     </div>
  `;

  const parser = new DOMParser().parseFromString(cards, 'text/html');
  selectors.board.replaceWith(parser.querySelector('.board'));
}

const startGame = () => {
  startDistractionPopups();
  state.gameStarted = true;
  selectors.start.classList.add('disabled');
  
  // Start background music after 60 seconds
  setTimeout(() => {
    startBackgroundMusic();
  }, 60000);
  
  state.loop = setInterval(() => {
    state.totalTime++;
    
    selectors.moves.innerText = `${state.totalFlips} moves`;
    selectors.timer.innerText = `time remaining: ${timeLimit - state.totalTime} sec`;
    
    if (state.totalTime >= timeLimit - 30) {
      stopBackgroundMusic(); // Stop background music 30 seconds before game end
    }
    
    if (state.totalTime >= timeLimit) {
      endGame(); // Call the function to end the game when the time limit is reached
    }
  }, 1000);
};

const startDistractionPopups = () => {
  let popUpInterval = initialPopUpInterval
  if (state.totalTime > startPopupTime) {
    //console.log('hi after 30');
    //console.log(state.totalTime);
    const timeElapsed = state.totalTime;
    const remainingTime = timeLimit - timeElapsed;

    if (remainingTime <= stopPopupTime) {
      console.log('hi before remaining 30');
      console.log(state.totalTime);
      return;
    }
    distractionPopup();

    if (remainingTime > 60) {
      const progressPercentage = (1 - (remainingTime - 60) / (timeLimit - 60));
      let intervalDecrease = Math.floor(progressPercentage * (initialPopUpInterval - 2000));
      intervalDecrease = Math.min(intervalDecrease, initialPopUpInterval - 2000);

      // Adjust the intensity in the middle of the game
      if (progressPercentage >= 0.5) {
        const intensifiedProgress = (progressPercentage - 0.5) * intervalIntense + 0.5;
        intervalDecrease *= intensifiedProgress;
      }

      popUpInterval = Math.max(initialPopUpInterval - intervalDecrease, minimumInterval);
      console.log('game progress: '+progressPercentage.toFixed(3) + "%")
    }

    console.log('next pop-up in: '+(popUpInterval/1000).toFixed(2)+' sec')
  }
  setTimeout(startDistractionPopups, popUpInterval );
};

const distractionPopup = () => {
  const randomTime = Math.floor(Math.random() * 2000) + 1000; // Random time delay 

  if (!isDistractionEnabled) {
    setTimeout(distractionPopup, randomTime);
    return; // Return early if distractions are disabled
  }

  setTimeout(() => {
    fetch('https://meme-api.com/gimme')
      .then(response => response.json())
      .then(data => {
        const distractionType = Math.random() < 0.5 ? 'image' : 'video';

        if (distractionType === 'image') {
          const distractionImageURL = data.url;
          displayImage(distractionImageURL);
        } else {
          fetchVideoContent();
        }
      })
      .catch(error => {
        console.error('Error fetching meme image:', error);
      });

   // distractionPopup(); // Schedule the next distraction
  }, randomTime);
};

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0
}

const removeModals = () => {
  const modals = document.querySelectorAll('.modal');
  const backdrops = document.querySelectorAll('.modal-backdrop');

  modals.forEach(modal => modal.remove());
  backdrops.forEach(backdrop => backdrop.remove());
};


function stopGameProcess(){
  toggleDistractions(false)
  removeModals()
  stopTickingSound()
}

// Function to toggle distractions on/off
function toggleDistractions(enable) {
  isDistractionEnabled = enable;
}

const flipCard = card => {
  state.flippedCards++;
  state.totalFlips++;

  if (!state.gameStarted) {
      startGame();
  }

  if (state.flippedCards <= 2) {
      card.classList.add('flipped');
  }

  if (state.flippedCards === 2) {
      const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
      const firstCard = flippedCards[0];
      const secondCard = flippedCards[1];

      if (firstCard.querySelector('img').src === secondCard.querySelector('img').src) {
          firstCard.classList.add('matched');
          secondCard.classList.add('matched');
      }

      setTimeout(() => {
          flipBackCards();
      }, 1000);
  }

  // If there are no more cards that we can flip, we won the game
  if (!document.querySelectorAll('.card:not(.flipped)').length) {
      setTimeout(() => {
          stopGameProcess()
          playCorrectSound()
          selectors.boardContainer.classList.add('flipped');
          selectors.win.innerHTML = `
              <span class="win-text">
                  You won!<br />
                  with <span class="highlight">${state.totalFlips}</span> moves<br />
                  under <span class="highlight">${state.totalTime}</span> seconds
                  <button onclick="location.reload();" class="play-again-btn">Play Again</button>
              </span>

          `;

          clearInterval(state.loop);
      }, 1000);
  }
}


const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } else if (
          eventTarget.nodeName === 'BUTTON' &&
          eventTarget.id === 'start_btn' &&
          !eventTarget.className.includes('disabled')
        ) {
          startGame();
        }
        
    })
}

const endGame = () => {
  stopGameProcess()
  playWrongSound()
  clearInterval(state.loop); // Stop the game loop
  selectors.boardContainer.classList.add('flipped');
  selectors.win.innerHTML = `
      <span class="win-text">
          You Lose!<br />
          You reached the time limit of ${timeLimit} seconds.<br />
          with <span class="highlight">${state.totalFlips}</span> moves<br />
          under <span class="highlight">${state.totalTime}</span> seconds
          <button onclick="location.reload();" class="play-again-btn">Play Again</button>
      </span>
  `;
  // Add any additional actions you want to perform at the end of the game
};


  const fetchVideoContent = () => {
    fetch('assets/videos.json')
      .then(response => response.json())
      .then(data => {
        const videos = data.videos;
        const randomIndex = Math.floor(Math.random() * videos.length);
        const videoUrl = videos[randomIndex].url;
        const videoEmbedUrl = getEmbeddedVideoUrl(videoUrl);
        displayVideo(videoEmbedUrl);
      })
      .catch(error => {
        console.error('Error fetching video content:', error);
      });
  };
  
  const getEmbeddedVideoUrl = (url) => {
    const videoId = url.match(/v=([^&]+)/)[1];
    return `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`;
    // return `https://www.youtube.com/embed/${videoId}`;
  };
  
  const displayImage = (imageURL) => {
    if (isDistractionEnabled){
      playPromptAlertSound()
    }
    const { modal, backdrop } = createModal();
  
    const header = document.createElement('div');
    header.className = 'modal-header';
    const closeButton = document.createElement('span');
    closeButton.className = 'modal-close';
    closeButton.innerHTML = '&times;';
    header.appendChild(closeButton);
    modal.appendChild(header);
  
    const body = document.createElement('div');
    body.className = 'modal-body';
  
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    const image = new Image();
    image.src = imageURL;
    image.className = 'distraction-image';
    imageContainer.appendChild(image);
    body.appendChild(imageContainer);
  
    modal.appendChild(body);
  
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
  
    const closeButtonFooter = document.createElement('span');
    closeButtonFooter.className = 'distraction-close';
    closeButtonFooter.innerHTML = 'Close';
    footer.appendChild(closeButtonFooter);
    // modal.addEventListener('click', () => {
    //   modal.remove();
    //   backdrop.remove();
    // });
    
    closeButton.addEventListener('click', () => {
      modal.remove();
      backdrop.remove();
    });
  
    closeButtonFooter.addEventListener('click', () => {
      modal.remove();
      backdrop.remove();
    });
  
    modal.appendChild(footer);

    if (isDistractionEnabled){
      document.body.appendChild(backdrop);
      document.body.appendChild(modal);
    }

  };
  
  const displayVideo = (videoEmbedUrl) => {
    if (isDistractionEnabled){
      playPromptAlertSound()
    }
    const { modal, backdrop } = createModal();

    const header = document.createElement('div');
    header.className = 'modal-header';
    const closeButton = document.createElement('span');
    closeButton.className = 'modal-close';
    closeButton.innerHTML = '&times;';
    header.appendChild(closeButton);
    modal.appendChild(header);
  
    const body = document.createElement('div');
    body.className = 'modal-body';
  
    const video = document.createElement('iframe');
    video.src = videoEmbedUrl;
    video.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    video.allowFullscreen = true;
    video.width = videoWidth; // Set the desired width
    video.height = videoHeight; // Set the desired height
    video.frameBorder = 0;
    video.className = 'distraction-video';
    body.appendChild(video);
  
    modal.appendChild(body);
  
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
  
    const closeButtonFooter = document.createElement('span');
    closeButtonFooter.className = 'distraction-close';
    closeButtonFooter.innerHTML = 'Close';
    footer.appendChild(closeButtonFooter);
  
    // modal.addEventListener('click', () => {
    //   modal.remove();
    //   backdrop.remove();
    // });

    closeButton.addEventListener('click', () => {
      modal.remove();
      backdrop.remove();
    });
  
    closeButtonFooter.addEventListener('click', () => {
      modal.remove();
      backdrop.remove();
    });
  
    modal.appendChild(footer);

    if (isDistractionEnabled){
      document.body.appendChild(backdrop);
      document.body.appendChild(modal);
    }
  };
  
  const createModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal';
  
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
  
    const board = document.querySelector('.board');
    const boardRect = board.getBoundingClientRect();
  
    // Calculate random position relative to the board
    const randomX = Math.floor(Math.random() * (boardRect.width - 400)) + boardRect.left;
    const randomY = Math.floor(Math.random() * (boardRect.height - 500)) + boardRect.top;
  
    // Set modal position
    modal.style.left = `${randomX}px`;
    modal.style.top = `${randomY}px`;
  
    return { modal, backdrop };
  };
  
  

generateGame()
attachEventListeners()
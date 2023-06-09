const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
}

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

let timeLimit = 300;
let initialPopUpInterval  = 7; // in seconds
let startPopupTime = 30; //pop up begin spawning after a 30-second pass
let stopPopupTime = 30; //stop spawning 30 seconds before the end
let videoWidth = 640; 
let videoHeight = 360; 

initialPopUpInterval *= 1000;

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
    state.gameStarted = true
    selectors.start.classList.add('disabled')

    state.loop = setInterval(() => {
        state.totalTime++

        selectors.moves.innerText = `${state.totalFlips} moves`
        selectors.timer.innerText = `time remaining: ${ timeLimit - state.totalTime} sec`

        if (state.totalTime >= timeLimit) {
          endGame(); // Call the function to end the game when the time limit is reached
        }
    }, 1000)

}

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
  
    if (remainingTime > 60) { // 60 seconds left
      const progressPercentage = 1 - (remainingTime - 60) / (timeLimit - 60);
      popUpInterval = Math.max(initialPopUpInterval - intervalDecrease, 2000); // Ensure the interval doesn't go below 2000 milliseconds
    }
    console.log('popUpInterval: '+popUpInterval)
  }
  setTimeout(startDistractionPopups, popUpInterval );
};

const distractionPopup = () => {
  const randomTime = Math.floor(Math.random() * 2000) + 1000; // Random time delay 
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
          selectors.boardContainer.classList.add('flipped');
          selectors.win.innerHTML = `
              <span class="win-text">
                  You won!<br />
                  with <span class="highlight">${state.totalFlips}</span> moves<br />
                  under <span class="highlight">${state.totalTime}</span> seconds
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
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        }
    })
}

const endGame = () => {
  clearInterval(state.loop); // Stop the game loop
  selectors.boardContainer.classList.add('flipped');
  selectors.win.innerHTML = `
      <span class="win-text">
          Game over!<br />
          You reached the time limit of ${timeLimit} seconds.<br />
          with <span class="highlight">${state.totalFlips}</span> moves<br />
          under <span class="highlight">${state.totalTime}</span> seconds
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
    modal.addEventListener('click', () => {
      modal.remove();
      backdrop.remove();
    });
    
    // closeButton.addEventListener('click', () => {
    //   modal.remove();
    //   backdrop.remove();
    // });
  
    // closeButtonFooter.addEventListener('click', () => {
    //   modal.remove();
    //   backdrop.remove();
    // });
  
    modal.appendChild(footer);
  
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
  };
  
  const displayVideo = (videoEmbedUrl) => {
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
  
    modal.addEventListener('click', () => {
      modal.remove();
      backdrop.remove();
    });

    // closeButton.addEventListener('click', () => {
    //   modal.remove();
    //   backdrop.remove();
    // });
  
    // closeButtonFooter.addEventListener('click', () => {
    //   modal.remove();
    //   backdrop.remove();
    // });
  
    modal.appendChild(footer);
  
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
  };
  
  const createModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal';
  
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
  
    // Calculate random position
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const randomX = Math.floor(Math.random() * (screenWidth - 400));
    const randomY = Math.floor(Math.random() * (screenHeight - 500));
  
    // Set modal position
    modal.style.left = `${randomX}px`;
    modal.style.top = `${randomY}px`;
  
    return { modal, backdrop };
  };
  

generateGame()
attachEventListeners()
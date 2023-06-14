// Set up background music
const backgroundMusic = new Howl({
    src: ['./assets/SFX/music/game_music.mp3'],
    loop: true,
    volume: 0.2
  });
  
  // Set up other sounds
  const wrongSound = new Howl({
    src: ['./assets/SFX/sounds/Lose.wav']
  });
  
  const promptingAlertSound = new Howl({
    src: ['./assets/SFX/prompt/iphone_1.mp3'],
    volume: 0.5
  });
  
  const correctSound = new Howl({
    src: ['./assets/SFX/sounds/Win.mp3']
  });
  
  const tickingSound = new Howl({
    src: ['./assets/SFX/music/tick-tock.wav'],
    loop: true,
    volume: 0.7
  });
  
  function playPromptAlertSound() {
      promptingAlertSound.play();
  }
  
  function playCorrectSound() {
      correctSound.play();
  }

  function stopTickingSound() {
    tickingSound.stop();
  }
  
  
  function playWrongSound() {
      wrongSound.play();
  }
  
  function playTickingSound() {
      tickingSound.play();
  }
  
  // Check user settings and play music if enabled
  
  function startBackgroundMusic() {
    backgroundMusic.play();
  }
  
  function stopBackgroundMusic() {
    backgroundMusic.stop();
  }
  

  
  
  
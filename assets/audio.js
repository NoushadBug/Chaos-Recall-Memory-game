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
    if (localStorage.getItem('settings.sound') === 'true') {
      promptingAlertSound.play();
    }
  }
  
  function playCorrectSound() {
    if (localStorage.getItem('settings.sound') === 'true') {
      correctSound.play();
    }
  }

  function stopTickingSound() {
    tickingSound.stop();
  }
  
  
  function playWrongSound() {
    if (localStorage.getItem('settings.sound') === 'true') {
      wrongSound.play();
    }
  }
  
  function playTickingSound() {
    if (localStorage.getItem('settings.sound') === 'true') {
      tickingSound.play();
    }
  }
  
  // Check user settings and play music if enabled
  
  // function tickingMusicTrigger(){
  //   if (localStorage.getItem('settings.music') === 'true') {
  //     tickingSound.play();
  //   }
  //   else if (localStorage.getItem('settings.music') === 'false') {
  //     tickingSound.stop();
  //   }
  // }

  function backgroundMusicTrigger(){
    if (localStorage.getItem('settings.music') === 'true') {
      backgroundMusic.play();
    }
    else if (localStorage.getItem('settings.music') === 'false') {
      backgroundMusic.stop();
    }
  }
  backgroundMusicTrigger()

  
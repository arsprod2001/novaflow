import chalkAnimation from 'chalk-animation';
import gradient from 'gradient-string';

export class Animator {
  static animations = {
    rainbow: chalkAnimation.rainbow,
    pulse: chalkAnimation.pulse,
    glitch: chalkAnimation.glitch,
    radar: chalkAnimation.radar,
    neon: chalkAnimation.neon
  };

  static async animateText(text, animationType = 'rainbow', duration = 2000) {
    const animation = this.animations[animationType](text);
    
    await new Promise(resolve => {
      setTimeout(() => {
        animation.stop();
        resolve();
      }, duration);
    });
  }

  static gradientText(text, colors = ['#ff0000', '#00ff00', '#0000ff']) {
    const grad = gradient(colors);
    return grad(text);
  }

  static async typingEffect(text, speed = 50) {
    for (let i = 0; i < text.length; i++) {
      process.stdout.write(text[i]);
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    console.log();
  }

  static async progressAnimation(steps, message = 'Chargement') {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    
    const interval = setInterval(() => {
      process.stdout.write(`\r${frames[i]} ${message}...`);
      i = (i + 1) % frames.length;
    }, 80);

    await new Promise(resolve => setTimeout(resolve, steps * 100));

    clearInterval(interval);
    process.stdout.write(`\r✅ ${message} terminé !\n`);
  }
}
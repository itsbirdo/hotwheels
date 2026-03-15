import Phaser from 'phaser';
import { CAR_STATS, CAR_KEYS, DIFFICULTY } from '../data/carStats.js';
import { SoundManager } from '../audio/SoundManager.js';

/**
 * Car selection screen — side-by-side layout with stats.
 * After selecting car → difficulty selection overlay.
 */
export class CarSelectScene extends Phaser.Scene {

  constructor() {
    super({ key: 'CarSelectScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.soundManager = new SoundManager(this);
    this.soundManager.init();

    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(width / 2, 40, 'SELECT YOUR RIDE', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // State
    this.selectedCarIndex = 1; // Default to sports car
    this.showingDifficulty = false;
    this.selectedDifficulty = null;

    // Car cards
    this.carCards = [];
    const cardWidth = 200;
    const spacing = 30;
    const totalWidth = CAR_KEYS.length * cardWidth + (CAR_KEYS.length - 1) * spacing;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;

    CAR_KEYS.forEach((key, i) => {
      const stats = CAR_STATS[key];
      const cx = startX + i * (cardWidth + spacing);
      const cy = 240;

      const card = this.createCarCard(cx, cy, key, stats, i);
      this.carCards.push(card);
    });

    // Navigation hint
    this.add.text(width / 2, 440, '← →  SELECT     ENTER  CONFIRM', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5);

    // Keyboard controls
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.input.keyboard.on('keydown-LEFT', () => this.navigate(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.navigate(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard.on('keydown-ESC', () => this.goBack());

    this.updateSelection();
  }

  createCarCard(cx, cy, carKey, stats, index) {
    const container = this.add.container(cx, cy);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x222244, 0.8);
    bg.fillRoundedRect(-90, -120, 180, 300, 8);
    container.add(bg);

    // Car sprite (scaled up)
    const carSprite = this.add.image(0, -60, `car_${carKey}`);
    carSprite.setScale(3);
    container.add(carSprite);

    // Name
    const name = this.add.text(0, 0, stats.name, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    container.add(name);

    // Stat bars
    const statNames = ['SPD', 'ACC', 'HND'];
    const statValues = [stats.speed, stats.acceleration, stats.handling];
    const statColors = [0xff4444, 0x44ff44, 0x4444ff];

    statNames.forEach((statName, si) => {
      const sy = 30 + si * 28;

      const label = this.add.text(-70, sy, statName, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#aaaaaa'
      });
      container.add(label);

      // Bar background
      const barBg = this.add.graphics();
      barBg.fillStyle(0x333333);
      barBg.fillRect(-30, sy + 2, 100, 12);
      container.add(barBg);

      // Bar fill
      const barFill = this.add.graphics();
      barFill.fillStyle(statColors[si]);
      barFill.fillRect(-30, sy + 2, (statValues[si] / 5) * 100, 12);
      container.add(barFill);
    });

    // Bonus text for Top Hat
    if (carKey === 'topHatCar') {
      const bonus = this.add.text(0, 118, '★ WIDE PICKUP', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#ffcc00'
      }).setOrigin(0.5);
      container.add(bonus);
    }

    // Description
    const desc = this.add.text(0, 138, stats.description, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#888888',
      wordWrap: { width: 160 },
      align: 'center'
    }).setOrigin(0.5);
    container.add(desc);

    // Border (selection indicator)
    const border = this.add.graphics();
    container.add(border);

    // Click handler
    const hitArea = this.add.rectangle(0, 30, 180, 300, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => {
      this.selectedCarIndex = index;
      this.updateSelection();
      this.soundManager.play('select');
    });
    hitArea.on('pointerdown', () => {
      if (this.selectedCarIndex === index) {
        this.confirm();
      }
    });
    container.add(hitArea);

    return { container, border, bg };
  }

  navigate(dir) {
    if (this.showingDifficulty) return;
    this.selectedCarIndex = (this.selectedCarIndex + dir + CAR_KEYS.length) % CAR_KEYS.length;
    this.updateSelection();
    this.soundManager.play('select');
  }

  updateSelection() {
    this.carCards.forEach((card, i) => {
      card.border.clear();
      if (i === this.selectedCarIndex) {
        card.border.lineStyle(3, 0xffcc00);
        card.border.strokeRoundedRect(-92, -122, 184, 304, 8);
        card.container.setScale(1.05);
      } else {
        card.container.setScale(0.95);
        card.container.setAlpha(0.6);
      }
    });
    // Reset alpha for selected
    this.carCards[this.selectedCarIndex].container.setAlpha(1);
  }

  confirm() {
    if (this.showingDifficulty) return;
    this.showDifficultySelect();
  }

  goBack() {
    if (this.showingDifficulty) {
      this.hideDifficultySelect();
    }
  }

  showDifficultySelect() {
    this.showingDifficulty = true;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Overlay
    this.diffOverlay = this.add.graphics();
    this.diffOverlay.fillStyle(0x000000, 0.7);
    this.diffOverlay.fillRect(0, 0, width, height);

    this.diffContainer = this.add.container(width / 2, height / 2);

    // Title
    const title = this.add.text(0, -80, 'SELECT DIFFICULTY', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.diffContainer.add(title);

    // Difficulty buttons
    const difficulties = ['easy', 'medium', 'hard'];
    const diffColors = { easy: 0x44cc44, medium: 0xcccc44, hard: 0xcc4444 };
    const diffDescs = {
      easy: 'Relaxed race. AI takes it easy.',
      medium: 'Fair challenge. Good racing.',
      hard: 'Intense! AI is ruthless.'
    };

    this.diffButtons = [];
    difficulties.forEach((diff, i) => {
      const by = -20 + i * 55;

      const btnBg = this.add.graphics();
      btnBg.fillStyle(diffColors[diff], 0.3);
      btnBg.fillRoundedRect(-120, by - 18, 240, 44, 6);
      btnBg.lineStyle(2, diffColors[diff]);
      btnBg.strokeRoundedRect(-120, by - 18, 240, 44, 6);
      this.diffContainer.add(btnBg);

      const label = this.add.text(0, by, DIFFICULTY[diff].name.toUpperCase(), {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      this.diffContainer.add(label);

      const desc = this.add.text(0, by + 14, diffDescs[diff], {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
      this.diffContainer.add(desc);

      // Click handler
      const hitArea = this.add.rectangle(0, by, 240, 44, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => {
        this.startRace(diff);
      });
      this.diffContainer.add(hitArea);

      this.diffButtons.push({ diff, btnBg, label });
    });

    // Key hints
    const hint = this.add.text(0, 130, '1  EASY     2  MEDIUM     3  HARD     ESC  BACK', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#666666'
    }).setOrigin(0.5);
    this.diffContainer.add(hint);

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-ONE', () => this.startRace('easy'));
    this.input.keyboard.on('keydown-TWO', () => this.startRace('medium'));
    this.input.keyboard.on('keydown-THREE', () => this.startRace('hard'));
  }

  hideDifficultySelect() {
    this.showingDifficulty = false;
    if (this.diffOverlay) this.diffOverlay.destroy();
    if (this.diffContainer) this.diffContainer.destroy();
  }

  startRace(difficulty) {
    this.soundManager.play('select');
    const selectedCar = CAR_KEYS[this.selectedCarIndex];
    this.soundManager.destroy();

    this.scene.start('RaceScene', {
      carKey: selectedCar,
      carStats: CAR_STATS[selectedCar],
      difficulty: DIFFICULTY[difficulty],
      difficultyName: difficulty
    });
  }
}

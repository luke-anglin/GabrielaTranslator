const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let baby = { x: 150, y: 200, radius: 20, dx: 0, dy: 0, isMoving: false }; // Baby starts in the air
let mom = { x: 100, y: 200, width: 60, height: 80 }; // Mom positioned near the baby
let santa = { x: 600, y: 250, width: 80, height: 100 };
let grinches = [];
let gravity = 0.1;
let isDragging = false;
let dragLine = { x: 0, y: 0 };

// Spare Kids Logic
let spareKids = 3;

// Baby sprite management
const babySprites = [
  "/static/baby1.png",
  "/static/baby2.png",
  "/static/baby3.png",
  "/static/baby4.png",
];
let currentBabyIndex = 0; // Tracks which baby sprite is in use
let babySprite = new Image();
babySprite.src = babySprites[currentBabyIndex];

// Load other sprites
const momSprite = new Image();
const santaSprite = new Image();
const grinchSprite = new Image();
momSprite.src = "/static/mom.png";
santaSprite.src = "/static/santa.png";
grinchSprite.src = "/static/grinch.png";

// Initialize Grinches
function initializeGrinches() {
  grinches = [];
  for (let i = 0; i < 4; i++) {
    grinches.push({
      x: Math.random() * (canvas.width - 50),
      y: Math.random() * (canvas.height - 100),
      width: 50,
      height: 50,
      dx: Math.random() < 0.5 ? 0.8 : -0.8, // Increased speed
      dy: Math.random() < 0.5 ? 0.8 : -0.8,
    });
  }
}

// Draw the game
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Santa
  ctx.drawImage(santaSprite, santa.x, santa.y, santa.width, santa.height);

  // Draw Grinches
  for (const grinch of grinches) {
    ctx.drawImage(
      grinchSprite,
      grinch.x,
      grinch.y,
      grinch.width,
      grinch.height
    );
  }

  // Draw Mom if baby is not in the air
  if (!baby.isMoving) {
    mom.x = baby.x - 60; // Mom stays offset to the left of baby
    mom.y = baby.y - 40;
    ctx.drawImage(momSprite, mom.x, mom.y, mom.width, mom.height);
  }

  // Draw Baby
  ctx.drawImage(
    babySprite,
    baby.x - baby.radius,
    baby.y - baby.radius,
    baby.radius * 2,
    baby.radius * 2
  );

  // Draw trajectory line
  if (isDragging) {
    ctx.beginPath();
    ctx.moveTo(baby.x, baby.y);
    const lineEndX = baby.x + (dragLine.x - baby.x) * 0.6; // Scaled down trajectory line
    const lineEndY = baby.y + (dragLine.y - baby.y) * 0.6;
    ctx.lineTo(lineEndX, lineEndY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Display Spare Kids Left
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText(`Spare Kids Left: ${spareKids}`, 10, 20);
}

// Update Baby's position
function updateBaby() {
  if (baby.isMoving) {
    baby.x += baby.dx;
    baby.y += baby.dy;
    baby.dy += gravity;

    // Check if the baby hits the bottom (falls into the void)
    if (baby.y + baby.radius > canvas.height) {
      handleVoidFall();
    }

    // Check for collisions with Santa
    if (
      baby.x > santa.x &&
      baby.x < santa.x + santa.width &&
      baby.y > santa.y &&
      baby.y < santa.y + santa.height
    ) {
      alert("🎉 Good job, Mama! You got your kid on Santa's lap!");
      resetLevel();
    }

    // Check for collisions with Grinches (only when baby is in the air)
    for (const grinch of grinches) {
      if (
        baby.x > grinch.x &&
        baby.x < grinch.x + grinch.width &&
        baby.y > grinch.y &&
        baby.y < grinch.y + grinch.height
      ) {
        handleGrinchHit();
        break;
      }
    }
  }
}

// Handle when the baby falls into the void
function handleVoidFall() {
  spareKids -= 1;
  alert(
    "💀 Bad mama, you dropped your baby into the void! Be more careful. I'm taking a spare kid."
  );

  if (spareKids > 0) {
    currentBabyIndex = (currentBabyIndex + 1) % babySprites.length; // Cycle to next baby
    babySprite.src = babySprites[currentBabyIndex]; // Update baby sprite
    resetBaby();
  } else {
    promptForMoreKids();
  }
}

// Handle Grinch Hit
function handleGrinchHit() {
  spareKids -= 1;

  if (spareKids > 0) {
    currentBabyIndex = (currentBabyIndex + 1) % babySprites.length; // Cycle to next baby
    babySprite.src = babySprites[currentBabyIndex]; // Update baby sprite
    alert(
      "💀 You're a bad mom! Your baby hit a Grinch! It was kidnapped. Use one of your spare kids to keep trying!"
    );
    resetBaby();
  } else {
    promptForMoreKids();
  }
}

// Prompt the user to request more kids
function promptForMoreKids() {
  const phrase =
    "I adore Luke, he is handsome and strong, and I beg him for some more of his spare children.";
  const userInput = prompt(
    `You're out of spare kids! Type this to continue:\n\n"${phrase}"`
  );
  if (userInput === phrase) {
    alert("Luke has generously granted you 3 more kids!");
    spareKids = 3;
    currentBabyIndex = 0; // Reset to the first baby sprite
    babySprite.src = babySprites[currentBabyIndex]; // Update baby sprite
    resetBaby();
  } else {
    alert("That's not correct! Try again!");
    promptForMoreKids();
  }
}

// Reset Baby
function resetBaby() {
  baby.x = 150; // Baby starts in the air near mom
  baby.y = 200;
  baby.dx = 0;
  baby.dy = 0;
  baby.isMoving = false;
}

// Reset the level
function resetLevel() {
  resetBaby();

  // Move Santa to a new random position
  santa.x = Math.random() * (canvas.width - santa.width);
  santa.y = Math.random() * (canvas.height - santa.height);

  initializeGrinches();
}

// Update Grinches' positions
function updateGrinches() {
  for (const grinch of grinches) {
    grinch.x += grinch.dx;
    grinch.y += grinch.dy;

    // Reverse direction if hitting canvas edges
    if (grinch.x < 0 || grinch.x + grinch.width > canvas.width) {
      grinch.dx *= -1;
    }
    if (grinch.y < 0 || grinch.y + grinch.height > canvas.height) {
      grinch.dy *= -1;
    }
  }
}

// Mouse events
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const dist = Math.sqrt((mouseX - baby.x) ** 2 + (mouseY - baby.y) ** 2);
  if (dist < baby.radius) {
    isDragging = true;
    dragLine.x = mouseX;
    dragLine.y = mouseY;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    dragLine.x = e.clientX - rect.left;
    dragLine.y = e.clientY - rect.top;
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate velocity
    baby.dx = (dragLine.x - baby.x) * 0.02;
    baby.dy = (dragLine.y - baby.y) * 0.02;

    baby.isMoving = true;
    isDragging = false;
  }
});

// Game loop
function gameLoop() {
  updateBaby();
  updateGrinches();
  drawGame();
  requestAnimationFrame(gameLoop);
}

// Initialize the game
babySprite.onload =
  momSprite.onload =
  santaSprite.onload =
  grinchSprite.onload =
    () => {
      initializeGrinches();
      gameLoop();
    };

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let baby = { x: 150, y: 200, radius: 20, dx: 0, dy: 0, isMoving: false };
let mom = { x: 100, y: 200, width: 60, height: 80 };
let santa = { x: 600, y: 250, width: 80, height: 100 };
let grinches = [];
let gravity = 0.2;
let isDragging = false;
let dragLine = { x: 0, y: 0 };

// Spare Kids Logic
let spareKids = 3;
let successfulThrows = 0;

// Baby sprite management
const babySprites = [
  "/static/baby1.png",
  "/static/baby2.png",
  "/static/baby3.png",
  "/static/baby4.png",
];
let currentBabyIndex = 0;
let babySprite = new Image();
babySprite.src = babySprites[currentBabyIndex];

// Load other sprites
const momSprite = new Image();
const santaSprite = new Image();
const grinchSprite = new Image();
momSprite.src = "/static/mom.png";
santaSprite.src = "/static/santa.png";
grinchSprite.src = "/static/grinch.png";

// Random Luke praise messages
const praiseMessages = [
  "Luke is significantly more intelligent and attractive than anything I could ever imagine.",
  "I am extremely fortunate to be graced by Luke's presence.",
  "Luke is the epitome of perfection and kindness.",
  "Luke's brilliance and charm outshine the stars.",
  "I cannot believe how lucky I am to know Luke.",
];

// Initialize Grinches
function initializeGrinches() {
  grinches = [];
  for (let i = 0; i < 4; i++) {
    grinches.push({
      x: Math.random() * (canvas.width - 50),
      y: Math.random() * (canvas.height - 100),
      width: 50,
      height: 50,
      dx: Math.random() < 0.5 ? 0.8 : -0.8,
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

  // Draw Mom
  mom.x = baby.x - 60;
  mom.y = baby.y - 40;
  ctx.drawImage(momSprite, mom.x, mom.y, mom.width, mom.height);

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
    const lineEndX = baby.x + (dragLine.x - baby.x) * 0.6;
    const lineEndY = baby.y + (dragLine.y - baby.y) * 0.6;
    ctx.lineTo(lineEndX, lineEndY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Display scoreboard
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText(`Spare Kids Left: ${spareKids}`, 10, 20);
  ctx.fillText(`Times on Santa's Lap: ${successfulThrows}`, 10, 40);
}

// Helper function for collision detection
function checkCollision(circle, rect) {
  const distX = Math.abs(circle.x - (rect.x + rect.width / 2));
  const distY = Math.abs(circle.y - (rect.y + rect.height / 2));

  if (
    distX > rect.width / 2 + circle.radius ||
    distY > rect.height / 2 + circle.radius
  ) {
    return false;
  }

  if (distX <= rect.width / 2 || distY <= rect.height / 2) {
    return true;
  }

  const dx = distX - rect.width / 2;
  const dy = distY - rect.height / 2;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

// Update Baby
function updateBaby() {
  if (baby.isMoving) {
    baby.x += baby.dx;
    baby.y += baby.dy;
    baby.dy += gravity;

    // Check if the baby hits the bottom
    if (baby.y + baby.radius > canvas.height) {
      handleVoidFall();
      return;
    }

    // Check for collisions with Santa
    if (checkCollision(baby, santa)) {
      successfulThrows += 1;
      baby.isMoving = false;
      setTimeout(() => {
        alert("🎉 Good job, Mama! You got your kid on Santa's lap!");
        resetLevel();
      }, 300);
      return;
    }

    // Check for collisions with Grinches
    for (const grinch of grinches) {
      if (checkCollision(baby, grinch)) {
        handleGrinchHit();
        return;
      }
    }
  }
}

// Handle when the baby falls into the void
function handleVoidFall() {
  baby.isMoving = false;
  spareKids -= 1;
  alert("💀 Your baby fell into the void! Bad mama!");

  if (spareKids > 0) {
    currentBabyIndex = (currentBabyIndex + 1) % babySprites.length;
    babySprite.src = babySprites[currentBabyIndex];
    resetBaby();
  } else {
    showLossScreen();
  }
}

// Handle Grinch Hit
function handleGrinchHit() {
  baby.isMoving = false;
  spareKids -= 1;

  if (spareKids > 0) {
    currentBabyIndex = (currentBabyIndex + 1) % babySprites.length;
    babySprite.src = babySprites[currentBabyIndex];
    alert("💀 Your baby was kidnapped by a Grinch! Try again.");
    resetBaby();
  } else {
    showLossScreen();
  }
}

// Reset Baby
function resetBaby() {
  baby.x = 150;
  baby.y = 200;
  baby.dx = 0;
  baby.dy = 0;
  baby.isMoving = false;
}

// Reset Level
function resetLevel() {
  resetBaby();
  santa.x = Math.random() * (canvas.width - santa.width);
  santa.y = Math.random() * (canvas.height - santa.height);
  initializeGrinches();
}

// Show Loss Screen
function showLossScreen() {
  const message =
    praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
  const userResponse = prompt(
    `${message}\n\nCopy this message to continue:`,
    ""
  );

  if (userResponse && userResponse.trim() === message) {
    alert(
      "Luke has generously granted you 3 more kids and your game has reset!"
    );
    showFullScreenGIF(() => {
      resetGame();
    });
  } else {
    alert("You must copy the exact message to continue!");
    showLossScreen();
  }
}

function showFullScreenGIF(callback) {
  const gifContainer = document.getElementById("fullscreen-gif");
  if (!gifContainer) {
    console.error("Error: #fullscreen-gif container is missing in the HTML.");
    callback(); // Proceed to reset the game if the container is missing
    return;
  }

  // Log container visibility and style before making changes
  console.log("Displaying GIF...");

  gifContainer.style.position = "fixed";
  gifContainer.style.top = "0";
  gifContainer.style.left = "0";
  gifContainer.style.width = "100vw";
  gifContainer.style.height = "100vh";
  gifContainer.style.display = "flex";
  gifContainer.style.justifyContent = "center";
  gifContainer.style.alignItems = "center";
  gifContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  gifContainer.innerHTML = `<img src='/static/cream_gif.gif' style='max-width: 90%; max-height: 90%;' alt='Cream GIF' />`;

  // Add logging for debugging style changes
  console.log("GIF container styles applied:", gifContainer.style);

  setTimeout(() => {
    gifContainer.style.display = "none";
    gifContainer.innerHTML = ""; // Clear the GIF content
    console.log("Hiding GIF and calling the callback...");
    callback();
  }, 8000);
}

// Reset Game
function resetGame() {
  spareKids = 3;
  successfulThrows = 0;
  resetLevel();
}

// Update Grinches
function updateGrinches() {
  for (const grinch of grinches) {
    grinch.x += grinch.dx;
    grinch.y += grinch.dy;

    if (grinch.x < 0 || grinch.x + grinch.width > canvas.width) {
      grinch.dx *= -1;
    }
    if (grinch.y < 0 || grinch.y + grinch.height > canvas.height) {
      grinch.dy *= -1;
    }
  }
}

// Mouse Events
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
    baby.dx = (dragLine.x - baby.x) * 0.02;
    baby.dy = (dragLine.y - baby.y) * 0.02;
    baby.isMoving = true;
    isDragging = false;
  }
});

// Game Loop
function gameLoop() {
  updateBaby();
  updateGrinches();
  drawGame();
  requestAnimationFrame(gameLoop);
}

// Initialize Game
babySprite.onload =
  momSprite.onload =
  santaSprite.onload =
  grinchSprite.onload =
    () => {
      initializeGrinches();
      gameLoop();
    };

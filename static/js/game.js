const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let momSpawnX = 50; // Mom's bottom-left corner position
let momSpawnY = canvas.height - 150; // Mom's height near bottom
let baby = { x: momSpawnX + 80, y: momSpawnY + 30, radius: 20, dx: 0, dy: 0, isMoving: false };
let mom = { x: momSpawnX, y: momSpawnY, width: 60, height: 80 };
let santa = { x: 600, y: 250, width: 80, height: 100 };
let grinches = [];
let gravity = 0.1; // Reduced gravity for smoother arcs
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
// Initialize Grinches dynamically based on successfulThrows
function initializeGrinches() {
  grinches = [];
  const numGrinches = successfulThrows + 1; // Start with 1 Grinch, add one per success
  for (let i = 0; i < numGrinches; i++) {
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

  // Draw Mom (fixed in the bottom-left corner)
  ctx.drawImage(momSprite, momSpawnX, momSpawnY, mom.width, mom.height);

  // Draw Baby (next to mom)
  ctx.drawImage(
    babySprite,
    baby.x - baby.radius,
    baby.y - baby.radius,
    baby.radius * 2,
    baby.radius * 2
  );

  // Draw trajectory line (Angry Birds style)
  if (isDragging) {
    const dragDistanceX = dragLine.x - baby.x;
    const dragDistanceY = dragLine.y - baby.y;

    // Calculate curve points for the trajectory
    const steps = 15; // Number of dots
    const gravityPreview = 0.1; // Use a smaller gravity to simulate the arc
    let tempX = baby.x;
    let tempY = baby.y;
    let tempDx = dragDistanceX * 0.03;
    let tempDy = dragDistanceY * 0.03;

    ctx.strokeStyle = "red";
    ctx.setLineDash([5, 5]); // Dashed line for trajectory
    ctx.beginPath();
    ctx.moveTo(baby.x, baby.y);

    for (let i = 0; i < steps; i++) {
      tempX += tempDx;
      tempY += tempDy;
      tempDy += gravityPreview;
      ctx.lineTo(tempX, tempY);
    }

    ctx.stroke();
    ctx.setLineDash([]); // Reset line style
  }

  // Display scoreboard
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText(`Spare Kids Left: ${spareKids}`, 10, 20);
  ctx.fillText(`Times on Santa's Lap: ${successfulThrows}`, 10, 40);
}


// Helper function for collision detection
function checkCollision(circle, rect) {
  // Skip collision check for mom
  if (rect === mom) {
    return false;
  }

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
function resetBaby() {
  baby.x = momSpawnX + 80; // Baby starts to the right of mom
  baby.y = momSpawnY + 30;
  baby.dx = 0;
  baby.dy = 0;
  baby.isMoving = false;
}



// Reset Level
function resetLevel() {
  resetBaby();
  // Ensure Santa spawns at least 200px away from the baby
  do {
    santa.x = Math.random() * (canvas.width - santa.width);
    santa.y = Math.random() * (canvas.height - santa.height);
  } while (
    Math.hypot(santa.x - baby.x, santa.y - baby.y) < 200 // 200px minimum distance
  );
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
  }, 6000);
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
    grinch.x += grinch.dx * 0.5; // Move at half speed
    grinch.y += grinch.dy * 0.5;

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

    // Calculate drag distance
    const dragDistanceX = dragLine.x - baby.x;
    const dragDistanceY = dragLine.y - baby.y;

    // Scale the baby's velocity for a smooth throw
    const scalingFactor = 0.03; // Adjust for responsiveness
    baby.dx = dragDistanceX * scalingFactor;
    baby.dy = dragDistanceY * scalingFactor;

    // Start baby's movement
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

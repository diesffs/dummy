(function () {
  let zone = 1;
  let highestZoneReached = 1;
  let gold = 0;
  let souls = 0;
  let enemyHp = 5;
  let maxEnemyHp = enemyHp;
  let baseDamage = 1;
  let currentDamage = baseDamage;
  let baseGoldGain = 1;
  let upgradeCost = 10;
  let upgrades = 0;
  let isFighting = false;
  let damagePerFrame;

  const zoneLevelElement = document.getElementById("zone-level");
  const goldValueElement = document.getElementById("gold-value");
  const damageValueElement = document.getElementById("damage-value");
  const soulsValueElement = document.getElementById("souls-value");
  const enemyHpValueElement = document.getElementById("enemy-hp-value");
  const hpBarElement = document.getElementById("hp-bar");
  const upgradeButton = document.getElementById("upgrade-button");
  const rebirthButton = document.getElementById("rebirth-button");
  const resetButton = document.getElementById("reset-button");
  const startButton = document.getElementById("start-button");
  const stopButton = document.getElementById("stop-button");

  function calculateGoldGain() {
    const exponent = 1.09;
    return Math.floor(baseGoldGain * Math.pow(zone, exponent));
  }

  function calculateUpgradeCost() {
    const exponent = 1.07;
    return Math.floor(10 * Math.pow(upgrades + 1, exponent));
  }

  function calculateEnemyHp() {
    const baseEnemyHp = 5;
    const exponent = 1.09;
    return Math.floor(baseEnemyHp * Math.pow(zone, exponent));
  }

  function calculateDamageGain() {
    const exponent = 1.05;
    const baseDamageGain = baseDamage * Math.pow(upgrades + 1, exponent);
    const soulsBonus = 1 + souls * 0.01;
    const totalDamage = Math.floor(baseDamageGain * soulsBonus);
    return totalDamage;
  }

  function saveGameState() {
    localStorage.setItem("zone", zone);
    localStorage.setItem("highestZoneReached", highestZoneReached);
    localStorage.setItem("gold", gold);
    localStorage.setItem("souls", souls);
    localStorage.setItem("upgrades", upgrades);
    localStorage.setItem("currentDamage", currentDamage);
    localStorage.setItem("upgradeCost", upgradeCost);
  }

  function loadGameState() {
    zone = parseInt(localStorage.getItem("zone")) || 1;
    highestZoneReached =
      parseInt(localStorage.getItem("highestZoneReached")) || 1;
    gold = parseInt(localStorage.getItem("gold")) || 0;
    souls = parseInt(localStorage.getItem("souls")) || 0;
    upgrades = parseInt(localStorage.getItem("upgrades")) || 0;
    currentDamage =
      parseInt(localStorage.getItem("currentDamage")) || baseDamage;
    upgradeCost = parseInt(localStorage.getItem("upgradeCost")) || 10;
    stopFight();
  }

  function updateHpBar() {
    const hpPercentage = (enemyHp / maxEnemyHp) * 100;
    hpBarElement.style.width = `${hpPercentage}%`;

    if (hpPercentage > 50) hpBarElement.style.backgroundColor = "green";
    else if (hpPercentage > 25) hpBarElement.style.backgroundColor = "yellow";
    else hpBarElement.style.backgroundColor = "red";
  }

  function updateRebirthButtonText() {
    const soulsForRebirth = highestZoneReached;
    rebirthButton.textContent = `Rebirth for ${soulsForRebirth} souls`;
  }

  function initializeGame() {
    loadGameState();

    zoneLevelElement.textContent = zone;
    goldValueElement.textContent = gold;
    damageValueElement.textContent = currentDamage;
    soulsValueElement.textContent = souls;
    enemyHpValueElement.textContent = enemyHp;
    upgradeButton.textContent = `Upgrade Damage (Cost: ${upgradeCost})`;

    updateRebirthButtonText();
    updateUpgradeButtonState();
  }

  function startFight() {
    if (isFighting) return;

    isFighting = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    upgradeButton.disabled = true;
    rebirthButton.disabled = true;
    resetButton.disabled = true;

    damagePerFrame = currentDamage / 60; // Damage per frame for 60 FPS

    function damageTick() {
      if (!isFighting) return;

      enemyHp -= damagePerFrame;
      enemyHpValueElement.textContent = Math.max(0, Math.floor(enemyHp));
      updateHpBar();

      if (enemyHp <= 0) {
        zone++;
        highestZoneReached = Math.max(highestZoneReached, zone);
        zoneLevelElement.textContent = zone;
        gold += calculateGoldGain();
        goldValueElement.textContent = gold;
        enemyHp = calculateEnemyHp();
        maxEnemyHp = enemyHp;
        enemyHpValueElement.textContent = enemyHp;
        updateHpBar();

        updateUpgradeButtonState();
        updateRebirthButtonText();

        saveGameState();
      }

      // Continue the loop, whether the enemy is killed or not
      requestAnimationFrame(damageTick);
    }

    requestAnimationFrame(damageTick); // Start the damage loop
  }

  function stopFight() {
    isFighting = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    resetButton.disabled = false;

    if (zone > 1) zone = Math.floor(highestZoneReached * 0.5);
    enemyHp = 5;
    maxEnemyHp = enemyHp;
    zoneLevelElement.textContent = zone;
    enemyHpValueElement.textContent = enemyHp;
    updateHpBar();

    updateUpgradeButtonState();
    rebirthButton.disabled = highestZoneReached >= 50 ? false : true;
    updateRebirthButtonText();

    saveGameState();
  }

  function upgradeDamage() {
    if (gold >= upgradeCost) {
      gold -= upgradeCost;
      upgrades++;
      currentDamage = calculateDamageGain();
      upgradeCost = calculateUpgradeCost();

      damageValueElement.textContent = currentDamage;
      goldValueElement.textContent = gold;
      upgradeButton.textContent = `Upgrade Damage (Cost: ${upgradeCost})`;

      damagePerFrame = currentDamage / 60; // Recalculate for 60 FPS

      updateUpgradeButtonState();

      saveGameState();
    }
  }

  function rebirth() {
    if (!isFighting && highestZoneReached >= 50) {
      souls += highestZoneReached;
      soulsValueElement.textContent = souls;
      gold = 0;
      goldValueElement.textContent = gold;
      upgrades = 0;
      currentDamage = calculateDamageGain();
      damageValueElement.textContent = currentDamage;
      zone = 1;
      highestZoneReached = 1;
      enemyHp = 5;
      maxEnemyHp = enemyHp;
      updateHpBar();
      enemyHpValueElement.textContent = enemyHp;
      zoneLevelElement.textContent = zone;
      rebirthButton.disabled = true;
      upgradeCost = calculateUpgradeCost();
      upgradeButton.textContent = `Upgrade Damage (Cost: ${upgradeCost})`;
      damagePerFrame = currentDamage / 60; // Adjust for 60 FPS

      updateUpgradeButtonState();
      updateRebirthButtonText();

      saveGameState();
    }
  }

  function reset() {
    const confirmed = confirm(
      "Are you sure you want to reset the game? This will erase all progress."
    );

    if (confirmed) {
      zone = 1;
      highestZoneReached = 1;
      gold = 0;
      souls = 0;
      upgrades = 0;
      currentDamage = baseDamage;
      upgradeCost = 10;
      enemyHp = 5;
      maxEnemyHp = enemyHp;

      zoneLevelElement.textContent = zone;
      goldValueElement.textContent = gold;
      damageValueElement.textContent = currentDamage;
      soulsValueElement.textContent = souls;
      enemyHpValueElement.textContent = enemyHp;
      upgradeButton.textContent = `Upgrade Damage (Cost: ${upgradeCost})`;

      updateHpBar();
      updateUpgradeButtonState();
      updateRebirthButtonText();

      localStorage.clear();

      saveGameState();
    }
  }

  function updateUpgradeButtonState() {
    if (gold >= upgradeCost && !isFighting) upgradeButton.disabled = false;
    else upgradeButton.disabled = true;
  }

  function updateRebirthButtonState() {
    if (!isFighting && highestZoneReached >= 50) rebirthButton.disabled = false;
    else rebirthButton.disabled = true;
  }

  initializeGame();

  startButton.addEventListener("click", startFight);
  stopButton.addEventListener("click", stopFight);
  upgradeButton.addEventListener("click", upgradeDamage);
  rebirthButton.addEventListener("click", rebirth);
  resetButton.addEventListener("click", reset);
})();

import {
  CameraShakeType,
  CatmullRomSpline,
  EasingType,
  system,
  world,
} from "@minecraft/server";

const TALISMAN_ID = "skill:crimson_talisman";
const RITUAL_ENTITY_ID = "skill:crimson_ritual";
const BOUNDARY_RADIUS = 14;
const BOUNDARY_SEGMENTS = 16;
const CUTSCENE_SECONDS = 8;

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== TALISMAN_ID) {
    return;
  }

  castBoundary(event.source);
});

function castBoundary(player) {
  const dimension = player.dimension;
  const location = player.location;
  const center = {
    x: Math.floor(location.x),
    y: Math.floor(location.y),
    z: Math.floor(location.z),
  };

  dimension.spawnEntity(RITUAL_ENTITY_ID, center);
  dimension.spawnParticle("skill:crimson_sigil", center);
  dimension.playSound("skill.boundary_open", center, { volume: 1.0, pitch: 0.82 });
  const cutsceneStarted = startCutscene(player, center);

  system.runTimeout(() => {
    dimension.spawnParticle("skill:crimson_rift", center);
    dimension.playSound("skill.boundary_hum", center, { volume: 0.65, pitch: 0.92 });
    if (cutsceneStarted) {
      shakeCamera(player, 0.35, 1.2);
    }
  }, 12);

  system.runTimeout(() => {
    spawnBoundaryWall(dimension, center);
    dimension.spawnParticle("skill:crimson_smoke", center);
  }, 40);

  system.runTimeout(() => {
    dimension.spawnParticle("skill:snowstorm", center);
    spawnPillars(dimension, center);
    dimension.playSound("skill.boundary_impact", center, { volume: 1.0, pitch: 0.9 });
    if (cutsceneStarted) {
      shakeCamera(player, 0.8, 1.4);
    }
  }, 90);

  system.runTimeout(() => {
    dimension.spawnParticle("skill:crimson_rift", center);
    dimension.playSound("skill.boundary_impact", center, { volume: 0.8, pitch: 0.68 });
  }, 360);

  system.runTimeout(() => {
    dimension.spawnParticle("skill:crimson_smoke", center);
    dimension.playSound("skill.boundary_collapse", center, { volume: 0.9, pitch: 0.95 });
    if (cutsceneStarted) {
      shakeCamera(player, 0.45, 1.0);
    }
  }, 450);
}

function spawnBoundaryWall(dimension, center) {
  for (let segment = 0; segment < BOUNDARY_SEGMENTS; segment += 1) {
    const angle = (segment / BOUNDARY_SEGMENTS) * Math.PI * 2;
    dimension.spawnParticle("skill:crimson_boundary", {
      x: center.x + Math.cos(angle) * BOUNDARY_RADIUS,
      y: center.y + 8,
      z: center.z + Math.sin(angle) * BOUNDARY_RADIUS,
    });
  }
}

function spawnPillars(dimension, center) {
  for (let pillar = 0; pillar < 8; pillar += 1) {
    const angle = (pillar / 8) * Math.PI * 2;
    dimension.spawnParticle("skill:crimson_pillar", {
      x: center.x + Math.cos(angle) * 10,
      y: center.y,
      z: center.z + Math.sin(angle) * 10,
    });
  }
}

function startCutscene(player, center) {
  const radius = 23;
  const path = new CatmullRomSpline();
  path.controlPoints = [0, 45, 90, 135, 180].map((degrees, index) => {
    const angle = (degrees * Math.PI) / 180;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + (index % 2 === 0 ? 20 : 17),
      z: center.z + Math.sin(angle) * radius,
    };
  });

  try {
    player.camera.setCamera("minecraft:free", {
      location: path.controlPoints[0],
      rotation: { x: -38, y: 90, z: 0 },
    });
    system.runTimeout(() => {
      if (player.isValid) {
        player.camera.clear();
      }
    }, CUTSCENE_SECONDS * 20 + 2);

    player.camera.fade({
      fadeColor: { red: 0.06, green: 0, blue: 0.015 },
      fadeTime: { fadeInTime: 0.25, holdTime: 0.15, fadeOutTime: 0.9 },
    });
    player.camera.playAnimation(path, {
      animation: {
        progressKeyFrames: [
          { timeSeconds: 0, alpha: 0, easingFunc: EasingType.InOutSine },
          {
            timeSeconds: CUTSCENE_SECONDS,
            alpha: 1,
            easingFunc: EasingType.InOutSine,
          },
        ],
        rotationKeyFrames: [
          {
            timeSeconds: 0,
            rotation: { x: -38, y: 90, z: 0 },
            easingFunc: EasingType.InOutSine,
          },
          {
            timeSeconds: 2,
            rotation: { x: -34, y: 135, z: 0 },
            easingFunc: EasingType.InOutSine,
          },
          {
            timeSeconds: 4,
            rotation: { x: -46, y: 180, z: 0 },
            easingFunc: EasingType.InOutSine,
          },
          {
            timeSeconds: 6,
            rotation: { x: -34, y: 225, z: 0 },
            easingFunc: EasingType.InOutSine,
          },
          {
            timeSeconds: CUTSCENE_SECONDS,
            rotation: { x: -38, y: 270, z: 0 },
            easingFunc: EasingType.InOutSine,
          },
        ],
      },
      totalTimeSeconds: CUTSCENE_SECONDS,
    });
    return true;
  } catch (error) {
    console.error("Crimson boundary camera cutscene could not start:", error);
    return false;
  }
}

function shakeCamera(player, intensity, duration) {
  if (!player.isValid) {
    return;
  }

  try {
    player.camera.addShake({
      intensity,
      duration,
      type: CameraShakeType.Positional,
    });
  } catch (error) {
    console.error("Crimson boundary camera shake failed:", error);
  }
}

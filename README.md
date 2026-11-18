# skill

Minecraft Bedrock add-on authored for Snowstorm:

- Target: Bedrock 1.26.62 with Script API `@minecraft/server` 2.11.0.
- The reusable `skill:crimson_talisman` item starts a 30-second Crimson Boundary ritual. Obtain it with `/give @s skill:crimson_talisman`.
- The 3D structure grows to 2.4× its previous size (36-block render bounds), raises a 16-panel crimson perimeter, then triggers an ember surge and an animated orbital cutscene.
- Four original, procedurally synthesized sound effects provide the opening, ambient boundary hum, impact, and collapse cues.
- Import `CrimsonSnowstorm.mcaddon` and activate both packs in the world. For the camera flyover, also enable **Experimental Creator Camera Features**; the visual ritual and sounds still play if the camera feature is unavailable.
- You can also run `/function cast_crimson_ritual` directly for the large visual and sound effect without the item-triggered camera sequence.
- Particle JSON can be opened in Snowstorm. The effect textures and original audio are packaged with the resource pack.

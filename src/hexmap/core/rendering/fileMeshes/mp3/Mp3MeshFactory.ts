import * as BABYLON from 'babylonjs';

export default class Mp3MeshFactory {
  getMesh(item: any, scene: BABYLON.Scene) {
    // Create a mesh that visually represents an audio file (e.g., a disc or speaker)
    const radius = item.size ? item.size / 2 : 15;
    const thickness = item.thickness || 3;

    // Main disc (vinyl look)
    const disc = BABYLON.MeshBuilder.CreateCylinder(
      item.id || `mp3_disc_${Math.random()}`,
      { diameter: radius * 2, height: thickness, tessellation: 32 },
      scene
    );

    // Material: black with a colored ring
    const mat = new BABYLON.StandardMaterial('mp3Mat', scene);
    mat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    mat.specularColor = new BABYLON.Color3(0.7, 0.7, 1);
    mat.emissiveColor = new BABYLON.Color3(0.15, 0.21, 0.45); // halo bleu // almost black
    mat.specularColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    disc.material = mat;

    // Center label (small colored circle)
    const label = BABYLON.MeshBuilder.CreateCylinder(
      item.id ? `${item.id}_label` : `mp3_label_${Math.random()}`,
      { diameter: radius * 0.4, height: thickness * 1.05, tessellation: 24 },
      scene
    );
    label.position.y = thickness * 0.52;
    const labelMat = new BABYLON.StandardMaterial('mp3LabelMat', scene);
    labelMat.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.2);
    labelMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.5);
    labelMat.emissiveColor = new BABYLON.Color3(0.25, 0.22, 0.10); // léger halo doré // blue
    label.material = labelMat;

    // Parent/child
    label.parent = disc;

    // Optionally, add a simple "waveform" icon using lines (not visible in 3D, but can be improved)
    // disc.metadata = { type: 'mp3' };
    return disc;
  }
}

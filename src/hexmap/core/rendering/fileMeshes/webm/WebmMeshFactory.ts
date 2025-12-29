import * as BABYLON from 'babylonjs';

export default class WebmMeshFactory {
  getMesh(item: any, scene: BABYLON.Scene) {
    // Visual: Film strip (video)
    const width = item.size ? item.size * 1.2 : 22;
    const height = item.size ? item.size * 0.7 : 14;
    const thickness = item.thickness || 2.5;
    const body = BABYLON.MeshBuilder.CreateBox(
      item.id || `webm_body_${Math.random()}`,
      { width, height, depth: thickness },
      scene
    );
    const mat = new BABYLON.StandardMaterial('webmMat', scene);
    mat.diffuseColor = new BABYLON.Color3(0.12, 0.12, 0.12);
    mat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    mat.emissiveColor = new BABYLON.Color3(0.12, 0.18, 0.24); // halo bleu
    body.material = mat;
    // Add white rectangles for "film holes"
    for (let i = -1; i <= 1; i += 2) {
      const hole = BABYLON.MeshBuilder.CreateBox(
        item.id ? `${item.id}_hole${i}` : `webm_hole${i}_${Math.random()}`,
        { width: width * 0.08, height: height * 0.9, depth: thickness * 1.15 },
        scene
      );
      hole.position.x = (width / 2 - width * 0.06) * i;
      hole.position.z = thickness * 0.7;
      const holeMat = new BABYLON.StandardMaterial('webmHoleMat', scene);
      holeMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    holeMat.specularColor = new BABYLON.Color3(0.7, 0.7, 1);
    holeMat.emissiveColor = new BABYLON.Color3(0.12, 0.18, 0.24); // halo bleu
      hole.material = holeMat;
      hole.parent = body;
    }
    return body;
  }
}

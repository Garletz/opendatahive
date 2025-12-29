import * as BABYLON from 'babylonjs';

export default class OdhcMeshFactory {
  getMesh(item: any, scene: BABYLON.Scene) {
    // Visual: A hexagon with a lock (ODHC = secure data)
    const size = item.size || 20;
    const thickness = item.thickness || 3;
    const hex = BABYLON.MeshBuilder.CreateCylinder(
      item.id || `odhc_hex_${Math.random()}`,
      { diameter: size, height: thickness, tessellation: 6 },
      scene
    );
    const mat = new BABYLON.StandardMaterial('odhcMat', scene);
    mat.diffuseColor = new BABYLON.Color3(0.5, 0.2, 0.8);
    mat.specularColor = new BABYLON.Color3(0.8, 0.6, 1);
    mat.emissiveColor = new BABYLON.Color3(0.22, 0.10, 0.35); // halo violet // purple
    hex.material = mat;
    // Add a "lock" (simple box for body, arc for shackle)
    const lockBody = BABYLON.MeshBuilder.CreateBox(
      item.id ? `${item.id}_lockBody` : `odhc_lockBody_${Math.random()}`,
      { width: size * 0.22, height: size * 0.18, depth: thickness * 0.6 },
      scene
    );
    lockBody.position.y = size * 0.19;
    lockBody.position.z = thickness * 0.7;
    const lockMat = new BABYLON.StandardMaterial('odhcLockMat', scene);
    lockMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 1);
    lockMat.specularColor = new BABYLON.Color3(0.7, 0.7, 1);
    lockMat.emissiveColor = new BABYLON.Color3(0.18, 0.08, 0.25); // halo bleu/violet
    lockBody.material = lockMat;
    lockBody.parent = hex;
    // No real arc, but could be improved with lines or more geometry
    return hex;
  }
}

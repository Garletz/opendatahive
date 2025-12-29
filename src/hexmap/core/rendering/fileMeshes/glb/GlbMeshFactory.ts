import * as BABYLON from 'babylonjs';

export default class GlbMeshFactory {
  getMesh(item: any, scene: BABYLON.Scene) {
    // Visual: A 3D cube with a blue highlight (GLB = 3D model)
    const size = item.size || 18;
    const thickness = item.thickness || 3;
    const cube = BABYLON.MeshBuilder.CreateBox(
      item.id || `glb_cube_${Math.random()}`,
      { width: size, height: size, depth: thickness },
      scene
    );
    const mat = new BABYLON.StandardMaterial('glbMat', scene);
    mat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.9);
    mat.specularColor = new BABYLON.Color3(0.7, 0.7, 1);
    mat.emissiveColor = new BABYLON.Color3(0.12, 0.18, 0.24); // halo bleu // blue
    cube.material = mat;
    // Optionally, could add a "3D" label using dynamic texture
    return cube;
  }
}

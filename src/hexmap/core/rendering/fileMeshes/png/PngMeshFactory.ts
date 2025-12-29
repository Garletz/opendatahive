import * as BABYLON from 'babylonjs';

export default class PngMeshFactory {
  getMesh(item: any, scene: BABYLON.Scene) {
    // Visual: A photo frame look (PNG = image)
    const size = item.size || 18;
    const thickness = item.thickness || 2.5;

    // Main frame
    const frame = BABYLON.MeshBuilder.CreateBox(
      item.id || `png_frame_${Math.random()}`,
      { width: size, height: size * 0.75, depth: thickness },
      scene
    );
    const mat = new BABYLON.StandardMaterial('pngMat', scene);
    mat.diffuseColor = new BABYLON.Color3(0.97, 0.97, 0.97);
    mat.specularColor = new BABYLON.Color3(0.7, 0.7, 1);
    mat.emissiveColor = new BABYLON.Color3(0.12, 0.18, 0.24); // halo bleu
    frame.material = mat;

    // Inner "image" (blue rectangle)
    const image = BABYLON.MeshBuilder.CreateBox(
      item.id ? `${item.id}_img` : `png_img_${Math.random()}`,
      { width: size * 0.85, height: size * 0.55, depth: thickness * 0.4 },
      scene
    );
    image.position.z = thickness * 0.7;
    const imageMat = new BABYLON.StandardMaterial('pngImgMat', scene);
    imageMat.diffuseColor = new BABYLON.Color3(0.1, 0.5, 1);
    imageMat.specularColor = new BABYLON.Color3(0.7, 0.7, 1);
    imageMat.emissiveColor = new BABYLON.Color3(0.12, 0.18, 0.24); // halo bleu
    image.material = imageMat;
    image.parent = frame;

    // Optionally, could add a mountain/sky icon using lines or textures
    // frame.metadata = { type: 'png' };
    return frame;
  }
}

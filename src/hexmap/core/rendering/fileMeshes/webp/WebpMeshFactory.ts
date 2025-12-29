import * as BABYLON from 'babylonjs';

import type { Mesh, Scene } from 'babylonjs';

export default class WebpMeshFactory {
  getMesh(item: any, scene: BABYLON.Scene) {
    // Visual: A photo frame (like PNG)
    const size = item.size || 18;
    const thickness = item.thickness || 2.5;
    const frame = BABYLON.MeshBuilder.CreateBox(
      item.id || `webp_frame_${Math.random()}`,
      { width: size, height: size * 0.75, depth: thickness },
      scene
    );
    const mat = new BABYLON.StandardMaterial('webpMat', scene);
    mat.diffuseColor = new BABYLON.Color3(0.97, 0.97, 0.97);
    mat.specularColor = new BABYLON.Color3(0.7, 1, 0.7);
    mat.emissiveColor = new BABYLON.Color3(0.12, 0.24, 0.12); // halo vert
    mat.specularColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    frame.material = mat;
    const image = BABYLON.MeshBuilder.CreateBox(
      item.id ? `${item.id}_img` : `webp_img_${Math.random()}`,
      { width: size * 0.85, height: size * 0.55, depth: thickness * 0.4 },
      scene
    );
    image.position.z = thickness * 0.7;
    const imageMat = new BABYLON.StandardMaterial('webpImgMat', scene);
    imageMat.diffuseColor = new BABYLON.Color3(0.4, 0.8, 0.6); // greenish
    imageMat.specularColor = new BABYLON.Color3(0.7, 1, 0.7);
    imageMat.emissiveColor = new BABYLON.Color3(0.12, 0.24, 0.12); // halo vert
    image.material = imageMat;
    image.parent = frame;
    return frame;
  }

  /**
   * Ajoute un ActionManager avec handler sur le mesh et tous ses enfants.
   */
  static attachPickHandler(mesh: Mesh, scene: Scene, handler: () => void) {
    if ((window as any).BABYLON && (window as any).BABYLON.ActionManager) {
      const BABYLON = (window as any).BABYLON;
      const addHandler = (target: any) => {
        target.actionManager = new BABYLON.ActionManager(scene);
        target.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, handler));
      };
      addHandler(mesh);
      if (mesh.getChildMeshes) {
        mesh.getChildMeshes().forEach(addHandler);
      }
    }
  }
}


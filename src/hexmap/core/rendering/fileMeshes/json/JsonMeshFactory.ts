import * as BABYLON from 'babylonjs';

export default class JsonMeshFactory {
  getMesh(item: any, scene: BABYLON.Scene) {
    // Visual: A curly brace or a document with braces (JSON look)
    const size = item.size || 17;
    const thickness = item.thickness || 2;

    // Main document
    const doc = BABYLON.MeshBuilder.CreateBox(
      item.id || `json_doc_${Math.random()}`,
      { width: size * 0.9, height: size * 1.1, depth: thickness },
      scene
    );
    const mat = new BABYLON.StandardMaterial('jsonMat', scene);
    mat.diffuseColor = new BABYLON.Color3(0.9, 1, 0.9);
    mat.specularColor = new BABYLON.Color3(0.7, 1, 0.7);
    mat.emissiveColor = new BABYLON.Color3(0.09, 0.18, 0.09); 
    doc.material = mat;

    // Add a green curly brace (simulate with a thin box)
    const brace = BABYLON.MeshBuilder.CreateBox(
      item.id ? `${item.id}_brace` : `json_brace_${Math.random()}`,
      { width: size * 0.12, height: size * 0.7, depth: thickness * 1.1 },
      scene
    );
    brace.position.x = -size * 0.35;
    brace.position.y = 0;
    brace.position.z = thickness * 0.7;
    const braceMat = new BABYLON.StandardMaterial('jsonBraceMat', scene);
    braceMat.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2);
    braceMat.specularColor = new BABYLON.Color3(0.7, 1, 0.7);
    braceMat.emissiveColor = new BABYLON.Color3(0.09, 0.18, 0.09); 
    brace.material = braceMat;
    brace.parent = doc;

    // Ajout texte 3D 'JSON' sur la face
    const dynTex = new BABYLON.DynamicTexture('jsonLabel', 256, scene, true);
    dynTex.hasAlpha = true;
    dynTex.drawText('JSON', 30, 160, 'bold 120px Arial', 'white', 'rgba(0,0,0,0.55)', true);
    const labelMat = new BABYLON.StandardMaterial('jsonLabelMat', scene);
    labelMat.diffuseTexture = dynTex;
    labelMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    labelMat.backFaceCulling = false;
    const labelPlane = BABYLON.MeshBuilder.CreatePlane('jsonLabelPlane', {width: size*0.7, height: size*0.28}, scene);
    labelPlane.position.z = thickness + 0.6;
    labelPlane.position.y = 0;
    labelPlane.material = labelMat;
    labelPlane.parent = doc;

    // Optionally, could add another brace or some "{}" text
    // doc.metadata = { type: 'json' };
    return doc;
  }
}

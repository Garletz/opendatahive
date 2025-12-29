import * as BABYLON from 'babylonjs';

export default class XmlMeshFactory {
  getMesh(item: any, scene: BABYLON.Scene) {
    // Visual: A document with a yellow tag (XML)
    const width = item.size ? item.size * 1.05 : 21;
    const height = item.size ? item.size * 1.2 : 24;
    const thickness = item.thickness || 2;
    const doc = BABYLON.MeshBuilder.CreateBox(
      item.id || `xml_doc_${Math.random()}`,
      { width, height, depth: thickness },
      scene
    );
    const mat = new BABYLON.StandardMaterial('xmlMat', scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 0.9);
    mat.specularColor = new BABYLON.Color3(1, 1, 0.7);
    mat.emissiveColor = new BABYLON.Color3(0.18, 0.18, 0.09); // halo jaune // pale yellow
    doc.material = mat;
    // Add a yellow tag (triangle)
    const tag = BABYLON.MeshBuilder.CreateCylinder(
      item.id ? `${item.id}_tag` : `xml_tag_${Math.random()}`,
      { diameterTop: 0, diameterBottom: 5, height: thickness * 1.1, tessellation: 3 },
      scene
    );
    tag.position.x = width/2 - 2.5;
    tag.position.y = height/2 - 2.5;
    tag.position.z = thickness * 0.55;
    tag.rotation.z = Math.PI/2;
    const tagMat = new BABYLON.StandardMaterial('xmlTagMat', scene);
    tagMat.diffuseColor = new BABYLON.Color3(1, 0.95, 0.2);
    tagMat.specularColor = new BABYLON.Color3(1, 1, 0.7);
    tagMat.emissiveColor = new BABYLON.Color3(0.18, 0.18, 0.09); // halo jaune // yellow
    tag.material = tagMat;
    tag.parent = doc;
    // Affiche les lettres 'X', 'M', 'L' en 3D flottantes au-dessus du document
    const letters = ['X', 'M', 'L'];
    const totalWidth = width * 0.8;
    const letterSpacing = totalWidth / 3;
    const letterHeight = height * 0.25;
    const baseZ = thickness + 1.1;
    letters.forEach((char, i) => {
      const dynTex = new BABYLON.DynamicTexture('xmlLetter'+char, 128, scene, true);
      dynTex.hasAlpha = true;
      dynTex.drawText(char, 32, 96, 'bold 90px Arial', 'white', 'transparent', true);
      const mat = new BABYLON.StandardMaterial('xmlLetterMat'+char, scene);
      mat.diffuseTexture = dynTex;
      mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
      mat.backFaceCulling = false;
      const plane = BABYLON.MeshBuilder.CreatePlane('xmlLetterPlane'+char, {width: letterSpacing*0.8, height: letterHeight}, scene);
      plane.position.x = -totalWidth/2 + (i+0.5)*letterSpacing;
      plane.position.y = 0;
      plane.position.z = baseZ;
      plane.material = mat;
      plane.parent = doc;
      // Optionnel : orienter le plan vers la caméra ?
    });
    return doc;
  }
}

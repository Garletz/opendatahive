import * as BABYLON from 'babylonjs';

export default class PdfMeshFactory {
  getMesh(item: any, scene: BABYLON.Scene) {
    // Visual: A single thick sheet with a folded corner (PDF look)
    const width = item.size ? item.size * 1.05 : 21;
    const height = item.size ? item.size * 1.4 : 28;
    const thickness = item.thickness || 2;

    // Main sheet
    const sheet = BABYLON.MeshBuilder.CreateBox(
      item.id || `pdf_sheet_${Math.random()}`,
      { width, height, depth: thickness },
      scene
    );
    const mat = new BABYLON.StandardMaterial('pdfMat', scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(1, 0.7, 0.7);
    mat.emissiveColor = new BABYLON.Color3(0.2, 0.04, 0.04); // halo rouge // white
    mat.specularColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    sheet.material = mat;

    // Add a red "folded" corner (triangle)
    const corner = BABYLON.MeshBuilder.CreateCylinder(
      item.id ? `${item.id}_corner` : `pdf_corner_${Math.random()}`,
      { diameterTop: 0, diameterBottom: 6, height: thickness * 1.1, tessellation: 3 },
      scene
    );
    corner.position.x = width/2 - 2.5;
    corner.position.y = height/2 - 2.5;
    corner.position.z = thickness * 0.55;
    corner.rotation.z = Math.PI/2;
    const cornerMat = new BABYLON.StandardMaterial('pdfCornerMat', scene);
    cornerMat.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
    cornerMat.specularColor = new BABYLON.Color3(1, 0.7, 0.7);
    cornerMat.emissiveColor = new BABYLON.Color3(0.2, 0.04, 0.04); // halo rouge // red
    corner.material = cornerMat;
    corner.parent = sheet;

    // Ajout texte 3D 'PDF' sur la feuille
    const dynTex = new BABYLON.DynamicTexture('pdfLabel', 256, scene, true);
    dynTex.hasAlpha = true;
    dynTex.drawText('PDF', 30, 160, 'bold 120px Arial', 'white', 'rgba(0,0,0,0.55)', true);
    const labelMat = new BABYLON.StandardMaterial('pdfLabelMat', scene);
    labelMat.diffuseTexture = dynTex;
    labelMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    labelMat.backFaceCulling = false;
    const labelPlane = BABYLON.MeshBuilder.CreatePlane('pdfLabelPlane', {width: width*0.7, height: height*0.28}, scene);
    labelPlane.position.z = thickness + 0.6;
    labelPlane.position.y = 0;
    labelPlane.material = labelMat;
    labelPlane.parent = sheet;

    // Optionally, could add "PDF" text using dynamic texture
    // sheet.metadata = { type: 'pdf' };
    return sheet;
  }
}

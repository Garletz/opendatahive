import * as BABYLON from 'babylonjs';

export default class CsvMeshFactory {
  getMesh(item: any, scene: BABYLON.Scene) {
    // Visual: A stack of sheets or a grid to evoke a spreadsheet
    const width = item.size ? item.size * 1.1 : 22;
    const height = item.size ? item.size * 0.7 : 14;
    const thickness = item.thickness || 1.5;

    // Main sheet (white rectangle)
    const sheet = BABYLON.MeshBuilder.CreateBox(
      item.id || `csv_sheet_${Math.random()}`,
      { width, height, depth: thickness },
      scene
    );
    const mat = new BABYLON.StandardMaterial('csvMat', scene);
    mat.diffuseColor = new BABYLON.Color3(0.8, 1, 0.8);
    mat.specularColor = new BABYLON.Color3(0.6, 1, 0.6);
    mat.emissiveColor = new BABYLON.Color3(0.15, 0.35, 0.15); // halo vert clair 
    sheet.material = mat;

    // Add green grid lines (simulate spreadsheet)
    const gridMat = new BABYLON.StandardMaterial('csvGridMat', scene);
    gridMat.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2); // green
    // Ajout texte 3D 'CSV' sur la feuille
    const dynTex = new BABYLON.DynamicTexture('csvLabel', 256, scene, true);
    dynTex.hasAlpha = true;
    dynTex.drawText('CSV', 30, 160, 'bold 120px Arial', 'white', 'rgba(0,0,0,0.55)', true);
    const labelMat = new BABYLON.StandardMaterial('csvLabelMat', scene);
    labelMat.diffuseTexture = dynTex;
    labelMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    labelMat.backFaceCulling = false;
    const labelPlane = BABYLON.MeshBuilder.CreatePlane('csvLabelPlane', {width: width*0.7, height: height*0.28}, scene);
    labelPlane.position.z = thickness + 0.6;
    labelPlane.position.y = 0;
    labelPlane.material = labelMat;
    labelPlane.parent = sheet;
    gridMat.specularColor = new BABYLON.Color3(0.6, 1, 0.6);
    gridMat.emissiveColor = new BABYLON.Color3(0.15, 0.35, 0.15); // halo vert clair
    // Optionally, you could add lines using dynamic texture for more realism

    // Optionally add a second, slightly offset sheet for "stacked paper" effect
    const sheet2 = BABYLON.MeshBuilder.CreateBox(
      item.id ? `${item.id}_sheet2` : `csv_sheet2_${Math.random()}`,
      { width, height, depth: thickness * 0.98 },
      scene
    );
    sheet2.position.z = -thickness * 0.7;
    sheet2.material = mat;
    sheet2.parent = sheet;

    // Optionally, could add more sheets or a grid pattern
    // sheet.metadata = { type: 'csv' };
    return sheet;
  }
}
